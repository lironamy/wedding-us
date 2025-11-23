'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';

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

const MESSAGE_TYPE_LABELS: Record<string, { title: string; icon: string }> = {
  invitation: { title: 'הזמנה ראשונית', icon: '💌' },
  rsvp_reminder: { title: 'תזכורת ראשונה', icon: '📬' },
  rsvp_reminder_2: { title: 'תזכורת שנייה', icon: '📨' },
  day_before: { title: 'תזכורת יום לפני', icon: '📅' },
  thank_you: { title: 'הודעת תודה', icon: '🙏' },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'ממתין', color: 'bg-yellow-100 text-yellow-800' },
  sending: { label: 'בשליחה...', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'הושלם', color: 'bg-green-100 text-green-800' },
  failed: { label: 'נכשל', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'בוטל', color: 'bg-gray-100 text-gray-800' },
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
      message: 'פעולה זו תבטל את כל התזמונים הממתינים ותיצור חדשים לפי תאריך האירוע. להמשיך?',
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

    if (days < 0) return 'עבר';
    if (days === 0) return 'היום';
    if (days === 1) return 'מחר';
    return `בעוד ${days} ימים`;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">טוען תזמונים...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {ConfirmDialogComponent}

      {/* Header */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">הודעות מתוזמנות</h2>
            <p className="text-gray-600 text-sm">
              ההודעות נשלחות אוטומטית בתאריכים שנקבעו
            </p>
          </div>
          <Button
            onClick={handleRegenerate}
            disabled={regenerating}
            variant="outline"
          >
            {regenerating ? 'יוצר...' : 'צור תזמונים מחדש'}
          </Button>
        </div>

        <Alert variant="info">
          <div className="text-sm">
            <strong>איך זה עובד:</strong> ברגע שמגדירים תאריך לאירוע, המערכת יוצרת
            אוטומטית תזמונים לכל ההודעות. ההודעות נשלחות ב-9:00 בבוקר בכל תאריך.
          </div>
        </Alert>
      </Card>

      {/* Schedule Timeline */}
      {scheduledMessages.length === 0 ? (
        <Card className="p-6">
          <Alert variant="warning">
            <div>
              <strong>אין תזמונים</strong>
              <p className="text-sm mt-1">
                לחץ על "צור תזמונים מחדש" כדי ליצור תזמונים לפי תאריך האירוע
              </p>
            </div>
          </Alert>
        </Card>
      ) : (
        <div className="space-y-4">
          {scheduledMessages.map((schedule, index) => {
            const typeInfo = MESSAGE_TYPE_LABELS[schedule.messageType] || {
              title: schedule.messageType,
              icon: '📧',
            };
            const statusInfo = STATUS_LABELS[schedule.status] || {
              label: schedule.status,
              color: 'bg-gray-100',
            };
            const isPending = schedule.status === 'pending';
            const isCompleted = schedule.status === 'completed';
            const isFailed = schedule.status === 'failed';

            return (
              <Card
                key={schedule._id}
                className={`p-4 border-r-4 ${
                  isCompleted
                    ? 'border-r-green-500'
                    : isFailed
                    ? 'border-r-red-500'
                    : isPending
                    ? 'border-r-yellow-500'
                    : 'border-r-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="text-3xl">{typeInfo.icon}</div>

                    {/* Content */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{typeInfo.title}</h3>
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          <strong>תאריך:</strong> {formatDate(schedule.scheduledFor)}
                        </div>
                        <div className="text-gold font-medium">
                          {getDaysUntil(schedule.scheduledFor)}
                        </div>
                      </div>

                      {/* Stats for completed/failed */}
                      {(isCompleted || isFailed) && (
                        <div className="mt-2 flex gap-4 text-sm">
                          <span className="text-green-600">
                            ✅ נשלח: {schedule.sentCount}
                          </span>
                          <span className="text-red-600">
                            ❌ נכשל: {schedule.failedCount}
                          </span>
                          <span className="text-gray-600">
                            📋 סה"כ: {schedule.totalGuests}
                          </span>
                        </div>
                      )}

                      {/* Error message */}
                      {schedule.errorMessage && (
                        <div className="mt-2 text-sm text-red-600">
                          שגיאה: {schedule.errorMessage}
                        </div>
                      )}

                      {/* Notification status */}
                      {schedule.coupleNotified && (
                        <div className="mt-1 text-xs text-green-600">
                          ✓ הודעה נשלחה אליכם
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {isPending && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(schedule._id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      בטל
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Schedule Legend */}
      <Card className="p-4 bg-gray-50">
        <h3 className="font-semibold mb-3">לוח זמנים אוטומטי:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span>💌</span>
            <span>הזמנה ראשונית - 8 שבועות לפני</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📬</span>
            <span>תזכורת ראשונה - 3 שבועות לפני</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📨</span>
            <span>תזכורת שנייה - שבוע לפני</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>תזכורת יום לפני - יום לפני</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🙏</span>
            <span>הודעת תודה - יום אחרי</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
