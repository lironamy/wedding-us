'use client';

import { motion } from 'framer-motion';
import { RSVPForm } from '@/components/invitation/RSVPForm';
import { getGenderText, type PartnerType } from '@/lib/utils/genderText';
import type { InvitationTemplateProps } from './types';

export default function ClassicTemplate({ wedding, guest, dateParts, isRSVP }: InvitationTemplateProps) {
  const theme = wedding.theme || {
    primaryColor: '#7950a5',
    secondaryColor: '#2C3E50',
    fontFamily: 'Assistant'
  };

  return (
    <div
      className="min-h-screen bg-[#fffff6]"
      style={{ fontFamily: 'Heebo, Assistant, sans-serif' }}
    >
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Allura&family=Heebo:wght@300;400;500;700&family=Suez+One&display=swap"
        rel="stylesheet"
      />

      {/* Hero Image - Fixed at top */}
      {wedding.mediaUrl && (
        <div className="fixed top-0 left-0 right-0 w-full z-0 flex justify-center">
          <div className="w-full md:w-[520px]">
            {wedding.mediaType === 'video' ? (
              <video
                src={wedding.mediaUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-auto object-contain block"
              />
            ) : (
              <img
                src={wedding.mediaUrl}
                alt={`${wedding.groomName} & ${wedding.brideName}`}
                className="w-full h-auto object-contain block"
              />
            )}
          </div>
        </div>
      )}

      {/* Spacer */}
      {wedding.mediaUrl && (
        <div className="w-full md:w-[520px] md:mx-auto invisible mb-[-90px] md:mb-[-110px]">
          {wedding.mediaType === 'video' ? (
            <video src={wedding.mediaUrl} className="w-full h-auto object-contain block" muted />
          ) : (
            <img src={wedding.mediaUrl} alt="" className="w-full h-auto object-contain block" />
          )}
        </div>
      )}

      {/* Torn Paper Effect - Always shown with default torn paper */}
      {wedding.mediaUrl && (
        <div
          className="relative z-10 h-24 w-full md:w-[522px] md:h-[120px] md:mx-auto pointer-events-none"
          style={{
            backgroundImage: `url("https://64.media.tumblr.com/52f3f4542616d233b4bdef01fc22fe4b/0e2dd220497b2358-8c/s540x810/352ede408d4a46c68011c4ebe7e639a289ac7ba8.pnj")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'top center',
            backgroundSize: 'cover',
            marginTop: '-1px',
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 bg-[#fffff6]" style={{ marginTop: '-1px' }}>
        <div className="relative px-4 max-w-md mx-auto">
          {/* Names */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-4 flex flex-wrap items-center justify-center gap-3 text-center"
          >
            <h1
              className="text-5xl md:text-6xl"
              style={{
                letterSpacing: '0.05em',
                color: '#555050',
                fontFamily: '"Suez One", "Heebo", serif',
                fontWeight: 600,
              }}
            >
              {wedding.groomName}
            </h1>
            <span
              className="text-5xl md:text-6xl pt-4"
              style={{ color: '#c2b57f', fontFamily: '"Allura", cursive' }}
            >
              &
            </span>
            <h1
              className="text-5xl md:text-6xl leading-tight tracking-wide"
              style={{
                letterSpacing: '0.05em',
                color: '#555050',
                fontFamily: '"Suez One", "Heebo", serif',
                fontWeight: 600,
              }}
            >
              {wedding.brideName}
            </h1>
          </motion.div>

          {/* Quote */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center text-sm text-gray-400 px-4"
          >
            {wedding.description || 'מים רבים לא יוכלו לכבות את האהבה ונהרות לא ישטפוה'}
          </motion.p>

          {/* Invitation Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center"
          >
            <p className="text-xl text-gray-700">
              {getGenderText('happy', (wedding.partner1Type || 'groom') as PartnerType, (wedding.partner2Type || 'bride') as PartnerType)} ו{getGenderText('thrilled', (wedding.partner1Type || 'groom') as PartnerType, (wedding.partner2Type || 'bride') as PartnerType)} להזמינכם ליום המאושר בחיינו
            </p>
          </motion.div>

          {/* Event Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="rounded-lg text-center"
          >
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-1">
                בתאריך {dateParts.hebrewDate} {dateParts.hebrewWeekday}
              </p>
            </div>
            <div className="text-sm text-gray-700 space-y-0.5">
              <p>קבלת פנים {wedding.eventTime}</p>
              {wedding.chuppahTime && <p>חופה וקידושין {wedding.chuppahTime}</p>}
            </div>
          </motion.div>

          {/* Date Display Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="rounded px-8 py-4 inline-flex items-center gap-6">
              <span className="text-lg font-medium w-24 text-center text-gray-600 border-b border-t border-zinc-400 p-2">
                {dateParts.weekday}
              </span>
              <div className="text-center">
                <p className="text-base text-gray-500">{dateParts.month}</p>
                <p className="text-5xl font-bold text-gray-800">{dateParts.day}</p>
                <p className="text-base text-gray-500">{dateParts.year}</p>
              </div>
              <span className="text-lg font-medium w-24 text-center text-gray-600 border-b border-t border-zinc-400 p-2">
                {wedding.eventTime}
              </span>
            </div>
          </motion.div>

          {/* Venue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="mb-4 flex flex-col items-center text-center space-y-1"
          >
            <p className="text-base font-medium text-gray-800">
              בגן אירועים "{wedding.venue}"
            </p>
            <p className="text-sm text-gray-600">{wedding.venueAddress}</p>
          </motion.div>

          {/* RSVP Section */}
          {isRSVP && guest ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              className="mb-6"
            >
              <div className="p-6 text-center">
                <RSVPForm
                  guest={guest}
                  themeColor={theme.primaryColor}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              className="text-center mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-800">אנא אשרו הגעתכם</h2>
              <p className="text-base text-gray-500 mb-4">
                קישור לאישור הגעה נשלח אליכם בהודעה אישית
              </p>
            </motion.div>
          )}

          {/* Divider */}
          <div
            className="w-16 h-0.5 mx-auto mb-6"
            style={{ backgroundColor: theme.primaryColor, opacity: 0.5 }}
          />

          {/* Map Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="mb-8"
          >
            <h3 className="text-center text-xl font-medium text-gray-700 mb-4">ניווט לאירוע</h3>
            <div className="flex gap-3 justify-center">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm flex items-center gap-2"
              >
                <span>📍</span>
                <span>Google Maps</span>
              </a>
              <a
                href={`https://waze.com/ul?q=${encodeURIComponent(wedding.venueAddress)}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm flex items-center gap-2"
              >
                <span>🚗</span>
                <span>Waze</span>
              </a>
            </div>
          </motion.div>

          {/* Gift Links */}
          {wedding.enableBitGifts && wedding.bitPhone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.7, duration: 0.6 }}
              className="mb-8"
            >
              <h3 className="text-center text-xl font-medium text-gray-700 mb-2">רוצים לשלוח מתנה?</h3>
              <p className="text-center text-base text-gray-500 mb-4">תודה מראש על המחשבה</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <a
                  href={wedding.bitPhone}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-sm flex items-center gap-2"
                >
                  <span>💳</span>
                  <span>שליחת מתנה ב-Bit</span>
                </a>
              </div>
            </motion.div>
          )}

          {/* Footer */}
          <div className="py-8 border-t border-gray-200">
            <p className="text-gray-400 text-base text-center">נשמח לראותכם בחגיגה שלנו</p>
          </div>
        </div>
      </div>
    </div>
  );
}
