'use client';

import { Card } from '@/components/ui/Card';
import { generateBitLink, generatePayboxLink } from '@/lib/utils/payment';

interface GiftLinksProps {
  bitPhone?: string;
  payboxPhone?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
}

export default function GiftLinks({ bitPhone, payboxPhone, theme }: GiftLinksProps) {
  const openBit = () => {
    if (bitPhone) {
      window.open(generateBitLink(bitPhone), '_blank');
    }
  };

  const openPaybox = () => {
    if (payboxPhone) {
      window.open(generatePayboxLink(payboxPhone), '_blank');
    }
  };

  return (
    <Card>
      <div className="p-6">
        <h2
          className="text-2xl font-bold text-center mb-4"
          style={{ color: theme.primaryColor }}
        >
          מתנה לחתן וכלה 🎁
        </h2>

        <p className="text-center text-gray-600 mb-6">
          נשמח אם תרצו להעניק לנו מתנה דרך אחת מהאפליקציות הבאות
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bitPhone && (
            <button
              onClick={openBit}
              className="flex items-center justify-center gap-3 p-4 rounded-lg transition-all hover:shadow-lg text-white font-semibold"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
              </svg>
              <span>שלח מתנה דרך Bit</span>
            </button>
          )}

          {payboxPhone && (
            <button
              onClick={openPaybox}
              className="flex items-center justify-center gap-3 p-4 rounded-lg transition-all hover:shadow-lg text-white font-semibold"
              style={{ backgroundColor: theme.secondaryColor }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
              </svg>
              <span>שלח מתנה דרך Paybox</span>
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
