import { NextRequest, NextResponse } from 'next/server';
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
export async function POST(request: NextRequest) {
  try {
    // Parse form data from Twilio (they send as application/x-www-form-urlencoded)
    const formData = await request.formData();

    const messageSid = formData.get('MessageSid') as string;
    const messageStatus = formData.get('MessageStatus') as string;
    const errorCode = formData.get('ErrorCode') as string | null;
    const errorMessage = formData.get('ErrorMessage') as string | null;
    const to = formData.get('To') as string;
    const from = formData.get('From') as string;

    console.log(`[Twilio Status] Message ${messageSid}: ${messageStatus}`, {
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
