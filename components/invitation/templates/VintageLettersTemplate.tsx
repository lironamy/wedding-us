'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation, Heart } from 'lucide-react';
import { RSVPForm } from '../RSVPForm';
import type { InvitationTemplateProps } from './types';

// Postage stamp component
const PostageStamp = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute top-6 left-6 w-16 h-20 pointer-events-none"
    style={{
      background: '#F5E6D3',
      border: '2px dashed #8B7355'
    }}
    initial={{ opacity: 0, scale: 1.5, rotate: -10 }}
    animate={{ opacity: 1, scale: 1, rotate: 5 }}
    transition={{ delay, duration: 0.5, type: "spring" }}
  >
    <div className="w-full h-full flex items-center justify-center">
      <Heart className="w-8 h-8" style={{ color: '#C4A77D' }} fill="#C4A77D" />
    </div>
    <div
      className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs"
      style={{ color: '#8B7355', fontFamily: "'EB Garamond', serif" }}
    >
      LOVE
    </div>
  </motion.div>
);

// Lace border component
const LaceBorder = ({ position }: { position: 'top' | 'bottom' }) => (
  <div
    className={`absolute ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 h-8 pointer-events-none`}
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='20' viewBox='0 0 40 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='8' fill='none' stroke='%23C4A77D' stroke-width='0.5' opacity='0.5'/%3E%3Ccircle cx='30' cy='10' r='8' fill='none' stroke='%23C4A77D' stroke-width='0.5' opacity='0.5'/%3E%3Ccircle cx='20' cy='10' r='5' fill='none' stroke='%23C4A77D' stroke-width='0.5' opacity='0.5'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat-x',
      opacity: 0.6
    }}
  />
);

