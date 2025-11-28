import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';

// GET - Get hall elements for a wedding
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

    const wedding = await Wedding.findOne({
      _id: weddingId,
      userId: session.user.id,
    }).select('hallElements').lean();

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    return NextResponse.json({ elements: wedding.hallElements || [] });
  } catch (error) {
    console.error('Error fetching hall elements:', error);
    return NextResponse.json({ error: 'Failed to fetch hall elements' }, { status: 500 });
  }
}

// PUT - Update hall elements for a wedding
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { weddingId, elements } = body;

    if (!weddingId) {
      return NextResponse.json({ error: 'Wedding ID is required' }, { status: 400 });
    }

    if (!Array.isArray(elements)) {
      return NextResponse.json({ error: 'Elements must be an array' }, { status: 400 });
    }

    await dbConnect();

    const wedding = await Wedding.findOneAndUpdate(
      {
        _id: weddingId,
        userId: session.user.id,
      },
      { hallElements: elements },
      { new: true }
    );

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      elements: wedding.hallElements,
      message: 'Hall elements saved successfully'
    });
  } catch (error) {
    console.error('Error saving hall elements:', error);
    return NextResponse.json({ error: 'Failed to save hall elements' }, { status: 500 });
  }
}
