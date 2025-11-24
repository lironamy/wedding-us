import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Guest from '@/lib/db/models/Guest';
import Wedding from '@/lib/db/models/Wedding';

// GET - Get single guest
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const guest = await Guest.findById(id).lean() as any;

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    // Verify the wedding belongs to this user
    const wedding = await Wedding.findOne({
      _id: guest.weddingId,
      userId: session.user.id,
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ guest }, { status: 200 });
  } catch (error) {
    console.error('Error fetching guest:', error);
    return NextResponse.json({ error: 'Failed to fetch guest' }, { status: 500 });
  }
}

// PUT - Update guest
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    await dbConnect();

    const { id } = await params;
    // Find guest and verify ownership
    const guest = await Guest.findById(id) as any;

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    // Verify the wedding belongs to this user
    const wedding = await Wedding.findOne({
      _id: guest.weddingId,
      userId: session.user.id,
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If phone is being updated, check for duplicates
    if (body.phone && body.phone.trim() !== guest.phone) {
      const existingGuest = await Guest.findOne({
        weddingId: guest.weddingId,
        phone: body.phone.trim(),
        _id: { $ne: id }, // Exclude current guest
      });

      if (existingGuest) {
        return NextResponse.json(
          { error: `אורח עם מספר הטלפון ${body.phone} כבר קיים (${existingGuest.name})` },
          { status: 400 }
        );
      }
    }

    // Update allowed fields
    const allowedFields = [
      'name',
      'phone',
      'email',
      'familyGroup',
      'invitedCount',
      'tableAssignment',
      'tableNumber',
      'notes',
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        guest[field as keyof typeof guest] = body[field];
      }
    });

    await guest.save();

    return NextResponse.json({ guest }, { status: 200 });
  } catch (error) {
    console.error('Error updating guest:', error);
    return NextResponse.json({ error: 'Failed to update guest' }, { status: 500 });
  }
}

// DELETE - Delete guest
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const guest = await Guest.findById(id) as any;

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    // Verify the wedding belongs to this user
    const wedding = await Wedding.findOne({
      _id: guest.weddingId,
      userId: session.user.id,
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await Guest.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Guest deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting guest:', error);
    return NextResponse.json({ error: 'Failed to delete guest' }, { status: 500 });
  }
}
