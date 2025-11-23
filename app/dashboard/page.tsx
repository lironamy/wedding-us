import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import Guest from '@/lib/db/models/Guest';
import DashboardContent from '@/components/dashboard/DashboardContent';
import EmptyDashboard from '@/components/dashboard/EmptyDashboard';

async function getDashboardData(userId: string) {
  await dbConnect();

  // Get wedding
  const wedding = await Wedding.findOne({
    userId,
    status: { $in: ['active', 'draft'] }
  }).lean() as any;

  if (!wedding) {
    return null;
  }

  // Get guest statistics
  const guests = await Guest.find({ weddingId: wedding._id }).lean() as any[];

  const stats = {
    totalGuests: guests.length,
    confirmed: guests.filter(g => g.rsvpStatus === 'confirmed').length,
    declined: guests.filter(g => g.rsvpStatus === 'declined').length,
    pending: guests.filter(g => g.rsvpStatus === 'pending').length,
    totalAdults: guests.reduce((sum, g) => sum + (g.adultsAttending || 0), 0),
    totalChildren: guests.reduce((sum, g) => sum + (g.childrenAttending || 0), 0),
    totalGifts: guests.reduce((sum, g) => sum + (g.giftAmount || 0), 0)
  };

  return {
    wedding: {
      ...wedding,
      _id: wedding._id.toString(),
      userId: wedding.userId.toString(),
      eventDate: wedding.eventDate.toISOString()
    },
    stats
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  const data = await getDashboardData(session.user.id);

  // No wedding created yet
  if (!data) {
    return <EmptyDashboard />;
  }

  const { wedding, stats } = data;

  return <DashboardContent wedding={wedding} stats={stats} />;
}
