import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Table from '@/lib/db/models/Table';
import Wedding from '@/lib/db/models/Wedding';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT - Toggle table lock status
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { locked } = body;

    if (typeof locked !== 'boolean') {
      return NextResponse.json({ error: 'locked field is required' }, { status: 400 });
    }

    await dbConnect();

    const table = await Table.findById(id);

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Verify the wedding belongs to this user
    const wedding = await Wedding.findOne({
      _id: table.weddingId,
      userId: session.user.id,
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Update lock status
    table.locked = locked;
    await table.save();

    return NextResponse.json({
      success: true,
      table: {
        _id: table._id,
        locked: table.locked,
      }
    });
  } catch (error) {
    console.error('Error toggling table lock:', error);
    return NextResponse.json({ error: 'Failed to update table lock' }, { status: 500 });
  }
}
