import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import MessagesPageContent from '@/components/dashboard/MessagesPageContent';

export const metadata = {
  title: 'שליחת הודעות | לונסול',
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
      <div className="min-h- ">
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
    <div className="container mx-auto px-4 py-8">
      <MessagesPageContent weddingId={weddingId} />
    </div>
  );
}
