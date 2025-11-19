import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/get-session';
import DashboardNav from '@/components/dashboard/DashboardNav';
import WarmupPing from '@/components/dashboard/WarmupPing';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <WarmupPing />
      <DashboardNav user={session.user} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
