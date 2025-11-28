import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import Guest from '@/lib/db/models/Guest';
import ScheduledMessage, {
  calculateScheduledDates,
  MESSAGE_SCHEDULE_CONFIG,
  type ScheduledMessageType,
} from '@/lib/db/models/ScheduledMessage';
import { fromZonedTime } from 'date-fns-tz';

/**
 * GET /api/scheduled-messages
 * Get all scheduled messages for a wedding
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const weddingId = searchParams.get('weddingId');

    if (!weddingId) {
      return NextResponse.json(
        { error: 'Wedding ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify wedding belongs to user
    const wedding = await Wedding.findOne({
      _id: weddingId,
      userId: session.user.id,
    }).lean();

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    // Get all scheduled messages (excluding cancelled)
    const scheduledMessages = await ScheduledMessage.find({
      weddingId,
      status: { $ne: 'cancelled' }
    })
      .sort({ scheduledFor: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      scheduledMessages,
      scheduleConfig: MESSAGE_SCHEDULE_CONFIG,
    });
  } catch (error) {
    console.error('Error fetching scheduled messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/scheduled-messages
 * Create scheduled messages for a wedding (auto-schedule based on event date)
 * Or create a custom manual schedule with specific date/time
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { weddingId, regenerate = false, manual = false, scheduledDate, scheduledTime, targetFilter, messageType: manualMessageType } = body;

    if (!weddingId) {
      return NextResponse.json(
        { error: 'Wedding ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify wedding belongs to user
    const wedding = await Wedding.findOne({
      _id: weddingId,
      userId: session.user.id,
    }).lean() as any;

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    // Handle manual scheduling
    if (manual) {
      if (!scheduledDate || !scheduledTime) {
        return NextResponse.json(
          { error: 'scheduledDate and scheduledTime are required for manual scheduling' },
          { status: 400 }
        );
      }

      // Build date string and convert from Israel time to UTC
      // scheduledDate is "YYYY-MM-DD", scheduledTime is "HH:MM"
      const israelDateTimeStr = `${scheduledDate}T${scheduledTime}:00`;
      const scheduleDate = fromZonedTime(israelDateTimeStr, 'Asia/Jerusalem');

      const now = new Date();

      if (scheduleDate <= now) {
        return NextResponse.json(
          { error: 'Scheduled date must be in the future' },
          { status: 400 }
        );
      }

      // Get total guest count based on target filter
      let guestQuery: any = { weddingId };
      if (targetFilter?.rsvpStatus && targetFilter.rsvpStatus !== 'all') {
        guestQuery.rsvpStatus = targetFilter.rsvpStatus;
      }
      const guestCount = await Guest.countDocuments(guestQuery);

      // Validate message type
      const validMessageTypes = ['invitation', 'rsvp_reminder', 'rsvp_reminder_2', 'day_before', 'thank_you'];
      const selectedMessageType = manualMessageType && validMessageTypes.includes(manualMessageType)
        ? manualMessageType
        : 'invitation';

      // Create manual schedule
      const customSchedule = await ScheduledMessage.create({
        weddingId,
        messageType: selectedMessageType,
        scheduledFor: scheduleDate,
        status: 'pending',
        totalGuests: guestCount,
        sentCount: 0,
        failedCount: 0,
        targetFilter: targetFilter || { rsvpStatus: 'all' },
        coupleNotified: false,
      });

      return NextResponse.json({
        success: true,
        message: 'Manual schedule created',
        scheduledMessage: customSchedule,
      });
    }

    // Auto-scheduling logic below
    // Check if schedules already exist
    const existingSchedules = await ScheduledMessage.find({
      weddingId,
      status: 'pending',
      messageType: { $ne: 'custom' }, // Don't count custom schedules
    });

    if (existingSchedules.length > 0 && !regenerate) {
      return NextResponse.json({
        success: false,
        error: 'Scheduled messages already exist. Set regenerate=true to recreate.',
        existingCount: existingSchedules.length,
      });
    }

    // If regenerating, handle existing schedules:
    // - Delete pending schedules that haven't sent any messages (except custom)
    // - Cancel pending schedules that have sent messages (keep for history)
    if (regenerate) {
      // Delete schedules with no messages sent (except custom)
      await ScheduledMessage.deleteMany({
        weddingId,
        status: 'pending',
        sentCount: 0,
        messageType: { $ne: 'custom' },
      });

      // Cancel schedules that have sent some messages (keep for history)
      await ScheduledMessage.updateMany(
        { weddingId, status: 'pending', sentCount: { $gt: 0 }, messageType: { $ne: 'custom' } },
        { status: 'cancelled' }
      );
    }

    // Calculate scheduled dates based on event date
    const scheduledDates = calculateScheduledDates(wedding.eventDate);
    const now = new Date();

    // Get total guest count
    const guestCount = await Guest.countDocuments({ weddingId });

    // Create scheduled messages
    const schedulesToCreate: any[] = [];

    for (const [messageType, scheduledForDate] of Object.entries(scheduledDates)) {
      // Only schedule if the date is in the future
      if (scheduledForDate > now) {
        const config = MESSAGE_SCHEDULE_CONFIG[messageType as ScheduledMessageType];

        schedulesToCreate.push({
          weddingId,
          messageType,
          scheduledFor: scheduledForDate,
          status: 'pending',
          totalGuests: guestCount,
          sentCount: 0,
          failedCount: 0,
          targetFilter: config.targetFilter,
          coupleNotified: false,
        });
      }
    }

    // Insert all schedules
    const createdSchedules = await ScheduledMessage.insertMany(schedulesToCreate);

    return NextResponse.json({
      success: true,
      message: `Created ${createdSchedules.length} scheduled messages`,
      scheduledMessages: createdSchedules,
      skippedPastDates: Object.keys(scheduledDates).length - createdSchedules.length,
    });
  } catch (error) {
    console.error('Error creating scheduled messages:', error);
    return NextResponse.json(
      { error: 'Failed to create scheduled messages' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/scheduled-messages
 * Cancel a scheduled message
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('id');
    const weddingId = searchParams.get('weddingId');

    if (!scheduleId || !weddingId) {
      return NextResponse.json(
        { error: 'Schedule ID and Wedding ID are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify wedding belongs to user
    const wedding = await Wedding.findOne({
      _id: weddingId,
      userId: session.user.id,
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    // Delete the scheduled message from database
    const result = await ScheduledMessage.findOneAndDelete({
      _id: scheduleId,
      weddingId,
      status: 'pending',
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Scheduled message not found or already processed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Scheduled message deleted',
    });
  } catch (error) {
    console.error('Error cancelling scheduled message:', error);
    return NextResponse.json(
      { error: 'Failed to cancel scheduled message' },
      { status: 500 }
    );
  }
}
