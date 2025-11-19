import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Message from '@/lib/db/models/Message';
import Wedding from '@/lib/db/models/Wedding';

// GET - Get all messages for a wedding
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const weddingId = searchParams.get('weddingId');
    const messageType = searchParams.get('messageType');
    const status = searchParams.get('status');

    if (!weddingId) {
      return NextResponse.json({ error: 'Wedding ID is required' }, { status: 400 });
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

    // Build query
    const query: any = { weddingId };
    if (messageType) query.messageType = messageType;
    if (status) query.status = status;

    // Get messages with guest details
    const messages = await Message.find(query)
      .populate('guestId', 'name phone rsvpStatus')
      .sort({ sentAt: -1 })
      .lean();

    // Ensure proper UTF-8 encoding for all message contents
    const encodedMessages = messages.map(msg => ({
      ...msg,
      messageContent: Buffer.from(msg.messageContent, 'utf8').toString('utf8')
    }));
    
    return NextResponse.json({ messages: encodedMessages }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST - Record a sent message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { weddingId, guestId, messageType, messageContent, status = 'sent', notes } = body;

    // Validation
    if (!weddingId || !guestId || !messageType || !messageContent) {
      return NextResponse.json(
        { error: 'Wedding ID, Guest ID, message type, and content are required' },
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

    // Create message record
    const message = new Message({
      weddingId,
      guestId,
      messageType,
      messageContent,
      status,
      sentBy: session.user.id,
      notes,
      sentAt: new Date(),
    });

    await message.save();

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