export default function VintageLettersTemplate({ wedding, guest, dateParts, isRSVP = false }: InvitationTemplateProps) {
  const handleNavigation = () => {
    if (wedding.venueCoordinates) {
      const { lat, lng } = wedding.venueCoordinates;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`, '_blank');
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden py-8"
      style={{
        background: '#F5E6D3',
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23F5E6D3'/%3E%3Cg fill-opacity='0.03'%3E%3Cpath d='M0 0h100v100H0z'/%3E%3Cpath d='M20 20h60v60H20z' fill='%238B7355'/%3E%3C/g%3E%3C/svg%3E")
        `
      }}
      dir="rtl"
    >
      {/* Paper texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXWBgYGHh4d5765teleJAAACnklEQVQYV...")',
          opacity: 0.05
        }}
      />

      {/* Main card */}
      <motion.div
        className="relative max-w-lg mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <div
          className="relative mx-4 p-8"
          style={{
            background: 'linear-gradient(135deg, #FFFEF7 0%, #F9F3E8 100%)',
            boxShadow: '0 10px 40px rgba(139, 115, 85, 0.2), inset 0 0 100px rgba(139, 115, 85, 0.05)',
            border: '1px solid #E8DCC8'
          }}
        >
          <LaceBorder position="top" />
          <LaceBorder position="bottom" />
          <PostageStamp delay={0.5} />

          {/* Welcome text */}
          <motion.div
            className="text-center mb-6 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span
              className="text-base italic"
              style={{
                color: '#8B7355',
                fontFamily: "'EB Garamond', serif"
              }}
            >
              {guest ? `${guest.name} היקרים` : 'אורחים יקרים'}
            </span>
          </motion.div>

          {/* Media */}
          {wedding.mediaUrl && (
            <motion.div
              className="relative mx-auto mb-6 max-w-xs"
              initial={{ opacity: 0, rotate: -2 }}
              animate={{ opacity: 1, rotate: 2 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div
                className="absolute inset-0"
                style={{
                  border: '8px solid #FFFEF7',
                  boxShadow: '0 4px 15px rgba(139, 115, 85, 0.3)'
                }}
              />

              {wedding.mediaType === 'video' ? (
                <video
                  src={wedding.mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full aspect-square object-cover"
                  style={{ filter: 'sepia(15%)' }}
                />
              ) : (
                <img
                  src={wedding.mediaUrl}
                  alt={`${wedding.groomName} & ${wedding.brideName}`}
                  className="w-full aspect-square object-cover"
                  style={{
                    filter: 'sepia(15%)',
                    ...(wedding.mediaPosition && { objectPosition: `${wedding.mediaPosition.x}% ${wedding.mediaPosition.y}%` })
                  }}
                />
              )}
            </motion.div>
          )}

          {/* Names */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <h1
              className="text-4xl md:text-5xl mb-2"
              style={{
                fontFamily: "'EB Garamond', serif",
                color: '#5D4E37',
                fontWeight: 400
              }}
            >
              {wedding.groomName}
            </h1>

            <motion.div
              className="flex items-center justify-center gap-3 my-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #C4A77D)' }} />
              <span style={{ color: '#C4A77D', fontFamily: "'EB Garamond', serif", fontSize: '1.5rem' }}>♥</span>
              <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, #C4A77D, transparent)' }} />
            </motion.div>

            <h1
              className="text-4xl md:text-5xl"
              style={{
                fontFamily: "'EB Garamond', serif",
                color: '#5D4E37',
                fontWeight: 400
              }}
            >
              {wedding.brideName}
            </h1>
          </motion.div>

          {/* Invitation text */}
          <motion.p
            className="text-center text-base mb-8 italic"
            style={{
              color: '#8B7355',
              fontFamily: "'EB Garamond', serif",
              lineHeight: 1.8
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {wedding.description || 'מתכבדים להזמינכם לחגוג עמנו את יום חתונתנו'}
          </motion.p>

          {/* Decorative divider */}
          <motion.div
            className="flex items-center justify-center gap-2 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <div className="h-px w-8" style={{ background: '#C4A77D' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: '#C4A77D' }} />
            <div className="h-px w-8" style={{ background: '#C4A77D' }} />
          </motion.div>

          {/* Date section */}
          <motion.div
            className="text-center mb-8 p-6"
            style={{
              background: 'rgba(196, 167, 125, 0.1)',
              border: '1px dashed #C4A77D'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <div
              className="text-5xl mb-2"
              style={{ color: '#5D4E37', fontFamily: "'EB Garamond', serif" }}
            >
              {dateParts.day}
            </div>
            <div
              className="text-xl mb-1"
              style={{ color: '#5D4E37', fontFamily: "'EB Garamond', serif" }}
            >
              {dateParts.month} {dateParts.year}
            </div>
            <div
              className="text-base mb-3"
              style={{ color: '#8B7355' }}
            >
              {dateParts.weekday}
            </div>
            <div
              className="text-sm italic"
              style={{ color: '#C4A77D' }}
            >
              {dateParts.hebrewDate}
            </div>
          </motion.div>

          {/* Time and Location */}
          <motion.div
            className="space-y-4 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            {/* Reception time */}
            <div className="flex items-center gap-4 p-3">
              <Clock className="w-5 h-5" style={{ color: '#C4A77D' }} />
              <div className="flex-1">
                <div className="text-xs" style={{ color: '#8B7355' }}>קבלת פנים</div>
                <div className="text-lg" style={{ color: '#5D4E37', fontFamily: "'EB Garamond', serif" }}>{wedding.eventTime}</div>
              </div>
            </div>

            {/* Chuppah time */}
            {wedding.chuppahTime && (
              <div className="flex items-center gap-4 p-3">
                <Heart className="w-5 h-5" style={{ color: '#C4A77D' }} />
                <div className="flex-1">
                  <div className="text-xs" style={{ color: '#8B7355' }}>חופה</div>
                  <div className="text-lg" style={{ color: '#5D4E37', fontFamily: "'EB Garamond', serif" }}>{wedding.chuppahTime}</div>
                </div>
              </div>
            )}

            {/* Location */}
            <div className="p-3">
              <div className="flex items-center gap-4 mb-3">
                <MapPin className="w-5 h-5" style={{ color: '#C4A77D' }} />
                <div className="flex-1">
                  <div className="text-lg" style={{ color: '#5D4E37', fontFamily: "'EB Garamond', serif" }}>{wedding.venue}</div>
                  <div className="text-sm" style={{ color: '#8B7355' }}>{wedding.venueAddress}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <motion.a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: 'transparent',
                    color: '#8B7355',
                    border: '1px solid #C4A77D',
                    fontFamily: "'EB Garamond', serif"
                  }}
                  whileHover={{ background: 'rgba(196, 167, 125, 0.2)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Navigation className="w-4 h-4" />
                  <span>Maps</span>
                </motion.a>
                <motion.a
                  href={`https://waze.com/ul?q=${encodeURIComponent(wedding.venueAddress)}&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: '#C4A77D',
                    color: '#5D4E37',
                    border: '1px solid #C4A77D',
                    fontFamily: "'EB Garamond', serif"
                  }}
                  whileHover={{ background: 'rgba(196, 167, 125, 0.8)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Navigation className="w-4 h-4" />
                  <span>Waze</span>
                </motion.a>
              </div>
            </div>
          </motion.div>

          {/* RSVP Section */}
          {isRSVP && guest && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
            >
              <RSVPForm
                guest={guest}
                themeColor="#C4A77D"
              />
            </motion.div>
          )}

          {/* Gift section */}
          {wedding.enableBitGifts && wedding.bitPhone && (
            <motion.div
              className="mt-8 p-6 text-center"
              style={{
                background: 'rgba(196, 167, 125, 0.1)',
                border: '1px dashed #C4A77D'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
            >
              <h3 className="text-lg mb-2 italic" style={{ color: '#5D4E37', fontFamily: "'EB Garamond', serif" }}>רוצים לשלוח מתנה?</h3>
              <p className="text-sm mb-4" style={{ color: '#8B7355' }}>תודה מראש על המחשבה</p>

              <a
                href={wedding.bitPhone}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 transition-all hover:bg-[rgba(196,167,125,0.2)]"
                style={{
                  background: 'transparent',
                  color: '#8B7355',
                  border: '1px solid #C4A77D',
                  fontFamily: "'EB Garamond', serif"
                }}
              >
                <span>💳</span>
                <span>שליחת מתנה ב-Bit</span>
              </a>
            </motion.div>
          )}


          {/* Footer */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 2.2 }}
          >
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#C4A77D' }} />
              <div className="h-px w-16" style={{ background: '#C4A77D' }} />
              <div className="w-2 h-2 rounded-full" style={{ background: '#C4A77D' }} />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
