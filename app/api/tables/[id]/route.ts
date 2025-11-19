import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Table from '@/lib/db/models/Table';
import Wedding from '@/lib/db/models/Wedding';
import Guest from '@/lib/db/models/Guest';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get a single table
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    const table = await Table.findById(id)
      .populate('assignedGuests', 'name phone rsvpStatus adultsAttending childrenAttending familyGroup')
      .lean() as any;

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

    return NextResponse.json({ table });
  } catch (error) {
    console.error('Error fetching table:', error);
    return NextResponse.json({ error: 'Failed to fetch table' }, { status: 500 });
  }
}

// PUT - Update a table
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { tableName, tableNumber, capacity, tableType } = body;

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

    // Check if new table number conflicts with existing
    if (tableNumber && tableNumber !== table.tableNumber) {
      const existingTable = await Table.findOne({
        weddingId: table.weddingId,
        tableNumber,
        _id: { $ne: id },
      });

      if (existingTable) {
        return NextResponse.json(
          { error: `Table number ${tableNumber} already exists` },
          { status: 400 }
        );
      }
    }

    // Update the table
    if (tableName) table.tableName = tableName;
    if (tableNumber) table.tableNumber = tableNumber;
    if (capacity) table.capacity = capacity;
    if (tableType) table.tableType = tableType;

    await table.save();

    // Also update tableNumber on all assigned guests
    if (tableNumber) {
      await Guest.updateMany(
        { _id: { $in: table.assignedGuests } },
        { tableNumber: tableNumber, tableAssignment: tableName || table.tableName }
      );
    }

    return NextResponse.json({ table });
  } catch (error: any) {
    console.error('Error updating table:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Table number already exists for this wedding' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 });
  }
}

// DELETE - Delete a table
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

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

    // Clear tableNumber from all assigned guests
    await Guest.updateMany(
      { _id: { $in: table.assignedGuests } },
      { $unset: { tableNumber: 1, tableAssignment: 1 } }
    );

    // Delete the table
    await Table.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 });
  }
}
