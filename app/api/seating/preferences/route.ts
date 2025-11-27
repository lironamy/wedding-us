import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import SeatingPreference from '@/lib/db/models/SeatingPreference';
import Guest from '@/lib/db/models/Guest';

// GET - Get all preferences for a wedding
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get('weddingId');

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

    const preferences = await SeatingPreference.find({ weddingId }).lean();

    // Enrich with guest names
    const enrichedPreferences = await Promise.all(
      preferences.map(async (pref: any) => {
        const guestA = await Guest.findById(pref.guestAId).lean();
        const guestB = await Guest.findById(pref.guestBId).lean();

        return {
          ...pref,
          _id: pref._id.toString(),
          guestAId: pref.guestAId.toString(),
          guestBId: pref.guestBId.toString(),
          guestAName: (guestA as any)?.name || 'Unknown',
          guestBName: (guestB as any)?.name || 'Unknown',
        };
      })
    );

    return NextResponse.json({ preferences: enrichedPreferences });
  } catch (error) {
    console.error('Get preferences API error:', error);
    return NextResponse.json(
      { error: 'Failed to get preferences' },
      { status: 500 }
    );
  }
}

// POST - Create a new preference
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const {
      weddingId,
      guestAId,
      guestBId,
      type,
      scope = 'sameTable',
      strength,
    } = body;

    if (!weddingId || !guestAId || !guestBId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (guestAId === guestBId) {
      return NextResponse.json(
        { error: 'Cannot create preference between same guest' },
        { status: 400 }
      );
    }

    // Verify wedding ownership
    const wedding = await Wedding.findOne({
      _id: weddingId,
      userId: session.user.id,
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    // Verify both guests exist and belong to this wedding
    const guestA = await Guest.findOne({ _id: guestAId, weddingId });
    const guestB = await Guest.findOne({ _id: guestBId, weddingId });

    if (!guestA || !guestB) {
      return NextResponse.json(
        { error: 'One or both guests not found' },
        { status: 400 }
      );
    }

    // Check for existing preference between these guests
    const existing = await SeatingPreference.findOne({
      weddingId,
      $or: [
        { guestAId, guestBId },
        { guestAId: guestBId, guestBId: guestAId },
      ],
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Preference between these guests already exists' },
        { status: 400 }
      );
    }

    // Determine strength based on type if not provided
    const finalStrength = strength || (type === 'apart' ? 'must' : 'try');

    const preference = await SeatingPreference.create({
      weddingId,
      guestAId,
      guestBId,
      type,
      scope,
      strength: finalStrength,
      enabled: true,
    });

    return NextResponse.json({
      success: true,
      preference: {
        ...preference.toObject(),
        _id: preference._id.toString(),
        guestAName: guestA.name,
        guestBName: guestB.name,
      },
    });
  } catch (error) {
    console.error('Create preference API error:', error);
    return NextResponse.json(
      { error: 'Failed to create preference' },
      { status: 500 }
    );
  }
}

// PUT - Update a preference
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { preferenceId, type, scope, strength, enabled } = body;

    if (!preferenceId) {
      return NextResponse.json(
        { error: 'Preference ID required' },
        { status: 400 }
      );
    }

    const preference = await SeatingPreference.findById(preferenceId);
    if (!preference) {
      return NextResponse.json(
        { error: 'Preference not found' },
        { status: 404 }
      );
    }

    // Verify wedding ownership
    const wedding = await Wedding.findOne({
      _id: preference.weddingId,
      userId: session.user.id,
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (type) preference.type = type;
    if (scope) preference.scope = scope;
    if (strength) preference.strength = strength;
    if (enabled !== undefined) preference.enabled = enabled;

    await preference.save();

    return NextResponse.json({
      success: true,
      preference: {
        ...preference.toObject(),
        _id: preference._id.toString(),
      },
    });
  } catch (error) {
    console.error('Update preference API error:', error);
    return NextResponse.json(
      { error: 'Failed to update preference' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a preference
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const preferenceId = searchParams.get('preferenceId');

    if (!preferenceId) {
      return NextResponse.json(
        { error: 'Preference ID required' },
        { status: 400 }
      );
    }

    const preference = await SeatingPreference.findById(preferenceId);
    if (!preference) {
      return NextResponse.json(
        { error: 'Preference not found' },
        { status: 404 }
      );
    }

    // Verify wedding ownership
    const wedding = await Wedding.findOne({
      _id: preference.weddingId,
      userId: session.user.id,
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await SeatingPreference.findByIdAndDelete(preferenceId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete preference API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete preference' },
      { status: 500 }
    );
  }
}
