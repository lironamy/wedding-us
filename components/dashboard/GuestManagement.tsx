'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { GuestForm } from './GuestForm';
import { generateWhatsAppUrl } from '@/lib/utils/whatsapp';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { BlurText, CountUp, AnimatedCard, LottieAnimation } from '@/components/ui/animated';

interface Guest {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  familyGroup?: string;
  invitedCount?: number;
  uniqueToken: string;
  rsvpStatus: 'pending' | 'confirmed' | 'declined';
  adultsAttending?: number;
  childrenAttending?: number;
  // Meal counts
  regularMeals?: number;
  vegetarianMeals?: number;
  veganMeals?: number;
  otherMeals?: number;
  otherMealDescription?: string;
  // Legacy
  mealType?: 'regular' | 'vegetarian' | 'vegan' | 'other';
  specialMealRequests?: string;
  notes?: string;
  tableAssignment?: string;
  tableNumber?: number;
}

const MEAL_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  regular: { label: 'רגיל', icon: '🍽️', color: 'bg-gray-100 text-gray-700' },
  vegetarian: { label: 'צמחוני', icon: '🥗', color: 'bg-green-100 text-green-700' },
  vegan: { label: 'טבעוני', icon: '🌱', color: 'bg-emerald-100 text-emerald-700' },
  other: { label: 'אחר', icon: '✏️', color: 'bg-amber-100 text-amber-700' },
};

interface GuestManagementProps {
  weddingId: string;
}

// Animated SVG icons for stats
const StatIcons: Record<string, React.ReactNode> = {
  guests: (
    <svg className="w-12 h-12 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  confirmed: (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <motion.path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
      />
    </svg>
  ),
  declined: (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <motion.path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        initial={{ scale: 0.8, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
      />
    </svg>
  ),
  pending: (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <motion.path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "center" }}
      />
    </svg>
  ),
  adults: (
    <svg className="w-12 h-12 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  children: (
    <motion.svg
      className="w-12 h-12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 1, repeat: Infinity }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25a3 3 0 100-6 3 3 0 000 6zM12 14.25a6 6 0 016 6H6a6 6 0 016-6z" />
      <circle cx="12" cy="5.25" r="1.5" fill="currentColor" opacity="0.3" />
    </motion.svg>
  ),
};

// Stat card component with gradient backgrounds and animated icons
function StatCard({
  title,
  value,
  iconType,
  gradient,
  delay,
}: {
  title: string;
  value: number;
  iconType: keyof typeof StatIcons;
  gradient: string;
  delay: number;
}) {
  return (
    <AnimatedCard delay={delay} className={`relative overflow-hidden ${gradient}`}>
      <div className="p-5 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <div className="text-3xl font-bold text-white mt-1">
              <CountUp to={value} duration={1.5} />
            </div>
          </div>
          <div className="text-white/90">
            {StatIcons[iconType]}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
      <div className="absolute -top-4 -left-4 w-16 h-16 bg-white/5 rounded-full blur-lg" />
    </AnimatedCard>
  );
}

