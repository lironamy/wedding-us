import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  await dbConnect();

  // Check if user is admin
  const user = await User.findById(session.user.id).lean() as any;

  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="text-xl font-bold">
                פאנל אדמין
              </Link>
              <nav className="hidden md:flex items-center gap-4">
                <Link
                  href="/admin"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  סקירה כללית
                </Link>
                <Link
                  href="/admin/weddings"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  חתונות
                </Link>
                <Link
                  href="/admin/users"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  משתמשים
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">{session.user.name}</span>
              <Link
                href="/dashboard"
                className="px-3 py-2 rounded-md text-sm bg-gray-700 hover:bg-gray-600"
              >
                חזרה לדשבורד
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
