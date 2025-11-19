import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Wedding from '@/lib/db/models/Wedding';
import { Card } from '@/components/ui/Card';

async function getAllUsers() {
  await dbConnect();

  const users = await User.find()
    .sort({ createdAt: -1 })
    .lean() as any[];

  // Get wedding count for each user
  const usersWithStats = await Promise.all(
    users.map(async (user) => {
      const weddingCount = await Wedding.countDocuments({ userId: user._id });
      const activeWedding = await Wedding.findOne({
        userId: user._id,
        status: { $in: ['active', 'draft'] },
      }).lean() as any;

      return {
        ...user,
        _id: user._id.toString(),
        weddingCount,
        activeWedding: activeWedding ? {
          groomName: activeWedding.groomName,
          brideName: activeWedding.brideName,
          eventDate: activeWedding.eventDate,
        } : null,
      };
    })
  );

  return usersWithStats;
}

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  const adminCount = users.filter(u => u.role === 'admin').length;
  const coupleCount = users.filter(u => u.role === 'couple').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ניהול משתמשים</h1>
          <p className="text-gray-600">צפייה וניהול כל המשתמשים בפלטפורמה</p>
        </div>
        <div className="text-sm text-gray-500">
          סה״כ: {users.length} משתמשים ({adminCount} אדמינים, {coupleCount} זוגות)
        </div>
      </div>

      {users.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          אין משתמשים בפלטפורמה
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-right">שם</th>
                <th className="px-4 py-3 text-right">אימייל</th>
                <th className="px-4 py-3 text-center">תפקיד</th>
                <th className="px-4 py-3 text-center">סוג הרשמה</th>
                <th className="px-4 py-3 text-center">חתונות</th>
                <th className="px-4 py-3 text-right">חתונה פעילה</th>
                <th className="px-4 py-3 text-center">תאריך הרשמה</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {user.role === 'admin' ? 'אדמין' : 'זוג'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        user.googleId
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.googleId ? 'Google' : 'אימייל'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{user.weddingCount}</td>
                  <td className="px-4 py-3">
                    {user.activeWedding ? (
                      <div>
                        <p className="text-sm">
                          {user.activeWedding.groomName} & {user.activeWedding.brideName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(user.activeWedding.eventDate).toLocaleDateString('he-IL')}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('he-IL')}
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
