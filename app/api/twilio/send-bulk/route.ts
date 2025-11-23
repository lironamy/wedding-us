import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Guest from '@/lib/db/models/Guest';
import Wedding from '@/lib/db/models/Wedding';
import Message from '@/lib/db/models/Message';
import { getTwilioService, type TemplateVariables } from '@/lib/services/twilio-whatsapp';
import { generateMessage, type MessageType } from '@/lib/utils/messageTemplates';
import { formatHebrewDate } from '@/lib/utils/date';
import { getGenderText, type PartnerType } from '@/lib/utils/genderText';

/**
 * POST /api/twilio/send-bulk
 * Send bulk WhatsApp messages via Twilio with Content Templates
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { weddingId, guestIds, messageType, delayBetweenMessages = 1000 } = body;

    // Validation
    if (!weddingId || !guestIds || !Array.isArray(guestIds) || !messageType) {
      return NextResponse.json(
        { error: 'Wedding ID, guest IDs array, and message type are required' },
        { status: 400 }
      );
    }

    // Get Content SID for this message type
    const contentSidMap: Record<string, string | undefined> = {
      invitation: process.env.TWILIO_CONTENT_SID_INVITATION,
      rsvp_reminder: process.env.TWILIO_CONTENT_SID_REMINDER,
      rsvp_reminder_2: process.env.TWILIO_CONTENT_SID_REMINDER,
      day_before: process.env.TWILIO_CONTENT_SID_DAY_BEFORE,
      thank_you: process.env.TWILIO_CONTENT_SID_THANK_YOU,
    };

    const contentSid = contentSidMap[messageType];

    if (!contentSid) {
      return NextResponse.json(
        {
          error: 'Template not configured',
          message: `Please set TWILIO_CONTENT_SID_${messageType.toUpperCase()} in environment variables`,
          details: 'WhatsApp requires approved templates for bulk messaging'
        },
        { status: 400 }
      );
    }

    // Get Twilio service
    let twilioService;
    try {
      twilioService = getTwilioService();
    } catch (error: any) {
      return NextResponse.json(
        {
          error: 'Twilio not configured',
          message: 'Please configure Twilio credentials in environment variables',
          details: error.message
        },
        { status: 500 }
      );
    }

    await dbConnect();

    // Verify the wedding belongs to this user
    const wedding = await Wedding.findOne({
      _id: weddingId,
      userId: session.user.id,
    }).lean() as any;

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    // Get selected guests
    const guests = await Guest.find({
      _id: { $in: guestIds },
      weddingId,
    }).lean() as any[];

    if (guests.length === 0) {
      return NextResponse.json({ error: 'No guests found' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Generate batch ID for this sending batch
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Get gender-aware text based on partner types
    const partner1Type: PartnerType = wedding.partner1Type || 'groom';
    const partner2Type: PartnerType = wedding.partner2Type || 'bride';
    const happyText = getGenderText('happy', partner1Type, partner2Type); // שמחים/שמחות
    const excitedText = getGenderText('excited', partner1Type, partner2Type); // מתרגשים/מתרגשות

    // Prepare messages for bulk send with template variables
    const messagesToSend = guests.map((guest) => {
      const rsvpLink = `${appUrl}/rsvp/${guest.uniqueToken}`;

      // Template variables - must match your Twilio Content Template
      // Template format (with image header as {{1}}):
      // [IMAGE {{1}} - dynamic from wedding.mediaUrl]
      //
      // היי {{2}}, {{3}}
      // להזמינכם לחתונה שלנו 💍
      //
      // נפגש ביום {{4}}
      // ב"{{5}}" בשעה {{6}}
      //
      // {{7}} לחגוג איתכם,
      // {{8}}
      //
      // לחצו על הקישור לאישור הגעה
      // {{9}}
      const variables: TemplateVariables = {
        '1': wedding.mediaUrl || '', // Image URL (header)
        '2': guest.name,
        '3': happyText, // שמחים/שמחות
        '4': formatHebrewDate(new Date(wedding.eventDate)),
        '5': wedding.venue,
        '6': wedding.eventTime,
        '7': excitedText, // מתרגשים/מתרגשות
        '8': `${wedding.groomName} ו${wedding.brideName}`,
        '9': rsvpLink,
      };

      // Add table number for day_before messages
      if (messageType === 'day_before' && guest.tableNumber) {
        variables['10'] = guest.tableNumber.toString();
      }

      return {
        phone: guest.phone,
        variables,
        guestId: guest._id.toString(),
      };
    });

    console.log(`📱 [API] Sending bulk template messages via Twilio to ${messagesToSend.length} guests`);
    console.log(`📝 [API] Using Content SID: ${contentSid}`);

    // Track progress and errors
    const progressUpdates: Array<{ guestId: string; sent: number; total: number }> = [];
    const errors: Array<{ guestId: string; error: string }> = [];

    // Send bulk messages with template
    const result = await twilioService.sendBulkMessagesWithTemplate(messagesToSend, contentSid, {
      delayBetweenMessages,
      onProgress: (sent, total, guestId) => {
        console.log(`📊 [API] Progress: ${sent}/${total} - Guest ID: ${guestId}`);
        progressUpdates.push({ guestId, sent, total });
      },
      onError: (error, guestId) => {
        console.error(`❌ [API] Error for guest ${guestId}:`, error);
        errors.push({ guestId, error });
      },
    });

    // Update message records in database
    const messageRecords = [];
    for (const msgResult of result.results) {
      const guest = guests.find((g) => g._id.toString() === msgResult.guestId);
      if (!guest) continue;

      const rsvpLink = `${appUrl}/rsvp/${guest.uniqueToken}`;
      const messageContent = generateMessage(messageType as MessageType, {
        guestName: guest.name,
        groomName: wedding.groomName,
        brideName: wedding.brideName,
        eventDate: formatHebrewDate(new Date(wedding.eventDate)),
        eventTime: wedding.eventTime,
        venue: wedding.venue,
        rsvpLink,
        tableNumber: guest.tableNumber,
        appUrl,
      });

      messageRecords.push({
        weddingId,
        guestId: guest._id,
        messageType,
        messageContent,
        status: msgResult.success ? 'sent' : 'failed',
        sentBy: session.user.id,
        sentAt: new Date(),
        batchId,
        deliveryStatus: msgResult.success ? 'delivered' : 'failed',
        errorMessage: msgResult.error,
        whatsappMessageId: msgResult.messageId,
      });
    }

    // Insert message records
    if (messageRecords.length > 0) {
      await Message.insertMany(messageRecords);
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: messagesToSend.length,
        successful: result.successful,
        failed: result.failed,
        batchId,
      },
      results: result.results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('❌ [API] Bulk send error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send bulk messages',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
