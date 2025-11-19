import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import Link from 'next/link';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import Guest from '@/lib/db/models/Guest';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import CopyLinkButton from '@/components/dashboard/CopyLinkButton';
import ExportPDFButton from '@/components/dashboard/ExportPDFButton';
import { formatHebrewDate, getDaysUntilEvent } from '@/lib/utils/date';

async function getDashboardData(userId: string) {
  await dbConnect();

  // Get wedding
  const wedding = await Wedding.findOne({
    userId,
    status: { $in: ['active', 'draft'] }
  }).lean() as any;

  if (!wedding) {
    return null;
  }

  // Get guest statistics
  const guests = await Guest.find({ weddingId: wedding._id }).lean() as any[];

  const stats = {
    totalGuests: guests.length,
    confirmed: guests.filter(g => g.rsvpStatus === 'confirmed').length,
    declined: guests.filter(g => g.rsvpStatus === 'declined').length,
    pending: guests.filter(g => g.rsvpStatus === 'pending').length,
    totalAdults: guests.reduce((sum, g) => sum + (g.adultsAttending || 0), 0),
    totalChildren: guests.reduce((sum, g) => sum + (g.childrenAttending || 0), 0),
    totalGifts: guests.reduce((sum, g) => sum + (g.giftAmount || 0), 0)
  };

  return {
    wedding: {
      ...wedding,
      _id: wedding._id.toString(),
      userId: wedding.userId.toString(),
      eventDate: wedding.eventDate.toISOString()
    },
    stats
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  const data = await getDashboardData(session.user.id);

  // No wedding created yet
  if (!data) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ברוכים הבאים!</h1>
          <p className="text-gray-600">התחילו ליצור את החתונה הדיגיטלית שלכם</p>
        </div>

        <Card>
          <div className="p-12 text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-24 w-24 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              עדיין לא יצרתם חתונה
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              התחילו בהגדרת פרטי החתונה שלכם - שמות, תאריך, מיקום ותמונות. זה לוקח רק כמה דקות!
            </p>
            <Link href="/dashboard/settings">
              <Button size="lg">צור חתונה חדשה</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const { wedding, stats } = data;
  const daysUntilEvent = getDaysUntilEvent(new Date(wedding.eventDate));
  const isEventPast = daysUntilEvent < 0;

  return (
    <div>
      {/* Header with wedding info */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          החתונה של {wedding.groomName} ו{wedding.brideName}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatHebrewDate(new Date(wedding.eventDate))}</span>
          </div>
          {!isEventPast && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {daysUntilEvent === 0 ? 'היום!' : daysUntilEvent === 1 ? 'מחר!' : `עוד ${daysUntilEvent} ימים`}
            </span>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">סטטיסטיקות</h2>
        <ExportPDFButton />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="סה״כ אורחים"
          value={stats.totalGuests.toString()}
          icon="👥"
          color="bg-blue-500"
        />
        <StatsCard
          title="אישרו הגעה"
          value={stats.confirmed.toString()}
          subtitle={`${stats.totalAdults} מבוגרים, ${stats.totalChildren} ילדים`}
          icon="✅"
          color="bg-green-500"
        />
        <StatsCard
          title="בהמתנה"
          value={stats.pending.toString()}
          icon="⏳"
          color="bg-yellow-500"
        />
        <StatsCard
          title="מתנות"
          value={`₪${stats.totalGifts.toLocaleString('he-IL')}`}
          icon="🎁"
          color="bg-purple-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">פעולות מהירות</h2>
            <div className="space-y-3">
              <QuickAction
                title="צפה בהזמנה"
                description="צפה בהזמנה הדיגיטלית שלך"
                href={`/wedding/${wedding.uniqueUrl}`}
                icon="👀"
                external
              />
              <QuickAction
                title="ערוך פרטי חתונה"
                description="עדכן תאריך, מקום, תמונות ועוד"
                href="/dashboard/settings"
                icon="⚙️"
              />
              <QuickAction
                title="נהל אורחים"
                description="הוסף, ערוך או מחק אורחים"
                href="/dashboard/guests"
                icon="👥"
              />
              <QuickAction
                title="שלח הזמנות"
                description="שלח הזמנות דרך WhatsApp"
                href="/dashboard/messages"
                icon="💬"
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">קישור להזמנה</h2>
            <p className="text-gray-600 mb-4">שתפו את הקישור הזה עם האורחים שלכם:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={`${process.env.NEXT_PUBLIC_APP_URL}/wedding/${wedding.uniqueUrl}`}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <CopyLinkButton text={`${process.env.NEXT_PUBLIC_APP_URL}/wedding/${wedding.uniqueUrl}`} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  color: string;
}) {
  return (
    <Card>
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-2xl shrink-0`}>
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );
}

function QuickAction({
  title,
  description,
  href,
  icon,
  external
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
  external?: boolean;
}) {
  const content = (
    <>
      <div className="text-2xl">{icon}</div>
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 group-hover:text-[#C4A57B] transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      {external && (
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      )}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
    >
      {content}
    </Link>
  );
}
