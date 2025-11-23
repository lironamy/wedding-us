import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import { AutomatedMessageSender } from '@/components/dashboard/AutomatedMessageSender';
import { ScheduledMessages } from '@/components/dashboard/ScheduledMessages';
import { TwilioSetup } from '@/components/dashboard/TwilioSetup';

export const metadata = {
  title: 'שליחת הודעות | Wedding Platform',
  description: 'שלח הודעות אוטומטיות לאורחים',
};

export default async function MessagesPage() {
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
            <h1 className="text-3xl font-bold mb-4">שליחת הודעות</h1>
            <p className="text-gray-600 mb-6">
              עליך ליצור חתונה לפני שתוכל לשלוח הודעות
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
            שליחת הודעות
          </h1>
          <p className="text-gray-600">
            שלח הודעות אוטומטיות לאורחים דרך WhatsApp
          </p>
        </div>

        <div className="space-y-8">
          {/* Scheduled Messages - Auto Send */}
          <section>
            <h2 className="text-2xl font-bold mb-4">תזמון אוטומטי</h2>
            <ScheduledMessages weddingId={weddingId} />
          </section>

          {/* Manual Message Sender */}
          <section>
            <h2 className="text-2xl font-bold mb-4">שליחה ידנית</h2>
            <AutomatedMessageSender weddingId={weddingId} />
          </section>

          {/* Twilio Setup */}
          <section>
            <h2 className="text-2xl font-bold mb-4">הגדרות Twilio</h2>
            <TwilioSetup />
          </section>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">איך זה עובד?</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span><strong>תזמון אוטומטי:</strong> ההודעות נשלחות אוטומטית בתאריכים שנקבעו לפי תאריך האירוע</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span><strong>שליחה ידנית:</strong> שלח הודעות באופן ידני לאורחים שבחרת</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span><strong>התראות:</strong> תקבלו הודעה ב-WhatsApp כשההודעות נשלחות עם לינק לצפייה בתגובות</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span><strong>Twilio:</strong> השירות דורש הגדרת חשבון Twilio ויצירת Templates מאושרים</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
