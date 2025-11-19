import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Table from '@/lib/db/models/Table';
import Wedding from '@/lib/db/models/Wedding';

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
      .populate('assignedGuests', 'name phone rsvpStatus adultsAttending childrenAttending')
      .sort({ tableNumber: 1 })
      .lean();

    return NextResponse.json({ tables });
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

    // Create the table
    const table = await Table.create({
      weddingId,
      tableName,
      tableNumber,
      capacity,
      tableType: tableType || 'mixed',
      assignedGuests: [],
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
