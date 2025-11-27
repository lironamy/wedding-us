import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import GuestGroup from '@/lib/db/models/GuestGroup';
import Guest from '@/lib/db/models/Guest';

// GET - Get all groups for a wedding
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get('weddingId');

    if (!weddingId) {
      return NextResponse.json({ error: 'Wedding ID required' }, { status: 400 });
    }

    // Verify wedding ownership
    const wedding = await Wedding.findOne({
      _id: weddingId,
      userId: session.user.id,
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    const groups = await GuestGroup.find({ weddingId })
      .sort({ priority: -1, name: 1 })
      .lean();

    // Get guest counts for each group
    const groupsWithCounts = await Promise.all(
      groups.map(async (group: any) => {
        const guestCount = await Guest.countDocuments({
          weddingId,
          groupId: group._id,
        });
        const confirmedCount = await Guest.countDocuments({
          weddingId,
          groupId: group._id,
          rsvpStatus: 'confirmed',
        });

        return {
          ...group,
          _id: group._id.toString(),
          guestCount,
          confirmedCount,
        };
      })
    );

    return NextResponse.json({ groups: groupsWithCounts });
  } catch (error) {
    console.error('Get groups API error:', error);
    return NextResponse.json(
      { error: 'Failed to get groups' },
      { status: 500 }
    );
  }
}

// POST - Create a new group
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { weddingId, name, priority = 0 } = body;

    if (!weddingId || !name) {
      return NextResponse.json(
        { error: 'Wedding ID and name are required' },
        { status: 400 }
      );
    }

    // Verify wedding ownership
    const wedding = await Wedding.findOne({
      _id: weddingId,
      userId: session.user.id,
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    // Check for duplicate name
    const existing = await GuestGroup.findOne({ weddingId, name });
    if (existing) {
      return NextResponse.json(
        { error: 'Group with this name already exists' },
        { status: 400 }
      );
    }

    const group = await GuestGroup.create({
      weddingId,
      name,
      priority,
    });

    return NextResponse.json({
      success: true,
      group: {
        ...group.toObject(),
        _id: group._id.toString(),
        guestCount: 0,
        confirmedCount: 0,
      },
    });
  } catch (error) {
    console.error('Create group API error:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}

// PUT - Update a group
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { groupId, name, priority } = body;

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID required' }, { status: 400 });
    }

    const group = await GuestGroup.findById(groupId);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Verify wedding ownership
    const wedding = await Wedding.findOne({
      _id: group.weddingId,
      userId: session.user.id,
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for duplicate name if changing
    if (name && name !== group.name) {
      const existing = await GuestGroup.findOne({
        weddingId: group.weddingId,
        name,
        _id: { $ne: groupId },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Group with this name already exists' },
          { status: 400 }
        );
      }
    }

    if (name) group.name = name;
    if (priority !== undefined) group.priority = priority;

    await group.save();

    return NextResponse.json({
      success: true,
      group: {
        ...group.toObject(),
        _id: group._id.toString(),
      },
    });
  } catch (error) {
    console.error('Update group API error:', error);
    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a group
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID required' }, { status: 400 });
    }

    const group = await GuestGroup.findById(groupId);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Verify wedding ownership
    const wedding = await Wedding.findOne({
      _id: group.weddingId,
      userId: session.user.id,
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Remove group reference from all guests
    await Guest.updateMany(
      { groupId },
      { $unset: { groupId: 1 } }
    );

    await GuestGroup.findByIdAndDelete(groupId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete group API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    );
  }
}
