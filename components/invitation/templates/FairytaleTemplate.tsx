'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation, Heart } from 'lucide-react';
import { RSVPForm } from '../RSVPForm';
import type { InvitationTemplateProps } from './types';

// Magic sparkle component
const Sparkle = ({ x, y, delay, size }: { x: string; y: string; delay: number; size: number }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: x, top: y }}
    initial={{ opacity: 0, scale: 0, rotate: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      rotate: [0, 180, 360]
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  >
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FFD700">
      <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
    </svg>
  </motion.div>
);

// Floating crown component
const Crown = () => (
  <motion.div
    className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none"
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 1, type: "spring" }}
  >
    <motion.svg
      width="60"
      height="40"
      viewBox="0 0 60 40"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <path
        d="M5,35 L10,15 L20,25 L30,5 L40,25 L50,15 L55,35 Z"
        fill="#FFD700"
        stroke="#DAA520"
        strokeWidth="2"
      />
      <circle cx="30" cy="12" r="4" fill="#FF69B4" />
      <circle cx="15" cy="20" r="3" fill="#87CEEB" />
      <circle cx="45" cy="20" r="3" fill="#87CEEB" />
    </motion.svg>
  </motion.div>
);

// Fairy dust trail
const FairyDust = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{
      left: `${20 + Math.random() * 60}%`,
      top: '0%'
    }}
    initial={{ y: -20, opacity: 0 }}
    animate={{
      y: [0, 200],
      x: [0, Math.random() * 40 - 20],
      opacity: [0, 1, 0]
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      delay,
      ease: "easeOut"
    }}
  >
    <div
      className="w-2 h-2 rounded-full"
      style={{
        background: 'radial-gradient(circle, #FFD700, transparent)',
        boxShadow: '0 0 10px #FFD700'
      }}
    />
  </motion.div>
);

