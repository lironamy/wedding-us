import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Table from '@/lib/db/models/Table';
import Wedding from '@/lib/db/models/Wedding';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT - Update table visual settings (shape and size)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { shape, size } = body;

    if (!shape && !size) {
      return NextResponse.json(
        { error: 'At least one of shape or size is required' },
        { status: 400 }
      );
    }

    // Validate shape
    if (shape && !['round', 'square', 'rectangle'].includes(shape)) {
      return NextResponse.json(
        { error: 'Invalid shape. Must be "round", "square", or "rectangle"' },
        { status: 400 }
      );
    }

    // Validate size
    if (size && !['small', 'medium', 'large'].includes(size)) {
      return NextResponse.json(
        { error: 'Invalid size. Must be "small", "medium", or "large"' },
        { status: 400 }
      );
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

    // Update visual settings
    if (shape) table.shape = shape;
    if (size) table.size = size;
    await table.save();

    return NextResponse.json({ success: true, table });
  } catch (error) {
    console.error('Error updating table visual settings:', error);
    return NextResponse.json({ error: 'Failed to update visual settings' }, { status: 500 });
  }
}
