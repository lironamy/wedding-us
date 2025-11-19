import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Guest from '@/lib/db/models/Guest';
import Wedding from '@/lib/db/models/Wedding';
import Message from '@/lib/db/models/Message';
import { getTwilioService } from '@/lib/services/twilio-whatsapp';
import { generateMessage, type MessageType } from '@/lib/utils/messageTemplates';
import { formatHebrewDate } from '@/lib/utils/date';

/**
 * POST /api/twilio/send-bulk
 * Send bulk WhatsApp messages via Twilio with proper delays and tracking
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

    // Prepare messages for bulk send
    const messagesToSend = guests.map((guest) => {
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

      return {
        phone: guest.phone,
        message: messageContent,
        guestId: guest._id.toString(),
      };
    });

    console.log(`📱 [API] Sending bulk messages via Twilio to ${messagesToSend.length} guests`);

    // Track progress and errors
    const progressUpdates: Array<{ guestId: string; sent: number; total: number }> = [];
    const errors: Array<{ guestId: string; error: string }> = [];

    // Send bulk messages
    const result = await twilioService.sendBulkMessages(messagesToSend, {
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
