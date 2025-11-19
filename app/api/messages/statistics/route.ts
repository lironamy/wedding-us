import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Message from '@/lib/db/models/Message';
import Guest from '@/lib/db/models/Guest';
import Wedding from '@/lib/db/models/Wedding';

// GET - Get message statistics for a wedding
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const weddingId = searchParams.get('weddingId');

    if (!weddingId) {
      return NextResponse.json({ error: 'Wedding ID is required' }, { status: 400 });
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

    // Get all messages for this wedding
    const messages = await Message.find({ weddingId }).lean();
    const guests = await Guest.find({ weddingId }).lean();

    // Calculate statistics
    const stats = {
      totalMessages: messages.length,
      messagesByType: {
        invitation: messages.filter(m => m.messageType === 'invitation').length,
        rsvp_reminder: messages.filter(m => m.messageType === 'rsvp_reminder').length,
        rsvp_reminder_2: messages.filter(m => m.messageType === 'rsvp_reminder_2').length,
        day_before: messages.filter(m => m.messageType === 'day_before').length,
        thank_you: messages.filter(m => m.messageType === 'thank_you').length,
      },
      messagesByStatus: {
        sent: messages.filter(m => m.status === 'sent').length,
        pending: messages.filter(m => m.status === 'pending').length,
        failed: messages.filter(m => m.status === 'failed').length,
      },
      guestsWithMessages: new Set(messages.map(m => m.guestId.toString())).size,
      guestsWithoutMessages: guests.length - new Set(messages.map(m => m.guestId.toString())).size,

      // Response rate after invitations
      invitationsSent: messages.filter(m => m.messageType === 'invitation').length,
      rsvpResponseRate: calculateResponseRate(guests, messages),

      // Recent activity
      messagesLast7Days: messages.filter(m => {
        const sentDate = new Date(m.sentAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return sentDate >= weekAgo;
      }).length,
    };

    return NextResponse.json({ statistics: stats }, { status: 200 });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}

function calculateResponseRate(guests: any[], messages: any[]): number {
  const invitationMessages = messages.filter(m => m.messageType === 'invitation');
  if (invitationMessages.length === 0) return 0;

  const guestsWithInvitations = new Set(invitationMessages.map(m => m.guestId.toString()));
  const respondedGuests = guests.filter(g =>
    guestsWithInvitations.has(g._id.toString()) && g.rsvpStatus !== 'pending'
  ).length;

  return Math.round((respondedGuests / guestsWithInvitations.size) * 100);
}
