import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import { MessageHistory } from '@/components/dashboard/MessageHistory';

export default async function MessageHistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  await dbConnect();

  // Get user's wedding
  const wedding = await Wedding.findOne({
    userId: session.user.id,
    status: { $ne: 'archived' },
  }).lean() as any;

  if (!wedding) {
    redirect('/dashboard/settings');
  }

  const weddingId = wedding._id.toString();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <a
            href="/dashboard/messages"
            className="text-gray-600 hover:text-gray-900"
          >
            ← חזרה להודעות
          </a>
        </div>
        <h1 className="text-3xl font-bold mb-2">היסטוריית הודעות</h1>
        <p className="text-gray-600">
          צפה בכל ההודעות שנשלחו לאורחים
        </p>
      </div>

      <MessageHistory weddingId={weddingId} />
    </div>
  );
}
