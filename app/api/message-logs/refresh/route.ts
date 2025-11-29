import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import MessageLog from '@/lib/db/models/MessageLog';
import ScheduledMessage from '@/lib/db/models/ScheduledMessage';
import Wedding from '@/lib/db/models/Wedding';
import twilio from 'twilio';

/**
 * POST /api/message-logs/refresh
 * Refresh message statuses by fetching from Twilio API directly
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scheduledMessageId = searchParams.get('scheduledMessageId');
    const weddingId = searchParams.get('weddingId');

    if (!scheduledMessageId || !weddingId) {
      return NextResponse.json(
        { error: 'scheduledMessageId and weddingId are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify the wedding belongs to this user
    const wedding = await Wedding.findOne({
      _id: weddingId,
      userId: session.user.id,
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    // Get Twilio client
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      return NextResponse.json({ error: 'Twilio not configured' }, { status: 500 });
    }

    const client = twilio(accountSid, authToken);

    // Get message logs that need status refresh (queued or sent)
    const logs = await MessageLog.find({
      scheduledMessageId,
      weddingId,
      deliveryStatus: { $in: ['queued', 'sent', 'sending'] },
    });

    console.log(`[Refresh] Found ${logs.length} logs to refresh for scheduledMessageId: ${scheduledMessageId}`);

    let updatedCount = 0;
    let deliveredCount = 0;
    let failedCount = 0;

    // Fetch status from Twilio for each message
    for (const log of logs) {
      try {
        const message = await client.messages(log.twilioSid).fetch();

        console.log(`[Refresh] Twilio status for ${log.twilioSid}: ${message.status}`);

        // Map Twilio status
        const statusMap: Record<string, string> = {
          'queued': 'queued',
          'sending': 'sending',
          'sent': 'sent',
          'delivered': 'delivered',
          'read': 'read',
          'failed': 'failed',
          'undelivered': 'undelivered',
        };

        const newStatus = statusMap[message.status] || message.status;
        const oldStatus = log.deliveryStatus;

        if (newStatus !== oldStatus) {
          await MessageLog.updateOne(
            { _id: log._id },
            {
              $set: {
                deliveryStatus: newStatus,
                ...(message.errorCode && { errorCode: message.errorCode.toString() }),
                ...(message.errorMessage && { errorMessage: message.errorMessage }),
                statusUpdatedAt: new Date(),
              }
            }
          );
          updatedCount++;

          // Track final statuses for updating ScheduledMessage counts
          if (newStatus === 'delivered' || newStatus === 'read') {
            deliveredCount++;
          } else if (newStatus === 'failed' || newStatus === 'undelivered') {
            failedCount++;
          }

          console.log(`[Refresh] Updated ${log.twilioSid}: ${oldStatus} -> ${newStatus}`);
        }
      } catch (twilioError: any) {
        console.error(`[Refresh] Error fetching status for ${log.twilioSid}:`, twilioError.message);
      }
    }

    // Update ScheduledMessage counts if needed
    if (deliveredCount > 0 || failedCount > 0) {
      await ScheduledMessage.updateOne(
        { _id: scheduledMessageId },
        {
          $inc: {
            deliveredCount: deliveredCount,
            failedCount: failedCount,
            sentCount: -failedCount, // Correct the optimistic count for failures
          }
        }
      );
      console.log(`[Refresh] Updated ScheduledMessage counts: delivered +${deliveredCount}, failed +${failedCount}`);
    }

    return NextResponse.json({
      success: true,
      updated: updatedCount,
      delivered: deliveredCount,
      failed: failedCount,
      total: logs.length,
    });
  } catch (error) {
    console.error('Error refreshing message statuses:', error);
    return NextResponse.json(
      { error: 'Failed to refresh message statuses' },
      { status: 500 }
    );
  }
}
