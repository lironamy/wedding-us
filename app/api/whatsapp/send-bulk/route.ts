import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Guest from '@/lib/db/models/Guest';
import Wedding from '@/lib/db/models/Wedding';
import Message from '@/lib/db/models/Message';
import { MESSAGE_TEMPLATES, type MessageType } from '@/lib/utils/messageTemplates';
import { replaceGenderPlaceholders } from '@/lib/utils/genderText';
import whatsappService from '@/lib/whatsapp/client';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Wait for initialization to complete (in case auto-reconnect is in progress)
    await whatsappService.waitForInitialization();

    // Check if WhatsApp is connected
    if (!whatsappService.isReady()) {
      return NextResponse.json(
        { error: 'WhatsApp is not connected. Please connect first.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { weddingId, guestIds, messageType, delayBetweenMessages = 3000 } = body;

    if (!weddingId || !guestIds || !messageType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get wedding details
    const wedding = await Wedding.findOne({
      _id: weddingId,
      userId: session.user.id,
    }).lean() as any;

    if (!wedding) {
      return NextResponse.json(
        { error: 'Wedding not found' },
        { status: 404 }
      );
    }

    // Get guests
    const guests = await Guest.find({
      _id: { $in: guestIds },
      weddingId,
    }).lean() as any[];

    if (guests.length === 0) {
      return NextResponse.json(
        { error: 'No guests found' },
        { status: 404 }
      );
    }

    // Get message template
    const template = MESSAGE_TEMPLATES[messageType as MessageType];
    if (!template) {
      return NextResponse.json(
        { error: 'Invalid message type' },
        { status: 400 }
      );
    }

    // Get partner types for gender-aware text (default to groom/bride for backward compatibility)
    const partner1Type = wedding.partner1Type || 'groom';
    const partner2Type = wedding.partner2Type || 'bride';

    // Prepare messages
    const messages = guests.map((guest) => {
      // Generate RSVP link
      const rsvpLink = `${process.env.NEXT_PUBLIC_APP_URL}/rsvp/${guest.uniqueToken}`;

      // Format date
      const eventDate = new Date(wedding.eventDate);
      const formattedDate = eventDate.toLocaleDateString('he-IL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Replace gender placeholders first
      let messageText = replaceGenderPlaceholders(template.template, partner1Type, partner2Type);

      // Replace other placeholders in template
      messageText = messageText
        .replace(/{guestName}/g, guest.name)
        .replace(/{groomName}/g, wedding.groomName)
        .replace(/{brideName}/g, wedding.brideName)
        .replace(/{eventDate}/g, formattedDate)
        .replace(/{eventTime}/g, wedding.eventTime || '')
        .replace(/{venue}/g, wedding.venue || '')
        .replace(/{rsvpLink}/g, rsvpLink);

      return {
        phone: guest.phone,
        message: messageText,
        guestId: guest._id.toString(),
        guestName: guest.name,
      };
    });

    // Get image URL if wedding has one (only for image type media)
    const imageUrl = wedding.mediaType === 'image' && wedding.mediaUrl
      ? wedding.mediaUrl
      : undefined;

    // Send messages using the WhatsApp service (with image if available)
    const result = await whatsappService.sendBulkMessages(
      messages,
      delayBetweenMessages,
      undefined, // onProgress callback
      imageUrl
    );

    // Save messages to database and update guest records
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const now = new Date();

    // Create message records and update guests
    const savePromises = result.results.map(async (msgResult) => {
      // Find the original message content
      const originalMessage = messages.find(m => m.guestId === msgResult.guestId);

      // Save to Message collection
      await Message.create({
        weddingId,
        guestId: msgResult.guestId,
        messageType: messageType as 'invitation' | 'rsvp_reminder' | 'rsvp_reminder_2' | 'day_before' | 'thank_you',
        messageContent: originalMessage?.message || '',
        sentAt: now,
        status: msgResult.success ? 'sent' : 'failed',
        sentBy: session.user.id,
        batchId,
        deliveryStatus: msgResult.success ? 'delivered' : 'failed',
        whatsappMessageId: msgResult.messageId,
        errorMessage: msgResult.error,
      });

      // Update guest's messageSent array
      if (msgResult.success) {
        await Guest.findByIdAndUpdate(msgResult.guestId, {
          $push: {
            messageSent: {
              type: messageType,
              sentAt: now,
            },
          },
        });
      }
    });

    await Promise.all(savePromises);

    return NextResponse.json({
      ...result,
      batchId,
    });
  } catch (error: any) {
    console.error('Error sending bulk WhatsApp messages:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send messages' },
      { status: 500 }
    );
  }
}
