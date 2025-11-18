import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Guest from '@/lib/db/models/Guest';
import Wedding from '@/lib/db/models/Wedding';
import { v4 as uuidv4 } from 'uuid';

// GET - Get all guests for a wedding
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const weddingId = searchParams.get('weddingId');

    if (!weddingId) {
      return NextResponse.json({ error: 'Wedding ID is required' }, { status: 400 });
    }

    await dbConnect();

    // Verify the wedding belongs to this user
    const wedding = await Wedding.findOne({
      _id: weddingId,
      userId: session.user.id
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    // Get all guests for this wedding
    const guests = await Guest.find({ weddingId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ guests }, { status: 200 });
  } catch (error) {
    console.error('Error fetching guests:', error);
    return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 });
  }
}

// POST - Create a new guest
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      weddingId,
      name,
      phone,
      email,
      familyGroup,
      invitedCount = 1,
    } = body;

    // Validation
    if (!weddingId || !name || !phone) {
      return NextResponse.json(
        { error: 'Wedding ID, name, and phone are required' },
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

    // Create new guest
    const guest = new Guest({
      guestId: uuidv4(),
      weddingId,
      name,
      phone,
      email,
      familyGroup,
      invitedCount,
      uniqueToken: uuidv4(), // For RSVP link
      rsvpStatus: 'pending',
      messageSent: [],
    });

    await guest.save();

    return NextResponse.json({ guest }, { status: 201 });
  } catch (error) {
    console.error('Error creating guest:', error);
    return NextResponse.json({ error: 'Failed to create guest' }, { status: 500 });
  }
}
