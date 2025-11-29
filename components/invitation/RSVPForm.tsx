'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import { balloons } from 'balloons-js';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';

// Helper components - defined outside to prevent re-creation on each render
const DecorativeCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="space-y-10">
    {children}
  </div>
);

const SectionHeading = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="text-center space-y-2">
    <p className="text-xs tracking-[0.55em] text-gray-400 uppercase">{subtitle}</p>
    <h2 className="text-2xl font-[Suez_One] text-[#4d4a48]">{title}</h2>
    <div className="mx-auto h-px w-16 bg-gray-200" />
  </div>
);

// Celebration function with confetti and balloons
const fireCelebration = () => {
  // Gentle confetti burst - wide spread
  confetti({
    particleCount: 50,
    spread: 120,
    origin: { y: 0.7 },
    colors: ['#FFD700', '#FFA500', '#FF69B4', '#87CEEB', '#98FB98'],
    ticks: 200,
    gravity: 1.2,
    decay: 0.94,
    startVelocity: 25,
  });

  // Second gentle burst - wide spread
  setTimeout(() => {
    confetti({
      particleCount: 30,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#7950a5', '#E8D5B7'],
      ticks: 150,
      gravity: 1,
      decay: 0.92,
      startVelocity: 20,
    });
  }, 300);

  // Add CSS to slow down balloons animation
  const style = document.createElement('style');
  style.textContent = `
    .balloon {
      animation-duration: 8s !important;
    }
  `;
  document.head.appendChild(style);

  // Balloons using balloons-js
  balloons();

  // Clean up style after animation
  setTimeout(() => {
    style.remove();
  }, 10000);
};

interface MealOptions {
  regular: boolean;
  vegetarian: boolean;
  vegan: boolean;
  kids: boolean;
  glutenFree: boolean;
  other: boolean;
}

interface RSVPFormProps {
  guest: {
    _id: string;
    name: string;
    uniqueToken: string;
    invitedCount?: number;
    rsvpStatus: 'pending' | 'confirmed' | 'declined';
    adultsAttending: number;
    childrenAttending: number;
    regularMeals?: number;
    vegetarianMeals?: number;
    veganMeals?: number;
    kidsMeals?: number;
    glutenFreeMeals?: number;
    otherMeals?: number;
    otherMealDescription?: string;
    notes?: string;
  };
  askAboutMeals?: boolean;
  mealOptions?: MealOptions;
  customOtherMealName?: string;
  themeColor?: string;
}

// Meal types with +/- controls (regular is calculated automatically)
const MEAL_OPTIONS = [
  { key: 'vegetarian', label: 'צמחוני', icon: '🥗' },
  { key: 'vegan', label: 'טבעוני', icon: '🌱' },
  { key: 'kids', label: 'מנת ילדים', icon: '🧒' },
  { key: 'glutenFree', label: 'ללא גלוטן', icon: '🌾' },
  { key: 'other', label: 'אחר', icon: '🍽️' },
] as const;

type MealKey = typeof MEAL_OPTIONS[number]['key'] | 'regular';

const DEFAULT_MEAL_OPTIONS: MealOptions = {
  regular: true,
  vegetarian: true,
  vegan: true,
  kids: true,
  glutenFree: true,
  other: true,
};

