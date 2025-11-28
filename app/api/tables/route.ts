import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Table from '@/lib/db/models/Table';
import Wedding from '@/lib/db/models/Wedding';
import SeatAssignment from '@/lib/db/models/SeatAssignment';

// GET - Get all tables for a wedding
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

    // Get all tables with populated guests
    const tables = await Table.find({ weddingId })
      .populate('assignedGuests', 'name phone rsvpStatus adultsAttending childrenAttending familyGroup groupId')
      .sort({ tableNumber: 1 })
      .lean();

    // Get all seat assignments for this wedding (both real and simulation)
    const [realAssignments, simulationAssignments] = await Promise.all([
      SeatAssignment.find({ weddingId, assignmentType: 'real' }).lean(),
      SeatAssignment.find({ weddingId, assignmentType: 'simulation' }).lean(),
    ]);

    // Create maps of tableId+guestId -> seatsCount for each type
    const realAssignmentMap = new Map<string, number>();
    for (const assignment of realAssignments) {
      const key = `${assignment.tableId.toString()}_${assignment.guestId.toString()}`;
      realAssignmentMap.set(key, assignment.seatsCount);
    }

    const simulationAssignmentMap = new Map<string, number>();
    for (const assignment of simulationAssignments) {
      const key = `${assignment.tableId.toString()}_${assignment.guestId.toString()}`;
      simulationAssignmentMap.set(key, assignment.seatsCount);
    }

    // Add seatsInTable and simulationSeatsInTable to each guest in each table
    // All calculations done server-side - frontend just displays
    const tablesWithSeats = tables.map((table: any) => {
      // Remove duplicate guests (same guest appearing multiple times in assignedGuests)
      const seenGuestIds = new Set<string>();
      const uniqueGuests = table.assignedGuests.filter((guest: any) => {
        const guestId = guest._id.toString();
        if (seenGuestIds.has(guestId)) return false;
        seenGuestIds.add(guestId);
        return true;
      });

      return {
        ...table,
        assignedGuests: uniqueGuests.map((guest: any) => {
          const key = `${table._id.toString()}_${guest._id.toString()}`;
          const realSeats = realAssignmentMap.get(key);
          const simSeats = simulationAssignmentMap.get(key);

          // Calculate fallback values (when no SeatAssignment exists)
          const confirmedSeats = (guest.adultsAttending || 1) + (guest.childrenAttending || 0);
          const pendingSeats = 1; // Pending guests count as 1 in simulation

          return {
            ...guest,
            // seatsInTable: for real mode - from SeatAssignment or fallback to actual attendance
            seatsInTable: realSeats ?? confirmedSeats,
            // simulationSeatsInTable: for simulation mode - from SeatAssignment or fallback based on rsvp status
            simulationSeatsInTable: simSeats ?? (guest.rsvpStatus === 'confirmed' ? confirmedSeats : pendingSeats),
          };
        }),
      };
    });

    return NextResponse.json({ tables: tablesWithSeats });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
  }
}

// POST - Create a new table
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { weddingId, tableName, tableNumber, capacity, tableType } = body;

    // Validation
    if (!weddingId || !tableName || !tableNumber || !capacity) {
      return NextResponse.json(
        { error: 'Wedding ID, table name, number, and capacity are required' },
        { status: 400 }
      );
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

    // Check if table number already exists for this wedding
    const existingTable = await Table.findOne({ weddingId, tableNumber });
    if (existingTable) {
      return NextResponse.json(
        { error: `Table number ${tableNumber} already exists` },
        { status: 400 }
      );
    }

    // Create the table (mode: 'manual' for user-created tables)
    const table = await Table.create({
      weddingId,
      tableName,
      tableNumber,
      capacity,
      tableType: tableType || 'mixed',
      assignedGuests: [],
      mode: 'manual',
    });

    return NextResponse.json({ table }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating table:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Table number already exists for this wedding' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
  }
}
