import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db/mongodb';
import Guest from '@/lib/db/models/Guest';
import Wedding from '@/lib/db/models/Wedding';
import { RSVPForm } from '@/components/invitation/RSVPForm';
import { formatHebrewDate } from '@/lib/utils/date';

interface RSVPPageProps {
  params: Promise<{
    guestToken: string;
  }>;
}

export default async function RSVPPage({ params }: RSVPPageProps) {
  const { guestToken } = await params;

  await dbConnect();

  // Find guest by token
  const guest = await Guest.findOne({ uniqueToken: guestToken }).lean() as any;

  if (!guest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gold-light to-navy-light p-4">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gold-light to-navy-light p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">שגיאה</h1>
          <p className="text-gray-600">לא נמצאו פרטי החתונה</p>
        </div>
      </div>
    );
  }

  const weddingDate = formatHebrewDate(new Date(wedding.eventDate));

  return (
    <div
      className="min-h-screen p-4 py-12"
      style={{
        background: `linear-gradient(to bottom right, ${wedding.theme?.primaryColor || '#C4A57B'}, ${wedding.theme?.secondaryColor || '#2C3E50'})`,
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Wedding Info */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6 text-center">
          <h1 className="text-4xl font-bold mb-2" style={{ color: wedding.theme?.primaryColor || '#C4A57B' }}>
            {wedding.groomName} & {wedding.brideName}
          </h1>
          <p className="text-xl text-gray-700 mb-1">מתחתנים!</p>
          <p className="text-lg text-gray-600">{weddingDate}</p>
          <p className="text-lg text-gray-600">{wedding.eventTime}</p>
          <p className="text-lg text-gray-600">{wedding.venue}</p>

          {wedding.mediaUrl && (
            <div className="mt-6">
              {wedding.mediaType === 'video' ? (
                <video
                  src={wedding.mediaUrl}
                  controls
                  className="w-full max-w-2xl mx-auto rounded-lg"
                />
              ) : (
                <img
                  src={wedding.mediaUrl}
                  alt="Wedding"
                  className="w-full max-w-2xl mx-auto rounded-lg"
                />
              )}
            </div>
          )}

          {wedding.description && (
            <p className="mt-6 text-gray-700 whitespace-pre-wrap">
              {wedding.description}
            </p>
          )}
        </div>

        {/* RSVP Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-center">
            היי {guest.name}! 👋
          </h2>
          <p className="text-center text-gray-600 mb-6">
            נשמח לדעת אם תוכל/י להגיע לחתונה שלנו
          </p>

          <RSVPForm
            guest={{
              _id: guest._id.toString(),
              name: guest.name,
              uniqueToken: guest.uniqueToken,
              invitedCount: guest.invitedCount,
              rsvpStatus: guest.rsvpStatus,
              adultsAttending: guest.adultsAttending || 0,
              childrenAttending: guest.childrenAttending || 0,
              specialMealRequests: guest.specialMealRequests || '',
              notes: guest.notes || '',
            }}
            themeColor={wedding.theme?.primaryColor || '#C4A57B'}
          />
        </div>

        {/* Map Links */}
        {wedding.venueAddress && (
          <div className="bg-white rounded-lg shadow-xl p-6 mt-6">
            <h3 className="text-xl font-semibold mb-4 text-center">הגעה לאירוע</h3>
            <p className="text-center text-gray-600 mb-4">{wedding.venueAddress}</p>
            <div className="flex gap-4 justify-center">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                📍 Google Maps
              </a>
              <a
                href={`https://waze.com/ul?q=${encodeURIComponent(wedding.venueAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
              >
                🚗 Waze
              </a>
            </div>
          </div>
        )}

        {/* Gift Links */}
        {(wedding.bitPhone || wedding.payboxPhone) && (
          <div className="bg-white rounded-lg shadow-xl p-6 mt-6">
            <h3 className="text-xl font-semibold mb-4 text-center">רוצים לשלוח מתנה?</h3>
            <div className="flex gap-4 justify-center flex-wrap">
              {wedding.bitPhone && (
                <a
                  href={`https://bit.app/${wedding.bitPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  💳 Bit
                </a>
              )}
              {wedding.payboxPhone && (
                <a
                  href={`https://payboxapp.page.link/?link=https://payboxapp.com/payment?phone=${wedding.payboxPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  💎 Paybox
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
