import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import hebrewDate from 'hebrew-date';
import dbConnect from '@/lib/db/mongodb';
import Guest from '@/lib/db/models/Guest';
import Wedding from '@/lib/db/models/Wedding';
import { RSVPForm } from '@/components/invitation/RSVPForm';
import { getGenderText, type PartnerType } from '@/lib/utils/genderText';

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

  const theme = wedding.theme || {
    primaryColor: '#7950a5',
    secondaryColor: '#2C3E50',
    fontFamily: 'Assistant'
  };

  const backgroundPattern = wedding.backgroundPattern;

  return (
    <div
      className="min-h-screen bg-[#fffff6]"
      style={{
        fontFamily: 'Heebo, Assistant, sans-serif'
      }}
    >
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Allura&family=Heebo:wght@300;400;500;700&family=Suez+One&display=swap"
        rel="stylesheet"
      />

      {/* Hero Image - Fixed at top, scrolls under content */}
      {wedding.mediaUrl && (
        <div className="fixed top-0 left-0 right-0 w-full z-0 flex justify-center">
          <div className="w-full md:w-[520px]">
            {wedding.mediaType === 'video' ? (
              <video
                src={wedding.mediaUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-auto object-contain block"
              />
            ) : (
              <img
                src={wedding.mediaUrl}
                alt={`${wedding.groomName} & ${wedding.brideName}`}
                className="w-full h-auto object-contain block"
              />
            )}
          </div>
        </div>
      )}

      {/* Spacer - slightly shorter than image so content overlaps a bit */}
      {wedding.mediaUrl && (
        <div className="w-full md:w-[520px] md:mx-auto invisible mb-[-90px] md:mb-[-110px]">
          {wedding.mediaType === 'video' ? (
            <video
              src={wedding.mediaUrl}
              className="w-full h-auto object-contain block"
              muted
            />
          ) : (
            <img
              src={wedding.mediaUrl}
              alt=""
              className="w-full h-auto object-contain block"
            />
          )}
        </div>
      )}

      {/* Torn Paper Effect - scrolls over image */}
      {wedding.mediaUrl && wedding.backgroundPattern && (
        <div
          className="relative z-10 h-24 w-full md:w-[522px] md:h-[120px] md:mx-auto pointer-events-none"
          style={{
            backgroundImage: `url("${wedding.backgroundPattern}")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'top center',
            backgroundSize: 'cover',
            marginTop: '-1px',
          }}
        />
      )}

      {/* Invitation Content - scrolls over image */}
      <div className="relative z-10 bg-[#fffff6]" style={{ marginTop: '-1px' }}>
        {/* Content */}
        <div className="relative px-4 max-w-md mx-auto">
          {/* Names - Large Decorative Font */}
          <div className="mb-4 flex flex-wrap items-center justify-center gap-3 text-center">
            <h1
              className="text-5xl md:text-6xl"
              style={{
                letterSpacing: '0.05em',
                color: '#555050',
                fontFamily: '"Suez One", "Heebo", serif',
                fontWeight: 600,
              }}
            >
              {wedding.groomName}
            </h1>
            <span
              className="text-5xl md:text-6xl pt-4"
              style={{
                color: '#c2b57f',
                fontFamily: '"Allura", cursive',
              }}
            >
              &
            </span>
            <h1
              className="text-5xl md:text-6xl leading-tight tracking-wide"
              style={{
                letterSpacing: '0.05em',
                color: '#555050',
                fontFamily: '"Suez One", "Heebo", serif',
                fontWeight: 600,
              }}
            >
              {wedding.brideName}
            </h1>
          </div>

          {/* Quote */}
          <p className="text-center text-sm text-gray-400 px-4">
            {wedding.description || 'מים רבים לא יוכלו לכבות את האהבה ונהרות לא ישטפוה'}
          </p>

          {/* Invitation Text */}
          <div className="text-center">
            <p className="text-xl text-gray-700">
              {getGenderText('happy', (wedding.partner1Type || 'groom') as PartnerType, (wedding.partner2Type || 'bride') as PartnerType)} ו{getGenderText('thrilled', (wedding.partner1Type || 'groom') as PartnerType, (wedding.partner2Type || 'bride') as PartnerType)} להזמינכם ליום המאושר בחיינו
            </p>
          </div>

          {/* Event Details */}
          <div className="rounded-lg text-center">
            {/* Date Display */}
            {(() => {
              const dateParts = getDateParts(wedding.eventDate);
              return (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">
                    בתאריך {dateParts.hebrewDate} {dateParts.hebrewWeekday}
                  </p>
                </div>
              );
            })()}

            <div className="text-sm text-gray-700 space-y-0.5">
              <p>קבלת פנים {wedding.eventTime}</p>
              <p>חופה וקידושין {wedding.eventTime}</p>
            </div>
          </div>

          {/* Date Display Box */}
          {(() => {
            const dateParts = getDateParts(wedding.eventDate);
            return (
              <div className="flex justify-center">
                <div className="rounded px-8 py-4 inline-flex items-center gap-6">
                  <span className="text-lg font-medium w-24 text-center text-gray-600 border-b border-t border-zinc-400 p-2">{dateParts.weekday}</span>
                  <div className="text-center">
                    <p className="text-base text-gray-500">{dateParts.month}</p>
                    <p className="text-5xl font-bold text-gray-800">{dateParts.day}</p>
                    <p className="text-base text-gray-500">{dateParts.year}</p>
                  </div>
                  <span className="text-lg font-medium w-24 text-center text-gray-600 border-b border-t border-zinc-400 p-2">{wedding.eventTime}</span>
                </div>
              </div>
            );
          })()}

          {/* Venue */}
          <div className="mb-4 flex flex-col items-center text-center space-y-1">
            <p className="text-base font-medium text-gray-800">
              בגן אירועים "{wedding.venue}"
            </p>
            <p className="text-sm text-gray-600">{wedding.venueAddress}</p>
          </div>

          {/* RSVP Form Section */}
          <div className="mb-6">
            
           
            <div className="p-6 text-center">
              <RSVPForm
                guest={{
                  _id: guest._id.toString(),
                  name: guest.name,
                  uniqueToken: guest.uniqueToken,
                  invitedCount: guest.invitedCount,
                  rsvpStatus: guest.rsvpStatus,
                  adultsAttending: guest.adultsAttending || 0,
                  childrenAttending: guest.childrenAttending || 0,
                  regularMeals: guest.regularMeals,
                  vegetarianMeals: guest.vegetarianMeals || 0,
                  veganMeals: guest.veganMeals || 0,
                  otherMeals: guest.otherMeals || 0,
                  otherMealDescription: guest.otherMealDescription || '',
                  specialMealRequests: guest.specialMealRequests || '',
                  notes: guest.notes || '',
                }}
                themeColor={theme.primaryColor}
              />
            </div>
          </div>

          {/* Divider */}
          <div
            className="w-16 h-0.5 mx-auto mb-6"
            style={{ backgroundColor: theme.primaryColor, opacity: 0.5 }}
          />

          {/* Map Links */}
          {wedding.venueAddress && (
            <div className="mb-8">
              <h3 className="text-center text-xl font-medium text-gray-700 mb-4">
                ניווט לאירוע
              </h3>
              <div className="flex gap-3 justify-center">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm flex items-center gap-2"
                >
                  <span>📍</span>
                  <span>Google Maps</span>
                </a>
                <a
                  href={`https://waze.com/ul?q=${encodeURIComponent(wedding.venueAddress)}&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm flex items-center gap-2"
                >
                  <span>🚗</span>
                  <span>Waze</span>
                </a>
              </div>
            </div>
          )}

          {/* Gift Links */}
          {(wedding.enableBitGifts && wedding.bitPhone) && (
            <div className="mb-8">
              <h3 className="text-center text-xl font-medium text-gray-700 mb-2">
                רוצים לשלוח מתנה?
              </h3>
              <p className="text-center text-base text-gray-500 mb-4">
                תודה מראש על המחשבה
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <a
                  href={wedding.bitPhone}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-sm flex items-center gap-2"
                >
                  <span>💳</span>
                  <span>שליחת מתנה ב-Bit</span>
                </a>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="py-8 border-t border-gray-200">
            <p className="text-gray-400 text-base text-center">
              נשמח לראותכם בחגיגה שלנו
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
