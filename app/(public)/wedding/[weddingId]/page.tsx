import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import InvitationCard from '@/components/invitation/InvitationCard';
import EventDetails from '@/components/invitation/EventDetails';
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
      className="min-h-screen relative"
      style={{
        fontFamily: theme.fontFamily
      }}
    >
      {/* Background Pattern Layer */}
      {backgroundPattern ? (
        <div
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url(${backgroundPattern})`,
            backgroundSize: '300px',
            backgroundRepeat: 'repeat',
            opacity: 0.3,
          }}
        />
      ) : (
        <div
          className="fixed inset-0 z-0"
          style={{
            background: `linear-gradient(135deg, ${theme.primaryColor}15 0%, ${theme.secondaryColor}15 100%)`,
          }}
        />
      )}

      {/* Content Layer */}
      <div className="relative z-10">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1
            className="text-5xl md:text-6xl font-bold mb-2"
            style={{ color: theme.primaryColor }}
          >
            {wedding.groomName} ו{wedding.brideName}
          </h1>
          <p className="text-xl text-gray-600">מתחתנים!</p>
        </div>

        {/* Invitation Card */}
        <div className="mb-8">
          <InvitationCard
            mediaUrl={wedding.mediaUrl}
            mediaType={wedding.mediaType}
            description={wedding.description}
            theme={theme}
          />
        </div>

        {/* Event Details */}
        <div className="mb-8">
          <EventDetails
            eventDate={wedding.eventDate}
            eventTime={wedding.eventTime}
            venue={wedding.venue}
            venueAddress={wedding.venueAddress}
            theme={theme}
          />
        </div>

        {/* Map Links */}
        <div className="mb-8">
          <MapLinks
            venueAddress={wedding.venueAddress}
            venueName={wedding.venue}
            theme={theme}
          />
        </div>

        {/* Gift Links */}
        {(wedding.bitPhone || wedding.payboxPhone) && (
          <div className="mb-8">
            <GiftLinks
              bitPhone={wedding.bitPhone}
              payboxPhone={wedding.payboxPhone}
              theme={theme}
            />
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            נשמח לראותכם בחגיגה שלנו 💍
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
