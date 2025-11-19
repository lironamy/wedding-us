import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import { SeatingDashboard } from '@/components/dashboard/SeatingDashboard';

export const metadata = {
  title: 'ניהול שיבוץ לשולחנות | Wedding Platform',
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
      <div className="min-h-screen bg-gradient-to-b from-cream to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
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
      </div>
    );
  }

  const weddingId = wedding._id.toString();

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ניהול שיבוץ לשולחנות
          </h1>
          <p className="text-lg text-gray-600">
            צור שולחנות ושבץ אורחים לפי משפחות וקבוצות
          </p>
        </div>

        {/* Seating Dashboard */}
        <SeatingDashboard weddingId={weddingId} />

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">טיפים לשיבוץ</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>צור שולחנות לפי הקיבולת של האולם (בדרך כלל 8-12 מקומות לשולחן)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>שבץ משפחות וחברים ביחד כשאפשר</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>השאר מקום פנוי לשינויים של הרגע האחרון</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>מספר השולחן יופיע בהודעת "יום לפני" לאורחים</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
