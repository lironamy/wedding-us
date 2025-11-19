import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Guest from '@/lib/db/models/Guest';
import Wedding from '@/lib/db/models/Wedding';
import { generateMessage, getTemplate, type MessageType } from '@/lib/utils/messageTemplates';
import { formatHebrewDate } from '@/lib/utils/date';

// POST - Preview message for a guest
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { weddingId, guestId, messageType } = body;

    // Validation
    if (!weddingId || !guestId || !messageType) {
      return NextResponse.json(
        { error: 'Wedding ID, Guest ID, and message type are required' },
        { status: 400 }
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

    // Get guest details
    const guest = await Guest.findOne({
      _id: guestId,
      weddingId,
    }).lean() as any;

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    // Generate message
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
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

    const template = getTemplate(messageType as MessageType);

    // Ensure proper UTF-8 encoding for the response
    const encodedMessageContent = Buffer.from(messageContent, 'utf8').toString('utf8');
    
    return NextResponse.json({
      messageContent: encodedMessageContent,
      template,
      guest: {
        name: guest.name,
        phone: guest.phone,
      },
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('Error previewing message:', error);
    return NextResponse.json({ error: 'Failed to preview message' }, { status: 500 });
  }
}
