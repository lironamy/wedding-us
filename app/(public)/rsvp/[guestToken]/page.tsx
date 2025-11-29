import { Metadata } from 'next';
import hebrewDate from 'hebrew-date';
import dbConnect from '@/lib/db/mongodb';
import Guest from '@/lib/db/models/Guest';
import Wedding from '@/lib/db/models/Wedding';
import InvitationRenderer from '@/components/invitation/InvitationRenderer';

interface RSVPPageProps {
  params: Promise<{
    guestToken: string;
  }>;
}

// Generate metadata with Open Graph tags for WhatsApp preview
export async function generateMetadata({ params }: RSVPPageProps): Promise<Metadata> {
  const { guestToken } = await params;

  await dbConnect();

  const guest = await Guest.findOne({ uniqueToken: guestToken }).lean() as any;

  if (!guest) {
    return {
      title: 'הזמנה לחתונה',
    };
  }

  const wedding = await Wedding.findById(guest.weddingId).lean() as any;

  if (!wedding) {
    return {
      title: 'הזמנה לחתונה',
    };
  }

  const title = `הזמנה לחתונה של ${wedding.groomName} ו${wedding.brideName}`;
  const description = `${guest.name}, אתם מוזמנים לחתונה שלנו! לחצו לאישור הגעה`;

  // Format date for description
  const eventDate = new Date(wedding.eventDate);
  const formattedDate = eventDate.toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    title,
    description: `${description} - ${formattedDate}`,
    openGraph: {
      title,
      description: `${description} - ${formattedDate}`,
      images: wedding.mediaUrl ? [
        {
          url: wedding.mediaUrl,
          width: 1200,
          height: 630,
          alt: `${wedding.groomName} & ${wedding.brideName}`,
        }
      ] : [],
      locale: 'he_IL',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: `${description} - ${formattedDate}`,
      images: wedding.mediaUrl ? [wedding.mediaUrl] : [],
    },
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

export default async function RSVPPage({ params }: RSVPPageProps) {
  const { guestToken } = await params;

  await dbConnect();

  // Find guest by token
  const guest = await Guest.findOne({ uniqueToken: guestToken }).lean() as any;

  if (!guest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffff6] p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">קישור לא תקין</h1>
          <p className="text-gray-600">
            הקישור לאישור ההגעה לא תקין או שפג תוקפו.
          </p>
        </div>
      </div>
    );
  }

  // Get wedding details
  const wedding = await Wedding.findById(guest.weddingId).lean() as any;

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffff6] p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">שגיאה</h1>
          <p className="text-gray-600">לא נמצאו פרטי החתונה</p>
        </div>
      </div>
    );
  }

  // Convert to proper format - serialize all MongoDB ObjectIds
  const weddingData = JSON.parse(JSON.stringify({
    ...wedding,
    _id: wedding._id.toString(),
    userId: wedding.userId.toString(),
    eventDate: wedding.eventDate.toISOString()
  }));

  const guestData = {
    _id: guest._id.toString(),
    name: guest.name,
    uniqueToken: guest.uniqueToken,
    invitedCount: guest.invitedCount,
    rsvpStatus: guest.rsvpStatus,
    adultsAttending: guest.adultsAttending || 0,
    childrenAttending: guest.childrenAttending || 0,
    vegetarianMeals: guest.vegetarianMeals || 0,
    veganMeals: guest.veganMeals || 0,
    kidsMeals: guest.kidsMeals || 0,
    glutenFreeMeals: guest.glutenFreeMeals || 0,
    otherMeals: guest.otherMeals || 0,
    otherMealDescription: guest.otherMealDescription || '',
    notes: guest.notes || '',
  };

  // Get meal settings from wedding
  const askAboutMeals = weddingData.askAboutMeals !== false;
  const mealOptions = weddingData.mealOptions || {
    regular: true,
    vegetarian: true,
    vegan: true,
    kids: true,
    glutenFree: true,
    other: true,
  };
  const customOtherMealName = weddingData.customOtherMealName || '';

  const dateParts = getDateParts(weddingData.eventDate);

  return (
    <InvitationRenderer
      wedding={weddingData}
      guest={guestData}
      dateParts={dateParts}
      isRSVP={true}
      askAboutMeals={askAboutMeals}
      mealOptions={mealOptions}
      customOtherMealName={customOtherMealName}
    />
  );
}
