import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import { ExcelImport } from '@/components/dashboard/ExcelImport';

export default async function ImportGuestsPage() {
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
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">ייבוא אורחים מאקסל</h1>
          <p className="text-gray-600">
            העלה קובץ אקסל עם רשימת האורחים שלך
          </p>
        </div>

        <ExcelImport weddingId={weddingId} />

        <div className="mt-6">
          <a
            href="/dashboard/guests"
            className="text-blue-600 hover:underline"
          >
            ← חזרה לרשימת אורחים
          </a>
        </div>
      </div>
    </div>
  );
}
