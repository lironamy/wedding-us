import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import SeatAssignment from '@/lib/db/models/SeatAssignment';

// POST - Copy simulation assignments to real assignments
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { weddingId } = body;

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

    // Get all simulation assignments
    const simulationAssignments = await SeatAssignment.find({
      weddingId,
      assignmentType: 'simulation',
    }).lean();

    if (simulationAssignments.length === 0) {
      return NextResponse.json({
        error: 'אין שיבוצים בהדמיה לשמור',
        saved: 0
      }, { status: 400 });
    }

    // Delete all existing real assignments
    await SeatAssignment.deleteMany({
      weddingId,
      assignmentType: 'real',
    });

    // Copy simulation assignments to real
    const realAssignments = simulationAssignments.map((assignment: any) => ({
      weddingId: assignment.weddingId,
      tableId: assignment.tableId,
      guestId: assignment.guestId,
      seatsCount: assignment.seatsCount,
      assignmentType: 'real',
    }));

    await SeatAssignment.insertMany(realAssignments);

    return NextResponse.json({
      success: true,
      saved: realAssignments.length,
      message: `${realAssignments.length} שיבוצים נשמרו בהצלחה`,
    });
  } catch (error) {
    console.error('Error saving seating assignments:', error);
    return NextResponse.json({ error: 'Failed to save assignments' }, { status: 500 });
  }
}
