import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import { GiftsDashboard } from '@/components/dashboard/GiftsDashboard';

export const metadata = {
  title: 'מעקב מתנות | לונסול',
  description: 'עקוב אחר המתנות שקיבלת מהאורחים',
};

export default async function GiftsPage() {
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
      <div className="min-h- ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">מעקב מתנות</h1>
            <p className="text-gray-600 mb-6">
              עליך ליצור חתונה לפני שתוכל לעקוב אחר מתנות
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
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            מעקב מתנות
          </h1>
          <p className="text-lg text-gray-600">
            עקוב אחר המתנות שאורחים שלחו דרך ביט או פייבוקס
          </p>
        </div>

        {/* Setup Warning */}
        {!wedding.bitPhone && !wedding.payboxPhone && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-bold text-yellow-800 mb-2">הגדר מספרי טלפון נייד לתשלום</h3>
            <p className="text-sm text-yellow-700 mb-3">
              כדי שאורחים יוכלו לשלוח מתנות, הגדר את מספרי הטלפון נייד שלך לביט ו/או פייבוקס בהגדרות.
            </p>
            <a
              href="/dashboard/settings"
              className="text-sm text-yellow-800 font-medium hover:underline"
            >
              עבור להגדרות →
            </a>
          </div>
        )}

        {/* Gifts Dashboard */}
        <GiftsDashboard
          weddingId={weddingId}
          bitPhone={wedding.bitPhone}
          payboxPhone={wedding.payboxPhone}
        />

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">איך זה עובד?</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>הגדר את מספרי הטלפון נייד שלך לביט ופייבוקס בהגדרות</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>קישורי התשלום יופיעו בדף ה-RSVP של האורחים</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>הוסף ידנית את סכומי המתנות שקיבלת למעקב</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>ייצא את רשימת המתנות לאקסל לרישום מסודר</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
