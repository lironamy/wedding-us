import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Guest from '@/lib/db/models/Guest';
import Wedding from '@/lib/db/models/Wedding';
import { parseGuestExcel } from '@/lib/utils/excel';

// POST - Import guests from Excel file
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const weddingId = formData.get('weddingId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!weddingId) {
      return NextResponse.json({ error: 'Wedding ID is required' }, { status: 400 });
    }

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)' },
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

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse Excel file
    const { guests, errors } = parseGuestExcel(buffer);

    if (errors.length > 0 && guests.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to parse Excel file',
          validationErrors: errors,
        },
        { status: 400 }
      );
    }

    // Insert guests into database
    const guestDocuments = guests.map((guest) => ({
      ...guest,
      weddingId,
      rsvpStatus: 'pending',
      adultsAttending: 0,
      childrenAttending: 0,
      giftAmount: 0,
      giftMethod: 'none',
      messageSent: [],
    }));

    const insertedGuests = await Guest.insertMany(guestDocuments, {
      ordered: false, // Continue even if some fail
    });

    return NextResponse.json(
      {
        message: `Successfully imported ${insertedGuests.length} guests`,
        imported: insertedGuests.length,
        total: guests.length,
        validationErrors: errors.length > 0 ? errors : undefined,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error importing guests:', error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Some guests already exist in the database' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to import guests' }, { status: 500 });
  }
}