// Meal stats popup component
function MealStatsPopup({
  mealType,
  guests,
  onClose,
}: {
  mealType: 'regular' | 'vegetarian' | 'vegan' | 'other';
  guests: Guest[];
  onClose: () => void;
}) {
  const config = MEAL_TYPE_LABELS[mealType];

  // Filter guests who have this meal type
  const guestsWithMeal = guests.filter((g) => {
    if (g.rsvpStatus !== 'confirmed') return false;
    switch (mealType) {
      case 'regular':
        return (g.regularMeals || 0) > 0;
      case 'vegetarian':
        return (g.vegetarianMeals || 0) > 0;
      case 'vegan':
        return (g.veganMeals || 0) > 0;
      case 'other':
        return (g.otherMeals || 0) > 0;
      default:
        return false;
    }
  });

  const getMealCount = (guest: Guest) => {
    switch (mealType) {
      case 'regular':
        return guest.regularMeals || 0;
      case 'vegetarian':
        return guest.vegetarianMeals || 0;
      case 'vegan':
        return guest.veganMeals || 0;
      case 'other':
        return guest.otherMeals || 0;
      default:
        return 0;
    }
  };

  const gradients: Record<string, string> = {
    regular: 'from-gray-400 to-gray-600',
    vegetarian: 'from-green-400 to-green-600',
    vegan: 'from-emerald-400 to-teal-600',
    other: 'from-amber-400 to-orange-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${gradients[mealType]} p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-3xl">
                {config.icon}
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">מנות {config.label}</h3>
                <p className="text-white/80 text-sm">{guestsWithMeal.length} אורחים</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {guestsWithMeal.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl block mb-3">🍽️</span>
              <p>אין אורחים שבחרו במנה זו</p>
            </div>
          ) : (
            <div className="space-y-2">
              {guestsWithMeal.map((guest, index) => (
                <motion.div
                  key={guest._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-xl p-3 border ${config.color} border-current/20`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center font-bold">
                        {guest.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{guest.name}</p>
                        {guest.familyGroup && (
                          <p className="text-xs opacity-70">{guest.familyGroup}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold">{getMealCount(guest)}</span>
                      <p className="text-xs opacity-70">מנות</p>
                    </div>
                  </div>
                  {/* Show description for "other" meal type */}
                  {mealType === 'other' && guest.otherMealDescription && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 pt-2 border-t border-current/20"
                    >
                      <p className="text-sm">
                        <span className="font-medium">פירוט: </span>
                        {guest.otherMealDescription}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 transition-all"
          >
            סגור
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Notes popup component
function NotesPopup({
  guest,
  onClose,
}: {
  guest: Guest;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-amber-400 to-orange-500 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold">
                {guest.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">{guest.name}</h3>
                <p className="text-white/80 text-sm">הערות ובקשות</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {guest.notes && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-purple-100/60  rounded-xl p-4 border border-amber-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="font-semibold text-amber-800">הערות</span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{guest.notes}</p>
            </motion.div>
          )}

          {guest.specialMealRequests && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-purple-50 rounded-xl p-4 border border-purple-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="font-semibold text-purple-800">בקשות מיוחדות לאוכל</span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{guest.specialMealRequests}</p>
            </motion.div>
          )}

          {!guest.notes && !guest.specialMealRequests && (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <p>אין הערות או בקשות מיוחדות</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-3 bg-linear-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 transition-all"
          >
            סגור
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Guest row component with animations - matching AutomatedMessageSender style
function GuestRow({
  guest,
  index,
  onEdit,
  onDelete,
  onCopyLink,
  onSendWhatsApp,
  onShowNotes,
}: {
  guest: Guest;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onCopyLink: () => void;
  onSendWhatsApp: () => void;
  onShowNotes: () => void;
}) {
  const statusConfig = {
    confirmed: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      dot: 'bg-green-500',
      label: 'אישר',
    },
    declined: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      dot: 'bg-red-500',
      label: 'סירב',
    },
    pending: {
      bg: 'bg-purple-100/60 ',
      text: 'text-amber-700',
      dot: 'bg-purple-100/60 0',
      label: 'ממתין',
    },
  };

  const status = statusConfig[guest.rsvpStatus];

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.015 }}
      className="border-t hover:bg-gray-50 transition"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-gold/80 to-gold flex items-center justify-center text-balance font-semibold text-sm shadow-sm">
            {guest.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-900">{guest.name}</p>
            {guest.familyGroup && (
              <p className="text-xs text-gray-500">{guest.familyGroup}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 dir-ltr text-right font-mono text-sm text-gray-600">
        {guest.phone}
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
          {guest.invitedCount || '∞'}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        {guest.rsvpStatus === 'confirmed' ? (
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-semibold text-emerald-600">
              {(guest.adultsAttending || 0) + (guest.childrenAttending || 0)}
            </span>
            <span className="text-xs text-gray-500">
              {guest.adultsAttending || 0} + {guest.childrenAttending || 0}
            </span>
            {((guest.vegetarianMeals || 0) > 0 || (guest.veganMeals || 0) > 0 || (guest.otherMeals || 0) > 0) && (
              <div className="flex flex-wrap gap-1 justify-center mt-1">
                {(guest.vegetarianMeals || 0) > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                    🥗 {guest.vegetarianMeals}
                  </span>
                )}
                {(guest.veganMeals || 0) > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    🌱 {guest.veganMeals}
                  </span>
                )}
                {(guest.otherMeals || 0) > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700" title={guest.otherMealDescription}>
                    ✏️ {guest.otherMeals}
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1 justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onEdit}
            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            title="ערוך"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCopyLink}
            className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
            title="העתק קישור RSVP"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onSendWhatsApp}
            className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
            title="שלח WhatsApp"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </motion.button>
          {(guest.notes || guest.specialMealRequests) && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onShowNotes}
              className="p-2 rounded-lg bg-purple-100/60  text-amber-600 hover:bg-amber-100 transition-colors relative"
              title="הערות ובקשות"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-100/60 0 rounded-full" />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDelete}
            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            title="מחק"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </motion.button>
        </div>
      </td>
    </motion.tr>
  );
}

export function GuestManagement({ weddingId }: GuestManagementProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [notesGuest, setNotesGuest] = useState<Guest | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<'regular' | 'vegetarian' | 'vegan' | 'other' | null>(null);
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [familyFilter, setFamilyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const GUESTS_PER_PAGE = 25;

  // Load guests
  const loadGuests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/guests?weddingId=${weddingId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load guests');
      }

      setGuests(data.guests || []);
      setFilteredGuests(data.guests || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuests();
  }, [weddingId]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...guests];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (guest) =>
          guest.name.toLowerCase().includes(term) ||
          guest.phone.includes(searchTerm) ||
          (guest.email && guest.email.toLowerCase().includes(term)) ||
          (guest.familyGroup && guest.familyGroup.toLowerCase().includes(term)) ||
          (guest.notes && guest.notes.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((guest) => guest.rsvpStatus === statusFilter);
    }

    // Family filter
    if (familyFilter !== 'all') {
      filtered = filtered.filter((guest) => guest.familyGroup === familyFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'he');
          break;
        case 'status':
          const statusOrder = { confirmed: 1, pending: 2, declined: 3 };
          comparison = statusOrder[a.rsvpStatus] - statusOrder[b.rsvpStatus];
          break;
        case 'invitedCount':
          comparison = (a.invitedCount || 0) - (b.invitedCount || 0);
          break;
        case 'attending':
          const aTotal = (a.adultsAttending || 0) + (a.childrenAttending || 0);
          const bTotal = (b.adultsAttending || 0) + (b.childrenAttending || 0);
          comparison = aTotal - bTotal;
          break;
        case 'family':
          comparison = (a.familyGroup || '').localeCompare(b.familyGroup || '', 'he');
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredGuests(filtered);
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [searchTerm, statusFilter, familyFilter, sortBy, sortOrder, guests]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredGuests.length / GUESTS_PER_PAGE);
  const startIndex = (currentPage - 1) * GUESTS_PER_PAGE;
  const endIndex = startIndex + GUESTS_PER_PAGE;
  const paginatedGuests = filteredGuests.slice(startIndex, endIndex);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setFamilyFilter('all');
    setSortBy('name');
    setSortOrder('asc');
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || familyFilter !== 'all';

  // Get unique family groups
  const familyGroups = Array.from(
    new Set(guests.filter((g) => g.familyGroup).map((g) => g.familyGroup))
  ).sort();

  // Statistics
  // Calculate meal counts from new meal count fields
  const confirmedGuests = guests.filter((g) => g.rsvpStatus === 'confirmed');

  const mealStats = {
    regular: confirmedGuests.reduce((sum, g) => {
      // Use new fields if available, otherwise calculate from legacy mealType
      if (g.regularMeals !== undefined) {
        return sum + (g.regularMeals || 0);
      }
      // Legacy: if mealType is regular or not set, count all attendees as regular
      if (!g.mealType || g.mealType === 'regular') {
        return sum + (g.adultsAttending || 0) + (g.childrenAttending || 0);
      }
      return sum;
    }, 0),
    vegetarian: confirmedGuests.reduce((sum, g) => {
      if (g.vegetarianMeals !== undefined) {
        return sum + (g.vegetarianMeals || 0);
      }
      if (g.mealType === 'vegetarian') {
        return sum + (g.adultsAttending || 0) + (g.childrenAttending || 0);
      }
      return sum;
    }, 0),
    vegan: confirmedGuests.reduce((sum, g) => {
      if (g.veganMeals !== undefined) {
        return sum + (g.veganMeals || 0);
      }
      if (g.mealType === 'vegan') {
        return sum + (g.adultsAttending || 0) + (g.childrenAttending || 0);
      }
      return sum;
    }, 0),
    other: confirmedGuests.reduce((sum, g) => {
      if (g.otherMeals !== undefined) {
        return sum + (g.otherMeals || 0);
      }
      if (g.mealType === 'other') {
        return sum + (g.adultsAttending || 0) + (g.childrenAttending || 0);
      }
      return sum;
    }, 0),
  };

  const stats = {
    total: guests.length,
    confirmed: confirmedGuests.length,
    declined: guests.filter((g) => g.rsvpStatus === 'declined').length,
    pending: guests.filter((g) => g.rsvpStatus === 'pending').length,
    totalAdults: guests.reduce((sum, g) => sum + (g.adultsAttending || 0), 0),
    totalChildren: guests.reduce((sum, g) => sum + (g.childrenAttending || 0), 0),
  };

  const handleDelete = async (guestId: string) => {
    const confirmed = await showConfirm({
      title: 'מחיקת אורח',
      message: 'האם אתה בטוח שברצונך למחוק אורח זה?',
      confirmText: 'מחק',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/guests/${guestId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete guest');
      }

      loadGuests();
      toast.success('האורח נמחק בהצלחה');
    } catch (err: any) {
      toast.error('שגיאה במחיקת האורח');
    }
  };

  const copyRsvpLink = (token: string) => {
    const link = `${window.location.origin}/rsvp/${token}`;
    navigator.clipboard.writeText(link);
    toast.success('הקישור הועתק ללוח');
  };

  const sendWhatsApp = (guest: Guest) => {
    const rsvpLink = `${window.location.origin}/rsvp/${guest.uniqueToken}`;
    const message = `היי ${guest.name},\n\nאנחנו מתחתנים! \nמוזמן/ת לחתונה שלנו.\n\nלצפייה בהזמנה ואישור הגעה:\n${rsvpLink}`;

    const whatsappUrl = generateWhatsAppUrl(guest.phone, message);
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-8">
      {ConfirmDialogComponent}

      {/* Notes Popup */}
      <AnimatePresence>
        {notesGuest && (
          <NotesPopup guest={notesGuest} onClose={() => setNotesGuest(null)} />
        )}
      </AnimatePresence>

      {/* Meal Stats Popup */}
      <AnimatePresence>
        {selectedMealType && (
          <MealStatsPopup
            mealType={selectedMealType}
            guests={guests}
            onClose={() => setSelectedMealType(null)}
          />
        )}
      </AnimatePresence>

   

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="סה״כ אורחים"
          value={stats.total}
          iconType="guests"
          gradient="bg-linear-to-br from-yellow-300 to-yellow-500"
          delay={0}
        />
        <StatCard
          title="אישרו הגעה"
          value={stats.confirmed}
          iconType="confirmed"
          gradient="bg-linear-to-br from-emerald-500 to-green-600"
          delay={0.1}
        />
        <StatCard
          title="סירבו"
          value={stats.declined}
          iconType="declined"
          gradient="bg-linear-to-br from-rose-500 to-red-600"
          delay={0.2}
        />
        <StatCard
          title="ממתינים"
          value={stats.pending}
          iconType="pending"
          gradient="bg-linear-to-br from-amber-400 to-orange-500"
          delay={0.3}
        />
        <StatCard
          title="מבוגרים"
          value={stats.totalAdults}
          iconType="adults"
          gradient="bg-linear-to-br from-blue-500 to-indigo-600"
          delay={0.4}
        />
        <StatCard
          title="ילדים"
          value={stats.totalChildren}
          iconType="children"
          gradient="bg-linear-to-br from-pink-400 to-purple-500"
          delay={0.5}
        />
      </div>

      {/* Meal Stats */}
      {(stats.totalAdults + stats.totalChildren > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <AnimatedCard delay={0.6} hover={false} className="p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍽️</span>
                <h3 className="font-semibold text-gray-700">סיכום מנות</h3>
                <span className="text-sm text-gray-500">({stats.totalAdults + stats.totalChildren} מנות סה״כ)</span>
              </div>
              <motion.a
                href="/api/guests/export/meals"
                download
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-shadow"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                ייצוא מנות
              </motion.a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(mealStats).map(([type, count]) => {
                const config = MEAL_TYPE_LABELS[type];
                return (
                  <motion.div
                    key={type}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMealType(type as 'regular' | 'vegetarian' | 'vegan' | 'other')}
                    className={`rounded-xl p-3 text-center ${config.color} cursor-pointer transition-shadow hover:shadow-lg`}
                  >
                    <span className="text-2xl">{config.icon}</span>
                    <p className="font-bold text-xl mt-1">{count}</p>
                    <p className="text-sm opacity-80">{config.label}</p>
                    <p className="text-xs opacity-60 mt-1">לחץ לצפייה</p>
                  </motion.div>
                );
              })}
            </div>
          </AnimatedCard>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-3"
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-linear-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-white shadow-lg shadow-gold/30"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              הוסף אורח
            </span>
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button variant="outline" asChild className="border-2 hover:bg-gray-50">
            <a href="/dashboard/guests/import" className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              ייבוא מאקסל
            </a>
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button variant="outline" asChild className="border-2 hover:bg-gray-50">
            <a href="/api/guests/template" download className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              הורד תבנית
            </a>
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button variant="outline" asChild className="border-2 hover:bg-gray-50">
            <a href="/api/guests/export" download className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              ייצוא לאקסל
            </a>
          </Button>
        </motion.div>
      </motion.div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingGuest) && (
        <AnimatedCard hover={false} className="p-6 border-2 border-gold/20">
          <GuestForm
            weddingId={weddingId}
            guest={editingGuest}
            onSuccess={() => {
              setShowAddForm(false);
              setEditingGuest(null);
              loadGuests();
            }}
            onCancel={() => {
              setShowAddForm(false);
              setEditingGuest(null);
            }}
          />
        </AnimatedCard>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <AnimatedCard delay={0.4} hover={false} className="p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">חיפוש</label>
              <div className="relative">
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Input
                  type="text"
                  placeholder="שם, טלפון, אימייל..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 focus:ring-2 focus:ring-gold/50 focus:border-gold"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">סטטוס</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">הכל</option>
                <option value="pending">ממתין</option>
                <option value="confirmed">אישר</option>
                <option value="declined">סירב</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">קבוצה</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                value={familyFilter}
                onChange={(e) => setFamilyFilter(e.target.value)}
              >
                <option value="all">הכל</option>
                {familyGroups.map((family) => (
                  <option key={family} value={family}>
                    {family}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">מיון לפי</label>
              <div className="flex gap-2">
                <select
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">שם</option>
                  <option value="status">סטטוס</option>
                  <option value="invitedCount">מוזמנים</option>
                  <option value="attending">מגיעים</option>
                  <option value="family">קבוצה</option>
                </select>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  title={sortOrder === 'asc' ? 'סדר עולה' : 'סדר יורד'}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </motion.button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              מציג <span className="font-semibold text-gray-700">{filteredGuests.length}</span> מתוך{' '}
              <span className="font-semibold text-gray-700">{guests.length}</span> אורחים
            </span>
            {hasActiveFilters && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  נקה פילטרים
                </Button>
              </motion.div>
            )}
          </div>
        </AnimatedCard>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Alert variant="error">{error}</Alert>
        </motion.div>
      )}

      {/* Guest List */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center  "
        >
          <LottieAnimation animation="loading" size={120} />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 mt-4"
          >
            טוען את רשימת האורחים...
          </motion.p>
        </motion.div>
      ) : filteredGuests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatedCard hover={false} className="p-12 text-center border-2 border-dashed border-gray-200">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center"
            >
              <span className="text-4xl">👥</span>
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {guests.length === 0 ? 'עדיין לא הוספת אורחים' : 'לא נמצאו תוצאות'}
            </h3>
            <p className="text-gray-500">
              {guests.length === 0
                ? 'התחל על ידי הוספת אורח או ייבוא מאקסל'
                : 'נסה לשנות את הפילטרים או חפש משהו אחר'}
            </p>
            {guests.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6"
              >
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-linear-to-r from-gold to-gold-dark text-white"
                >
                  הוסף את האורח הראשון
                </Button>
              </motion.div>
            )}
          </AnimatedCard>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">אורח</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">טלפון</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">מוזמנים</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">סטטוס</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">מגיעים</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {paginatedGuests.map((guest, index) => (
                  <GuestRow
                    key={guest._id}
                    guest={guest}
                    index={index}
                    onEdit={() => setEditingGuest(guest)}
                    onDelete={() => handleDelete(guest._id)}
                    onCopyLink={() => copyRsvpLink(guest.uniqueToken)}
                    onSendWhatsApp={() => sendWhatsApp(guest)}
                    onShowNotes={() => setNotesGuest(guest)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                מציג {startIndex + 1}-{Math.min(endIndex, filteredGuests.length)} מתוך {filteredGuests.length} אורחים
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="13 17 18 12 13 7" />
                    <polyline points="6 17 11 12 6 7" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </motion.button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                          currentPage === pageNum
                            ? 'bg-gold text-zinc-800 shadow-md'
                            : 'hover:bg-white text-gray-700 border border-gray-200'
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition"
                >
              
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition"
                >
               

                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="11 17 6 12 11 7" />
                    <polyline points="18 17 13 12 18 7" />
                  </svg>
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
