'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation, Heart, Star } from 'lucide-react';
import { RSVPForm } from '../RSVPForm';
import type { InvitationTemplateProps } from './types';
import { useState } from 'react';

// Confetti component for success
const Confetti = ({ show }: { show: boolean }) => {
  if (!show) return null;

  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random(),
    color: ['#FF6B9D', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6B6B'][Math.floor(Math.random() * 5)]
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            left: `${piece.x}%`,
            top: -20,
            background: piece.color
          }}
          initial={{ y: 0, rotate: 0, opacity: 1 }}
          animate={{
            y: window.innerHeight + 100,
            rotate: 720,
            opacity: 0
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: "easeIn"
          }}
        />
      ))}
    </div>
  );
};

// Star decoration
const StarDecoration = ({ x, y, delay, size }: { x: string; y: string; delay: number; size: number }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: x, top: y }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5, type: "spring" }}
  >
    <Star className="text-yellow-400" style={{ width: size, height: size }} fill="#FFD93D" />
  </motion.div>
);

export default function CarnivalTemplate({ wedding, guest, dateParts, isRSVP = false, askAboutMeals }: InvitationTemplateProps) {
  const [showConfetti, setShowConfetti] = useState(false);

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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
      }}
      dir="rtl"
    >
      <Confetti show={showConfetti} />

      {/* Stars background */}
      <StarDecoration x="5%" y="10%" delay={0.2} size={24} />
      <StarDecoration x="90%" y="15%" delay={0.3} size={20} />
      <StarDecoration x="15%" y="30%" delay={0.4} size={16} />
      <StarDecoration x="85%" y="40%" delay={0.5} size={22} />
      <StarDecoration x="10%" y="60%" delay={0.6} size={18} />
      <StarDecoration x="92%" y="70%" delay={0.7} size={20} />

      {/* Main content */}
      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">

        {/* Welcome text */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <span
            className="text-lg font-bold tracking-wide"
            style={{
              color: '#FFD93D',
              fontFamily: "'Fredoka', sans-serif",
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            🎉הנכם מוזמנים 🎉
          </span>
        </motion.div>

        {/* Main card */}
        <motion.div
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Gradient border */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              padding: '3px',
              background: 'linear-gradient(135deg, #FF6B9D, #FFD93D, #6BCB77, #4D96FF)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude'
            }}
          />

          {/* Media */}
          {wedding.mediaUrl && (
            <motion.div
              className="relative mx-auto mb-6 max-w-xs"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
            >
              <div
                className="absolute -inset-2 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, #FF6B9D, #FFD93D, #6BCB77, #4D96FF)',
                  backgroundSize: '400% 400%',
                  animation: 'gradientShift 5s ease infinite'
                }}
              />

              {wedding.mediaType === 'video' ? (
                <video
                  src={wedding.mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="relative w-full aspect-square object-cover rounded-xl"
                />
              ) : (
                <img
                  src={wedding.mediaUrl}
                  alt={`${wedding.groomName} & ${wedding.brideName}`}
                  className="relative w-full aspect-square object-cover rounded-xl"
                  style={wedding.mediaPosition ? {
                    objectPosition: `${wedding.mediaPosition.x}% ${wedding.mediaPosition.y}%`
                  } : undefined}
                />
              )}

              <style jsx>{`
                @keyframes gradientShift {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
              `}</style>
            </motion.div>
          )}

          {/* Names */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h1
              className="text-4xl md:text-5xl font-bold mb-2"
              style={{
                fontFamily: "'Fredoka', sans-serif",
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {wedding.groomName}
            </h1>

            <motion.div
              className="flex items-center justify-center gap-3 my-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.7, type: "spring", bounce: 0.5 }}
            >
              <Star className="w-5 h-5 text-yellow-400" fill="#FFD93D" />
              <Heart className="w-6 h-6 text-pink-500" fill="#FF6B9D" />
              <Star className="w-5 h-5 text-yellow-400" fill="#FFD93D" />
            </motion.div>

            <h1
              className="text-4xl md:text-5xl font-bold"
              style={{
                fontFamily: "'Fredoka', sans-serif",
                background: 'linear-gradient(135deg, #f093fb, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {wedding.brideName}
            </h1>
          </motion.div>

          {/* Invitation text */}
          <motion.p
            className="text-center text-lg mb-6"
            style={{
              color: '#666',
              fontFamily: "'Assistant', sans-serif"
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            {wedding.description || 'מים רבים לא יוכלו לכבות את האהבה ונהרות לא ישטפוה'}
          </motion.p>

          {/* Date card */}
          <motion.div
            className="rounded-2xl p-6 mb-6 text-center"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <div
              className="text-5xl font-bold mb-2 text-white"
              style={{ fontFamily: "'Fredoka', sans-serif" }}
            >
              {dateParts.day}
            </div>
            <div className="text-xl mb-1 text-white/90">
              {dateParts.month} {dateParts.year}
            </div>
            <div className="text-lg mb-3 text-white/80">
              {dateParts.weekday}
            </div>
            <div
              className="text-sm px-4 py-1 rounded-full inline-block"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
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
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #f5f5f5, #fff)' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
              >
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500">קבלת פנים</div>
                <div className="text-lg font-bold" style={{ color: '#667eea' }}>{wedding.eventTime}</div>
              </div>
            </div>

            {/* Chuppah time */}
            {wedding.chuppahTime && (
              <div
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{ background: 'linear-gradient(135deg, #f5f5f5, #fff)' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #FF6B9D, #f093fb)' }}
                >
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500">חופה</div>
                  <div className="text-lg font-bold" style={{ color: '#FF6B9D' }}>{wedding.chuppahTime}</div>
                </div>
              </div>
            )}

            {/* Location */}
            <div
              className="p-4 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #f5f5f5, #fff)' }}
            >
              <div className="flex items-center gap-4 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #6BCB77, #4D96FF)' }}
                >
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold" style={{ color: '#6BCB77' }}>{wedding.venue}</div>
                  <div className="text-sm text-gray-500">{wedding.venueAddress}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <motion.a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #6BCB77, #4D96FF)'
                  }}
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
                  style={{
                    background: 'linear-gradient(135deg, #FF6B9D, #f093fb)'
                  }}
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
              <RSVPForm
                guest={guest}
                themeColor="#667eea"
                askAboutMeals={wedding.askAboutMeals !== false}
                mealOptions={wedding.mealOptions}
              customOtherMealName={wedding.customOtherMealName}
              />
            </motion.div>
          )}

          {/* Gift section */}
          {wedding.enableBitGifts && wedding.bitPhone && (
            <motion.div
              className="mt-6 p-6 rounded-2xl text-center"
              style={{
                background: 'linear-gradient(135deg, #FFF5F7, #FFF)'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
            >
              <h3 className="text-lg font-bold mb-2" style={{ color: '#FF6B9D' }}>🎁 רוצים לשלוח מתנה?</h3>
              <p className="text-sm mb-4 text-gray-500">תודה מראש על המחשבה</p>

              <a
                href={wedding.bitPhone}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #FF6B9D, #f093fb)'
                }}
              >
                <span>💳</span>
                <span>שליחת מתנה ב-Bit</span>
              </a>
            </motion.div>
          )}

        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <div className="flex items-center justify-center gap-2">
            <Star className="w-4 h-4 text-yellow-300" fill="#FFD93D" />
            <span className="text-white/80 text-sm">נשמח לראותכם</span>
            <Star className="w-4 h-4 text-yellow-300" fill="#FFD93D" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
