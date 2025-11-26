import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import Guest from '@/lib/db/models/Guest';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/weddings/[id] - Get wedding by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 401 });
    }

    await dbConnect();

    const wedding = await Wedding.findById(id);

    if (!wedding) {
      return NextResponse.json({ error: 'החתונה לא נמצאה' }, { status: 404 });
    }

    // Check authorization (couples can only access their own weddings)
    if (
      session.user.role !== 'admin' &&
      wedding.userId.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 });
    }

    return NextResponse.json(wedding, { status: 200 });
  } catch (error) {
    console.error('Error fetching wedding:', error);
    return NextResponse.json(
      { error: 'שגיאה בטעינת החתונה' },
      { status: 500 }
    );
  }
}

// PUT /api/weddings/[id] - Update wedding
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 401 });
    }

    await dbConnect();

    const wedding = await Wedding.findById(id);

    if (!wedding) {
      return NextResponse.json({ error: 'החתונה לא נמצאה' }, { status: 404 });
    }

    // Check authorization
    if (
      session.user.role !== 'admin' &&
      wedding.userId.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 });
    }

    const body = await request.json();

    // Debug: log the fields being sent
    console.log('=== API ROUTE: Updating wedding ===');
    console.log('Received contactPhone:', body.contactPhone);
    console.log('Updating wedding with partner1Type:', body.partner1Type);
    console.log('Updating wedding with partner2Type:', body.partner2Type);
    console.log('Updating wedding with backgroundPattern:', body.backgroundPattern);
    console.log('Updating wedding with enableBitGifts:', body.enableBitGifts);
    console.log('Updating wedding with bitQrImage:', body.bitQrImage);
    console.log('Updating wedding with bitPhone:', body.bitPhone);

    // Check if trying to reduce maxGuests below current guest count
    if (body.maxGuests !== undefined && body.maxGuests < wedding.maxGuests) {
      const currentGuestCount = await Guest.countDocuments({ weddingId: id });
      console.log('Package downgrade check - Guest count:', currentGuestCount, 'Requested maxGuests:', body.maxGuests);

      if (currentGuestCount > body.maxGuests) {
        return NextResponse.json({
          error: `יש לך כרגע ${currentGuestCount} אורחים. כדי לעבור לחבילה של ${body.maxGuests} מוזמנים, יש למחוק ${currentGuestCount - body.maxGuests} אורחים קודם.`,
          tooManyGuests: true,
          guestCount: currentGuestCount,
          requestedPackage: body.maxGuests,
        }, { status: 400 });
      }
    }

    // Update fields
    const allowedFields = [
      'groomName',
      'brideName',
      'contactPhone',
      'partner1Type',
      'partner2Type',
      'eventDate',
      'eventTime',
      'chuppahTime',
      'venue',
      'venueAddress',
      'venueCoordinates',
      'description',
      'mediaUrl',
      'mediaType',
      'theme',
      'backgroundPattern',
      'invitationTemplate',
      'bitPhone',
      'payboxPhone',
      'enableBitGifts',
      'bitQrImage',
      'maxGuests',
      'status'
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        if (field === 'eventDate' && body[field]) {
          wedding[field] = new Date(body[field]);
        } else {
          wedding[field] = body[field];
        }
        // Mark field as modified for Mongoose to save it
        wedding.markModified(field);
      }
    });

    await wedding.save();

    // Reload the document to get all fields properly
    const updatedWedding = await Wedding.findById(id).lean() as any;

    // Debug: log what was saved
    console.log('=== API ROUTE: After save ===');
    console.log('Saved wedding contactPhone:', updatedWedding?.contactPhone);
    console.log('Saved wedding partner1Type:', updatedWedding?.partner1Type);
    console.log('Saved wedding partner2Type:', updatedWedding?.partner2Type);
    console.log('Saved wedding backgroundPattern:', updatedWedding?.backgroundPattern);
    console.log('Saved wedding enableBitGifts:', updatedWedding?.enableBitGifts);
    console.log('Saved wedding bitQrImage:', updatedWedding?.bitQrImage);
    console.log('Saved wedding bitPhone:', updatedWedding?.bitPhone);

    return NextResponse.json(updatedWedding, { status: 200 });
  } catch (error) {
    console.error('Error updating wedding:', error);
    return NextResponse.json(
      { error: 'שגיאה בעדכון החתונה' },
      { status: 500 }
    );
  }
}

// DELETE /api/weddings/[id] - Delete wedding
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 401 });
    }

    await dbConnect();

    const wedding = await Wedding.findById(id);

    if (!wedding) {
      return NextResponse.json({ error: 'החתונה לא נמצאה' }, { status: 404 });
    }

    // Check authorization
    if (
      session.user.role !== 'admin' &&
      wedding.userId.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 });
    }

    // Soft delete by setting status to 'archived'
    wedding.status = 'archived';
    await wedding.save();

    return NextResponse.json(
      { message: 'החתונה נמחקה בהצלחה' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting wedding:', error);
    return NextResponse.json(
      { error: 'שגיאה במחיקת החתונה' },
      { status: 500 }
    );
  }
}
