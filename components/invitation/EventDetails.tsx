import { Card } from '@/components/ui/Card';
import { formatHebrewDate } from '@/lib/utils/date';

interface EventDetailsProps {
  eventDate: string;
  eventTime: string;
  chuppahTime?: string;
  venue: string;
  venueAddress: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
}

export default function EventDetails({
  eventDate,
  eventTime,
  chuppahTime,
  venue,
  venueAddress,
  theme
}: EventDetailsProps) {
  const formattedDate = formatHebrewDate(new Date(eventDate));

  return (
    <Card>
      <div className="p-8">
        <h2
          className="text-3xl font-bold text-center mb-8"
          style={{ color: theme.primaryColor }}
        >
          פרטי האירוע
        </h2>

        <div className="space-y-6">
          {/* Date */}
          <div className="flex items-start gap-4">
            <div
              className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${theme.primaryColor}20` }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: theme.primaryColor }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3
                className="text-lg font-semibold mb-1"
                style={{ color: theme.secondaryColor }}
              >
                תאריך
              </h3>
              <p className="text-gray-700">{formattedDate}</p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-start gap-4">
            <div
              className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${theme.primaryColor}20` }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: theme.primaryColor }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3
                className="text-lg font-semibold mb-1"
                style={{ color: theme.secondaryColor }}
              >
                שעת קבלת פנים
              </h3>
              <p className="text-gray-700">{eventTime}</p>
            </div>
          </div>

          {/* Chuppah Time */}
          {chuppahTime && (
            <div className="flex items-start gap-4">
              <div
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${theme.primaryColor}20` }}
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: theme.primaryColor }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <div>
                <h3
                  className="text-lg font-semibold mb-1"
                  style={{ color: theme.secondaryColor }}
                >
                  שעת החופה
                </h3>
                <p className="text-gray-700">{chuppahTime}</p>
              </div>
            </div>
          )}

          {/* Venue */}
          <div className="flex items-start gap-4">
            <div
              className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${theme.primaryColor}20` }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: theme.primaryColor }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h3
                className="text-lg font-semibold mb-1"
                style={{ color: theme.secondaryColor }}
              >
                מיקום
              </h3>
              <p className="text-gray-700 font-semibold">{venue}</p>
              <p className="text-gray-600 text-sm mt-1">{venueAddress}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
