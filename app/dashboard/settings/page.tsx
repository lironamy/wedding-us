'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WeddingFormStepper from '@/components/dashboard/WeddingFormStepper';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Wedding {
  _id: string;
  userId: string;
  groomName: string;
  brideName: string;
  contactPhone?: string;
  partner1Type?: 'groom' | 'bride';
  partner2Type?: 'groom' | 'bride';
  eventDate: string;
  eventTime: string;
  chuppahTime?: string;
  venue: string;
  venueAddress: string;
  venueCoordinates?: { lat: number; lng: number };
  description?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  theme?: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  backgroundPattern?: string;
  bitPhone?: string;
  payboxPhone?: string;
  enableBitGifts?: boolean;
  bitQrImage?: string;
  maxGuests?: number;
  uniqueUrl: string;
  status: string;
}

export default function SettingsPage() {
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchWedding();
  }, []);

  const fetchWedding = async () => {
    try {
      const response = await fetch('/api/weddings');
      if (!response.ok) throw new Error('Failed to fetch wedding');

      const weddings = await response.json();

      // Get the first active/draft wedding
      const activeWedding = weddings.find(
        (w: Wedding) => w.status === 'active' || w.status === 'draft'
      );

      console.log('=== fetchWedding result ===');
      console.log('Total weddings returned:', weddings.length);
      console.log('All weddings:', weddings.map((w: Wedding) => ({ userId: w.userId, contactPhone: w.contactPhone, status: w.status })));
      console.log('Active wedding contactPhone:', activeWedding?.contactPhone);
      console.log('Active wedding userId:', activeWedding?.userId);
      setWedding(activeWedding || null);
    } catch (err) {
      console.error('Error fetching wedding:', err);
      setError('שגיאה בטעינת פרטי החתונה');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any, options?: { skipRedirect?: boolean }) => {
    console.log('=== Settings Page handleSubmit ===');
    console.log('Options:', options);
    console.log('Skip redirect:', options?.skipRedirect);

    try {
      // Debug: log data being sent
      console.log('Submitting wedding data:', data);
      console.log('groomName:', data.groomName);
      console.log('brideName:', data.brideName);
      console.log('contactPhone:', data.contactPhone);
      console.log('partner1Type:', data.partner1Type);
      console.log('partner2Type:', data.partner2Type);
      console.log('eventDate:', data.eventDate);
      console.log('eventTime:', data.eventTime);
      console.log('venue:', data.venue);
      console.log('venueAddress:', data.venueAddress);
      console.log('backgroundPattern:', data.backgroundPattern);
      console.log('enableBitGifts:', data.enableBitGifts);
      console.log('bitQrImage:', data.bitQrImage);
      console.log('bitPhone:', data.bitPhone);
      console.log('maxGuests:', data.maxGuests);

      const url = wedding
        ? `/api/weddings/${wedding._id}`
        : '/api/weddings';

      const method = wedding ? 'PUT' : 'POST';

      console.log('API URL:', url);
      console.log('Method:', method);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to save wedding');
      }

      const savedWedding = await response.json();
      console.log('=== Saved wedding response ===');
      console.log('Full response:', JSON.stringify(savedWedding, null, 2));
      console.log('contactPhone in response:', savedWedding.contactPhone);
      setWedding(savedWedding);

      // Only redirect if not skipped
      if (!options?.skipRedirect) {
        console.log('Redirecting to dashboard...');
        router.push('/dashboard');
      } else {
        console.log('Skipping redirect');
      }
    } catch (err: any) {
      console.error('Error saving wedding:', err);
      setError(err.message || 'שגיאה בשמירת החתונה');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Show error as overlay if needed
  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 z-50">
        <div className="max-w-md p-6 bg-white rounded-2xl shadow-xl text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">שגיאה</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/dashboard')}>
            חזרה לדשבורד
          </Button>
        </div>
      </div>
    );
  }

  return (
    <WeddingFormStepper
      wedding={wedding}
      onSubmit={handleSubmit}
      onCancel={() => router.push('/dashboard')}
    />
  );
}
