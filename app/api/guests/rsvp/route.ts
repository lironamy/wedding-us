import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Guest from '@/lib/db/models/Guest';

// POST - Submit RSVP (public endpoint, uses uniqueToken)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      uniqueToken,
      rsvpStatus,
      adultsAttending,
      childrenAttending,
      specialMealRequests,
      notes,
    } = body;

    // Validation
    if (!uniqueToken || !rsvpStatus) {
      return NextResponse.json(
        { error: 'Token and RSVP status are required' },
        { status: 400 }
      );
    }

    if (!['confirmed', 'declined'].includes(rsvpStatus)) {
      return NextResponse.json(
        { error: 'Invalid RSVP status' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find guest by unique token
    const guest = await Guest.findOne({ uniqueToken });

    if (!guest) {
      return NextResponse.json({ error: 'Invalid RSVP link' }, { status: 404 });
    }

    // Update guest RSVP
    guest.rsvpStatus = rsvpStatus;

    if (rsvpStatus === 'confirmed') {
      // Validate total attendees
      const totalAttending = (adultsAttending || 0) + (childrenAttending || 0);

      if (totalAttending > guest.invitedCount) {
        return NextResponse.json(
          { error: `מספר האורחים לא יכול לעלות על ${guest.invitedCount}` },
          { status: 400 }
        );
      }

      guest.adultsAttending = adultsAttending || 0;
      guest.childrenAttending = childrenAttending || 0;
      guest.specialMealRequests = specialMealRequests || '';
      guest.notes = notes || '';
    } else {
      // If declined, clear attendance numbers
      guest.adultsAttending = 0;
      guest.childrenAttending = 0;
    }

    await guest.save();

    return NextResponse.json(
      {
        message: rsvpStatus === 'confirmed'
          ? 'תודה על אישור ההגעה!'
          : 'תודה על עדכון ההגעה',
        guest: {
          name: guest.name,
          rsvpStatus: guest.rsvpStatus,
          adultsAttending: guest.adultsAttending,
          childrenAttending: guest.childrenAttending,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error submitting RSVP:', error);
    return NextResponse.json({ error: 'Failed to submit RSVP' }, { status: 500 });
  }
}

// GET - Get guest info by token (for RSVP page)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    await dbConnect();

    const guest = await Guest.findOne({ uniqueToken: token })
      .populate('weddingId')
      .lean();

    if (!guest) {
      return NextResponse.json({ error: 'Invalid RSVP link' }, { status: 404 });
    }

    return NextResponse.json({ guest }, { status: 200 });
  } catch (error) {
    console.error('Error fetching guest:', error);
    return NextResponse.json({ error: 'Failed to fetch guest info' }, { status: 500 });
  }
}
