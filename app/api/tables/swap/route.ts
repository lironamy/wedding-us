import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Table from '@/lib/db/models/Table';
import Wedding from '@/lib/db/models/Wedding';
import Guest from '@/lib/db/models/Guest';

// POST - Swap two tables (all properties including guests)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tableAId, tableBId } = body;

    if (!tableAId || !tableBId) {
      return NextResponse.json(
        { error: 'Both table IDs are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get both tables
    const tableA = await Table.findById(tableAId);
    const tableB = await Table.findById(tableBId);

    if (!tableA || !tableB) {
      return NextResponse.json({ error: 'One or both tables not found' }, { status: 404 });
    }

    // Verify same wedding
    if (tableA.weddingId.toString() !== tableB.weddingId.toString()) {
      return NextResponse.json({ error: 'Tables must belong to the same wedding' }, { status: 400 });
    }

    // Verify the wedding belongs to this user
    const wedding = await Wedding.findOne({
      _id: tableA.weddingId,
      userId: session.user.id,
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    // Store original values
    const tableANumber = tableA.tableNumber;
    const tableBNumber = tableB.tableNumber;

    // Use a temporary number to avoid unique constraint violation
    const tempNumber = -1;

    // Step 1: Set tableA to temp number
    await Table.findByIdAndUpdate(tableAId, { tableNumber: tempNumber });

    // Step 2: Set tableB to tableA's original number
    await Table.findByIdAndUpdate(tableBId, { tableNumber: tableANumber });

    // Step 3: Set tableA to tableB's original number
    await Table.findByIdAndUpdate(tableAId, { tableNumber: tableBNumber });

    // Update guest tableNumber references
    await Guest.updateMany(
      { _id: { $in: tableA.assignedGuests } },
      { tableNumber: tableBNumber }
    );

    await Guest.updateMany(
      { _id: { $in: tableB.assignedGuests } },
      { tableNumber: tableANumber }
    );

    // Fetch updated tables
    const updatedTableA = await Table.findById(tableAId)
      .populate('assignedGuests', 'name phone rsvpStatus adultsAttending childrenAttending')
      .lean();
    const updatedTableB = await Table.findById(tableBId)
      .populate('assignedGuests', 'name phone rsvpStatus adultsAttending childrenAttending')
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Tables swapped successfully',
      tables: [updatedTableA, updatedTableB],
    });
  } catch (error: any) {
    console.error('Error swapping tables:', error);
    return NextResponse.json({ error: 'Failed to swap tables' }, { status: 500 });
  }
}
