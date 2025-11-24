'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LottieAnimation } from '@/components/ui/animated';

interface ScheduledMessage {
  _id: string;
  messageType: string;
  scheduledFor: string;
  status: 'pending' | 'sending' | 'completed' | 'failed' | 'cancelled';
  totalGuests: number;
  sentCount: number;
  failedCount: number;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  coupleNotified: boolean;
}

const MESSAGE_TYPE_CONFIG: Record<string, {
  title: string;
  icon: string;
  gradient: string;
  iconBg: string;
}> = {
  invitation: {
    title: 'הזמנה ראשונית',
    icon: '💌',
    gradient: 'from-pink-500 to-rose-600',
    iconBg: 'bg-pink-100',
  },
  rsvp_reminder: {
    title: 'תזכורת ראשונה',
    icon: '📬',
    gradient: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-100',
  },
  rsvp_reminder_2: {
    title: 'תזכורת שנייה',
    icon: '📨',
    gradient: 'from-purple-500 to-violet-600',
    iconBg: 'bg-purple-100',
  },
  day_before: {
    title: 'תזכורת יום לפני',
    icon: '📅',
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-100',
  },
  thank_you: {
    title: 'הודעת תודה',
    icon: '🙏',
    gradient: 'from-green-500 to-emerald-600',
    iconBg: 'bg-green-100',
  },
};

const STATUS_CONFIG: Record<string, {
  label: string;
  bgColor: string;
  textColor: string;
  dotColor: string;
}> = {
  pending: {
    label: 'ממתין',
    bgColor: 'bg-purple-100/60 ',
    textColor: 'text-amber-700',
    dotColor: 'bg-purple-100/60 0',
  },
  sending: {
    label: 'בשליחה...',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    dotColor: 'bg-blue-500',
  },
  completed: {
    label: 'הושלם',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    dotColor: 'bg-green-500',
  },
  failed: {
    label: 'נכשל',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    dotColor: 'bg-red-500',
  },
  cancelled: {
    label: 'בוטל',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    dotColor: 'bg-gray-400',
  },
};

interface ScheduledMessagesProps {
  weddingId: string;
}

