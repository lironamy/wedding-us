'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { MESSAGE_TEMPLATES, type MessageType } from '@/lib/utils/messageTemplates';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';

interface AutomatedMessageSenderProps {
  weddingId: string;
}

interface SendingProgress {
  total: number;
  sent: number;
  failed: number;
  current?: string; // Current guest name
}

export function AutomatedMessageSender({ weddingId }: AutomatedMessageSenderProps) {
  const [selectedType, setSelectedType] = useState<MessageType>('invitation');
  const [guests, setGuests] = useState<any[]>([]);
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'declined'>('all');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState<SendingProgress | null>(null);
  const [results, setResults] = useState<any>(null);
  const [delayBetweenMessages, setDelayBetweenMessages] = useState(1); // seconds between messages (Twilio can handle faster)
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();

  // Load guests
  const loadGuests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/guests?weddingId=${weddingId}`);
      const data = await response.json();
      if (response.ok) {
        setGuests(data.guests || []);
      }
    } catch (error) {
      console.error('Error loading guests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuests();
  }, [weddingId]);

  // Filter guests based on message type and RSVP status
  const getFilteredGuests = () => {
    let filtered = [...guests];

    if (filter !== 'all') {
      filtered = filtered.filter((g) => g.rsvpStatus === filter);
    }

    if (selectedType === 'rsvp_reminder' || selectedType === 'rsvp_reminder_2') {
      filtered = filtered.filter((g) => g.rsvpStatus === 'pending');
    } else if (selectedType === 'day_before') {
      filtered = filtered.filter((g) => g.rsvpStatus === 'confirmed');
    } else if (selectedType === 'thank_you') {
      filtered = filtered.filter((g) => g.rsvpStatus === 'confirmed');
    }

    return filtered;
  };

  const filteredGuests = getFilteredGuests();

  const handleSelectAll = () => {
    if (selectedGuests.length === filteredGuests.length) {
      setSelectedGuests([]);
    } else {
      setSelectedGuests(filteredGuests.map((g) => g._id));
    }
  };

  const handleToggleGuest = (guestId: string) => {
    if (selectedGuests.includes(guestId)) {
      setSelectedGuests(selectedGuests.filter((id) => id !== guestId));
    } else {
      setSelectedGuests([...selectedGuests, guestId]);
    }
  };

  const handleSendBulk = async () => {
    if (selectedGuests.length === 0) {
      toast.error('נא לבחור לפחות אורח אחד');
      return;
    }

    const confirmed = await showConfirm({
      title: 'שליחת הודעות',
      message: `האם לשלוח ${selectedGuests.length} הודעות?\nזמן משוער: ${Math.ceil((selectedGuests.length * delayBetweenMessages) / 60)} דקות\n\nשים לב: אל תסגור את הדפדפן במהלך השליחה!`,
      confirmText: 'שלח',
      variant: 'warning',
    });

    if (!confirmed) return;

    try {
      setSending(true);
      setProgress({ total: selectedGuests.length, sent: 0, failed: 0 });
      setResults(null);

      const response = await fetch('/api/twilio/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId,
          guestIds: selectedGuests,
          messageType: selectedType,
          delayBetweenMessages: delayBetweenMessages * 1000, // Convert to milliseconds
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send messages');
      }

      setResults(data);
      setProgress(null);

      // Show summary
      toast.success(
        `השליחה הושלמה! הצלחה: ${data.summary.successful}, כשלון: ${data.summary.failed}, סה"כ: ${data.summary.total}`
      );

      // Clear selection
      setSelectedGuests([]);
      loadGuests();
    } catch (error: any) {
      toast.error(error.message || 'שגיאה בשליחת הודעות');
      setProgress(null);
    } finally {
      setSending(false);
    }
  };

  const template = MESSAGE_TEMPLATES[selectedType];

  if (loading) {
    return <div className="text-center py-8">טוען...</div>;
  }

  return (
    <div className="space-y-6">
      {ConfirmDialogComponent}

      {/* Sending Progress */}
      {sending && progress && (
        <Card className="p-6 border-2 border-gold">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold">שולח הודעות...</div>
              <div className="text-lg font-semibold text-gold">
                {progress.sent + progress.failed} / {progress.total}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gold h-4 rounded-full transition-all duration-300"
                style={{
                  width: `${((progress.sent + progress.failed) / progress.total) * 100}%`
                }}
              ></div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">נשלח</div>
                <div className="text-2xl font-bold text-green-600">{progress.sent}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">נכשל</div>
                <div className="text-2xl font-bold text-red-600">{progress.failed}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">נותרו</div>
                <div className="text-2xl font-bold text-gray-600">
                  {progress.total - progress.sent - progress.failed}
                </div>
              </div>
            </div>

            <Alert variant="info">
              <div className="text-sm">
                אל תסגור את החלון! השליחה תימשך כ-{Math.ceil((progress.total * delayBetweenMessages) / 60)} דקות
              </div>
            </Alert>
          </div>
        </Card>
      )}

      {/* Results Summary */}
      {results && !sending && (
        <Card className="p-6 border-2 border-green-600">
          <div className="space-y-4">
            <div className="text-xl font-bold text-green-600">השליחה הושלמה!</div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600">הצלחה</div>
                <div className="text-3xl font-bold text-green-600">
                  {results.summary.successful}
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-sm text-gray-600">כשלון</div>
                <div className="text-3xl font-bold text-red-600">
                  {results.summary.failed}
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">סה"כ</div>
                <div className="text-3xl font-bold text-gray-600">
                  {results.summary.total}
                </div>
              </div>
            </div>

            <Button
              onClick={() => setResults(null)}
              variant="outline"
              className="w-full"
            >
              סגור
            </Button>
          </div>
        </Card>
      )}

      {/* Message Type Selection */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">בחר סוג הודעה</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.values(MESSAGE_TEMPLATES).map((template) => (
            <button
              key={template.type}
              onClick={() => {
                setSelectedType(template.type);
                setSelectedGuests([]);
              }}
              className={`p-4 rounded-lg border-2 transition text-right ${
                selectedType === template.type
                  ? 'border-gold bg-gold-light'
                  : 'border-gray-300 hover:border-gold'
              }`}
            >
              <div className="font-semibold mb-1">{template.title}</div>
              <div className="text-sm text-gray-600">{template.description}</div>
            </button>
          ))}
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="font-semibold mb-2">תצוגה מקדימה:</div>
          <pre className="text-sm whitespace-pre-wrap text-gray-700 font-sans">
            {template.template}
          </pre>
        </div>
      </Card>

      {/* Sending Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">הגדרות שליחה</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              השהיה בין הודעות (שניות)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={delayBetweenMessages}
              onChange={(e) => setDelayBetweenMessages(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={sending}
            />
            <p className="text-xs text-gray-600 mt-1">
              מומלץ: 1-3 שניות (Twilio יכול לשלוח מהר יותר)
            </p>
          </div>

          {selectedGuests.length > 0 && (
            <Alert variant="info">
              <div className="text-sm">
                זמן משוער לשליחה: <strong>{Math.ceil((selectedGuests.length * delayBetweenMessages) / 60)} דקות</strong>
              </div>
            </Alert>
          )}
        </div>
      </Card>

      {/* Guest Selection */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">בחר אורחים</h2>
          <select
            className="px-3 py-2 border rounded-lg"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            disabled={sending}
          >
            <option value="all">הכל</option>
            <option value="pending">ממתינים</option>
            <option value="confirmed">אישרו</option>
            <option value="declined">סירבו</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedGuests.length === filteredGuests.length && filteredGuests.length > 0}
              onChange={handleSelectAll}
              className="rounded"
              disabled={sending}
            />
            <span className="font-medium">
              בחר הכל ({filteredGuests.length} אורחים)
            </span>
          </label>
        </div>

        {filteredGuests.length === 0 ? (
          <Alert variant="info">
            אין אורחים מתאימים לסוג הודעה זה
          </Alert>
        ) : (
          <div className="max-h-96 overflow-y-auto border rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-right w-12"></th>
                  <th className="px-4 py-2 text-right">שם</th>
                  <th className="px-4 py-2 text-right">טלפון</th>
                  <th className="px-4 py-2 text-center">סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((guest) => (
                  <tr key={guest._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedGuests.includes(guest._id)}
                        onChange={() => handleToggleGuest(guest._id)}
                        className="rounded"
                        disabled={sending}
                      />
                    </td>
                    <td className="px-4 py-2">{guest.name}</td>
                    <td className="px-4 py-2 dir-ltr text-right">{guest.phone}</td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          guest.rsvpStatus === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : guest.rsvpStatus === 'declined'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {guest.rsvpStatus === 'confirmed'
                          ? 'אישר'
                          : guest.rsvpStatus === 'declined'
                          ? 'סירב'
                          : 'ממתין'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4">
          <Button
            onClick={handleSendBulk}
            disabled={selectedGuests.length === 0 || sending}
            size="lg"
            className="w-full"
          >
            {sending
              ? 'שולח הודעות...'
              : `שלח הודעות (${selectedGuests.length} אורחים)`}
          </Button>
        </div>
      </Card>
    </div>
  );
}
