'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LottieAnimation } from '@/components/ui/animated';
import { ModernDatePicker, ModernTimePicker } from '@/components/ui/DateTimePicker';

interface ScheduledMessage {
  _id: string;
  messageType: string;
  scheduledFor: string;
  status: 'pending' | 'sending' | 'completed' | 'failed' | 'cancelled';
  totalGuests: number;
  sentCount: number;
  failedCount: number;
  deliveredCount?: number;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  coupleNotified: boolean;
  customTitle?: string;
  targetFilter?: { rsvpStatus: string };
}

interface MessageLogEntry {
  _id: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  twilioSid: string;
  deliveryStatus: 'queued' | 'sent' | 'delivered' | 'read' | 'failed' | 'undelivered';
  errorCode?: string;
  errorMessage?: string;
  sentAt: string;
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
  custom: {
    title: 'הודעה מותאמת אישית',
    icon: '✨',
    gradient: 'from-cyan-500 to-teal-600',
    iconBg: 'bg-cyan-100',
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

  // Manual scheduling state
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState('09:00');
  const [manualTarget, setManualTarget] = useState<'all' | 'pending' | 'confirmed'>('all');
  const [manualMessageType, setManualMessageType] = useState<'invitation' | 'rsvp_reminder' | 'rsvp_reminder_2' | 'day_before' | 'thank_you'>('invitation');
  const [creatingManual, setCreatingManual] = useState(false);

  // Message details popup state
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduledMessage | null>(null);
  const [messageLogs, setMessageLogs] = useState<MessageLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [retryingGuests, setRetryingGuests] = useState<Set<string>>(new Set());
  const [refreshingStatuses, setRefreshingStatuses] = useState(false);

  const loadScheduledMessages = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
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
      if (showLoading) setLoading(false);
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
      confirmText: 'מחק',
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

  const handleOpenDetails = async (schedule: ScheduledMessage, skipRefresh = false) => {
    setSelectedSchedule(schedule);
    setShowDetailsPopup(true);
    setLoadingLogs(true);

    try {
      // First load the logs immediately so user sees something
      const response = await fetch(`/api/message-logs?scheduledMessageId=${schedule._id}&weddingId=${weddingId}`);
      const data = await response.json();

      if (response.ok) {
        setMessageLogs(data.logs || []);
      } else {
        console.error('Error loading message logs:', data.error);
        setMessageLogs([]);
      }
    } catch (error) {
      console.error('Error loading message logs:', error);
      setMessageLogs([]);
    } finally {
      setLoadingLogs(false);
    }

    // Then refresh statuses from Twilio in the background (unless skipped)
    if (!skipRefresh && (schedule.status === 'completed' || schedule.status === 'sending')) {
      try {
        setRefreshingStatuses(true);
        const refreshResponse = await fetch(`/api/message-logs/refresh?scheduledMessageId=${schedule._id}&weddingId=${weddingId}`, {
          method: 'POST',
        });

        if (refreshResponse.ok) {
          // Reload logs with updated statuses
          const logsResponse = await fetch(`/api/message-logs?scheduledMessageId=${schedule._id}&weddingId=${weddingId}`);
          const logsData = await logsResponse.json();
          if (logsResponse.ok) {
            setMessageLogs(logsData.logs || []);
          }
          // Refresh the main list in background without showing loading
          loadScheduledMessages(false);
        }
      } catch (refreshError) {
        console.error('Error refreshing statuses:', refreshError);
      } finally {
        setRefreshingStatuses(false);
      }
    }
  };

  const handleRetryGuest = async (guestId: string, messageType: string) => {
    setRetryingGuests(prev => new Set(prev).add(guestId));

    try {
      const response = await fetch('/api/twilio/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId,
          guestIds: [guestId],
          messageType,
        }),
      });

      const data = await response.json();

