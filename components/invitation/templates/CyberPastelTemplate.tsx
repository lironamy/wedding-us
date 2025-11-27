'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation, Heart } from 'lucide-react';
import { RSVPForm } from '../RSVPForm';
import type { InvitationTemplateProps } from './types';

// Floating bubble component
const Bubble = ({ x, size, delay, duration }: { x: string; size: number; delay: number; duration: number }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      left: x,
      bottom: '-10%',
      width: size,
      height: size,
      background: 'linear-gradient(135deg, rgba(255,182,193,0.3), rgba(173,216,230,0.3), rgba(221,160,221,0.3))',
      border: '1px solid rgba(255,255,255,0.3)',
      backdropFilter: 'blur(2px)'
    }}
    animate={{
      y: [0, -800],
      x: [0, Math.random() * 40 - 20],
      scale: [1, 0.8],
      opacity: [0.6, 0]
    }}
    transition={{
      duration,
      repeat: Infinity,
      delay,
      ease: "easeOut"
    }}
  />
);

export default function CyberPastelTemplate({ wedding, guest, dateParts, isRSVP = false }: InvitationTemplateProps) {
  const handleNavigation = () => {
    if (wedding.venueCoordinates) {
      const { lat, lng } = wedding.venueCoordinates;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`, '_blank');
    }
  };

  // Generate bubbles
  const bubbles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: `${Math.random() * 100}%`,
    size: 20 + Math.random() * 60,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 5
  }));

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FFE5EC 0%, #E0F4FF 25%, #F3E5F5 50%, #E8F5E9 75%, #FFF8E1 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite'
      }}
      dir="rtl"
    >
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Floating bubbles */}
      {bubbles.map((bubble) => (
        <Bubble key={bubble.id} {...bubble} />
      ))}

      {/* Soft glow spots */}
      <div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,182,193,0.4) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(173,216,230,0.4) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">

        {/* Welcome text */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span
            className="text-sm tracking-[0.2em]"
            style={{
              color: '#9C7C9C',
              fontFamily: "'Space Grotesk', sans-serif"
            }}
          >
            {guest ? `${guest.name} מוזמנים` : 'הנכם מוזמנים'}
          </span>
        </motion.div>

        {/* Media with glass morphism */}
        {wedding.mediaUrl && (
          <motion.div
            className="relative mx-auto mb-8 max-w-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div
              className="absolute -inset-4 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,182,193,0.5), rgba(173,216,230,0.5), rgba(221,160,221,0.5))',
                filter: 'blur(20px)'
              }}
            />

            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.3)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.5)',
                padding: '8px'
              }}
            >
              {wedding.mediaType === 'video' ? (
                <video
                  src={wedding.mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full aspect-square object-cover rounded-xl"
                />
              ) : (
                <img
                  src={wedding.mediaUrl}
                  alt={`${wedding.groomName} & ${wedding.brideName}`}
                  className="w-full aspect-square object-cover rounded-xl"
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
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1
            className="text-4xl md:text-5xl font-medium mb-2"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              background: 'linear-gradient(135deg, #FF9AA2, #DDA0DD)',
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
            transition={{ duration: 0.4, delay: 0.4, type: "spring" }}
          >
            <div
              className="h-px w-12"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(221,160,221,0.6))' }}
            />
            <Heart className="w-5 h-5" style={{ color: '#DDA0DD' }} fill="#DDA0DD" />
            <div
              className="h-px w-12"
              style={{ background: 'linear-gradient(90deg, rgba(221,160,221,0.6), transparent)' }}
            />
          </motion.div>

          <h1
            className="text-4xl md:text-5xl font-medium"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              background: 'linear-gradient(135deg, #87CEEB, #98D8C8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {wedding.brideName}
          </h1>
        </motion.div>

        {/* Invitation text */}
        <motion.p
          className="text-center text-base mb-8"
          style={{
            color: '#7C6C7C',
            fontFamily: "'Rubik', sans-serif"
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {wedding.description || 'מים רבים לא יוכלו לכבות את האהבה ונהרות לא ישטפוה'}
        </motion.p>

        {/* Date card - glass morphism */}
        <motion.div
          className="rounded-2xl p-6 mb-6 text-center"
          style={{
            background: 'rgba(255,255,255,0.4)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div
            className="text-5xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, #FF9AA2, #87CEEB)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {dateParts.day}
          </div>
          <div
            className="text-xl mb-1"
            style={{ color: '#5C4C5C' }}
          >
            {dateParts.month} {dateParts.year}
          </div>
          <div
            className="text-lg mb-3"
            style={{ color: '#7C6C7C' }}
          >
            {dateParts.weekday}
          </div>
          <div
            className="text-sm px-4 py-1 rounded-full inline-block"
            style={{
              background: 'rgba(221,160,221,0.3)',
              color: '#9C7C9C'
            }}
          >
            {dateParts.hebrewDate}
          </div>
        </motion.div>

        {/* Time and Location */}
        <motion.div
          className="space-y-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          {/* Reception time */}
          <div
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.4)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.5)'
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(255,154,162,0.5), rgba(221,160,221,0.5))' }}
            >
              <Clock className="w-5 h-5" style={{ color: '#9C7C9C' }} />
            </div>
            <div className="flex-1">
              <div className="text-xs" style={{ color: '#9C7C9C' }}>קבלת פנים</div>
              <div className="text-lg font-medium" style={{ color: '#5C4C5C' }}>{wedding.eventTime}</div>
            </div>
          </div>

          {/* Chuppah time */}
          {wedding.chuppahTime && (
            <div
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.4)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.5)'
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(221,160,221,0.5), rgba(135,206,235,0.5))' }}
              >
                <Heart className="w-5 h-5" style={{ color: '#9C7C9C' }} />
              </div>
              <div className="flex-1">
                <div className="text-xs" style={{ color: '#9C7C9C' }}>חופה</div>
                <div className="text-lg font-medium" style={{ color: '#5C4C5C' }}>{wedding.chuppahTime}</div>
              </div>
            </div>
          )}

          {/* Location */}
          <div
            className="p-4 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.4)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.5)'
            }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(135,206,235,0.5), rgba(152,216,200,0.5))' }}
              >
                <MapPin className="w-5 h-5" style={{ color: '#9C7C9C' }} />
              </div>
              <div className="flex-1">
                <div className="text-lg font-medium" style={{ color: '#5C4C5C' }}>{wedding.venue}</div>
                <div className="text-sm" style={{ color: '#9C7C9C' }}>{wedding.venueAddress}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-medium text-white"
                style={{
                  background: 'linear-gradient(135deg, #FF9AA2, #DDA0DD)',
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
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-medium text-white"
                style={{
                  background: 'linear-gradient(135deg, #87CEEB, #DDA0DD)',
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
            transition={{ delay: 1.1 }}
          >
            <RSVPForm
              guest={guest}
              themeColor="#DDA0DD"
            />
          </motion.div>
        )}

        {/* Gift section */}
        {wedding.enableBitGifts && wedding.bitPhone && (
          <motion.div
            className="mt-6 p-6 rounded-2xl text-center"
            style={{
              background: 'rgba(255,255,255,0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.6)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            <h3 className="text-lg font-medium mb-2" style={{ color: '#5C4C5C' }}>רוצים לשלוח מתנה? ✨</h3>
            <p className="text-sm mb-4" style={{ color: '#9C7C9C' }}>תודה מראש על המחשבה</p>

            <a
              href={wedding.bitPhone}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white"
              style={{
                background: 'linear-gradient(135deg, #FF9AA2, #DDA0DD, #87CEEB)',
                backgroundSize: '200% 200%'
              }}
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
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.7 }}
        >
          <span style={{ fontSize: '1.5rem' }}>🫧</span>
        </motion.div>
      </div>
    </div>
  );
}
