'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { MESSAGE_TEMPLATES, generatePreviewMessage, type MessageType } from '@/lib/utils/messageTemplates';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LottieAnimation } from '@/components/ui/animated';

interface AutomatedMessageSenderProps {
  weddingId: string;
}

interface SendingProgress {
  total: number;
  sent: number;
  failed: number;
  current?: string;
}

const MESSAGE_TYPE_STYLES: Record<string, {
  gradient: string;
  iconBg: string;
  icon: string;
}> = {
  invitation: {
    gradient: 'from-pink-500 to-rose-600',
    iconBg: 'bg-pink-100',
    icon: '💌',
  },
  rsvp_reminder: {
    gradient: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-100',
    icon: '📬',
  },
  rsvp_reminder_2: {
    gradient: 'from-purple-500 to-violet-600',
    iconBg: 'bg-purple-100',
    icon: '📨',
  },
  day_before: {
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-100',
    icon: '📅',
  },
  thank_you: {
    gradient: 'from-green-500 to-emerald-600',
    iconBg: 'bg-green-100',
    icon: '🙏',
  },
};

interface WeddingData {
  groomName: string;
  brideName: string;
  partner1Type: 'groom' | 'bride';
  partner2Type: 'groom' | 'bride';
  eventDate: string;
  eventTime: string;
  venue: string;
  mediaUrl?: string;
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
  const [delayBetweenMessages, setDelayBetweenMessages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const GUESTS_PER_PAGE = 25;
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();

  // Load wedding data
  const loadWeddingData = async () => {
    try {
      const response = await fetch(`/api/weddings/${weddingId}`);
      const data = await response.json();

      if (response.ok && data) {
        const w = data;
        const eventDate = w.eventDate ? new Date(w.eventDate).toLocaleDateString('he-IL', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }) : '';

        setWeddingData({
          groomName: w.groomName || '',
          brideName: w.brideName || '',
          partner1Type: w.partner1Type || 'groom',
          partner2Type: w.partner2Type || 'bride',
          eventDate,
          eventTime: w.eventTime || '',
          venue: w.venue || '',
          mediaUrl: w.mediaUrl,
        });
      }
    } catch (error) {
      console.error('Error loading wedding data:', error);
    }
  };

