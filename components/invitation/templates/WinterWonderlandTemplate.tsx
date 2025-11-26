'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation, Heart } from 'lucide-react';
import { RSVPForm } from '../RSVPForm';
import type { InvitationTemplateProps } from './types';

// Snowflake component
const Snowflake = ({ x, delay, size, duration }: { x: string; delay: number; size: number; duration: number }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: x, top: '-5%' }}
    initial={{ y: 0, opacity: 0, rotate: 0 }}
    animate={{
      y: '110vh',
      opacity: [0, 1, 1, 0],
      rotate: 360
    }}
    transition={{
      duration,
      repeat: Infinity,
      delay,
      ease: "linear"
    }}
  >
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#A5F2F3" strokeWidth="1">
      <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  </motion.div>
);

// Ice crystal component
const IceCrystal = ({ x, y, delay }: { x: string; y: string; delay: number }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: x, top: y }}
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 0.4 }}
    transition={{ delay, duration: 1 }}
  >
    <motion.svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      <polygon points="20,0 24,16 40,20 24,24 20,40 16,24 0,20 16,16" fill="#A5F2F3" opacity="0.3" />
    </motion.svg>
  </motion.div>
);

export default function WinterWonderlandTemplate({ wedding, guest, dateParts, isRSVP = false }: InvitationTemplateProps) {
  const handleNavigation = () => {
    if (wedding.venueCoordinates) {
      const { lat, lng } = wedding.venueCoordinates;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`, '_blank');
    }
  };

  // Generate snowflakes
  const snowflakes = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    size: 12 + Math.random() * 16,
    duration: 8 + Math.random() * 6
  }));

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #E8F4F8 0%, #D4E9F7 30%, #C8E0F4 60%, #B8D4F0 100%)'
      }}
      dir="rtl"
    >
      {/* Snowflakes */}
      {snowflakes.map((flake) => (
        <Snowflake key={flake.id} x={flake.x} delay={flake.delay} size={flake.size} duration={flake.duration} />
      ))}

      {/* Ice crystals */}
      <IceCrystal x="5%" y="20%" delay={0.3} />
      <IceCrystal x="90%" y="15%" delay={0.5} />
      <IceCrystal x="10%" y="60%" delay={0.7} />
      <IceCrystal x="85%" y="70%" delay={0.9} />

      {/* Frost overlay at edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(255,255,255,0.3) 100%)'
        }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">

        {/* Hero Section - Names with large date overlay */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Large date display in background */}
          <motion.div
            className="absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none select-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.15, scale: 1 }}
            transition={{ duration: 1.2 }}
          >
            <span
              className="text-[150px] md:text-[200px] font-bold leading-none"
              style={{
                fontFamily: "'Suez One', serif",
                color: '#4169E1',
                textShadow: '0 0 40px rgba(65,105,225,0.3)'
              }}
            >
              {dateParts.day}
            </span>
          </motion.div>

          {/* Welcome text */}
          <motion.div
            className="text-center mb-4 relative z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span
              className="text-sm tracking-widest uppercase px-4 py-1 rounded-full"
              style={{
                color: '#4169E1',
                background: 'rgba(255,255,255,0.7)',
                fontFamily: "'Assistant', sans-serif"
              }}
            >
              ❄️ {guest ? `${guest.name} מוזמנים` : 'הנכם מוזמנים'} ❄️
            </span>
          </motion.div>

          {/* Names - horizontal layout */}
          <div className="flex items-center justify-center gap-4 md:gap-8 relative z-10 pt-16 md:pt-24">
            <motion.h1
              className="text-3xl md:text-5xl font-bold"
              style={{
                fontFamily: "'Suez One', serif",
                color: '#4169E1',
                textShadow: '2px 2px 4px rgba(255,255,255,0.8)'
              }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {wedding.groomName}
            </motion.h1>

            <motion.div
              className="flex flex-col items-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
            >
              <span className="text-lg">❄️</span>
              <Heart className="w-5 h-5 my-1" style={{ color: '#9370DB' }} fill="#9370DB" />
              <span className="text-lg">❄️</span>
            </motion.div>

            <motion.h1
              className="text-3xl md:text-5xl font-bold"
              style={{
                fontFamily: "'Suez One', serif",
                color: '#9370DB',
                textShadow: '2px 2px 4px rgba(255,255,255,0.8)'
              }}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {wedding.brideName}
            </motion.h1>
          </div>
        </motion.div>

        {/* Media + Date Card - Side by side on larger screens */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Media */}
          {wedding.mediaUrl && (
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {/* Frost frame */}
              <div
                className="absolute -inset-3 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(165,242,243,0.5), rgba(192,192,192,0.3), rgba(165,242,243,0.5))',
                  filter: 'blur(10px)'
                }}
              />

              <div
                className="relative rounded-xl overflow-hidden"
                style={{
                  border: '3px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 10px 40px rgba(65,105,225,0.2)'
                }}
              >
                {wedding.mediaType === 'video' ? (
                  <video
                    src={wedding.mediaUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <img
                    src={wedding.mediaUrl}
                    alt={`${wedding.groomName} & ${wedding.brideName}`}
                    className="w-full aspect-square object-cover"
                  />
                )}
              </div>

              {/* Ice corners */}
              {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
                <motion.div
                  key={i}
                  className={`absolute ${pos} w-8 h-8`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                >
                  <svg viewBox="0 0 32 32" fill="none" stroke="#A5F2F3" strokeWidth="2">
                    <path d="M0 16 L16 16 L16 0" transform={`rotate(${i * 90} 16 16)`} />
                  </svg>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Date card - vertical orientation */}
          <motion.div
            className="rounded-2xl p-6 flex flex-col justify-center items-center relative overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 40px rgba(65,105,225,0.15)',
              border: '1px solid rgba(165,242,243,0.5)',
              minHeight: wedding.mediaUrl ? 'auto' : '200px'
            }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="text-xs tracking-widest mb-2" style={{ color: '#718096' }}>
              ❄️ SAVE THE DATE ❄️
            </div>
            <motion.div
              className="text-6xl md:text-7xl font-bold mb-1"
              style={{ color: '#4169E1', fontFamily: "'Suez One', serif" }}
              animate={{
                textShadow: [
                  '0 0 10px rgba(165,242,243,0.5)',
                  '0 0 20px rgba(165,242,243,0.8)',
                  '0 0 10px rgba(165,242,243,0.5)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {dateParts.day}
            </motion.div>
            <div className="text-xl mb-1" style={{ color: '#4A5568' }}>
              {dateParts.month}
            </div>
            <div className="text-2xl font-bold mb-2" style={{ color: '#4169E1' }}>
              {dateParts.year}
            </div>
            <div className="text-sm mb-2" style={{ color: '#718096' }}>
              {dateParts.weekday}
            </div>
            <div
              className="text-xs px-3 py-1 rounded-full"
              style={{ background: 'rgba(147,112,219,0.2)', color: '#9370DB' }}
            >
              {dateParts.hebrewDate}
            </div>
          </motion.div>
        </div>

        {/* Invitation text */}
        <motion.p
          className="text-center text-lg mb-6 px-4"
          style={{
            color: '#4A5568',
            fontFamily: "'Assistant', sans-serif"
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {wedding.description || 'מים רבים לא יוכלו לכבות את האהבה ונהרות לא ישטפוה'}
        </motion.p>

        {/* Time Section - Horizontal cards */}
        <motion.div
          className="grid grid-cols-2 gap-3 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          {/* Reception time */}
          <div
            className="p-4 rounded-xl text-center"
            style={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(5px)'
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
              style={{ background: 'rgba(65,105,225,0.2)' }}
            >
              <Clock className="w-5 h-5" style={{ color: '#4169E1' }} />
            </div>
            <div className="text-xs mb-1" style={{ color: '#718096' }}>קבלת פנים</div>
            <div className="text-xl font-bold" style={{ color: '#4169E1' }}>{wedding.eventTime}</div>
          </div>

          {/* Chuppah time */}
          <div
            className="p-4 rounded-xl text-center"
            style={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(5px)'
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
              style={{ background: 'rgba(147,112,219,0.2)' }}
            >
              <Heart className="w-5 h-5" style={{ color: '#9370DB' }} />
            </div>
            <div className="text-xs mb-1" style={{ color: '#718096' }}>חופה</div>
            <div className="text-xl font-bold" style={{ color: '#9370DB' }}>{wedding.chuppahTime || '—'}</div>
          </div>
        </motion.div>

        {/* Location - Full width card */}
        <motion.div
          className="p-5 rounded-xl mb-6"
          style={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(5px)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4169E1, #9370DB)' }}
            >
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xl font-bold mb-1" style={{ color: '#4A5568' }}>{wedding.venue}</div>
              <div className="text-sm" style={{ color: '#718096' }}>{wedding.venueAddress}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <motion.a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #4169E1, #9370DB)' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Navigation className="w-5 h-5" />
              <span>Maps</span>
            </motion.a>
            <motion.a
              href={`https://waze.com/ul?q=${encodeURIComponent(wedding.venueAddress)}&navigate=yes`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #9370DB, #4169E1)' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Navigation className="w-5 h-5" />
              <span>Waze</span>
            </motion.a>
          </div>
        </motion.div>

        {/* RSVP Section */}
        {isRSVP && guest && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <RSVPForm guest={guest} themeColor="#4169E1" />
          </motion.div>
        )}

        {/* Gift section */}
        {wedding.enableBitGifts && wedding.bitPhone && (
          <motion.div
            className="mt-6 p-6 rounded-2xl text-center"
            style={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(5px)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <h3 className="text-lg font-bold mb-2" style={{ color: '#4169E1' }}>⛄ רוצים לשלוח מתנה?</h3>
            <p className="text-sm mb-4" style={{ color: '#718096' }}>תודה מראש על המחשבה</p>

            <a
              href={wedding.bitPhone}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #4169E1, #9370DB)' }}
            >
              <span>💳</span>
              <span>שליחת מתנה ב-Bit</span>
            </a>
          </motion.div>
        )}


        {/* Footer */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 2 }}
        >
          <span className="text-2xl">❄️✨❄️</span>
        </motion.div>
      </div>
    </div>
  );
}
