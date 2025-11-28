import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Guest from '@/lib/db/models/Guest';
import Wedding from '@/lib/db/models/Wedding';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT - Toggle guest seat lock status
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { lockedSeat, lockedTableId } = body;

    await dbConnect();

    const guest = await Guest.findById(id);

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    // Verify the wedding belongs to this user
    const wedding = await Wedding.findOne({
      _id: guest.weddingId,
      userId: session.user.id,
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    // Update lock status
    if (typeof lockedSeat === 'boolean') {
      guest.lockedSeat = lockedSeat;

      // If unlocking, also clear lockedTableId
      if (!lockedSeat) {
        guest.lockedTableId = undefined;
      }
    }

    // If locking to specific table
    if (lockedTableId) {
      guest.lockedTableId = lockedTableId;
      guest.lockedSeat = true;
    }

    await guest.save();

    return NextResponse.json({
      success: true,
      guest: {
        _id: guest._id,
        lockedSeat: guest.lockedSeat,
        lockedTableId: guest.lockedTableId,
      }
    });
  } catch (error) {
    console.error('Error toggling guest lock:', error);
    return NextResponse.json({ error: 'Failed to update guest lock' }, { status: 500 });
  }
}