      if (response.ok && data.summary?.successful > 0) {
        toast.success('ההודעה נשלחה בהצלחה');
        // Update the log entry locally
        setMessageLogs(prev => prev.map(log =>
          log.guestId === guestId
            ? { ...log, deliveryStatus: 'sent' as const }
            : log
        ));
      } else {
        toast.error(data.error || 'שגיאה בשליחת ההודעה');
      }
    } catch (error) {
      toast.error('שגיאה בשליחת ההודעה');
    } finally {
      setRetryingGuests(prev => {
        const newSet = new Set(prev);
        newSet.delete(guestId);
        return newSet;
      });
    }
  };

  const handleRefreshStatuses = async () => {
    if (!selectedSchedule) return;

    try {
      setRefreshingStatuses(true);
      const response = await fetch(`/api/message-logs/refresh?scheduledMessageId=${selectedSchedule._id}&weddingId=${weddingId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`עודכנו ${data.updated || 0} סטטוסים`);
        // Refresh the logs (skip auto-refresh since we just refreshed)
        handleOpenDetails(selectedSchedule, true);
        // Also refresh the scheduled messages list to update counts (without loading)
        loadScheduledMessages(false);
      } else {
        toast.error(data.error || 'שגיאה בעדכון סטטוסים');
      }
    } catch (error) {
      toast.error('שגיאה בעדכון סטטוסים');
    } finally {
      setRefreshingStatuses(false);
    }
  };

  const handleRetryAllFailed = async () => {
    if (!selectedSchedule) return;

    const failedLogs = messageLogs.filter(log =>
      log.deliveryStatus === 'failed' || log.deliveryStatus === 'undelivered'
    );

    if (failedLogs.length === 0) {
      toast.error('אין הודעות כושלות לשליחה חוזרת');
      return;
    }

    const confirmed = await showConfirm({
      title: 'שליחה חוזרת',
      message: `האם לשלוח שוב את ההודעה ל-${failedLogs.length} אורחים שנכשלו?`,
      confirmText: 'שלח שוב',
      variant: 'warning',
    });

    if (!confirmed) return;

    const guestIds = failedLogs.map(log => log.guestId);

    try {
      const response = await fetch('/api/twilio/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId,
          guestIds,
          messageType: selectedSchedule.messageType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`נשלחו ${data.summary?.successful || 0} הודעות בהצלחה`);
        // Refresh the logs
        handleOpenDetails(selectedSchedule);
      } else {
        toast.error(data.error || 'שגיאה בשליחת ההודעות');
      }
    } catch (error) {
      toast.error('שגיאה בשליחת ההודעות');
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'read':
        return { label: 'נמסר', color: 'text-green-600', bg: 'bg-green-50', icon: '✓' };
      case 'sent':
        return { label: 'נשלח', color: 'text-blue-600', bg: 'bg-blue-50', icon: '→' };
      case 'queued':
        return { label: 'בתור', color: 'text-amber-600', bg: 'bg-amber-50', icon: '○' };
      case 'failed':
      case 'undelivered':
        return { label: 'נכשל', color: 'text-red-600', bg: 'bg-red-50', icon: '✕' };
      default:
        return { label: status, color: 'text-gray-600', bg: 'bg-gray-50', icon: '?' };
    }
  };

  const handleCreateManualSchedule = async () => {
    if (!manualDate) {
      toast.error('יש לבחור תאריך');
      return;
    }

    try {
      setCreatingManual(true);

      const response = await fetch('/api/scheduled-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId,
          manual: true,
          // Send date and time separately so server can interpret as Israel time
          scheduledDate: manualDate,
          scheduledTime: manualTime,
          targetFilter: { rsvpStatus: manualTarget },
          messageType: manualMessageType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('התזמון נוצר בהצלחה');
        setShowManualForm(false);
        setManualDate('');
        setManualTime('09:00');
        setManualTarget('all');
        setManualMessageType('invitation');
        loadScheduledMessages();
      } else {
        toast.error(data.error || 'שגיאה ביצירת התזמון');
      }
    } catch (error) {
      toast.error('שגיאה ביצירת התזמון');
    } finally {
      setCreatingManual(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      timeZone: 'Asia/Jerusalem',
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

    // Compare dates only (ignore time) - use Israel timezone
    const dateOnly = new Date(date.toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' }));
    const nowOnly = new Date(now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' }));

    const diff = dateOnly.getTime() - nowOnly.getTime();
    const days = Math.round(diff / (1000 * 60 * 60 * 24));

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
                אוטומטית תזמונים לכל ההודעות. ההודעות נשלחות ב-9:00 בבוקר (שעון ישראל).
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Manual Scheduling Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">תזמון ידני</h3>
                <p className="text-sm text-gray-500">תזמנו הודעה בתאריך ושעה לבחירתכם</p>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => setShowManualForm(!showManualForm)}
                variant={showManualForm ? 'outline' : 'primary'}
                className="flex items-center gap-2"
              >
                {showManualForm ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                    סגור
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    הוסף תזמון
                  </>
                )}
              </Button>
            </motion.div>
          </div>

          <AnimatePresence>
            {showManualForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Message Type */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        סוג ההודעה
                      </label>
                      <select
                        value={manualMessageType}
                        onChange={(e) => setManualMessageType(e.target.value as typeof manualMessageType)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-white"
                      >
                        <option value="invitation">💌 הזמנה ראשונית</option>
                        <option value="rsvp_reminder">📬 תזכורת ראשונה</option>
                        <option value="rsvp_reminder_2">📨 תזכורת שנייה</option>
                        <option value="day_before">📅 תזכורת יום לפני</option>
                        <option value="thank_you">🙏 הודעת תודה</option>
                      </select>
                    </div>

                    {/* Target */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        קהל יעד
                      </label>
                      <select
                        value={manualTarget}
                        onChange={(e) => setManualTarget(e.target.value as 'all' | 'pending' | 'confirmed')}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-white"
                      >
                        <option value="all">כל האורחים</option>
                        <option value="pending">ממתינים לאישור</option>
                        <option value="confirmed">אישרו הגעה</option>
                      </select>
                    </div>

                    {/* Date */}
                    <div>
                      <ModernDatePicker
                        label="תאריך"
                        value={manualDate}
                        onChange={(date) => {
                          setManualDate(date);
                          // If selecting today, check if current time has passed and update time if needed
                          const today = new Date().toISOString().split('T')[0];
                          if (date === today) {
                            const now = new Date();
                            const currentHour = now.getHours();
                            const [selectedHour] = manualTime.split(':').map(Number);
                            if (selectedHour <= currentHour) {
                              // Set to next available hour
                              const nextHour = currentHour + 1;
                              if (nextHour < 24) {
                                setManualTime(`${nextHour.toString().padStart(2, '0')}:00`);
                              }
                            }
                          }
                        }}
                        type="date"
                        minDate={new Date()}
                      />
                    </div>

                    {/* Time */}
                    <div>
                      <ModernTimePicker
                        label="שעה"
                        value={manualTime}
                        onChange={setManualTime}
                        type="time"
                        timeIntervals={60}
                        minTime={
                          manualDate === new Date().toISOString().split('T')[0]
                            ? new Date(new Date().setHours(new Date().getHours() + 1, 0, 0, 0))
                            : new Date(new Date().setHours(0, 0, 0, 0))
                        }
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-end pt-1">
                      <Button
                        onClick={handleCreateManualSchedule}
                        disabled={creatingManual || !manualDate}
                        className="w-full"
                      >
                        {creatingManual ? (
                          <motion.span
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                          >
                            יוצר...
                          </motion.span>
                        ) : (
                          'צור תזמון'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                            <h3 className="font-bold text-gray-900">
                              {schedule.messageType === 'custom' && schedule.customTitle
                                ? schedule.customTitle
                                : typeConfig.title}
                            </h3>
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

                            {/* Show target for custom messages */}
                            {schedule.messageType === 'custom' && schedule.targetFilter && (
                              <div className="text-xs text-gray-500">
                                קהל יעד: {
                                  schedule.targetFilter.rsvpStatus === 'all' ? 'כל האורחים' :
                                  schedule.targetFilter.rsvpStatus === 'pending' ? 'ממתינים לאישור' :
                                  schedule.targetFilter.rsvpStatus === 'confirmed' ? 'אישרו הגעה' :
                                  schedule.targetFilter.rsvpStatus
                                }
                              </div>
                            )}
                          </div>

                          {/* Stats for completed/failed - clickable */}
                          {(isCompleted || isFailed) && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              onClick={() => handleOpenDetails(schedule)}
                              className="mt-3 flex flex-wrap gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                              title="לחץ לצפייה בפרטים"
                            >
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <span className="text-sm font-medium text-green-700">נשלח: {schedule.sentCount}</span>
                              </div>
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
                                  <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                                <span className="text-sm font-medium text-red-700">נכשל: {schedule.failedCount}</span>
                              </div>
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                </svg>
                                <span className="text-sm font-medium text-gray-600">סה״כ: {schedule.totalGuests}</span>
                              </div>
                              <div className="flex items-center text-xs text-primary">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="M12 16v-4M12 8h.01" />
                                </svg>
                                <span className="mr-1">לחץ לפרטים</span>
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

      {/* Message Details Popup */}
      <AnimatePresence>
        {showDetailsPopup && selectedSchedule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailsPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${MESSAGE_TYPE_CONFIG[selectedSchedule.messageType]?.iconBg || 'bg-gray-100'} flex items-center justify-center text-2xl`}>
                      {MESSAGE_TYPE_CONFIG[selectedSchedule.messageType]?.icon || '📧'}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {MESSAGE_TYPE_CONFIG[selectedSchedule.messageType]?.title || selectedSchedule.messageType}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {formatDate(selectedSchedule.scheduledFor)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailsPopup(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Summary stats */}
                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm font-medium text-green-700">נשלח: {selectedSchedule.sentCount}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
                    <span className="text-red-600">✕</span>
                    <span className="text-sm font-medium text-red-700">נכשל: {selectedSchedule.failedCount}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">👥</span>
                    <span className="text-sm font-medium text-gray-700">סה״כ: {selectedSchedule.totalGuests}</span>
                  </div>

                  {/* Refresh statuses button */}
                  <Button
                    onClick={handleRefreshStatuses}
                    disabled={refreshingStatuses}
                    size="sm"
                    variant="outline"
                    className="mr-auto"
                  >
                    <motion.svg
                      animate={refreshingStatuses ? { rotate: 360 } : {}}
                      transition={{ repeat: refreshingStatuses ? Infinity : 0, duration: 1, ease: 'linear' }}
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="ml-1"
                    >
                      <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                    </motion.svg>
                    {refreshingStatuses ? 'מעדכן...' : 'רענן סטטוסים'}
                  </Button>

                  {/* Retry all failed button */}
                  {messageLogs.some(log => log.deliveryStatus === 'failed' || log.deliveryStatus === 'undelivered') && (
                    <Button
                      onClick={handleRetryAllFailed}
                      size="sm"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1">
                        <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                      </svg>
                      שלח שוב לכל הנכשלים
                    </Button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 relative min-h-[200px]">
                {/* Loading overlay for initial load */}
                {loadingLogs && (
                  <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center">
                    <LottieAnimation animation="loading" size={50} />
                    <p className="text-gray-500 mt-2 text-sm">טוען פרטים...</p>
                  </div>
                )}

                {/* Refreshing overlay - semi-transparent, shown on top of existing content */}
                {refreshingStatuses && !loadingLogs && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
                    <LottieAnimation animation="loading" size={40} />
                    <p className="text-gray-500 mt-2 text-sm">מרענן סטטוסים...</p>
                  </div>
                )}

                {messageLogs.length === 0 && !loadingLogs ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-3xl">📭</span>
                    </div>
                    <p className="text-gray-500">אין פרטי הודעות זמינים</p>
                    <p className="text-sm text-gray-400 mt-1">הפרטים יהיו זמינים רק להודעות שנשלחו אחרי העדכון האחרון</p>
                  </div>
                ) : messageLogs.length > 0 ? (
                  <div className="space-y-2">
                    {messageLogs.map((log) => {
                      const statusDisplay = getStatusDisplay(log.deliveryStatus);
                      const isFailed = log.deliveryStatus === 'failed' || log.deliveryStatus === 'undelivered';
                      const isRetrying = retryingGuests.has(log.guestId);

                      return (
                        <motion.div
                          key={log._id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex items-center justify-between p-3 rounded-xl border ${isFailed ? 'border-red-200 bg-red-50/50' : 'border-gray-100 bg-gray-50/50'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg ${statusDisplay.bg} flex items-center justify-center text-sm font-bold ${statusDisplay.color}`}>
                              {statusDisplay.icon}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{log.guestName}</p>
                              <p className="text-xs text-gray-500" dir="ltr">{log.guestPhone}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.bg} ${statusDisplay.color}`}>
                              {statusDisplay.label}
                            </span>

                            {isFailed && (
                              <Button
                                onClick={() => handleRetryGuest(log.guestId, selectedSchedule.messageType)}
                                disabled={isRetrying}
                                size="sm"
                                variant="outline"
                                className="text-xs"
                              >
                                {isRetrying ? (
                                  <motion.span
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                    className="inline-block"
                                  >
                                    ⟳
                                  </motion.span>
                                ) : (
                                  'שלח שוב'
                                )}
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