export function ScheduledMessages({ weddingId }: ScheduledMessagesProps) {
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();

  const loadScheduledMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/scheduled-messages?weddingId=${weddingId}`);
      const data = await response.json();

      if (response.ok) {
        setScheduledMessages(data.scheduledMessages || []);
      } else {
        console.error('Error loading scheduled messages:', data.error);
      }
    } catch (error) {
      console.error('Error loading scheduled messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScheduledMessages();
  }, [weddingId]);

  const handleRegenerate = async () => {
    const confirmed = await showConfirm({
      title: 'יצירת תזמונים מחדש',
      message: 'פעולה זו תמחק את כל התזמונים הממתינים ותיצור חדשים לפי תאריך האירוע. להמשיך?',
      confirmText: 'צור מחדש',
      variant: 'warning',
    });

    if (!confirmed) return;

    try {
      setRegenerating(true);
      const response = await fetch('/api/scheduled-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weddingId, regenerate: true }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`נוצרו ${data.scheduledMessages?.length || 0} תזמונים חדשים`);
        loadScheduledMessages();
      } else {
        toast.error(data.error || 'שגיאה ביצירת תזמונים');
      }
    } catch (error) {
      toast.error('שגיאה ביצירת תזמונים');
    } finally {
      setRegenerating(false);
    }
  };

  const handleCancel = async (scheduleId: string) => {
    const confirmed = await showConfirm({
      title: 'ביטול תזמון',
      message: 'האם לבטל את ההודעה המתוזמנת?',
      confirmText: 'בטל',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/scheduled-messages?id=${scheduleId}&weddingId=${weddingId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        toast.success('התזמון בוטל');
        loadScheduledMessages();
      } else {
        toast.error('שגיאה בביטול התזמון');
      }
    } catch (error) {
      toast.error('שגיאה בביטול התזמון');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return { text: 'עבר', color: 'text-gray-500' };
    if (days === 0) return { text: 'היום', color: 'text-green-600' };
    if (days === 1) return { text: 'מחר', color: 'text-amber-600' };
    if (days <= 7) return { text: `בעוד ${days} ימים`, color: 'text-blue-600' };
    return { text: `בעוד ${days} ימים`, color: 'text-gray-600' };
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl shadow-lg p-12 flex flex-col items-center justify-center"
      >
        <LottieAnimation animation="loading" size={80} />
        <p className="text-gray-500 mt-4">טוען תזמונים...</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {ConfirmDialogComponent}

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">הודעות מתוזמנות</h3>
              <p className="text-gray-500 text-sm mt-1">
                ההודעות נשלחות אוטומטית ב-9:00 בבוקר בכל תאריך
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleRegenerate}
                disabled={regenerating}
                variant="outline"
                className="flex items-center gap-2"
              >
                <motion.svg
                  animate={regenerating ? { rotate: 360 } : {}}
                  transition={{ repeat: regenerating ? Infinity : 0, duration: 1, ease: 'linear' }}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                </motion.svg>
                {regenerating ? 'יוצר...' : 'צור תזמונים מחדש'}
              </Button>
            </motion.div>
          </div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </div>
              <p className="text-sm text-blue-800">
                <strong>איך זה עובד:</strong> ברגע שמגדירים תאריך לאירוע, המערכת יוצרת
                אוטומטית תזמונים לכל ההודעות. ההודעות נשלחות ב-9:00 בבוקר.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Schedule Timeline */}
      <AnimatePresence mode="wait">
        {scheduledMessages.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center"
            >
              <span className="text-4xl">📭</span>
            </motion.div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">אין תזמונים</h3>
            <p className="text-gray-500 mb-4">
              לחץ על &quot;צור תזמונים מחדש&quot; כדי ליצור תזמונים לפי תאריך האירוע
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {scheduledMessages.map((schedule, index) => {
              const typeConfig = MESSAGE_TYPE_CONFIG[schedule.messageType] || {
                title: schedule.messageType,
                icon: '📧',
                gradient: 'from-gray-500 to-gray-600',
                iconBg: 'bg-gray-100',
              };
              const statusConfig = STATUS_CONFIG[schedule.status] || STATUS_CONFIG.pending;
              const isPending = schedule.status === 'pending';
              const isCompleted = schedule.status === 'completed';
              const isFailed = schedule.status === 'failed';
              const daysInfo = getDaysUntil(schedule.scheduledFor);

              return (
                <motion.div
                  key={schedule._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  {/* Gradient top border */}
                  <div className={`h-1 bg-gradient-to-r ${typeConfig.gradient}`} />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', delay: 0.2 + index * 0.1 }}
                          className={`w-14 h-14 rounded-2xl ${typeConfig.iconBg} flex items-center justify-center text-2xl shadow-sm`}
                        >
                          {typeConfig.icon}
                        </motion.div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-900">{typeConfig.title}</h3>
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
                              {statusConfig.label}
                            </span>
                          </div>

                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                              </svg>
                              <span>{formatDate(schedule.scheduledFor)}</span>
                            </div>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 + index * 0.1 }}
                              className={`font-semibold ${daysInfo.color}`}
                            >
                              {daysInfo.text}
                            </motion.div>
                          </div>

                          {/* Stats for completed/failed */}
                          {(isCompleted || isFailed) && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-3 flex flex-wrap gap-3"
                            >
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <span className="text-sm font-medium text-green-700">נשלח: {schedule.sentCount}</span>
                              </div>
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-lg">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
                                  <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                                <span className="text-sm font-medium text-red-700">נכשל: {schedule.failedCount}</span>
                              </div>
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                </svg>
                                <span className="text-sm font-medium text-gray-600">סה״כ: {schedule.totalGuests}</span>
                              </div>
                            </motion.div>
                          )}

                          {/* Error message */}
                          {schedule.errorMessage && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-2 p-2 bg-red-50 rounded-lg text-sm text-red-600"
                            >
                              {schedule.errorMessage}
                            </motion.div>
                          )}

                          {/* Notification status */}
                          {schedule.coupleNotified && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                              הודעה נשלחה אליכם
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      {isPending && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(schedule._id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            בטל
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          לוח זמנים אוטומטי
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { icon: '💌', text: 'הזמנה ראשונית - 4 שבועות לפני', target: 'כולם' },
            { icon: '📬', text: 'תזכורת ראשונה - 3 שבועות לפני', target: 'ממתינים' },
            { icon: '📨', text: 'תזכורת שנייה - שבוע לפני', target: 'ממתינים' },
            { icon: '📅', text: 'תזכורת יום לפני - יום לפני', target: 'מאושרים' },
            { icon: '🙏', text: 'הודעת תודה - יום אחרי', target: 'מאושרים' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
            >
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 truncate">{item.text}</p>
                <p className="text-xs text-gray-500">נשלח ל: {item.target}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
