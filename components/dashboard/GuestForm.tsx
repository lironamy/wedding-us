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

// Floating label textarea component (matching Input style)
function FloatingTextarea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== '' && value !== undefined;
  const isFloating = isFocused || hasValue;

  return (
    <div className="w-full">
      <div className="relative">
        <textarea
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows={rows}
          className={`
            w-full px-4 py-3.5 pt-5 pb-2
            border-2 rounded-xl
            bg-white
            text-gray-800 text-base
            transition-all duration-200
            focus:outline-none
            resize-none
            ${isFocused ? 'border-primary' : 'border-gray-300'}
          `}
          style={{ fontSize: '16px' }}
          placeholder=" "
        />
        <label
          className={`
            absolute right-3
            pointer-events-none
            transition-all duration-200 ease-out
            px-1
            ${isFloating
              ? '-top-2.5 text-xs bg-white text-primary font-medium'
              : 'top-4 text-base text-gray-400'
            }
          `}
        >
          {label}
        </label>
      </div>
    </div>
  );
}

export function GuestForm({ weddingId, guest, onSuccess, onCancel }: GuestFormProps) {
  const isEdit = !!guest;

  const [formData, setFormData] = useState<Partial<GuestInput>>({
    name: guest?.name || '',
    phone: guest?.phone || '',
    email: guest?.email || '',
    familyGroup: guest?.familyGroup || '',
    invitedCount: guest?.invitedCount || undefined,
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
        invitedCount: formData.invitedCount ? Number(formData.invitedCount) : undefined,
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
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div
          className="w-16 h-16 mx-auto mb-3 rounded-full bg-linear-to-br from-gold to-gold-dark flex items-center justify-center"
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isEdit ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            )}
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800">
          {isEdit ? 'עריכת אורח' : 'הוספת אורח חדש'}
        </h3>
        <p className="text-gray-500 text-sm mt-1">
          {isEdit ? 'עדכן את פרטי האורח' : 'מלא את הפרטים להוספת אורח לרשימה'}
        </p>
      </div>

      {error && (
        <Alert variant="error">{error}</Alert>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="שם מלא *"
            name="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div>
          <Input
            label="מספר טלפון *"
            name="phone"
            type="tel"
            dir="ltr"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div>
          <Input
            label="אימייל (אופציונלי)"
            name="email"
            type="email"
            dir="ltr"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={loading}
          />
        </div>

        <div>
          <Input
            label="קבוצה (אופציונלי)"
            name="familyGroup"
            type="text"
            value={formData.familyGroup || ''}
            onChange={(e) => setFormData({ ...formData, familyGroup: e.target.value })}
            disabled={loading}
          />
        </div>
      </div>

      <div className="w-full md:w-1/2">
        <Input
          label="מספר מוזמנים (אופציונלי)"
          name="invitedCount"
          type="number"
          min={1}
          max={50}
          value={formData.invitedCount || ''}
          onChange={(e) =>
            setFormData({ ...formData, invitedCount: e.target.value ? parseInt(e.target.value) : undefined })
          }
          disabled={loading}
        />
      </div>

      <div>
        <FloatingTextarea
          label="הערות (אופציונלי)"
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <div className="flex-1">
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base"
            isLoading={loading}
          >
            {isEdit ? 'עדכן אורח' : 'הוסף אורח'}
          </Button>
        </div>
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="h-12 px-6 border-2"
          >
            ביטול
          </Button>
        </div>
      </div>
    </form>
  );
}
