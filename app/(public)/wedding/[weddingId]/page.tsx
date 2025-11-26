import { notFound } from 'next/navigation';
import hebrewDate from 'hebrew-date';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import InvitationRenderer from '@/components/invitation/InvitationRenderer';

interface PageProps {
  params: Promise<{
    weddingId: string;
  }>;
}

async function getWedding(uniqueUrl: string) {
  await dbConnect();

  const wedding = await Wedding.findOne({
    uniqueUrl,
    status: { $in: ['active', 'draft'] }
  }).lean() as any;

  if (!wedding) {
    return null;
  }

  // Convert MongoDB ObjectId to string
  return {
    ...wedding,
    _id: wedding._id.toString(),
    userId: wedding.userId.toString(),
    eventDate: wedding.eventDate.toISOString()
  };
}

function convertNumberToHebrewDay(day: number) {
  if (day <= 0 || day > 30 || Number.isNaN(day)) {
    return String(day);
  }

  if (day === 15) return 'ט״ו';
  if (day === 16) return 'ט״ז';

  const units = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];

  const dayTens = Math.floor(day / 10);
  const dayUnits = day % 10;
  const letters: string[] = [];

  if (dayTens > 0) {
    letters.push(tens[dayTens]);
  }
  if (dayUnits > 0) {
    letters.push(units[dayUnits]);
  }

  if (letters.length === 0) {
    return '';
  }

  if (letters.length === 1) {
    return `${letters[0]}׳`;
  }

  return letters
    .map((letter, index) =>
      index === letters.length - 2 ? `${letter}״` : letter
    )
    .join('');
}

function getDateParts(dateString: string) {
  const date = new Date(dateString);
  const hebrewWeekdayFormatter = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
    weekday: 'long'
  });
  const hebrewMonthFormatter = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
    month: 'long'
  });
  const hebrew = hebrewDate(date);
  const hebrewMonth = hebrewMonthFormatter.format(date);

  return {
    day: date.getDate(),
    month: date.toLocaleDateString('he-IL', { month: 'long' }),
    year: date.getFullYear(),
    weekday: date.toLocaleDateString('he-IL', { weekday: 'long' }),
    hebrewDate: `${convertNumberToHebrewDay(hebrew.date)} ב${hebrewMonth}`.trim(),
    hebrewWeekday: hebrewWeekdayFormatter.format(date),
  };
}

export default async function WeddingInvitationPage({ params }: PageProps) {
  const { weddingId } = await params;
  const wedding = await getWedding(weddingId);

  if (!wedding) {
    notFound();
  }

  const dateParts = getDateParts(wedding.eventDate);

  return (
    <InvitationRenderer
      wedding={wedding}
      dateParts={dateParts}
      isRSVP={false}
    />
  );
}
