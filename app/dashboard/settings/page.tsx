'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WeddingForm from '@/components/dashboard/WeddingForm';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Wedding {
  _id: string;
  groomName: string;
  brideName: string;
  eventDate: string;
  eventTime: string;
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

      setWedding(activeWedding || null);
    } catch (err) {
      console.error('Error fetching wedding:', err);
      setError('שגיאה בטעינת פרטי החתונה');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      // Debug: log data being sent
      console.log('Submitting wedding data:', data);
      console.log('backgroundPattern:', data.backgroundPattern);

      const url = wedding
        ? `/api/weddings/${wedding._id}`
        : '/api/weddings';

      const method = wedding ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save wedding');
      }

      const savedWedding = await response.json();
      setWedding(savedWedding);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Error saving wedding:', err);
      setError(err.message || 'שגיאה בשמירת החתונה');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {wedding ? 'עריכת פרטי החתונה' : 'יצירת חתונה חדשה'}
        </h1>
        <p className="text-gray-600 mt-2">
          {wedding
            ? 'עדכני את פרטי החתונה שלך'
            : 'מלאי את הפרטים ליצירת הזמנה דיגיטלית מושלמת'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {wedding && (
        <Card className="mb-6">
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            <h3 className="font-semibold text-blue-900">קישור להזמנה שלך</h3>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 p-2 bg-white rounded border border-blue-200 text-sm">
                {`${process.env.NEXT_PUBLIC_APP_URL}/wedding/${wedding.uniqueUrl}`}
              </code>
              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${process.env.NEXT_PUBLIC_APP_URL}/wedding/${wedding.uniqueUrl}`
                  );
                  alert('הקישור הועתק ללוח!');
                }}
              >
                העתק
              </Button>
            </div>
          </div>
        </Card>
      )}

      <WeddingForm
        wedding={wedding}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/dashboard')}
      />
    </div>
  );
}