export function RSVPForm({ guest, askAboutMeals = true, mealOptions = DEFAULT_MEAL_OPTIONS, customOtherMealName, themeColor = '#7950a5' }: RSVPFormProps) {
  // If invitedCount is not set or is 0, there's no limit
  const hasLimit = !!(guest.invitedCount && guest.invitedCount > 0);
  const maxGuests: number = hasLimit ? guest.invitedCount! : 99;

  const [rsvpStatus, setRsvpStatus] = useState<'confirmed' | 'declined'>(
    guest.rsvpStatus === 'pending' ? 'confirmed' : (guest.rsvpStatus as 'confirmed' | 'declined')
  );
  const [adultsAttending, setAdultsAttending] = useState(
    guest.adultsAttending && guest.adultsAttending > 0 ? guest.adultsAttending : 1
  );
  const [childrenAttending, setChildrenAttending] = useState(guest.childrenAttending || 0);

  // Meal counts - initialize from guest data or 0
  const [mealCounts, setMealCounts] = useState<Record<MealKey, number>>({
    regular: guest.regularMeals || 0,
    vegetarian: guest.vegetarianMeals || 0,
    vegan: guest.veganMeals || 0,
    kids: guest.kidsMeals || 0,
    glutenFree: guest.glutenFreeMeals || 0,
    other: guest.otherMeals || 0,
  });

  const [otherMealDescription, setOtherMealDescription] = useState(guest.otherMealDescription || '');
  const [notes, setNotes] = useState(guest.notes || '');

  const totalAttendees = adultsAttending + childrenAttending;
  // Calculate special meals (excluding regular which is auto-calculated)
  const specialMeals = mealCounts.vegetarian + mealCounts.vegan + mealCounts.kids + mealCounts.glutenFree + mealCounts.other;
  // Regular meals = total attendees minus special meals
  const calculatedRegularMeals = Math.max(0, totalAttendees - specialMeals);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset meals when attendees change
  const resetMeals = () => {
    setMealCounts({
      regular: 0,
      vegetarian: 0,
      vegan: 0,
      kids: 0,
      glutenFree: 0,
      other: 0,
    });
  };

  const handleMealChange = (mealKey: MealKey, delta: number) => {
    if (mealKey === 'regular') return; // Regular is auto-calculated

    const currentValue = mealCounts[mealKey];
    const newValue = Math.max(0, currentValue + delta);

    // Check if we can add more special meals (can't exceed total attendees)
    if (delta > 0 && specialMeals >= totalAttendees) {
      return; // Can't add more special meals than attendees
    }

    setMealCounts(prev => ({
      ...prev,
      [mealKey]: newValue,
    }));

    // Clear other description if reducing to 0
    if (mealKey === 'other' && newValue === 0) {
      setOtherMealDescription('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate total attendees
      if (rsvpStatus === 'confirmed') {
        if (adultsAttending < 1) {
          setError('נא לציין לפחות מבוגר אחד מגיע');
          setLoading(false);
          return;
        }
        const total = adultsAttending + childrenAttending;
        if (total === 0) {
          setError('נא לציין לפחות אורח אחד מגיע');
          setLoading(false);
          return;
        }
        if (hasLimit && total > guest.invitedCount!) {
          setError(`מספר האורחים לא יכול לעלות על ${guest.invitedCount}`);
          setLoading(false);
          return;
        }
        // Validate "other" description if has other meals and no custom name is set
        if (askAboutMeals && mealCounts.other > 0 && !customOtherMealName && !otherMealDescription.trim()) {
          setError('נא לציין את סוג המנה המבוקשת בשדה "אחר"');
          setLoading(false);
          return;
        }
      }

      // Calculate meals to send
      // If askAboutMeals is false, count all as regular
      // Otherwise, regular = total - special meals (auto-calculated)
      const mealsToSend = askAboutMeals ? {
        regular: calculatedRegularMeals,
        vegetarian: mealCounts.vegetarian,
        vegan: mealCounts.vegan,
        kids: mealCounts.kids,
        glutenFree: mealCounts.glutenFree,
        other: mealCounts.other,
      } : {
        regular: totalAttendees,
        vegetarian: 0,
        vegan: 0,
        kids: 0,
        glutenFree: 0,
        other: 0,
      };

      const response = await fetch('/api/guests/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uniqueToken: guest.uniqueToken,
          rsvpStatus,
          adultsAttending: rsvpStatus === 'confirmed' ? adultsAttending : 0,
          childrenAttending: rsvpStatus === 'confirmed' ? childrenAttending : 0,
          regularMeals: rsvpStatus === 'confirmed' ? mealsToSend.regular : 0,
          vegetarianMeals: rsvpStatus === 'confirmed' ? mealsToSend.vegetarian : 0,
          veganMeals: rsvpStatus === 'confirmed' ? mealsToSend.vegan : 0,
          kidsMeals: rsvpStatus === 'confirmed' ? mealsToSend.kids : 0,
          glutenFreeMeals: rsvpStatus === 'confirmed' ? mealsToSend.glutenFree : 0,
          otherMeals: rsvpStatus === 'confirmed' ? mealsToSend.other : 0,
          otherMealDescription: rsvpStatus === 'confirmed' && mealsToSend.other > 0 ? otherMealDescription : '',
          notes: rsvpStatus === 'confirmed' ? notes : '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit RSVP');
      }

      setSuccess(true);

      // Fire celebration if confirmed
      if (rsvpStatus === 'confirmed') {
        fireCelebration();
      }
    } catch (err: any) {
      setError(err.message || 'שגיאה בשליחת אישור ההגעה');
    } finally {
      setLoading(false);
    }
  };

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  const handleAdultsUpdate = (nextValue: number) => {
    const sanitized = clamp(nextValue, 1, maxGuests);
    setAdultsAttending(sanitized);
    const remainingForChildren = Math.max(0, maxGuests - sanitized);
    if (childrenAttending > remainingForChildren) {
      setChildrenAttending(remainingForChildren);
    }
    // Reset meals when attendees change
    resetMeals();
  };

  const handleChildrenUpdate = (nextValue: number) => {
    const maxChildren = Math.max(0, maxGuests - adultsAttending);
    const sanitized = clamp(nextValue, 0, maxChildren);
    setChildrenAttending(sanitized);
    // Reset meals when attendees change
    resetMeals();
  };


  const renderNumberField = ({
    value,
    onChange,
    max,
    min = 0,
  }: {
    value: number;
    onChange: (next: number) => void;
    max: number;
    min?: number;
  }) => (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        className="h-10 w-10 rounded-full border border-gray-300 text-lg font-semibold text-gray-600 transition hover:border-gray-400"
        disabled={value <= min}
      >
        −
      </button>
      <Input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="border-0 border-b-2 border-gray-200 bg-transparent px-0 text-center text-2xl font-semibold tracking-wide text-gray-800 focus:border-gray-500 focus:ring-0 rounded-none"
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="h-10 w-10 rounded-full border border-gray-300 text-lg font-semibold text-gray-600 transition hover:border-gray-400"
        disabled={value >= max}
      >
        +
      </button>
    </div>
  );

  if (success) {
    return (
      <DecorativeCard>
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 text-3xl text-gray-600">
            {rsvpStatus === 'confirmed' ? '🤍' : '🕊️'}
          </div>
          <h2 className="mb-3 text-3xl font-semibold tracking-tight text-gray-900">
            {rsvpStatus === 'confirmed' ? 'תודה על אישור ההגעה!' : 'קיבלנו את תשובתך'}
          </h2>
          <p className="text-gray-600">
            {rsvpStatus === 'confirmed'
              ? 'מחכים לראותכם ולחגוג ביחד את היום המיוחד שלנו ❤️'
              : 'נצטער שלא תגיעו, אבל מעריכים שהקדשתם זמן לעדכן אותנו'}
          </p>
          <Button
            onClick={() => setSuccess(false)}
            variant="outline"
            className="mt-8"
          >
            ערוך תשובה
          </Button>
        </div>
      </DecorativeCard>
    );
  }

  return (
    <DecorativeCard>
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-[Suez_One] text-[#4d4a48]">{guest.name}</h1>
        <p className="text-sm text-gray-500">איזה כיף שבדקת את ההזמנה שלנו! נשמח לדעת אם תוכלו להגיע.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
      {/* Already responded */}
      {guest.rsvpStatus !== 'pending' && (
        <Alert variant="info">
          כבר ענית על ההזמנה. אתה יכול לעדכן את התשובה שלך בכל עת.
        </Alert>
      )}

      {error && <Alert variant="error">{error}</Alert>}

        {/* RSVP Status */}
        <div className="space-y-6">
          <SectionHeading title="האם תוכלו להגיע?" subtitle="אישור הגעה" />
          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setRsvpStatus('confirmed')}
              className={`rounded-2xl border px-5 py-6 text-center transition ${
                rsvpStatus === 'confirmed'
                  ? 'border-green-600 text-green-700'
                  : 'border-gray-200 text-gray-600 hover:border-green-400'
              }`}
            >
              <div className="text-3xl mb-1">🤍</div>
              <p className="font-semibold text-lg">כן, אגיע!</p>
              <p className="text-xs text-gray-500">נתראה בחגיגה</p>
            </button>
            <button
              type="button"
              onClick={() => setRsvpStatus('declined')}
              className={`rounded-2xl border px-5 py-6 text-center transition ${
                rsvpStatus === 'declined'
                  ? 'border-red-500 text-red-600'
                  : 'border-gray-200 text-gray-600 hover:border-red-400'
              }`}
            >
              <div className="text-3xl mb-1">🌿</div>
              <p className="font-semibold text-lg">לא אוכל להגיע</p>
              <p className="text-xs text-gray-500">מקווים לראותכם בשמחות אחרות</p>
            </button>
          </div>
        </div>

        {/* Attendance Details (only if confirmed) */}
        {rsvpStatus === 'confirmed' && (
          <div className="space-y-8">
            <SectionHeading title="פרטי ההגעה" subtitle="תכנון מקומות" />
            {hasLimit && (
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 px-5 py-4 text-sm text-gray-600">
                <span>סה״כ מוזמנים: <strong className="text-gray-900">{guest.invitedCount}</strong></span>
                <span>נותרו {Math.max(0, guest.invitedCount! - totalAttendees)} מקומות פנויים</span>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  כמה מבוגרים יגיעו?
                </label>
                <div className="rounded-2xl border border-gray-200 p-4">
                  {renderNumberField({
                    value: adultsAttending,
                    onChange: handleAdultsUpdate,
                    max: maxGuests,
                    min: 1,
                  })}
                  {hasLimit && (
                    <p className="mt-2 text-xs text-gray-500">מקסימום {guest.invitedCount} אורחים בסך הכל</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  כמה ילדים יגיעו?
                </label>
                <div className="rounded-2xl border border-gray-200 p-4">
                  {renderNumberField({
                    value: childrenAttending,
                    onChange: handleChildrenUpdate,
                    max: Math.max(0, maxGuests - adultsAttending),
                  })}
                  {hasLimit && (
                    <p className="mt-2 text-xs text-gray-500">עוד {Math.max(0, guest.invitedCount! - adultsAttending)} מקומות לאחר המבוגרים</p>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              סה"כ מגיעים: <span className="font-semibold text-gray-900">{totalAttendees}</span>
              {hasLimit && <span> מתוך {guest.invitedCount}</span>}
            </div>

            {/* Meal Preferences - Only show if askAboutMeals is true */}
            {askAboutMeals && (
              <div className="space-y-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  האם יש מישהו עם העדפת מנה מיוחדת?
                </label>
                <p className="text-xs text-gray-500 -mt-2 mb-3">
                  מי שלא מסומן יקבל מנה רגילה
                </p>
                <div className="space-y-3">
                  {MEAL_OPTIONS.filter((meal) => mealOptions[meal.key as keyof MealOptions]).map((meal) => {
                    // Use custom name for 'other' if provided
                    const displayLabel = meal.key === 'other' && customOtherMealName
                      ? customOtherMealName
                      : meal.label;
                    return (
                    <div key={meal.key}>
                      <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{meal.icon}</span>
                          <span className="font-medium text-gray-700">{displayLabel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleMealChange(meal.key, -1)}
                            disabled={mealCounts[meal.key] <= 0}
                            className="h-8 w-8 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-semibold text-lg">{mealCounts[meal.key]}</span>
                          <button
                            type="button"
                            onClick={() => handleMealChange(meal.key, 1)}
                            disabled={specialMeals >= totalAttendees}
                            className="h-8 w-8 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      {/* Show text input when "other" has count > 0 and no custom name provided */}
                      {meal.key === 'other' && mealCounts.other > 0 && !customOtherMealName && (
                        <div className="mt-2 mr-8 animate-in slide-in-from-top-2 duration-200">
                          <Input
                            type="text"
                            value={otherMealDescription}
                            onChange={(e) => setOtherMealDescription(e.target.value)}
                            placeholder="פרט את הבקשה (חובה)"
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                            required
                          />
                        </div>
                      )}
                    </div>
                  );
                  })}
                </div>
                {/* Show regular meals count */}
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                  <p className="text-sm text-gray-600">
                    🍖 מנות רגילות: <span className="font-semibold text-gray-900">{calculatedRegularMeals}</span>
                    {specialMeals > 0 && (
                      <span className="text-gray-500"> | מנות מיוחדות: {specialMeals}</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                הערות נוספות (אופציונלי)
              </label>
              <textarea
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="משהו שחשוב שנדע..."
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="space-y-4">
          <div className="h-px w-24 mx-auto bg-gray-200" />
          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-5 text-base font-medium tracking-wide shadow-sm transition hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            variant="outline"
            >
            {loading ? 'שולח...' : 'שלח אישור הגעה'}
          </Button>
          <p className="mt-3 text-center text-xs text-gray-400">
            בלחיצה על הכפתור נשמור את התשובה שלך ותוכלו לעדכן בכל רגע
          </p>
        </div>
      </form>
    </DecorativeCard>
  );
}
