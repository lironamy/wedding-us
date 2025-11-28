import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import TableAdjacency from '@/lib/db/models/TableAdjacency';
import Table from '@/lib/db/models/Table';
import Wedding from '@/lib/db/models/Wedding';

// GET - Get all adjacencies for a wedding
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

    const adjacencies = await TableAdjacency.find({ weddingId })
      .populate('tableId', 'tableName tableNumber')
      .populate('adjacentTableId', 'tableName tableNumber')
      .lean();

    return NextResponse.json({ adjacencies });
  } catch (error) {
    console.error('Error fetching adjacencies:', error);
    return NextResponse.json({ error: 'Failed to fetch adjacencies' }, { status: 500 });
  }
}

// POST - Create adjacency between two tables
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { weddingId, tableId, adjacentTableId } = body;

    if (!weddingId || !tableId || !adjacentTableId) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (tableId === adjacentTableId) {
      return NextResponse.json({ error: 'Cannot make table adjacent to itself' }, { status: 400 });
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

    // Verify both tables exist and belong to this wedding
    const [table1, table2] = await Promise.all([
      Table.findOne({ _id: tableId, weddingId }),
      Table.findOne({ _id: adjacentTableId, weddingId }),
    ]);

    if (!table1 || !table2) {
      return NextResponse.json({ error: 'One or both tables not found' }, { status: 404 });
    }

    // Create bidirectional adjacency (both directions)
    // Use upsert to avoid duplicates
    const [adj1, adj2] = await Promise.all([
      TableAdjacency.findOneAndUpdate(
        { weddingId, tableId, adjacentTableId },
        { weddingId, tableId, adjacentTableId },
        { upsert: true, new: true }
      ),
      TableAdjacency.findOneAndUpdate(
        { weddingId, tableId: adjacentTableId, adjacentTableId: tableId },
        { weddingId, tableId: adjacentTableId, adjacentTableId: tableId },
        { upsert: true, new: true }
      ),
    ]);

    return NextResponse.json({
      success: true,
      adjacency: {
        tableId,
        adjacentTableId,
        table1Number: table1.tableNumber,
        table2Number: table2.tableNumber,
      }
    });
  } catch (error: any) {
    console.error('Error creating adjacency:', error);

    if (error.code === 11000) {
      return NextResponse.json({ error: 'Adjacency already exists' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to create adjacency' }, { status: 500 });
  }
}

// DELETE - Remove adjacency between two tables
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get('weddingId');
    const tableId = searchParams.get('tableId');
    const adjacentTableId = searchParams.get('adjacentTableId');

    if (!weddingId || !tableId || !adjacentTableId) {
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

    // Delete both directions of adjacency
    await Promise.all([
      TableAdjacency.deleteOne({ weddingId, tableId, adjacentTableId }),
      TableAdjacency.deleteOne({ weddingId, tableId: adjacentTableId, adjacentTableId: tableId }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting adjacency:', error);
    return NextResponse.json({ error: 'Failed to delete adjacency' }, { status: 500 });
  }
}
