'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { guestSchema, type GuestInput } from '@/lib/validators/guest';

interface GuestFormProps {
  weddingId: string;
  guest?: any; // For editing
  onSuccess: () => void;
  onCancel: () => void;
}

export function GuestForm({ weddingId, guest, onSuccess, onCancel }: GuestFormProps) {
  const isEdit = !!guest;

  const [formData, setFormData] = useState<GuestInput>({
    name: guest?.name || '',
    phone: guest?.phone || '',
    email: guest?.email || '',
    familyGroup: guest?.familyGroup || '',
    invitedCount: guest?.invitedCount || 1,
    notes: guest?.notes || '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form data
      const validatedData = guestSchema.parse({
        ...formData,
        invitedCount: Number(formData.invitedCount),
      });

      // Submit to API
      const url = isEdit ? `/api/guests/${guest._id}` : '/api/guests';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...validatedData,
          weddingId: isEdit ? undefined : weddingId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save guest');
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error saving guest:', err);
      if (err.errors) {
        // Zod validation errors
        setError(err.errors[0].message);
      } else {
        setError(err.message || 'שגיאה בשמירת פרטי האורח');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">
        {isEdit ? 'עריכת אורח' : 'הוספת אורח חדש'}
      </h3>

      {error && <Alert variant="error">{error}</Alert>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          שם מלא *
        </label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">
          מספר טלפון *
        </label>
        <Input
          id="phone"
          type="tel"
          dir="ltr"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="0501234567"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          אימייל (אופציונלי)
        </label>
        <Input
          id="email"
          type="email"
          dir="ltr"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="example@email.com"
        />
      </div>

      <div>
        <label htmlFor="familyGroup" className="block text-sm font-medium mb-1">
          קבוצה משפחתית (אופציונלי)
        </label>
        <Input
          id="familyGroup"
          type="text"
          value={formData.familyGroup}
          onChange={(e) => setFormData({ ...formData, familyGroup: e.target.value })}
          placeholder="משפחת כהן"
        />
      </div>

      <div>
        <label htmlFor="invitedCount" className="block text-sm font-medium mb-1">
          מספר מוזמנים *
        </label>
        <Input
          id="invitedCount"
          type="number"
          min="1"
          max="50"
          value={formData.invitedCount}
          onChange={(e) =>
            setFormData({ ...formData, invitedCount: parseInt(e.target.value) || 1 })
          }
          required
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-1">
          הערות (אופציונלי)
        </label>
        <textarea
          id="notes"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="הערות נוספות..."
        />
      </div>

      <div className="flex gap-3 mt-6">
        <Button type="submit" disabled={loading}>
          {loading ? 'שומר...' : isEdit ? 'עדכן אורח' : 'הוסף אורח'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          ביטול
        </Button>
      </div>
    </form>
  );
}
