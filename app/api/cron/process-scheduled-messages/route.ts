import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import Guest from '@/lib/db/models/Guest';
import Table from '@/lib/db/models/Table';
import SeatAssignment from '@/lib/db/models/SeatAssignment';
import ScheduledMessage, {
  MESSAGE_SCHEDULE_CONFIG,
  type ScheduledMessageType,
} from '@/lib/db/models/ScheduledMessage';
import MessageLog from '@/lib/db/models/MessageLog';
import { getTwilioService } from '@/lib/services/twilio-whatsapp';
import { formatHebrewDate } from '@/lib/utils/date';
import { getGenderText, type PartnerType } from '@/lib/utils/genderText';
import { MESSAGE_TEMPLATES, generateMessage, type MessageType } from '@/lib/utils/messageTemplates';

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * GET /api/cron/process-scheduled-messages
 * Process all pending scheduled messages that are due
 * Called by Vercel Cron or external scheduler
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    // Vercel Cron sends 'x-vercel-cron-signature' header in production
    // Or we can use our own CRON_SECRET via Authorization header
    const vercelCronHeader = request.headers.get('x-vercel-cron-signature');
    const authHeader = request.headers.get('authorization');

    // Allow if: Vercel Cron signature exists, OR valid CRON_SECRET provided, OR no secret configured
    const isVercelCron = !!vercelCronHeader;
    const isValidSecret = CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`;
    const noSecretConfigured = !CRON_SECRET;

    if (!isVercelCron && !isValidSecret && !noSecretConfigured) {
      console.log('❌ [CRON] Unauthorized request - no valid auth');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`🔑 [CRON] Auth: vercelCron=${isVercelCron}, validSecret=${isValidSecret}`);

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
  let guests = await Guest.find(guestFilter).lean() as any[];

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

  // For day_before messages, we need table numbers from SeatAssignment
  if (messageType === 'day_before') {
    // Get all seat assignments for this wedding
    const seatAssignments = await SeatAssignment.find({
      weddingId,
      assignmentType: 'real',
    }).lean() as any[];

    // Get all tables to map tableId -> tableNumber
    const tables = await Table.find({ weddingId }).lean() as any[];
    const tableMap = new Map(tables.map(t => [t._id.toString(), t.tableNumber]));

    // Create a map of guestId -> tableNumber
    const guestTableMap = new Map<string, number>();
    for (const assignment of seatAssignments) {
      const tableNumber = tableMap.get(assignment.tableId.toString());
      if (tableNumber) {
        guestTableMap.set(assignment.guestId.toString(), tableNumber);
      }
    }

    // Add tableNumber to each guest
    guests = guests.map(guest => ({
      ...guest,
      tableNumber: guestTableMap.get(guest._id.toString()) || guest.tableNumber,
    }));
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

  // Prepare variables - use same logic as manual send (/api/twilio/send-bulk)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const partner1Type: PartnerType = wedding.partner1Type || 'groom';
  const partner2Type: PartnerType = wedding.partner2Type || 'bride';
  const happyText = getGenderText('happy', partner1Type, partner2Type);
  const excitedText = getGenderText('excited', partner1Type, partner2Type);

  // Prepare messages using generateMessage() like manual send does
  const messagesToSend = guests.map((guest) => {
    const rsvpLink = `${appUrl}/rsvp/${guest.uniqueToken}`;

    // Generate the full message body based on message type (same as manual send)
    const messageBody = generateMessage(messageType as MessageType, {
      guestName: '',
      groomName: wedding.groomName,
      brideName: wedding.brideName,
      eventDate: formatHebrewDate(new Date(wedding.eventDate)),
      eventTime: wedding.eventTime,
      venue: wedding.venue,
      rsvpLink,
      tableNumber: guest.tableNumber,
      appUrl,
      happyText,
      excitedText,
      partner1Type,
      partner2Type,
    });

    // Clean up whitespace - message is already in Format B (with | separators)
    const sanitizedMessage = messageBody
      .replace(/\s+/g, ' ')  // Single spaces only
      .trim();

    // Set variables based on template type
    let variables: Record<string, string>;

    if (templateInfo.hasImage) {
      // Template with image: {{1}}=media, {{2}}=name, {{3}}=message
      variables = {
        '1': wedding.mediaUrl || '',  // Media URL (invitation image)
        '2': guest.name,
        '3': sanitizedMessage,
      };
    } else {
      // Text-only template uses named variables: {{name}}, {{message}}
      variables = {
        'name': guest.name,
        'message': sanitizedMessage,
      };
    }

    return {
      phone: guest.phone,
      variables,
      guestId: guest._id.toString(),
    };
  });

  // Send messages
  const result = await twilioService.sendBulkMessagesWithTemplate(
    messagesToSend,
    contentSid,
    { delayBetweenMessages: 1000 }
  );

  // Save MessageLog for each sent message (for status tracking via webhook)
  const twilioFromNumber = process.env.TWILIO_WHATSAPP_NUMBER || '';
  const messageLogsToCreate = result.results
    .filter(r => r.success && r.messageId)
    .map(r => {
      const guest = guests.find(g => g._id.toString() === r.guestId);
      return {
        weddingId,
        guestId: r.guestId,
        scheduledMessageId: scheduledMessage._id,
        twilioSid: r.messageId!,
        deliveryStatus: 'queued',
        messageType,
        toPhone: guest?.phone || '',
        fromPhone: twilioFromNumber,
        sentAt: new Date(),
      };
    });

  if (messageLogsToCreate.length > 0) {
    try {
      await MessageLog.insertMany(messageLogsToCreate);
      console.log(`📝 [CRON] Created ${messageLogsToCreate.length} message logs for tracking`);
    } catch (logError) {
      console.error('⚠️ [CRON] Error creating message logs:', logError);
      // Don't fail the whole process for logging errors
    }
  }

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
 * Uses the text-only template for reliable delivery
 */
async function notifyCouple(scheduledMessage: any, result: any) {
  try {
    const { weddingId, messageType } = scheduledMessage;
    console.log(`📱 [CRON] notifyCouple: Starting for wedding ${weddingId}, messageType: ${messageType}`);

    // Get wedding details
    const wedding = await Wedding.findById(weddingId).lean() as any;
    if (!wedding) {
      console.log(`⚠️ [CRON] notifyCouple: Wedding not found for ${weddingId}`);
      return;
    }
    console.log(`📱 [CRON] notifyCouple: Wedding found, contactPhone: ${wedding.contactPhone || 'missing'}`);

    // Use wedding's contactPhone for notifications
    if (!wedding.contactPhone) {
      console.log(`⚠️ [CRON] notifyCouple: Wedding has no contactPhone set. Please add a phone number in wedding settings.`);
      return;
    }

    const couplePhone = wedding.contactPhone;
    console.log(`📱 [CRON] notifyCouple: Using wedding contactPhone: ${couplePhone}`);

    // Get Twilio service
    let twilioService;
    try {
      twilioService = getTwilioService();
    } catch (error) {
      console.error('Could not notify couple - Twilio not configured');
      return;
    }

    // Get text-only template Content SID
    const contentSid = process.env.TWILIO_CONTENT_SID_TEXT_ONLY;
    console.log(`📱 [CRON] notifyCouple: TWILIO_CONTENT_SID_TEXT_ONLY: ${contentSid ? 'configured' : 'MISSING'}`);
    if (!contentSid) {
      console.error('TWILIO_CONTENT_SID_TEXT_ONLY not configured - cannot notify couple');
      return;
    }

    const config = MESSAGE_SCHEDULE_CONFIG[messageType as ScheduledMessageType];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const dashboardUrl = `${appUrl}/dashboard/messages`;

    // Build notification message for the couple - simple and clean
    const notificationMessage = `${config.description} נשלחה בהצלחה! סטטוס המסירה יתעדכן בדקות הקרובות🥳 | לצפייה באישורי הגעה: ${dashboardUrl}`;

    // Use text-only template with named variables
    const variables = {
      'name': `${wedding.groomName} ו${wedding.brideName}`,
      'message': notificationMessage,
    };

    console.log(`📱 [CRON] notifyCouple: Sending notification to ${couplePhone} with message: ${notificationMessage.substring(0, 50)}...`);

    const sendResult = await twilioService.sendMessageWithTemplate(couplePhone, contentSid, variables);
    console.log(`📱 [CRON] notifyCouple: Twilio send result:`, sendResult);

    // Update that couple was notified
    await ScheduledMessage.updateOne(
      { _id: scheduledMessage._id },
      { coupleNotified: true, coupleNotifiedAt: new Date() }
    );

    console.log(`✅ [CRON] Couple notified successfully for wedding ${weddingId}`);
  } catch (error) {
    console.error('❌ [CRON] Error notifying couple:', error);
    // Don't throw - notification failure shouldn't fail the whole process
  }
}

// Also allow POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
