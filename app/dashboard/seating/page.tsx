import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import { SeatingDashboard } from '@/components/dashboard/SeatingDashboard';

export const metadata = {
  title: 'ניהול שיבוץ לשולחנות | לונסול',
  description: 'שבץ אורחים לשולחנות בחתונה שלך',
};

export default async function SeatingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  await dbConnect();

  // Get the user's wedding
  const wedding = await Wedding.findOne({
    userId: session.user.id,
    status: { $ne: 'archived' },
  }).lean() as any;

  if (!wedding) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">ניהול שיבוץ לשולחנות</h1>
          <p className="text-gray-600 mb-6">
            עליך ליצור חתונה לפני שתוכל לנהל שיבוץ לשולחנות
          </p>
          <a
            href="/dashboard/settings"
            className="inline-block px-6 py-3 bg-gold text-white rounded-lg hover:bg-gold-dark transition"
          >
            צור חתונה
          </a>
        </div>
      </div>
    );
  }

  const weddingId = wedding._id.toString();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">ניהול שיבוץ לשולחנות</h1>
        <p className="text-gray-600">
          צור שולחנות ושבץ אורחים לפי משפחות וקבוצות
        </p>
      </div>

      <SeatingDashboard weddingId={weddingId} />
    </div>
  );
}
