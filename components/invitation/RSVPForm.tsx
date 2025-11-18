'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';

interface RSVPFormProps {
  guest: {
    _id: string;
    name: string;
    uniqueToken: string;
    invitedCount: number;
    rsvpStatus: 'pending' | 'confirmed' | 'declined';
    adultsAttending: number;
    childrenAttending: number;
    specialMealRequests?: string;
    notes?: string;
  };
  themeColor?: string;
}

export function RSVPForm({ guest, themeColor = '#C4A57B' }: RSVPFormProps) {
  const [rsvpStatus, setRsvpStatus] = useState<'confirmed' | 'declined'>(
    guest.rsvpStatus === 'pending' ? 'confirmed' : (guest.rsvpStatus as 'confirmed' | 'declined')
  );
  const [adultsAttending, setAdultsAttending] = useState(guest.adultsAttending || 0);
  const [childrenAttending, setChildrenAttending] = useState(guest.childrenAttending || 0);
  const [specialMealRequests, setSpecialMealRequests] = useState(guest.specialMealRequests || '');
  const [notes, setNotes] = useState(guest.notes || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate total attendees
      if (rsvpStatus === 'confirmed') {
        const total = adultsAttending + childrenAttending;
        if (total === 0) {
          setError('נא לציין לפחות אורח אחד מגיע');
          setLoading(false);
          return;
        }
        if (total > guest.invitedCount) {
          setError(`מספר האורחים לא יכול לעלות על ${guest.invitedCount}`);
          setLoading(false);
          return;
        }
      }

      const response = await fetch('/api/guests/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uniqueToken: guest.uniqueToken,
          rsvpStatus,
          adultsAttending: rsvpStatus === 'confirmed' ? adultsAttending : 0,
          childrenAttending: rsvpStatus === 'confirmed' ? childrenAttending : 0,
          specialMealRequests: rsvpStatus === 'confirmed' ? specialMealRequests : '',
          notes: rsvpStatus === 'confirmed' ? notes : '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit RSVP');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'שגיאה בשליחת אישור ההגעה');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">
          {rsvpStatus === 'confirmed' ? '🎉' : '😢'}
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {rsvpStatus === 'confirmed' ? 'תודה על אישור ההגעה!' : 'קיבלנו את תשובתך'}
        </h2>
        <p className="text-gray-600">
          {rsvpStatus === 'confirmed'
            ? 'מחכים לראותכם באירוע! ❤️'
            : 'מקווים לראותכם באירועים הבאים'}
        </p>
        <Button
          onClick={() => setSuccess(false)}
          variant="outline"
          className="mt-6"
        >
          ערוך תשובה
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Already responded */}
      {guest.rsvpStatus !== 'pending' && (
        <Alert variant="info">
          כבר ענית על ההזמנה. אתה יכול לעדכן את התשובה שלך בכל עת.
        </Alert>
      )}

      {error && <Alert variant="error">{error}</Alert>}

      {/* RSVP Status */}
      <div>
        <label className="block text-lg font-semibold mb-3">
          האם תוכל/י להגיע?
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setRsvpStatus('confirmed')}
            className={`p-4 rounded-lg border-2 transition ${
              rsvpStatus === 'confirmed'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-green-300'
            }`}
          >
            <div className="text-3xl mb-2">✅</div>
            <div className="font-semibold">כן, אגיע!</div>
          </button>
          <button
            type="button"
            onClick={() => setRsvpStatus('declined')}
            className={`p-4 rounded-lg border-2 transition ${
              rsvpStatus === 'declined'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 hover:border-red-300'
            }`}
          >
            <div className="text-3xl mb-2">❌</div>
            <div className="font-semibold">לא אוכל להגיע</div>
          </button>
        </div>
      </div>

      {/* Attendance Details (only if confirmed) */}
      {rsvpStatus === 'confirmed' && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">
              כמה מבוגרים יגיעו? (מקסימום: {guest.invitedCount})
            </label>
            <Input
              type="number"
              min="0"
              max={guest.invitedCount}
              value={adultsAttending}
              onChange={(e) => setAdultsAttending(parseInt(e.target.value) || 0)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              כמה ילדים יגיעו? (מקסימום: {guest.invitedCount - adultsAttending})
            </label>
            <Input
              type="number"
              min="0"
              max={Math.max(0, guest.invitedCount - adultsAttending)}
              value={childrenAttending}
              onChange={(e) => setChildrenAttending(parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="text-sm text-gray-600">
            סה"כ מגיעים: {adultsAttending + childrenAttending} מתוך {guest.invitedCount}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              בקשות מיוחדות לארוחה (אופציונלי)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': themeColor } as any}
              rows={3}
              value={specialMealRequests}
              onChange={(e) => setSpecialMealRequests(e.target.value)}
              placeholder="טבעוני, צמחוני, אלרגיות..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              הערות נוספות (אופציונלי)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': themeColor } as any}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="משהו שחשוב שנדע..."
            />
          </div>
        </>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full"
        style={{ backgroundColor: themeColor }}
      >
        {loading ? 'שולח...' : 'שלח אישור הגעה'}
      </Button>
    </form>
  );
}
