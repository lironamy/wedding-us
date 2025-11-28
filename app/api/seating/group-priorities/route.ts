import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import GroupPriority from '@/lib/db/models/GroupPriority';
import Wedding from '@/lib/db/models/Wedding';

// GET - Get all group priorities for a wedding
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get('weddingId');

    if (!weddingId) {
      return NextResponse.json({ error: 'Wedding ID required' }, { status: 400 });
    }

    await dbConnect();

    // Verify wedding ownership
    const wedding = await Wedding.findOne({
      _id: weddingId,
      userId: session.user.id,
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    const priorities = await GroupPriority.find({ weddingId })
      .sort({ priority: 1 })
      .lean();

    return NextResponse.json({ priorities });
  } catch (error) {
    console.error('Error fetching group priorities:', error);
    return NextResponse.json({ error: 'Failed to fetch priorities' }, { status: 500 });
  }
}

// POST - Set priority for a group
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { weddingId, groupName, priority } = body;

    if (!weddingId || !groupName || priority === undefined) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await dbConnect();

    // Verify wedding ownership
    const wedding = await Wedding.findOne({
      _id: weddingId,
      userId: session.user.id,
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    // If setting priority > 0, check if another group has this priority
    if (priority > 0) {
      const existingWithPriority = await GroupPriority.findOne({
        weddingId,
        priority,
        groupName: { $ne: groupName },
      });

      if (existingWithPriority) {
        // Swap priorities - set existing one to 0 (no priority)
        await GroupPriority.findByIdAndUpdate(existingWithPriority._id, { priority: 0 });
      }
    }

    // Upsert the priority
    const result = await GroupPriority.findOneAndUpdate(
      { weddingId, groupName },
      { weddingId, groupName, priority },
      { upsert: true, new: true }
    );

    // Get updated priorities list
    const priorities = await GroupPriority.find({ weddingId })
      .sort({ priority: 1 })
      .lean();

    return NextResponse.json({ success: true, priority: result, priorities });
  } catch (error) {
    console.error('Error setting group priority:', error);
    return NextResponse.json({ error: 'Failed to set priority' }, { status: 500 });
  }
}

// PUT - Update multiple priorities at once (for drag-and-drop reordering)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { weddingId, priorities } = body as {
      weddingId: string;
      priorities: Array<{ groupName: string; priority: number }>;
    };

    if (!weddingId || !priorities) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await dbConnect();

    // Verify wedding ownership
    const wedding = await Wedding.findOne({
      _id: weddingId,
      userId: session.user.id,
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    // Update all priorities
    const bulkOps = priorities.map(({ groupName, priority }) => ({
      updateOne: {
        filter: { weddingId, groupName },
        update: { weddingId, groupName, priority },
        upsert: true,
      },
    }));

    await GroupPriority.bulkWrite(bulkOps);

    // Get updated priorities list
    const updatedPriorities = await GroupPriority.find({ weddingId })
      .sort({ priority: 1 })
      .lean();

    return NextResponse.json({ success: true, priorities: updatedPriorities });
  } catch (error) {
    console.error('Error updating group priorities:', error);
    return NextResponse.json({ error: 'Failed to update priorities' }, { status: 500 });
  }
}

// DELETE - Remove priority for a group
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get('weddingId');
    const groupName = searchParams.get('groupName');

    if (!weddingId || !groupName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await dbConnect();

    // Verify wedding ownership
    const wedding = await Wedding.findOne({
      _id: weddingId,
      userId: session.user.id,
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    await GroupPriority.deleteOne({ weddingId, groupName });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting group priority:', error);
    return NextResponse.json({ error: 'Failed to delete priority' }, { status: 500 });
  }
}
