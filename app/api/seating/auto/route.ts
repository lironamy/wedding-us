import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import {
  buildAutoSeating,
  recalculateGroupSeating,
  getSeatingAssignments,
  AssignmentType,
} from '@/lib/seating/autoSeatingAlgorithm';

// POST - Run auto seating
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { weddingId, type = 'real', groupId } = body as {
      weddingId: string;
      type?: AssignmentType;
      groupId?: string;
    };

    // Verify wedding ownership
    const wedding = await Wedding.findOne({
      _id: weddingId,
      userId: session.user.id,
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    let result;

    if (groupId) {
      // Recalculate for specific group
      result = await recalculateGroupSeating(weddingId, groupId, type);
    } else {
      // Full recalculation
      result = await buildAutoSeating(weddingId, type);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Auto seating API error:', error);
    return NextResponse.json(
      { error: 'Failed to run auto seating' },
      { status: 500 }
    );
  }
}

// GET - Get seating assignments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get('weddingId');
    const type = (searchParams.get('type') || 'real') as AssignmentType;

    if (!weddingId) {
      return NextResponse.json({ error: 'Wedding ID required' }, { status: 400 });
    }

    // Verify wedding ownership
    const wedding = await Wedding.findOne({
      _id: weddingId,
      userId: session.user.id,
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    const assignments = await getSeatingAssignments(weddingId, type);

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Get seating API error:', error);
    return NextResponse.json(
      { error: 'Failed to get seating assignments' },
      { status: 500 }
    );
  }
}
