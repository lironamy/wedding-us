import { notFound } from 'next/navigation';
import hebrewDate from 'hebrew-date';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import MapLinks from '@/components/invitation/MapLinks';
import GiftLinks from '@/components/invitation/GiftLinks';

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

  const theme = wedding.theme || {
    primaryColor: '#C4A57B',
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
      {/* Hero Image - Full Width at Top */}
      {wedding.mediaUrl && (
        <div className="relative w-full">
          {wedding.mediaType === 'video' ? (
            <video
              src={wedding.mediaUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full md:w-1/4 md:mx-auto h-[50vh] md:h-[60vh] object-cover"
            />
          ) : (
            <img
              src={wedding.mediaUrl}
              alt={`${wedding.groomName} & ${wedding.brideName}`}
              className="w-full md:w-[520px] md:mx-auto h-[50vh] md:h-[60vh] object-cover"
            />
          )}

          {/* Torn Paper Effect */}
          <div
            className="absolute h-screen w-screen -bottom-1 left-0 right-0 pointer-events-none"
            style={{
              backgroundImage: 'url("https://64.media.tumblr.com/6753066afc5d236efae45d31ebfc7b64/a6d93d5b52cd16a6-1c/s540x810/fc872eb481d64b6e82192a760d700b4ae3845dce.pnj")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'bottom center',
            }}
          />
        </div>
      )}

      {/* Invitation Content with Background Pattern */}
      <div className="relative">
        {/* Background Pattern */}
        {backgroundPattern ? (
          <div
            className="  bg-[#FFFFF6]"
     

          />
        ) : (
          <div
            className=" "
            style={{
              background: `linear-gradient(180deg, ${theme.primaryColor}08 0%, ${theme.secondaryColor}08 100%)`,
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10 px-4 max-w-md mx-auto">
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
            מים רבים לא יוכלו לכבות את האהבה ונהרות לא ישטפוה
          </p>

          {/* Invitation Text */}
          <div className="text-center">
            <p className="text-xl text-gray-700">
              שמחים ונרגשים להזמינכם ליום המאושר בחיינו
            </p>
          </div>

          {/* Gold/Yellow Event Details Box */}
          <div
            className="rounded-lg text-center"
          >
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

          {/* Date Display Box - Like in the image */}
          {(() => {
            const dateParts = getDateParts(wedding.eventDate);
            return (
              <div className="flex justify-center">
                <div className=" rounded px-8 py-4 inline-flex items-center gap-6">
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

          <div className="mb-4 flex flex-col items-center text-center space-y-1">

             {/* Venue */}
            <p className="text-base font-medium text-gray-800">
              בגן אירועים "{wedding.venue}"
            </p>
            <p className="text-sm text-gray-600">{wedding.venueAddress}</p>
          </div>

          

          {/* RSVP Call to Action */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              אנא אשרו הגעתכם
            </h2>
            <p className="text-base text-gray-500 mb-4">
              קישור לאישור הגעה נשלח אליכם בהודעה אישית
            </p>
          </div>

          {/* Divider */}
          <div
            className="w-16 h-0.5 mx-auto mb-6"
            style={{ backgroundColor: theme.primaryColor, opacity: 0.5 }}
          />

          {/* Map Links */}
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
                href={`https://waze.com/ul?q=${encodeURIComponent(wedding.venueAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm flex items-center gap-2"
              >
                <span>🚗</span>
                <span>Waze</span>
              </a>
            </div>
          </div>

          {/* Gift Links */}
          {(wedding.bitPhone || wedding.payboxPhone) && (
            <div className="mb-8">
              <h3 className="text-center text-xl font-medium text-gray-700 mb-2">
                רוצים לשלוח מתנה?
              </h3>
              <p className="text-center text-base text-gray-500 mb-4">
                תודה מראש על המחשבה
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                {wedding.bitPhone && (
                  <a
                    href={`https://www.bitpay.co.il/app/users/${wedding.bitPhone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-sm flex items-center gap-2"
                  >
                    <span>💳</span>
                    <span>Bit</span>
                  </a>
                )}
                {wedding.payboxPhone && (
                  <a
                    href={`https://payboxapp.page.link/?link=https://payboxapp.com/payment?phone=${wedding.payboxPhone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-sm flex items-center gap-2"
                  >
                    <span>💎</span>
                    <span>Paybox</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="py-8   border-t border-gray-200">
            <p className="text-gray-400 text-base text-center">
              נשמח לראותכם בחגיגה שלנו
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
