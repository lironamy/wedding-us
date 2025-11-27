import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Table from '@/lib/db/models/Table';
import Wedding from '@/lib/db/models/Wedding';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT - Update table position
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { positionX, positionY } = body;

    if (positionX === undefined || positionY === undefined) {
      return NextResponse.json(
        { error: 'Position coordinates are required' },
        { status: 400 }
      );
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

    // Update position
    table.positionX = positionX;
    table.positionY = positionY;
    await table.save();

    return NextResponse.json({ success: true, table });
  } catch (error) {
    console.error('Error updating table position:', error);
    return NextResponse.json({ error: 'Failed to update position' }, { status: 500 });
  }
}
