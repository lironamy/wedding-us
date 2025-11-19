import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Table from '@/lib/db/models/Table';
import Wedding from '@/lib/db/models/Wedding';
import Guest from '@/lib/db/models/Guest';

// GET - Get seating statistics for a wedding
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const weddingId = searchParams.get('weddingId');

    if (!weddingId) {
      return NextResponse.json({ error: 'Wedding ID is required' }, { status: 400 });
    }

    await dbConnect();

    // Verify the wedding belongs to this user
    const wedding = await Wedding.findOne({
      _id: weddingId,
      userId: session.user.id,
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    // Get all tables
    const tables = await Table.find({ weddingId })
      .populate('assignedGuests', 'adultsAttending childrenAttending rsvpStatus')
      .lean();

    // Get all confirmed guests
    const confirmedGuests = await Guest.find({
      weddingId,
      rsvpStatus: 'confirmed',
    }).lean() as any[];

    // Calculate statistics
    const totalTables = tables.length;
    const totalCapacity = tables.reduce((sum, table: any) => sum + table.capacity, 0);

    // Count assigned people
    let assignedAdults = 0;
    let assignedChildren = 0;
    const assignedGuestIds = new Set<string>();

    tables.forEach((table: any) => {
      table.assignedGuests.forEach((guest: any) => {
        assignedGuestIds.add(guest._id.toString());
        assignedAdults += guest.adultsAttending || 1;
        assignedChildren += guest.childrenAttending || 0;
      });
    });

    const totalAssignedPeople = assignedAdults + assignedChildren;

    // Count total confirmed people
    const totalConfirmedAdults = confirmedGuests.reduce(
      (sum, guest) => sum + (guest.adultsAttending || 1),
      0
    );
    const totalConfirmedChildren = confirmedGuests.reduce(
      (sum, guest) => sum + (guest.childrenAttending || 0),
      0
    );
    const totalConfirmedPeople = totalConfirmedAdults + totalConfirmedChildren;

    // Unassigned guests (confirmed but not in any table)
    const unassignedGuests = confirmedGuests.filter(
      (guest) => !assignedGuestIds.has(guest._id.toString())
    );

    const unassignedPeople = unassignedGuests.reduce((sum, guest) => {
      return sum + (guest.adultsAttending || 1) + (guest.childrenAttending || 0);
    }, 0);

    // Tables by type
    const tablesByType = {
      adults: tables.filter((t: any) => t.tableType === 'adults').length,
      kids: tables.filter((t: any) => t.tableType === 'kids').length,
      mixed: tables.filter((t: any) => t.tableType === 'mixed').length,
    };

    // Tables at capacity or over
    const tablesOverCapacity = tables.filter((table: any) => {
      const peopleAtTable = table.assignedGuests.reduce((sum: number, guest: any) => {
        return sum + (guest.adultsAttending || 1) + (guest.childrenAttending || 0);
      }, 0);
      return peopleAtTable > table.capacity;
    }).length;

    return NextResponse.json({
      statistics: {
        totalTables,
        totalCapacity,
        totalAssignedPeople,
        totalConfirmedPeople,
        unassignedGuestsCount: unassignedGuests.length,
        unassignedPeople,
        assignedAdults,
        assignedChildren,
        tablesByType,
        tablesOverCapacity,
        seatingProgress: totalConfirmedPeople > 0
          ? Math.round((totalAssignedPeople / totalConfirmedPeople) * 100)
          : 0,
        capacityUsage: totalCapacity > 0
          ? Math.round((totalAssignedPeople / totalCapacity) * 100)
          : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching seating statistics:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
