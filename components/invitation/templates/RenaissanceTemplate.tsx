'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation, Heart } from 'lucide-react';
import { RSVPForm } from '../RSVPForm';
import type { InvitationTemplateProps } from './types';

// Golden frame corner component
const FrameCorner = ({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) => {
  const rotations = {
    'top-left': 0,
    'top-right': 90,
    'bottom-right': 180,
    'bottom-left': 270
  };

  const positions = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  return (
    <motion.svg
      className={`absolute ${positions[position]} w-16 h-16 pointer-events-none`}
      viewBox="0 0 60 60"
      style={{ transform: `rotate(${rotations[position]}deg)` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
    >
      <path
        d="M5,5 L5,25 C5,15 15,5 25,5 L5,5 M5,5 L25,5 M5,25 L5,5"
        fill="none"
        stroke="#C9A962"
        strokeWidth="2"
      />
      <circle cx="5" cy="5" r="3" fill="#C9A962" />
      <path
        d="M10,10 Q15,10 15,15 Q15,10 20,10"
        fill="none"
        stroke="#C9A962"
        strokeWidth="1"
        opacity="0.6"
      />
    </motion.svg>
  );
};

// Canvas texture shimmer
const CanvasShimmer = () => (
  <motion.div
    className="absolute inset-0 pointer-events-none"
    style={{
      background: 'linear-gradient(45deg, transparent 40%, rgba(201,169,98,0.1) 50%, transparent 60%)',
      backgroundSize: '200% 200%'
    }}
    animate={{
      backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
);

export default function RenaissanceTemplate({ wedding, guest, dateParts, isRSVP = false }: InvitationTemplateProps) {
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
      className="min-h-screen relative overflow-hidden"
      style={{
        background: '#F5F0E6',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='canvas'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23canvas)'/%3E%3C/svg%3E")`,
        backgroundBlendMode: 'soft-light'
      }}
      dir="rtl"
    >
      <CanvasShimmer />

      {/* Frame corners */}
      <FrameCorner position="top-left" />
      <FrameCorner position="top-right" />
      <FrameCorner position="bottom-left" />
      <FrameCorner position="bottom-right" />

      {/* Inner decorative border */}
      <motion.div
        className="absolute inset-8 pointer-events-none"
        style={{
          border: '1px solid rgba(201,169,98,0.4)'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-lg mx-auto px-8 py-12">

        {/* Decorative header ornament */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <svg width="120" height="30" viewBox="0 0 120 30">
            <motion.path
              d="M0,15 Q30,0 60,15 Q90,30 120,15"
              fill="none"
              stroke="#C9A962"
              strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.5 }}
            />
            <circle cx="60" cy="15" r="4" fill="#C9A962" />
          </svg>
        </motion.div>

        {/* Welcome text */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <span
            className="text-sm tracking-[0.2em] italic"
            style={{
              color: '#8B7355',
              fontFamily: "'Cinzel Decorative', serif"
            }}
          >
            {guest ? `${guest.name} מוזמנים` : 'הנכם מוזמנים'}
          </span>
        </motion.div>

        {/* Media with golden frame */}
        {wedding.mediaUrl && (
          <motion.div
            className="relative mx-auto mb-8 max-w-xs"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            {/* Ornate frame */}
            <div
              className="absolute -inset-4 rounded"
              style={{
                background: 'linear-gradient(135deg, #C9A962 0%, #E8D5A3 25%, #C9A962 50%, #E8D5A3 75%, #C9A962 100%)',
                boxShadow: '0 10px 40px rgba(139,115,85,0.3), inset 0 2px 4px rgba(255,255,255,0.3)'
              }}
            />
            <div
              className="absolute -inset-2 rounded"
              style={{ background: '#F5F0E6' }}
            />

            {wedding.mediaType === 'video' ? (
              <video
                src={wedding.mediaUrl}
                autoPlay
                loop
                muted
                playsInline
                className="relative w-full aspect-square object-cover rounded"
                style={{ filter: 'sepia(10%) contrast(1.05)' }}
              />
            ) : (
              <img
                src={wedding.mediaUrl}
                alt={`${wedding.groomName} & ${wedding.brideName}`}
                className="relative w-full aspect-square object-cover rounded"
                style={{ filter: 'sepia(10%) contrast(1.05)' }}
              />
            )}
          </motion.div>
        )}

        {/* Names */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <h1
            className="text-4xl md:text-5xl mb-2"
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              color: '#5D4E37',
              fontWeight: 400
            }}
          >
            {wedding.groomName}
          </h1>

          <motion.div
            className="flex items-center justify-center gap-4 my-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8, type: "spring" }}
          >
            <svg width="40" height="20" viewBox="0 0 40 20">
              <path d="M0,10 Q10,0 20,10 Q30,20 40,10" fill="none" stroke="#C9A962" strokeWidth="1" />
            </svg>
            <Heart className="w-5 h-5" style={{ color: '#C9A962' }} fill="#C9A962" />
            <svg width="40" height="20" viewBox="0 0 40 20">
              <path d="M0,10 Q10,20 20,10 Q30,0 40,10" fill="none" stroke="#C9A962" strokeWidth="1" />
            </svg>
          </motion.div>

          <h1
            className="text-4xl md:text-5xl"
            style={{
              fontFamily: "'Cinzel Decorative', serif",
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
            fontFamily: "'Alegreya', serif",
            lineHeight: 1.8
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {wedding.description || 'מים רבים לא יוכלו לכבות את האהבה ונהרות לא ישטפוה'}
        </motion.p>

        {/* Date card */}
        <motion.div
          className="p-6 mb-8 text-center relative"
          style={{
            background: 'rgba(255,255,255,0.5)',
            border: '2px solid #C9A962',
            boxShadow: 'inset 0 0 30px rgba(201,169,98,0.1)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          {/* Corner ornaments */}
          {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} w-4 h-4`}
              style={{
                borderTop: pos.includes('top') ? '2px solid #C9A962' : 'none',
                borderBottom: pos.includes('bottom') ? '2px solid #C9A962' : 'none',
                borderLeft: pos.includes('left') ? '2px solid #C9A962' : 'none',
                borderRight: pos.includes('right') ? '2px solid #C9A962' : 'none'
              }}
            />
          ))}

          <div
            className="text-5xl mb-2"
            style={{ color: '#C9A962', fontFamily: "'Cinzel', serif" }}
          >
            {dateParts.day}
          </div>
          <div
            className="text-xl mb-1"
            style={{ color: '#5D4E37', fontFamily: "'Cinzel', serif" }}
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
            style={{ color: '#C9A962' }}
          >
            {dateParts.hebrewDate}
          </div>
        </motion.div>

        {/* Time and Location */}
        <motion.div
          className="space-y-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          {/* Reception time */}
          <div
            className="flex items-center gap-4 p-4"
            style={{
              background: 'rgba(255,255,255,0.4)',
              borderRight: '3px solid #C9A962'
            }}
          >
            <Clock className="w-5 h-5" style={{ color: '#C9A962' }} />
            <div className="flex-1">
              <div className="text-xs tracking-wider" style={{ color: '#8B7355' }}>קבלת פנים</div>
              <div className="text-xl" style={{ color: '#5D4E37', fontFamily: "'Cinzel', serif" }}>{wedding.eventTime}</div>
            </div>
          </div>

          {/* Chuppah time */}
          {wedding.chuppahTime && (
            <div
              className="flex items-center gap-4 p-4"
              style={{
                background: 'rgba(255,255,255,0.4)',
                borderRight: '3px solid #C9A962'
              }}
            >
              <Heart className="w-5 h-5" style={{ color: '#C9A962' }} />
              <div className="flex-1">
                <div className="text-xs tracking-wider" style={{ color: '#8B7355' }}>חופה</div>
                <div className="text-xl" style={{ color: '#5D4E37', fontFamily: "'Cinzel', serif" }}>{wedding.chuppahTime}</div>
              </div>
            </div>
          )}

          {/* Location */}
          <div
            className="p-4"
            style={{
              background: 'rgba(255,255,255,0.4)',
              borderRight: '3px solid #C9A962'
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <MapPin className="w-5 h-5" style={{ color: '#C9A962' }} />
              <div className="flex-1">
                <div className="text-xl" style={{ color: '#5D4E37', fontFamily: "'Cinzel', serif" }}>{wedding.venue}</div>
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
                  background: 'linear-gradient(135deg, #C9A962 0%, #E8D5A3 100%)',
                  color: '#5D4E37',
                  border: 'none'
                }}
                whileHover={{ boxShadow: '0 5px 20px rgba(201,169,98,0.4)' }}
                whileTap={{ scale: 0.98 }}
              >
                <Navigation className="w-4 h-4" />
                <span style={{ fontFamily: "'Cinzel', serif" }}>Maps</span>
              </motion.a>
              <motion.a
                href={`https://waze.com/ul?q=${encodeURIComponent(wedding.venueAddress)}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 flex items-center justify-center gap-2 transition-all"
                style={{
                  background: '#5D4E37',
                  color: '#E8D5A3',
                  border: 'none'
                }}
                whileHover={{ boxShadow: '0 5px 20px rgba(93,78,55,0.4)' }}
                whileTap={{ scale: 0.98 }}
              >
                <Navigation className="w-4 h-4" />
                <span style={{ fontFamily: "'Cinzel', serif" }}>Waze</span>
              </motion.a>
            </div>
          </div>
        </motion.div>

        {/* RSVP Section */}
        {isRSVP && guest && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <RSVPForm
              guest={guest}
              themeColor="#C9A962"
            />
          </motion.div>
        )}

        {/* Gift section */}
        {wedding.enableBitGifts && wedding.bitPhone && (
          <motion.div
            className="mt-8 p-6 text-center"
            style={{
              background: 'rgba(255,255,255,0.4)',
              border: '1px solid #C9A962'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7 }}
          >
            <h3 className="text-lg mb-2" style={{ color: '#5D4E37', fontFamily: "'Cinzel', serif" }}>רוצים לשלוח מתנה?</h3>
            <p className="text-sm mb-4" style={{ color: '#8B7355' }}>תודה מראש על המחשבה</p>

            <a
              href={wedding.bitPhone}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 transition-all"
              style={{
                background: 'linear-gradient(135deg, #C9A962 0%, #E8D5A3 100%)',
                color: '#5D4E37'
              }}
            >
              <span>💳</span>
              <span style={{ fontFamily: "'Cinzel', serif" }}>שליחת מתנה ב-Bit</span>
            </a>
          </motion.div>
        )}


        {/* Footer ornament */}
        <motion.div
          className="mt-12 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 2.1 }}
        >
          <svg width="80" height="20" viewBox="0 0 80 20">
            <path d="M0,10 L30,10 M50,10 L80,10" stroke="#C9A962" strokeWidth="1" />
            <circle cx="40" cy="10" r="4" fill="none" stroke="#C9A962" strokeWidth="1" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
