import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Wedding from '@/lib/db/models/Wedding';
import Guest from '@/lib/db/models/Guest';
import { Card } from '@/components/ui/Card';

async function getAdminStats() {
  await dbConnect();

  // Get counts
  const totalUsers = await User.countDocuments();
  const totalWeddings = await Wedding.countDocuments();
  const activeWeddings = await Wedding.countDocuments({ status: 'active' });
  const draftWeddings = await Wedding.countDocuments({ status: 'draft' });
  const completedWeddings = await Wedding.countDocuments({ status: 'completed' });
  const totalGuests = await Guest.countDocuments();

  // Get RSVP statistics
  const confirmedGuests = await Guest.countDocuments({ rsvpStatus: 'confirmed' });
  const declinedGuests = await Guest.countDocuments({ rsvpStatus: 'declined' });
  const pendingGuests = await Guest.countDocuments({ rsvpStatus: 'pending' });

  // Get total attending
  const attendingStats = await Guest.aggregate([
    { $match: { rsvpStatus: 'confirmed' } },
    {
      $group: {
        _id: null,
        totalAdults: { $sum: '$adultsAttending' },
        totalChildren: { $sum: '$childrenAttending' },
        totalGifts: { $sum: '$giftAmount' },
      },
    },
  ]);

  const attending = attendingStats[0] || { totalAdults: 0, totalChildren: 0, totalGifts: 0 };

  // Get recent weddings
  const recentWeddings = await Wedding.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('userId', 'name email')
    .lean() as any[];

  // Get upcoming weddings
  const upcomingWeddings = await Wedding.find({
    eventDate: { $gte: new Date() },
    status: 'active',
  })
    .sort({ eventDate: 1 })
    .limit(5)
    .lean() as any[];

  // Get users registered this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: startOfMonth },
  });

  return {
    totalUsers,
    totalWeddings,
    activeWeddings,
    draftWeddings,
    completedWeddings,
    totalGuests,
    confirmedGuests,
    declinedGuests,
    pendingGuests,
    totalAdults: attending.totalAdults,
    totalChildren: attending.totalChildren,
    totalGifts: attending.totalGifts,
    recentWeddings,
    upcomingWeddings,
    newUsersThisMonth,
  };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">סקירה כללית</h1>
        <p className="text-gray-600">ניהול ומעקב אחר הפלטפורמה</p>
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="סה״כ משתמשים"
          value={stats.totalUsers}
          icon="👥"
          color="bg-blue-500"
        />
        <StatCard
          title="חדשים החודש"
          value={stats.newUsersThisMonth}
          icon="✨"
          color="bg-purple-500"
        />
        <StatCard
          title="סה״כ חתונות"
          value={stats.totalWeddings}
          icon="💒"
          color="bg-pink-500"
        />
        <StatCard
          title="חתונות פעילות"
          value={stats.activeWeddings}
          icon="💍"
          color="bg-green-500"
        />
      </div>

      {/* Wedding Status */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">סטטוס חתונות</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">פעילות</span>
              <span className="font-bold text-green-600">{stats.activeWeddings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">טיוטות</span>
              <span className="font-bold text-yellow-600">{stats.draftWeddings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">הושלמו</span>
              <span className="font-bold text-blue-600">{stats.completedWeddings}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">סטטיסטיקות אורחים</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">סה״כ אורחים</span>
              <span className="font-bold">{stats.totalGuests}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">אישרו הגעה</span>
              <span className="font-bold text-green-600">{stats.confirmedGuests}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">סירבו</span>
              <span className="font-bold text-red-600">{stats.declinedGuests}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">ממתינים</span>
              <span className="font-bold text-yellow-600">{stats.pendingGuests}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">נתוני מגיעים</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">מבוגרים</span>
              <span className="font-bold">{stats.totalAdults}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">ילדים</span>
              <span className="font-bold">{stats.totalChildren}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">סה״כ מתנות</span>
              <span className="font-bold text-green-600">₪{stats.totalGifts.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent & Upcoming */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Weddings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">חתונות אחרונות</h3>
          {stats.recentWeddings.length === 0 ? (
            <p className="text-gray-500 text-center py-4">אין חתונות</p>
          ) : (
            <div className="space-y-3">
              {stats.recentWeddings.map((wedding: any) => (
                <div key={wedding._id.toString()} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{wedding.groomName} & {wedding.brideName}</p>
                    <p className="text-sm text-gray-500">
                      {wedding.userId?.name || 'לא ידוע'} • {new Date(wedding.createdAt).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    wedding.status === 'active' ? 'bg-green-100 text-green-800' :
                    wedding.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {wedding.status === 'active' ? 'פעיל' : wedding.status === 'draft' ? 'טיוטה' : wedding.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming Weddings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">חתונות קרובות</h3>
          {stats.upcomingWeddings.length === 0 ? (
            <p className="text-gray-500 text-center py-4">אין חתונות קרובות</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingWeddings.map((wedding: any) => {
                const eventDate = new Date(wedding.eventDate);
                const daysUntil = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={wedding._id.toString()} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{wedding.groomName} & {wedding.brideName}</p>
                      <p className="text-sm text-gray-500">
                        {eventDate.toLocaleDateString('he-IL')} • {wedding.venue}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {daysUntil === 0 ? 'היום!' : daysUntil === 1 ? 'מחר!' : `עוד ${daysUntil} ימים`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