  // Load guests
  const loadGuests = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await fetch(`/api/guests?weddingId=${weddingId}`);
      const data = await response.json();
      if (response.ok) {
        setGuests(data.guests || []);
      }
    } catch (error) {
      console.error('Error loading guests:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadWeddingData();
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredGuests.length / GUESTS_PER_PAGE);
  const startIndex = (currentPage - 1) * GUESTS_PER_PAGE;
  const endIndex = startIndex + GUESTS_PER_PAGE;
  const paginatedGuests = filteredGuests.slice(startIndex, endIndex);

  // Reset page when filter or message type changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, selectedType]);

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
          delayBetweenMessages: delayBetweenMessages * 1000,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send messages');
      }

      setResults(data);
      setProgress(null);

      toast.success(
        `השליחה הושלמה! הצלחה: ${data.summary.successful}, כשלון: ${data.summary.failed}, סה"כ: ${data.summary.total}`
      );

      setSelectedGuests([]);
      loadGuests(false);
    } catch (error: any) {
      toast.error(error.message || 'שגיאה בשליחת הודעות');
      setProgress(null);
    } finally {
      setSending(false);
    }
  };

  const template = MESSAGE_TEMPLATES[selectedType];

  // Generate preview message with real wedding data
  const getPreviewMessageText = () => {
    if (!weddingData) {
      return template.template;
    }

    return generatePreviewMessage(selectedType, {
      guestName: 'אורח',
      groomName: weddingData.groomName || 'שם חתן',
      brideName: weddingData.brideName || 'שם כלה',
      eventDate: weddingData.eventDate || 'תאריך לא נקבע',
      eventTime: weddingData.eventTime || 'שעה לא נקבעה',
      venue: weddingData.venue || 'מיקום לא נקבע',
      rsvpLink: 'lunsoul.com/rsvp/...',
      tableNumber: 5,
      appUrl: 'lunsoul.com',
      partner1Type: weddingData.partner1Type,
      partner2Type: weddingData.partner2Type,
    });
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl shadow-lg p-12 flex flex-col items-center justify-center"
      >
        <LottieAnimation animation="loading" size={80} />
        <p className="text-gray-500 mt-4">טוען אורחים...</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {ConfirmDialogComponent}

      {/* Sending Progress */}
      <AnimatePresence>
        {sending && progress && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600" />
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                      <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
                    </svg>
                  </motion.div>
                  <span className="text-xl font-bold text-gray-900">שולח הודעות...</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {progress.sent + progress.failed} / {progress.total}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((progress.sent + progress.failed) / progress.total) * 100}%`
                  }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center p-4 bg-green-50 rounded-xl"
                >
                  <div className="text-sm text-gray-600 mb-1">נשלח</div>
                  <div className="text-3xl font-bold text-green-600">{progress.sent}</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center p-4 bg-red-50 rounded-xl"
                >
                  <div className="text-sm text-gray-600 mb-1">נכשל</div>
                  <div className="text-3xl font-bold text-red-600">{progress.failed}</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center p-4 bg-gray-50 rounded-xl"
                >
                  <div className="text-sm text-gray-600 mb-1">נותרו</div>
                  <div className="text-3xl font-bold text-gray-600">
                    {progress.total - progress.sent - progress.failed}
                  </div>
                </motion.div>
              </div>

              {/* Warning */}
              <div className="p-3 bg-purple-100/60  border border-amber-200 rounded-xl flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </motion.div>
                <p className="text-sm text-amber-800">
                  אל תסגור את החלון! השליחה תימשך כ-{Math.ceil((progress.total * delayBetweenMessages) / 60)} דקות
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      <AnimatePresence>
        {results && !sending && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600" />
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </motion.div>
                <span className="text-xl font-bold text-green-600">השליחה הושלמה!</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center p-4 bg-green-50 rounded-xl"
                >
                  <div className="text-sm text-gray-600 mb-1">הצלחה</div>
                  <div className="text-3xl font-bold text-green-600">
                    {results.summary.successful}
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center p-4 bg-red-50 rounded-xl"
                >
                  <div className="text-sm text-gray-600 mb-1">כשלון</div>
                  <div className="text-3xl font-bold text-red-600">
                    {results.summary.failed}
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center p-4 bg-gray-50 rounded-xl"
                >
                  <div className="text-sm text-gray-600 mb-1">סה״כ</div>
                  <div className="text-3xl font-bold text-gray-600">
                    {results.summary.total}
                  </div>
                </motion.div>
              </div>

              <Button
                onClick={() => setResults(null)}
                variant="outline"
                className="w-full"
              >
                סגור
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Type Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            בחר סוג הודעה
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.values(MESSAGE_TEMPLATES).map((tpl, index) => {
              const style = MESSAGE_TYPE_STYLES[tpl.type] || MESSAGE_TYPE_STYLES.invitation;
              const isSelected = selectedType === tpl.type;

              return (
                <motion.button
                  key={tpl.type}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedType(tpl.type);
                    setSelectedGuests([]);
                  }}
                  className={`relative p-4 rounded-xl border-2 transition-all text-right overflow-hidden ${
                    isSelected
                      ? 'border-gold bg-gold/5 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {/* Selected indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId="selectedType"
                      className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${style.gradient}`}
                    />
                  )}

                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${style.iconBg} flex items-center justify-center text-xl`}>
                      {style.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 mb-1">{tpl.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{tpl.description}</div>
                    </div>
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 left-3 w-5 h-5 rounded-full bg-gold flex items-center justify-center"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Preview - iPhone with WhatsApp */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex justify-center"
          >
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-4 text-gray-700">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span className="font-semibold text-sm">תצוגה מקדימה:</span>
              </div>

              {/* iPhone Frame - Premium Design */}
              <div
                className="relative bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800 rounded-[3rem] p-2 shadow-2xl"
                style={{
                  width: '280px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255,255,255,0.1)'
                }}
              >
                {/* Phone inner bezel */}
                <div className="bg-black rounded-[2.5rem] overflow-hidden relative">
                  {/* Dynamic Island / Notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-black rounded-full px-6 py-1.5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-800" />
                    <div className="w-12 h-3 rounded-full bg-gray-800" />
                  </div>

                  {/* Screen content */}
                  <div
                    className="bg-white overflow-hidden"
                    style={{ height: '540px' }}
                  >
                    {/* WhatsApp Screen */}
                    <div className="w-full h-full flex flex-col">
                      {/* WhatsApp Header */}
                      <div className="bg-[#075E54] pt-[45px] pb-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm">
                            <img
                              src="https://64.media.tumblr.com/a6474254d4eb619661f1c72ae79b0b01/e7caecb063553d4b-7f/s1280x1920/806c8f4985b556c98be429a77c693339f1aef082.pnj"
                              alt="לונסול"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-semibold text-sm">Lunsoul</div>
                            <div className="text-green-200 text-xs">מקוון</div>
                          </div>
                          <div className="flex items-center gap-4">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" opacity="0.9">
                              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                            </svg>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" opacity="0.9">
                              <path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Chat Background */}
                      <div
                        className="flex-1 p-3 overflow-y-auto"
                        style={{
                          backgroundColor: '#ECE5DD',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c5beb5' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                      >
                        {/* Message Bubble */}
                        <motion.div
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: 0.5, type: 'spring' }}
                          className="relative bg-white rounded-xl rounded-tr-none shadow-md max-w-[95%] mr-auto overflow-hidden"
                        >
                          {/* Message tail */}
                          <div className="absolute -top-0 -right-2 w-0 h-0 border-l-[10px] border-l-white border-t-[10px] border-t-transparent z-10" />

                          {/* Wedding Image - only show if template has image */}
                          {template.hasImage && weddingData?.mediaUrl && (
                            <div className="w-full">
                              <img
                                src={weddingData.mediaUrl}
                                alt="הזמנה לחתונה"
                                className="w-full max-h-[130px] object-cover"
                              />
                            </div>
                          )}

                          {/* Message Text */}
                          <div className="p-3">
                            <p className="text-[11px] whitespace-pre-wrap text-gray-800 font-sans leading-relaxed text-right" dir="rtl">
                              שלום יוסי כהן 👋
                            </p>
                            <p className="text-[11px] whitespace-pre-wrap text-gray-800 font-sans leading-relaxed text-right mt-1" dir="rtl">
                              {getPreviewMessageText()}
                            </p>

                            {/* Time and status */}
                            <div className="flex items-center justify-end gap-1 mt-2">
                              <span className="text-[10px] text-gray-500">09:00</span>
                              <svg width="16" height="10" viewBox="0 0 16 10" fill="#53bdeb">
                                <path d="M15.01 1.41L5.41 11l-4.12-4.12 1.41-1.41L5.41 8.17l8.18-8.17 1.42 1.41z" transform="translate(-1, -1)" />
                                <path d="M12.01 1.41L5.41 8l-.71-.71L11.3.7l.71.71z" transform="translate(2, -1)" />
                              </svg>
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* WhatsApp Input Bar */}
                      <div className="bg-[#F0F0F0] px-2 py-2 flex items-center gap-2">
                        <div className="flex-1 bg-white rounded-full px-3 py-2 flex items-center gap-2 shadow-sm">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="#9CA3AF">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5 5.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                          </svg>
                          <span className="text-gray-400 text-sm flex-1">הקלד הודעה</span>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#9CA3AF">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5z"/>
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#00A884] flex items-center justify-center shadow-md">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                          </svg>
                        </div>
                      </div>

                      {/* Home indicator */}
                      <div className="">
                        <div className="w-[100px] h-[4px] bg-white/60 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Home indicator bar */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-gray-600 rounded-full" />
                </div>

                {/* Side buttons - volume */}
                <div className="absolute -left-0.5 top-24 w-0.5 h-6 bg-gray-700 rounded-l-full" />
                <div className="absolute -left-0.5 top-32 w-0.5 h-10 bg-gray-700 rounded-l-full" />
                <div className="absolute -left-0.5 top-44 w-0.5 h-10 bg-gray-700 rounded-l-full" />
                {/* Side button - power */}
                <div className="absolute -right-0.5 top-32 w-0.5 h-14 bg-gray-700 rounded-r-full" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Guest Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              בחר אורחים
            </h3>
            <select
              className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              disabled={sending}
            >
              <option value="all">כל האורחים</option>
              <option value="pending">ממתינים לאישור</option>
              <option value="confirmed">אישרו הגעה</option>
              <option value="declined">סירבו</option>
            </select>
          </div>

          {/* Select All */}
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedGuests.length === filteredGuests.length && filteredGuests.length > 0}
                onChange={handleSelectAll}
                className="w-5 h-5 rounded border-gray-300 text-gold focus:ring-gold"
                disabled={sending}
              />
              <span className="font-medium text-gray-900">
                בחר הכל ({filteredGuests.length} אורחים)
              </span>
              {selectedGuests.length > 0 && (
                <span className="px-2 py-1 bg-gold/10 text-gold text-sm rounded-full font-medium">
                  {selectedGuests.length} נבחרו
                </span>
              )}
            </label>
          </div>

          {/* Guest List */}
          {filteredGuests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-3xl">🔍</span>
              </div>
              <p className="text-gray-500">אין אורחים מתאימים לסוג הודעה זה</p>
            </motion.div>
          ) : (
            <>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-right w-12"></th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">שם</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">טלפון נייד</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">סטטוס</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedGuests.map((guest, index) => (
                      <motion.tr
                        key={guest._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.015 }}
                        className={`border-t hover:bg-gray-50 transition ${
                          selectedGuests.includes(guest._id) ? 'bg-gold/5' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedGuests.includes(guest._id)}
                            onChange={() => handleToggleGuest(guest._id)}
                            className="w-5 h-5 rounded border-gray-300 text-gold focus:ring-gold"
                            disabled={sending}
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{guest.name}</td>
                        <td className="px-4 py-3 text-gray-600 dir-ltr text-right font-mono text-sm">
                          {guest.phone}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              guest.rsvpStatus === 'confirmed'
                                ? 'bg-green-50 text-green-700'
                                : guest.rsvpStatus === 'declined'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-purple-100/60  text-amber-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                guest.rsvpStatus === 'confirmed'
                                  ? 'bg-green-500'
                                  : guest.rsvpStatus === 'declined'
                                  ? 'bg-red-500'
                                  : 'bg-purple-100/60 0'
                              }`}
                            />
                            {guest.rsvpStatus === 'confirmed'
                              ? 'אישר'
                              : guest.rsvpStatus === 'declined'
                              ? 'סירב'
                              : 'ממתין'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    מציג {startIndex + 1}-{Math.min(endIndex, filteredGuests.length)} מתוך {filteredGuests.length} אורחים
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
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
                      className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
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
                                : 'hover:bg-gray-100 text-zinc-500'
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
                      className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
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
                      className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="11 17 6 12 11 7" />
                        <polyline points="18 17 13 12 18 7" />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Send Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            <Button
              onClick={handleSendBulk}
              disabled={selectedGuests.length === 0 || sending}
              size="lg"
              className="w-full flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
              {sending
                ? 'שולח הודעות...'
                : `שלח הודעות (${selectedGuests.length} אורחים)`}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
