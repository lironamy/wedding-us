import Link from 'next/link';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import Guest from '@/lib/db/models/Guest';
import { Card } from '@/components/ui/Card';

async function getAllWeddings() {
  await dbConnect();

  const weddings = await Wedding.find()
    .sort({ createdAt: -1 })
    .populate('userId', 'name email')
    .lean() as any[];

  // Get guest counts for each wedding
  const weddingsWithStats = await Promise.all(
    weddings.map(async (wedding) => {
      const guestCount = await Guest.countDocuments({ weddingId: wedding._id });
      const confirmedCount = await Guest.countDocuments({
        weddingId: wedding._id,
        rsvpStatus: 'confirmed',
      });
      return {
        ...wedding,
        _id: wedding._id.toString(),
        guestCount,
        confirmedCount,
      };
    })
  );

  return weddingsWithStats;
}

export default async function AdminWeddingsPage() {
  const weddings = await getAllWeddings();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">כל החתונות</h1>
          <p className="text-gray-600">צפייה וניהול כל החתונות בפלטפורמה</p>
        </div>
        <div className="text-sm text-gray-500">
          סה״כ: {weddings.length} חתונות
        </div>
      </div>

      {weddings.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          אין חתונות בפלטפורמה
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-right">שם הזוג</th>
                <th className="px-4 py-3 text-right">משתמש</th>
                <th className="px-4 py-3 text-right">תאריך אירוע</th>
                <th className="px-4 py-3 text-right">מקום</th>
                <th className="px-4 py-3 text-center">אורחים</th>
                <th className="px-4 py-3 text-center">אישרו</th>
                <th className="px-4 py-3 text-center">סטטוס</th>
                <th className="px-4 py-3 text-center">נוצר</th>
                <th className="px-4 py-3 text-center">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {weddings.map((wedding) => (
                <tr key={wedding._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {wedding.groomName} & {wedding.brideName}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm">{wedding.userId?.name || 'לא ידוע'}</p>
                      <p className="text-xs text-gray-500">{wedding.userId?.email || ''}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(wedding.eventDate).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-4 py-3 text-sm">{wedding.venue || '-'}</td>
                  <td className="px-4 py-3 text-center">{wedding.guestCount}</td>
                  <td className="px-4 py-3 text-center text-green-600 font-medium">
                    {wedding.confirmedCount}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        wedding.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : wedding.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : wedding.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {wedding.status === 'active'
                        ? 'פעיל'
                        : wedding.status === 'draft'
                        ? 'טיוטה'
                        : wedding.status === 'completed'
                        ? 'הושלם'
                        : wedding.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-500">
                    {new Date(wedding.createdAt).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <a
                        href={`/wedding/${wedding.uniqueUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                        title="צפה בהזמנה"
                      >
                        👀
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
