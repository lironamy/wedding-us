import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import MessageLog from '@/lib/db/models/MessageLog';
import Guest from '@/lib/db/models/Guest';
import Wedding from '@/lib/db/models/Wedding';

/**
 * GET /api/message-logs
 * Get message logs for a scheduled message
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scheduledMessageId = searchParams.get('scheduledMessageId');
    const weddingId = searchParams.get('weddingId');

    if (!scheduledMessageId || !weddingId) {
      return NextResponse.json(
        { error: 'scheduledMessageId and weddingId are required' },
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

    // Get message logs for this scheduled message
    const logs = await MessageLog.find({
      scheduledMessageId,
      weddingId,
    }).sort({ sentAt: -1 }).lean();

    // Get guest details for each log
    const guestIds = logs.map(log => log.guestId);
    const guests = await Guest.find({
      _id: { $in: guestIds },
    }).select('_id name phone').lean();

    // Create a map for quick lookup
    const guestMap = new Map(
      guests.map((g: any) => [g._id.toString(), { name: g.name, phone: g.phone }])
    );

    // Enrich logs with guest info
    const enrichedLogs = logs.map(log => ({
      _id: log._id,
      guestId: log.guestId,
      guestName: guestMap.get(log.guestId?.toString())?.name || 'לא ידוע',
      guestPhone: guestMap.get(log.guestId?.toString())?.phone || '',
      twilioSid: log.twilioSid,
      deliveryStatus: log.deliveryStatus,
      errorCode: log.errorCode,
      errorMessage: log.errorMessage,
      sentAt: log.sentAt,
    }));

    return NextResponse.json({ logs: enrichedLogs });
  } catch (error) {
    console.error('Error fetching message logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message logs' },
      { status: 500 }
    );
  }
}
