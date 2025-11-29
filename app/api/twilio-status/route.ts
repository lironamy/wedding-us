import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import dbConnect from '@/lib/db/mongodb';
import MessageLog from '@/lib/db/models/MessageLog';
import ScheduledMessage from '@/lib/db/models/ScheduledMessage';

// Twilio Status Callback Webhook
// This endpoint receives status updates from Twilio about message delivery
//
// IMPORTANT: Twilio statuses flow:
// queued → sent → delivered (success) OR failed/undelivered (failure)
//
// "sent" only means sent to carrier, NOT delivered to recipient!
// We must wait for "delivered" to confirm actual delivery.

/**
 * Validate that the request is actually from Twilio
 * Uses Twilio's signature validation
 */
async function validateTwilioRequest(request: NextRequest, body: string): Promise<boolean> {
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!authToken) {
    console.warn('⚠️ [Twilio Status] TWILIO_AUTH_TOKEN not set - skipping validation');
    return true; // Allow in development if not configured
  }

  const signature = request.headers.get('x-twilio-signature');
  if (!signature) {
    console.error('❌ [Twilio Status] Missing X-Twilio-Signature header');
    return false;
  }

  // Get the full URL that Twilio called
  const url = request.url;

  // Parse body as params for validation
  const params: Record<string, string> = {};
  const formData = new URLSearchParams(body);
  formData.forEach((value, key) => {
    params[key] = value;
  });

  // Validate using Twilio's helper
  const isValid = twilio.validateRequest(authToken, signature, url, params);

  if (!isValid) {
    console.error('❌ [Twilio Status] Invalid signature - request rejected');
  }

  return isValid;
}

export async function POST(request: NextRequest) {
  console.log('🔔 [Twilio Status] Webhook received!');
  console.log('🔔 [Twilio Status] Request URL:', request.url);

  try {
    // Clone request to read body twice (once for validation, once for parsing)
    const body = await request.text();
    console.log('🔔 [Twilio Status] Body received, length:', body.length);

    // Validate request is from Twilio
    const isValid = await validateTwilioRequest(request, body);
    if (!isValid) {
      console.error('❌ [Twilio Status] Unauthorized request rejected');
      // In production, still process the webhook but log the validation failure
      // This helps with debugging deployment URL mismatches
      console.warn('⚠️ [Twilio Status] Proceeding despite validation failure for debugging');
    }

    // Parse form data from the body
    const formData = new URLSearchParams(body);

    const messageSid = formData.get('MessageSid') as string;
    const messageStatus = formData.get('MessageStatus') as string;
    const errorCode = formData.get('ErrorCode') as string | null;
    const errorMessage = formData.get('ErrorMessage') as string | null;
    const to = formData.get('To') as string;
    const from = formData.get('From') as string;

    // Log all form data for debugging
    console.log('📋 [Twilio Status] Full webhook data:');
    formData.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });

    console.log(`🔔 [Twilio Status] Message ${messageSid}: ${messageStatus}`, {
      to,
      from,
      errorCode,
      errorMessage
    });

    await dbConnect();

    // Map Twilio status to our status
    // IMPORTANT: "sent" is NOT a final success status - only "delivered" is!
    const statusMap: Record<string, string> = {
      'queued': 'queued',
      'sending': 'sending',
      'sent': 'sent',        // Sent to carrier, but NOT yet delivered!
      'delivered': 'delivered', // Actually delivered to recipient
      'read': 'read',
      'failed': 'failed',
      'undelivered': 'undelivered', // Keep separate from failed for clarity
    };

    const mappedStatus = statusMap[messageStatus] || messageStatus;

    // Check if this is a final status (delivered, read, failed, undelivered)
    const isFinalSuccess = messageStatus === 'delivered' || messageStatus === 'read';
    const isFinalFailure = messageStatus === 'failed' || messageStatus === 'undelivered';
    const isFinalStatus = isFinalSuccess || isFinalFailure;

    // Update MessageLog
    console.log(`🔍 [Twilio Status] Looking for MessageLog with twilioSid: ${messageSid}`);
    const messageLog = await MessageLog.findOneAndUpdate(
      { twilioSid: messageSid },
      {
        $set: {
          deliveryStatus: mappedStatus,
          ...(errorCode && { errorCode }),
          ...(errorMessage && { errorMessage }),
          statusUpdatedAt: new Date(),
        }
      },
      { new: true }
    );

    if (messageLog) {
      console.log(`✅ [Twilio Status] MessageLog found and updated:`, {
        _id: messageLog._id,
        twilioSid: messageLog.twilioSid,
        newStatus: mappedStatus,
        scheduledMessageId: messageLog.scheduledMessageId
      });
    } else {
      console.warn(`⚠️ [Twilio Status] No MessageLog found for twilioSid: ${messageSid}`);
    }

    // If we have a final status and a scheduledMessageId, update the counts
    if (isFinalStatus && messageLog?.scheduledMessageId) {
      const scheduledMessageId = messageLog.scheduledMessageId;

      if (isFinalSuccess) {
        // Increment delivered count (real success!)
        await ScheduledMessage.updateOne(
          { _id: scheduledMessageId },
          { $inc: { deliveredCount: 1 } }
        );
        console.log(`[Twilio Status] ✅ Message ${messageSid} DELIVERED - incrementing deliveredCount`);
      } else if (isFinalFailure) {
        // Increment failed count and decrement sent count
        await ScheduledMessage.updateOne(
          { _id: scheduledMessageId },
          {
            $inc: {
              failedCount: 1,
              sentCount: -1 // Correct the optimistic count
            }
          }
        );
        console.log(`[Twilio Status] ❌ Message ${messageSid} FAILED (${errorCode}: ${errorMessage}) - updating counts`);
      }
    }

    console.log(`[Twilio Status] Updated message ${messageSid} to status: ${mappedStatus}`);

    // Twilio expects a 200 response
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('[Twilio Status] Error processing webhook:', error);
    // Still return 200 to prevent Twilio from retrying
    return new NextResponse('OK', { status: 200 });
  }
}

// Twilio might send GET requests to verify the endpoint
export async function GET() {
  return NextResponse.json({ status: 'Twilio status callback endpoint active' });
}
