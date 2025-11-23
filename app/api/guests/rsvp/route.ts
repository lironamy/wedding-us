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
      // Meal counts
      regularMeals,
      vegetarianMeals,
      veganMeals,
      otherMeals,
      otherMealDescription,
      // Legacy fields
      mealType,
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

    // Validate and prepare update data
    if (rsvpStatus === 'confirmed') {
      const totalAttending = (adultsAttending || 0) + (childrenAttending || 0);

      if (totalAttending > guest.invitedCount) {
        return NextResponse.json(
          { error: `מספר האורחים לא יכול לעלות על ${guest.invitedCount}` },
          { status: 400 }
        );
      }
    }

    // Build update object - use $set to ensure all fields are saved
    const updateData: Record<string, any> = {
      rsvpStatus,
    };

    if (rsvpStatus === 'confirmed') {
      updateData.adultsAttending = adultsAttending || 0;
      updateData.childrenAttending = childrenAttending || 0;
      // Meal counts
      updateData.regularMeals = regularMeals ?? 0;
      updateData.vegetarianMeals = vegetarianMeals ?? 0;
      updateData.veganMeals = veganMeals ?? 0;
      updateData.otherMeals = otherMeals ?? 0;
      updateData.otherMealDescription = otherMealDescription ?? '';
      // Legacy fields
      updateData.mealType = mealType || 'regular';
      updateData.specialMealRequests = specialMealRequests || '';
      updateData.notes = notes || '';

      console.log('Saving meal counts:', {
        regularMeals: updateData.regularMeals,
        vegetarianMeals: updateData.vegetarianMeals,
        veganMeals: updateData.veganMeals,
        otherMeals: updateData.otherMeals,
        otherMealDescription: updateData.otherMealDescription,
      });
    } else {
      // If declined, clear attendance numbers
      updateData.adultsAttending = 0;
      updateData.childrenAttending = 0;
    }

    // Use updateOne with $set to bypass Mongoose model caching
    await Guest.updateOne(
      { uniqueToken },
      { $set: updateData }
    );

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