export default function FairytaleTemplate({ wedding, guest, dateParts, isRSVP = false, askAboutMeals }: InvitationTemplateProps) {
  const handleNavigation = () => {
    if (wedding.venueCoordinates) {
      const { lat, lng } = wedding.venueCoordinates;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`, '_blank');
    }
  };

  // Generate sparkles
  const sparkles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    delay: Math.random() * 3,
    size: 12 + Math.random() * 12
  }));

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #E6F3FF 0%, #FFE4E9 30%, #FFF5F7 60%, #E8E4FF 100%)'
      }}
      dir="rtl"
    >
      {/* Sparkles */}
      {sparkles.map((sparkle) => (
        <Sparkle key={sparkle.id} x={sparkle.x} y={sparkle.y} delay={sparkle.delay} size={sparkle.size} />
      ))}

      {/* Fairy dust */}
      {Array.from({ length: 8 }).map((_, i) => (
        <FairyDust key={i} delay={i * 0.5} />
      ))}

      {/* Crown */}
      <Crown />

      {/* Clouds */}
      <motion.div
        className="absolute top-20 left-10 w-24 h-12 rounded-full pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.8)', filter: 'blur(10px)' }}
        animate={{ x: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-32 right-10 w-32 h-14 rounded-full pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.7)', filter: 'blur(10px)' }}
        animate={{ x: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-lg mx-auto px-4  ">

        {/* Welcome text */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span
            className="text-lg"
            style={{
              color: '#9B59B6',
              fontFamily: "'Suez One', serif"
            }}
          >
            ✨ הנכם מוזמנים ✨
          </span>
        </motion.div>

        {/* Media */}
        {wedding.mediaUrl && (
          <motion.div
            className="relative mx-auto mb-8 max-w-xs"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Magical frame glow */}
            <motion.div
              className="absolute -inset-4 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #FFB6C1, #87CEEB, #DDA0DD, #FFD700)',
                filter: 'blur(20px)',
                opacity: 0.6
              }}
              animate={{
                rotate: [0, 360]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />

            <div
              className="relative rounded-full overflow-hidden"
              style={{
                border: '4px solid white',
                boxShadow: '0 0 30px rgba(155, 89, 182, 0.3)'
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
                  style={wedding.mediaPosition ? {
                    objectPosition: `${wedding.mediaPosition.x}% ${wedding.mediaPosition.y}%`
                  } : undefined}
                />
              )}
            </div>
          </motion.div>
        )}

        {/* Names */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <h1
            className="text-4xl md:text-5xl font-bold mb-2"
            style={{
              fontFamily: "'Suez One', serif",
              color: '#9B59B6',
              textShadow: '2px 2px 4px rgba(155, 89, 182, 0.2)'
            }}
          >
            {wedding.groomName}
          </h1>

          <motion.div
            className="flex items-center justify-center gap-3 my-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
          >
            <span className="text-xl">👑</span>
            <Heart className="w-6 h-6" style={{ color: '#FF69B4' }} fill="#FF69B4" />
            <span className="text-xl">👑</span>
          </motion.div>

          <h1
            className="text-4xl md:text-5xl font-bold"
            style={{
              fontFamily: "'Suez One', serif",
              color: '#FF69B4',
              textShadow: '2px 2px 4px rgba(255, 105, 180, 0.2)'
            }}
          >
            {wedding.brideName}
          </h1>
        </motion.div>

        {/* Invitation text */}
        <motion.p
          className="text-center text-lg mb-8"
          style={{
            color: '#7B6B8D',
            fontFamily: "'Rubik', sans-serif"
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {wedding.description || 'מים רבים לא יוכלו לכבות את האהבה ונהרות לא ישטפוה'}
        </motion.p>

        {/* Date card */}
        <motion.div
          className="rounded-3xl p-6 mb-6 text-center relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.9)',
            boxShadow: '0 10px 40px rgba(155, 89, 182, 0.15)',
            border: '2px solid rgba(255, 215, 0, 0.3)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div
            className="text-5xl font-bold mb-2"
            style={{ color: '#9B59B6', fontFamily: "'Suez One', serif" }}
          >
            {dateParts.day}
          </div>
          <div className="text-xl mb-1" style={{ color: '#7B6B8D' }}>
            {dateParts.month} {dateParts.year}
          </div>
          <div className="text-lg mb-3" style={{ color: '#9B9B9B' }}>
            {dateParts.weekday}
          </div>
          <div
            className="text-sm px-4 py-1 rounded-full inline-block"
            style={{ background: 'linear-gradient(90deg, #FFB6C1, #DDA0DD)', color: 'white' }}
          >
            {dateParts.hebrewDate}
          </div>
        </motion.div>

        {/* Time and Location */}
        <motion.div
          className="space-y-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {/* Reception time */}
          <div
            className="flex items-center gap-4 p-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.9)' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FFB6C1, #FF69B4)' }}
            >
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm" style={{ color: '#9B9B9B' }}>קבלת פנים</div>
              <div className="text-xl font-bold" style={{ color: '#9B59B6' }}>{wedding.eventTime}</div>
            </div>
          </div>

          {/* Chuppah time */}
          {wedding.chuppahTime && (
            <div
              className="flex items-center gap-4 p-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.9)' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}
              >
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm" style={{ color: '#9B9B9B' }}>חופה</div>
                <div className="text-xl font-bold" style={{ color: '#9B59B6' }}>{wedding.chuppahTime}</div>
              </div>
            </div>
          )}

          {/* Location */}
          <div
            className="p-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.9)' }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #87CEEB, #9B59B6)' }}
              >
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold" style={{ color: '#9B59B6' }}>{wedding.venue}</div>
                <div className="text-sm" style={{ color: '#9B9B9B' }}>{wedding.venueAddress}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #9B59B6, #FF69B4)' }}
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
                style={{ background: 'linear-gradient(135deg, #FF69B4, #9B59B6)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Navigation className="w-5 h-5" />
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
            transition={{ delay: 1.4 }}
          >
            <RSVPForm guest={guest} themeColor="#9B59B6" askAboutMeals={wedding.askAboutMeals !== false} mealOptions={wedding.mealOptions} customOtherMealName={wedding.customOtherMealName} />
          </motion.div>
        )}

        {/* Gift section */}
        {wedding.enableBitGifts && wedding.bitPhone && (
          <motion.div
            className="mt-6 p-6 rounded-2xl text-center"
            style={{ background: 'rgba(255,255,255,0.9)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <h3 className="text-lg font-bold mb-2" style={{ color: '#9B59B6' }}>🪄 רוצים לשלוח מתנה?</h3>
            <p className="text-sm mb-4" style={{ color: '#9B9B9B' }}>תודה מראש על המחשבה</p>

            <a
              href={wedding.bitPhone}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #FFD700, #FF69B4)' }}
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
          <span className="text-2xl">✨🏰✨</span>
        </motion.div>
      </div>
    </div>
  );
}
