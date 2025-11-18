'use client';

import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface MapLinksProps {
  venueAddress: string;
  venueName: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
}

export default function MapLinks({ venueAddress, venueName, theme }: MapLinksProps) {
  const encodedAddress = encodeURIComponent(`${venueName}, ${venueAddress}`);

  const openGoogleMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const openWaze = () => {
    window.open(`https://waze.com/ul?q=${encodedAddress}&navigate=yes`, '_blank');
  };

  return (
    <Card>
      <div className="p-6">
        <h2
          className="text-2xl font-bold text-center mb-6"
          style={{ color: theme.primaryColor }}
        >
          ניווט למקום האירוע
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={openGoogleMaps}
            className="flex items-center justify-center gap-3 p-4 border-2 rounded-lg transition-all hover:shadow-lg"
            style={{
              borderColor: theme.primaryColor,
              color: theme.primaryColor
            }}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span className="font-semibold">פתח ב-Google Maps</span>
          </button>

          <button
            onClick={openWaze}
            className="flex items-center justify-center gap-3 p-4 border-2 rounded-lg transition-all hover:shadow-lg"
            style={{
              borderColor: theme.secondaryColor,
              color: theme.secondaryColor
            }}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span className="font-semibold">פתח ב-Waze</span>
          </button>
        </div>
      </div>
    </Card>
  );
}
