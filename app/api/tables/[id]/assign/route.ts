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

// POST - Assign guests to a table
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { guestIds, action = 'add' } = body; // action: 'add', 'remove', 'set'

    if (!guestIds || !Array.isArray(guestIds)) {
      return NextResponse.json({ error: 'Guest IDs array is required' }, { status: 400 });
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

    // Verify all guests belong to this wedding
    const guests = await Guest.find({
      _id: { $in: guestIds },
      weddingId: table.weddingId,
    });

    if (guests.length !== guestIds.length) {
      return NextResponse.json(
        { error: 'One or more guests not found or do not belong to this wedding' },
        { status: 400 }
      );
    }

    let updatedAssignedGuests: string[] = [];

    if (action === 'add') {
      // Add guests to table (if not already assigned)
      const existingIds = table.assignedGuests.map((g: any) => g.toString());
      const newIds = guestIds.filter((id: string) => !existingIds.includes(id));
      updatedAssignedGuests = [...existingIds, ...newIds];
    } else if (action === 'remove') {
      // Remove guests from table
      const removeIds = new Set(guestIds);
      updatedAssignedGuests = table.assignedGuests
        .map((g: any) => g.toString())
        .filter((id: string) => !removeIds.has(id));
    } else if (action === 'set') {
      // Replace all assigned guests
      updatedAssignedGuests = guestIds;
    }

    // Calculate total guests (including adults and children)
    const assignedGuestsData = await Guest.find({
      _id: { $in: updatedAssignedGuests },
    });

    const totalPeople = assignedGuestsData.reduce((sum, guest) => {
      return sum + (guest.adultsAttending || 1) + (guest.childrenAttending || 0);
    }, 0);

    // Warn if over capacity (but still allow)
    const isOverCapacity = totalPeople > table.capacity;

    // Update the table
    table.assignedGuests = updatedAssignedGuests;
    await table.save();

    // Update guests with tableNumber
    if (action === 'add' || action === 'set') {
      await Guest.updateMany(
        { _id: { $in: guestIds } },
        {
          tableNumber: table.tableNumber,
          tableAssignment: table.tableName,
        }
      );
    }

    if (action === 'remove') {
      await Guest.updateMany(
        { _id: { $in: guestIds } },
        { $unset: { tableNumber: 1, tableAssignment: 1 } }
      );
    }

    // If action is 'set', clear previous guests that are no longer in the list
    if (action === 'set') {
      const previousGuests = table.assignedGuests.map((g: any) => g.toString());
      const removedGuests = previousGuests.filter(
        (id: string) => !updatedAssignedGuests.includes(id)
      );

      if (removedGuests.length > 0) {
        await Guest.updateMany(
          { _id: { $in: removedGuests } },
          { $unset: { tableNumber: 1, tableAssignment: 1 } }
        );
      }
    }

    // Get updated table with populated guests
    const updatedTable = await Table.findById(id)
      .populate('assignedGuests', 'name phone rsvpStatus adultsAttending childrenAttending')
      .lean();

    return NextResponse.json({
      table: updatedTable,
      totalPeople,
      isOverCapacity,
      message: isOverCapacity
        ? `Warning: Table is over capacity (${totalPeople}/${table.capacity})`
        : undefined,
    });
  } catch (error) {
    console.error('Error assigning guests to table:', error);
    return NextResponse.json({ error: 'Failed to assign guests' }, { status: 500 });
  }
}
