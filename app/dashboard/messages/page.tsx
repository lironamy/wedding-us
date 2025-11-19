import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import { WhatsAppConnection } from '@/components/dashboard/WhatsAppConnection';
import { AutomatedMessageSender } from '@/components/dashboard/AutomatedMessageSender';

export const metadata = {
  title: 'שליחת הודעות WhatsApp | Wedding Platform',
  description: 'שלח הודעות WhatsApp אוטומטיות לאורחים',
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
            שליחת הודעות WhatsApp
          </h1>
         
        </div>

        <div className="space-y-8">
          {/* WhatsApp Connection */}
          <div>
            <WhatsAppConnection />
          </div>

          {/* Automated Message Sender */}
          <div>
            <AutomatedMessageSender weddingId={weddingId} />
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">טיפים חשובים</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>התחבר ל-WhatsApp על ידי סריקת QR Code עם הטלפון שלך</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>מומלץ להשתמש במספר ייעודי (לא האישי) לשליחת הזמנות</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>השאר 5-10 שניות בין הודעות למניעת חסימה</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>אל תסגור את הדפדפן במהלך שליחת הודעות</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
