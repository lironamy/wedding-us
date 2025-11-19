import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import { generateUUID } from '@/lib/utils/uuid';

// GET /api/weddings - Get user's weddings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 401 });
    }

    await dbConnect();

    // If admin, return all weddings; if couple, return only their weddings
    const query = session.user.role === 'admin'
      ? {}
      : { userId: session.user.id };

    const weddings = await Wedding.find(query).sort({ createdAt: -1 });

    return NextResponse.json(weddings, { status: 200 });
  } catch (error) {
    console.error('Error fetching weddings:', error);
    return NextResponse.json(
      { error: 'שגיאה בטעינת החתונות' },
      { status: 500 }
    );
  }
}

// POST /api/weddings - Create new wedding
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    const { groomName, brideName, eventDate, eventTime, venue, venueAddress } = body;

    if (!groomName || !brideName || !eventDate || !eventTime || !venue || !venueAddress) {
      return NextResponse.json(
        { error: 'חסרים שדות חובה' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already has a wedding (optional: limit to one wedding per couple)
    const existingWedding = await Wedding.findOne({
      userId: session.user.id,
      status: { $in: ['draft', 'active'] }
    });

    if (existingWedding) {
      return NextResponse.json(
        { error: 'כבר קיימת חתונה פעילה' },
        { status: 400 }
      );
    }

    // Create wedding with unique URL
    const uniqueUrl = generateUUID();

    const wedding = await Wedding.create({
      userId: session.user.id,
      groomName,
      brideName,
      eventDate: new Date(eventDate),
      eventTime,
      venue,
      venueAddress,
      venueCoordinates: body.venueCoordinates || null,
      description: body.description || '',
      mediaUrl: body.mediaUrl || null,
      mediaType: body.mediaType || null,
      theme: body.theme || {
        primaryColor: '#C4A57B',
        secondaryColor: '#2C3E50',
        fontFamily: 'Assistant'
      },
      backgroundPattern: body.backgroundPattern || '',
      bitPhone: body.bitPhone || '',
      payboxPhone: body.payboxPhone || '',
      uniqueUrl,
      status: 'draft'
    });

    return NextResponse.json(wedding, { status: 201 });
  } catch (error) {
    console.error('Error creating wedding:', error);
    return NextResponse.json(
      { error: 'שגיאה ביצירת החתונה' },
      { status: 500 }
    );
  }
}
