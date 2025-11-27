import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import ScheduledMessage, {
  calculateScheduledDates,
  MESSAGE_SCHEDULE_CONFIG,
  type ScheduledMessageType,
} from '@/lib/db/models/ScheduledMessage';
import { generateUUID } from '@/lib/utils/uuid';

// GET /api/weddings - Get user's weddings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 401 });
    }

    console.log('=== GET /api/weddings ===');
    console.log('Session user id:', session.user.id);
    console.log('Session user email:', session.user.email);
    console.log('Session user role:', session.user.role);

    await dbConnect();

    // If admin, return all weddings; if couple, return only their weddings
    const query = session.user.role === 'admin'
      ? {}
      : { userId: session.user.id };

    console.log('Query:', JSON.stringify(query));

    const weddings = await Wedding.find(query).sort({ createdAt: -1 });

    console.log('Found weddings count:', weddings.length);
    if (weddings.length > 0) {
      console.log('First wedding userId:', weddings[0].userId);
      console.log('First wedding contactPhone:', weddings[0].contactPhone);
    }

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
      contactPhone: body.contactPhone || '',
      partner1Type: body.partner1Type || 'groom',
      partner2Type: body.partner2Type || 'bride',
      eventDate: new Date(eventDate),
      eventTime,
      chuppahTime: body.chuppahTime || '',
      venue,
      venueAddress,
      venueCoordinates: body.venueCoordinates || null,
      description: body.description || '',
      mediaUrl: body.mediaUrl || null,
      mediaType: body.mediaType || null,
      mediaPosition: body.mediaPosition || { x: 50, y: 50 },
      theme: body.theme || {
        primaryColor: '#7950a5',
        secondaryColor: '#2C3E50',
        fontFamily: 'Assistant'
      },
      backgroundPattern: body.backgroundPattern || '',
      invitationTemplate: body.invitationTemplate || 'classic',
      bitPhone: body.bitPhone || '',
      payboxPhone: body.payboxPhone || '',
      enableBitGifts: body.enableBitGifts || false,
      bitQrImage: body.bitQrImage || '',
      maxGuests: body.maxGuests || 200,
      uniqueUrl,
      status: 'draft'
    });

    // Auto-schedule messages based on event date
    try {
      const scheduledDates = calculateScheduledDates(new Date(eventDate));
      const now = new Date();
      const schedulesToCreate: any[] = [];

      for (const [messageType, scheduledFor] of Object.entries(scheduledDates)) {
        // Only schedule if the date is in the future
        if (scheduledFor > now) {
          const config = MESSAGE_SCHEDULE_CONFIG[messageType as ScheduledMessageType];
          schedulesToCreate.push({
            weddingId: wedding._id,
            messageType,
            scheduledFor,
            status: 'pending',
            totalGuests: 0,
            sentCount: 0,
            failedCount: 0,
            targetFilter: config.targetFilter,
            coupleNotified: false,
          });
        }
      }

      if (schedulesToCreate.length > 0) {
        await ScheduledMessage.insertMany(schedulesToCreate);
        console.log(`📅 [Wedding] Auto-scheduled ${schedulesToCreate.length} messages for wedding ${wedding._id}`);
      }
    } catch (scheduleError) {
      console.error('Error auto-scheduling messages:', scheduleError);
      // Don't fail wedding creation if scheduling fails
    }

    return NextResponse.json(wedding, { status: 201 });
  } catch (error) {
    console.error('Error creating wedding:', error);
    return NextResponse.json(
      { error: 'שגיאה ביצירת החתונה' },
      { status: 500 }
    );
  }
}
