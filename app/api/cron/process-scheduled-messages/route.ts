import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import Guest from '@/lib/db/models/Guest';
import User from '@/lib/db/models/User';
import ScheduledMessage, {
  MESSAGE_SCHEDULE_CONFIG,
  type ScheduledMessageType,
} from '@/lib/db/models/ScheduledMessage';
import { getTwilioService } from '@/lib/services/twilio-whatsapp';
import { formatHebrewDate } from '@/lib/utils/date';
import { getGenderText, type PartnerType } from '@/lib/utils/genderText';
import { MESSAGE_TEMPLATES, type MessageType } from '@/lib/utils/messageTemplates';

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * GET /api/cron/process-scheduled-messages
 * Process all pending scheduled messages that are due
 * Called by Vercel Cron or external scheduler
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authorization (Vercel Cron sends this header)
    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const now = new Date();
    console.log(`🕐 [CRON] Processing scheduled messages at ${now.toISOString()}`);

    // Find all pending messages that are due
    const dueMessages = await ScheduledMessage.find({
      status: 'pending',
      scheduledFor: { $lte: now },
    }).limit(10); // Process max 10 at a time to avoid timeout

    if (dueMessages.length === 0) {
      console.log('✅ [CRON] No pending messages to process');
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No pending messages',
      });
    }

    console.log(`📬 [CRON] Found ${dueMessages.length} messages to process`);

    const results: any[] = [];

    for (const scheduledMessage of dueMessages) {
      try {
        // Mark as sending
        await ScheduledMessage.updateOne(
          { _id: scheduledMessage._id },
          { status: 'sending', startedAt: new Date() }
        );

        // Process this message
        const result = await processScheduledMessage(scheduledMessage);
        results.push(result);

        // Update status
        await ScheduledMessage.updateOne(
          { _id: scheduledMessage._id },
          {
            status: result.success ? 'completed' : 'failed',
            completedAt: new Date(),
            sentCount: result.sentCount,
            failedCount: result.failedCount,
            totalGuests: result.totalGuests,
            errorMessage: (result as any).error || undefined,
          }
        );

        // Send notification to couple
        await notifyCouple(scheduledMessage, result);

      } catch (error: any) {
        console.error(`❌ [CRON] Error processing message ${scheduledMessage._id}:`, error);

        await ScheduledMessage.updateOne(
          { _id: scheduledMessage._id },
          {
            status: 'failed',
            completedAt: new Date(),
            errorMessage: error.message,
          }
        );

        results.push({
          scheduleId: scheduledMessage._id,
          success: false,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('❌ [CRON] Critical error:', error);
    return NextResponse.json(
      { error: 'Failed to process scheduled messages' },
      { status: 500 }
    );
  }
}

/**
 * Process a single scheduled message
 */
async function processScheduledMessage(scheduledMessage: any) {
  const { weddingId, messageType, targetFilter } = scheduledMessage;

  // Get wedding details
  const wedding = await Wedding.findById(weddingId).lean() as any;
  if (!wedding) {
    throw new Error('Wedding not found');
  }

  // Build guest filter
  const guestFilter: any = { weddingId };

  if (targetFilter?.rsvpStatus && targetFilter.rsvpStatus !== 'all') {
    guestFilter.rsvpStatus = targetFilter.rsvpStatus;
  }

  // Get guests to send to
  const guests = await Guest.find(guestFilter).lean() as any[];

  if (guests.length === 0) {
    return {
      scheduleId: scheduledMessage._id,
      success: true,
      sentCount: 0,
      failedCount: 0,
      totalGuests: 0,
      message: 'No guests to send to',
    };
  }

  // Get Twilio service
  let twilioService;
  try {
    twilioService = getTwilioService();
  } catch (error) {
    throw new Error('Twilio not configured');
  }

  // Get template info to determine if it needs image or not
  const templateInfo = MESSAGE_TEMPLATES[messageType as MessageType];
  if (!templateInfo) {
    throw new Error(`Invalid message type: ${messageType}`);
  }

  // Select the correct Content SID based on whether template has image or not
  const contentSid = templateInfo.hasImage
    ? process.env.TWILIO_CONTENT_SID_WITH_IMAGE
    : process.env.TWILIO_CONTENT_SID_TEXT_ONLY;

  if (!contentSid) {
    const missingVar = templateInfo.hasImage
      ? 'TWILIO_CONTENT_SID_WITH_IMAGE'
      : 'TWILIO_CONTENT_SID_TEXT_ONLY';
    throw new Error(`${missingVar} not configured for message type: ${messageType}`);
  }

  // Prepare variables
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const partner1Type: PartnerType = wedding.partner1Type || 'groom';
  const partner2Type: PartnerType = wedding.partner2Type || 'bride';
  const happyText = getGenderText('happy', partner1Type, partner2Type);
  const excitedText = getGenderText('excited', partner1Type, partner2Type);

  // Prepare messages
  const messagesToSend = guests.map((guest) => {
    const rsvpLink = `${appUrl}/rsvp/${guest.uniqueToken}`;

    return {
      phone: guest.phone,
      variables: {
        '1': wedding.mediaUrl || '',
        '2': guest.name,
        '3': happyText,
        '4': formatHebrewDate(new Date(wedding.eventDate)),
        '5': wedding.venue,
        '6': wedding.eventTime,
        '7': excitedText,
        '8': `${wedding.groomName} ו${wedding.brideName}`,
        '9': rsvpLink,
        ...(messageType === 'day_before' && guest.tableNumber
          ? { '10': guest.tableNumber.toString() }
          : {}),
      },
      guestId: guest._id.toString(),
    };
  });

  // Send messages
  const result = await twilioService.sendBulkMessagesWithTemplate(
    messagesToSend,
    contentSid,
    { delayBetweenMessages: 1000 }
  );

  return {
    scheduleId: scheduledMessage._id,
    success: true,
    sentCount: result.successful,
    failedCount: result.failed,
    totalGuests: guests.length,
  };
}

/**
 * Send WhatsApp notification to the couple after messages are sent
 */
async function notifyCouple(scheduledMessage: any, result: any) {
  try {
    const { weddingId, messageType } = scheduledMessage;

    // Get wedding and user
    const wedding = await Wedding.findById(weddingId).lean() as any;
    if (!wedding) return;

    const user = await User.findById(wedding.userId).lean() as any;
    if (!user?.phone) return;

    // Get Twilio service
    let twilioService;
    try {
      twilioService = getTwilioService();
    } catch (error) {
      console.error('Could not notify couple - Twilio not configured');
      return;
    }

    const config = MESSAGE_SCHEDULE_CONFIG[messageType as ScheduledMessageType];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const dashboardUrl = `${appUrl}/dashboard/messages/history`;

    // Send notification (freeform message - should work if couple has messaged before)
    const message = `שלום ${wedding.groomName} ו${wedding.brideName}! 📬

${config.description} נשלחה בהצלחה!

📊 סיכום:
✅ נשלח: ${result.sentCount}
❌ נכשל: ${result.failedCount}
📋 סה"כ: ${result.totalGuests}

לצפייה בתגובות:
${dashboardUrl}`;

    await twilioService.sendMessage(user.phone, message);

    // Update that couple was notified
    await ScheduledMessage.updateOne(
      { _id: scheduledMessage._id },
      { coupleNotified: true, coupleNotifiedAt: new Date() }
    );

    console.log(`📱 [CRON] Couple notified for wedding ${weddingId}`);
  } catch (error) {
    console.error('Error notifying couple:', error);
    // Don't throw - notification failure shouldn't fail the whole process
  }
}

// Also allow POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
