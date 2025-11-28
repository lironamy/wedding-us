import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import Table from '@/lib/db/models/Table';
import SeatAssignment from '@/lib/db/models/SeatAssignment';

// GET - Get seating settings for a wedding
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
    }).lean() as any;

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    // Return settings with defaults
    const settings = {
      mode: 'manual',
      seatsPerTable: 12,
      autoRecalcPolicy: 'onRsvpChangeGroupOnly',
      adjacencyPolicy: 'forbidSameTableOnly',
      simulationEnabled: true,
      enableKidsTable: false,
      kidsTableMinAge: 6,
      kidsTableMinCount: 6,
      avoidSinglesAlone: true,
      enableZonePlacement: false,
      ...(wedding.seatingSettings || {}),
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Get settings API error:', error);
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}

// PUT - Update seating settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { weddingId, settings } = body;

    if (!weddingId || !settings) {
      return NextResponse.json(
        { error: 'Wedding ID and settings are required' },
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

    // Validate settings
    const validModes = ['auto', 'manual'];
    const validRecalcPolicies = ['onRsvpChangeGroupOnly', 'onRsvpChangeAll', 'manualOnly'];
    const validAdjacencyPolicies = ['forbidSameTableOnly', 'forbidSameAndAdjacent'];

    if (settings.mode && !validModes.includes(settings.mode)) {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }

    if (settings.autoRecalcPolicy && !validRecalcPolicies.includes(settings.autoRecalcPolicy)) {
      return NextResponse.json({ error: 'Invalid recalc policy' }, { status: 400 });
    }

    if (settings.adjacencyPolicy && !validAdjacencyPolicies.includes(settings.adjacencyPolicy)) {
      return NextResponse.json({ error: 'Invalid adjacency policy' }, { status: 400 });
    }

    if (settings.seatsPerTable !== undefined) {
      if (settings.seatsPerTable < 1 || settings.seatsPerTable > 20) {
        return NextResponse.json(
          { error: 'Seats per table must be between 1 and 20' },
          { status: 400 }
        );
      }
    }

    // Update settings
    const currentSettings = wedding.seatingSettings || {};
    const previousMode = currentSettings.mode || 'manual';
    const newMode = settings.mode ?? previousMode;

    wedding.seatingSettings = {
      mode: newMode,
      seatsPerTable: settings.seatsPerTable ?? currentSettings.seatsPerTable ?? 12,
      autoRecalcPolicy: settings.autoRecalcPolicy ?? currentSettings.autoRecalcPolicy ?? 'onRsvpChangeGroupOnly',
      adjacencyPolicy: settings.adjacencyPolicy ?? currentSettings.adjacencyPolicy ?? 'forbidSameTableOnly',
      simulationEnabled: true,
      // New advanced settings
      enableKidsTable: settings.enableKidsTable ?? currentSettings.enableKidsTable ?? false,
      kidsTableMinAge: settings.kidsTableMinAge ?? currentSettings.kidsTableMinAge ?? 6,
      kidsTableMinCount: settings.kidsTableMinCount ?? currentSettings.kidsTableMinCount ?? 6,
      avoidSinglesAlone: settings.avoidSinglesAlone ?? currentSettings.avoidSinglesAlone ?? true,
      enableZonePlacement: settings.enableZonePlacement ?? currentSettings.enableZonePlacement ?? false,
    };

    await wedding.save();

    // If switching from auto to manual mode, clear all auto-generated data
    if (previousMode === 'auto' && newMode === 'manual') {
      console.log('[SETTINGS] Switching from auto to manual - clearing auto seating data');

      // Delete all SeatAssignments for this wedding
      await SeatAssignment.deleteMany({ weddingId });

      // Clear assignedGuests from all tables and delete auto-generated tables
      await Table.updateMany(
        { weddingId },
        { $set: { assignedGuests: [] } }
      );

      // Delete tables that were auto-generated (mode: 'auto')
      await Table.deleteMany({ weddingId, mode: 'auto' });
    }

    return NextResponse.json({
      success: true,
      settings: wedding.seatingSettings,
    });
  } catch (error) {
    console.error('Update settings API error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
