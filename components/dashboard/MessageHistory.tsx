'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { MESSAGE_TEMPLATES } from '@/lib/utils/messageTemplates';

interface MessageHistoryProps {
  weddingId: string;
}

export function MessageHistory({ weddingId }: MessageHistoryProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadMessages();
  }, [weddingId, filter]);

  const loadMessages = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const params = new URLSearchParams({ weddingId });
      if (filter !== 'all') {
        params.append('messageType', filter);
      }

      const response = await fetch(`/api/messages?${params}`);
      const data = await response.json();

      if (response.ok) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const getMessageTypeLabel = (type: string) => {
    const template = MESSAGE_TEMPLATES[type as keyof typeof MESSAGE_TEMPLATES];
    return template?.title || type;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="text-center py-8">טוען...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all'
                ? 'bg-gold text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            הכל ({messages.length})
          </button>
          {Object.keys(MESSAGE_TEMPLATES).map((type) => {
            const count = messages.filter((m) => m.messageType === type).length;
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg ${
                  filter === type
                    ? 'bg-gold text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {getMessageTypeLabel(type)} ({count})
              </button>
            );
          })}
        </div>
      </Card>

      {/* Messages List */}
      {messages.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          {filter === 'all'
            ? 'עדיין לא נשלחו הודעות'
            : `לא נמצאו הודעות מסוג ${getMessageTypeLabel(filter)}`}
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <Card key={message._id} className="p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold">
                      {message.guestId?.name || 'אורח לא ידוע'}
                    </span>
                    <span className="text-sm text-gray-600 dir-ltr">
                      {message.guestId?.phone}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        message.guestId?.rsvpStatus === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : message.guestId?.rsvpStatus === 'declined'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {message.guestId?.rsvpStatus === 'confirmed'
                        ? 'אישר הגעה'
                        : message.guestId?.rsvpStatus === 'declined'
                        ? 'סירב'
                        : 'ממתין'}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">
                      {getMessageTypeLabel(message.messageType)}
                    </span>{' '}
                    • {formatDate(message.sentAt)}
                  </div>

                  <details className="text-sm">
                    <summary className="cursor-pointer text-blue-600 hover:underline">
                      הצג תוכן הודעה
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap font-sans text-gray-700">
                      {message.messageContent}
                    </pre>
                  </details>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded text-sm ${
                      message.status === 'sent'
                        ? 'bg-green-100 text-green-800'
                        : message.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {message.status === 'sent'
                      ? 'נשלח'
                      : message.status === 'failed'
                      ? 'נכשל'
                      : 'ממתין'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
