'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation, Heart } from 'lucide-react';
import { RSVPForm } from '../RSVPForm';
import type { InvitationTemplateProps } from './types';

// Spotlight component
const Spotlight = ({ x, delay }: { x: string; delay: number }) => (
  <motion.div
    className="absolute top-0 pointer-events-none"
    style={{
      left: x,
      width: '200px',
      height: '400px',
      background: 'radial-gradient(ellipse at top, rgba(255,215,0,0.15) 0%, transparent 70%)',
      transform: 'translateX(-50%)'
    }}
    initial={{ opacity: 0 }}
    animate={{ opacity: [0.3, 0.6, 0.3] }}
    transition={{
      duration: 4,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  />
);

// Smoke effect component
const Smoke = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none"
    style={{
      width: '300px',
      height: '200px',
      background: 'radial-gradient(ellipse, rgba(255,255,255,0.05) 0%, transparent 70%)',
      filter: 'blur(30px)'
    }}
    initial={{ opacity: 0, y: 0 }}
    animate={{ opacity: [0, 0.3, 0], y: -100 }}
    transition={{
      duration: 8,
      repeat: Infinity,
      delay,
      ease: "easeOut"
    }}
  />
);

// Neon text effect
const NeonText = ({ children, color, delay }: { children: React.ReactNode; color: string; delay: number }) => (
  <motion.span
    style={{
      color: color,
      textShadow: `0 0 10px ${color}, 0 0 20px ${color}, 0 0 40px ${color}`
    }}
    initial={{ opacity: 0 }}
    animate={{ opacity: [0.8, 1, 0.8] }}
    transition={{
      duration: 2,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  >
    {children}
  </motion.span>
);

export default function JazzClubTemplate({ wedding, guest, dateParts, isRSVP = false }: InvitationTemplateProps) {
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
        background: 'linear-gradient(180deg, #0D0D1A 0%, #1A1A2E 50%, #16213E 100%)'
      }}
      dir="rtl"
    >
      {/* Spotlights */}
      <Spotlight x="20%" delay={0} />
      <Spotlight x="80%" delay={1} />
      <Spotlight x="50%" delay={2} />

      {/* Smoke effects */}
      <Smoke delay={0} />
      <Smoke delay={3} />

      {/* Stars/lights background */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: '#FFD700'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">

        {/* Welcome text - neon style */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span
            className="text-sm tracking-[0.3em] uppercase"
            style={{
              color: '#FFD700',
              fontFamily: "'Bebas Neue', sans-serif",
              textShadow: '0 0 10px rgba(255,215,0,0.5)'
            }}
          >
            {guest ? `${guest.name} מוזמנים` : 'הנכם מוזמנים'}
          </span>
        </motion.div>

        {/* Media with stage-like frame */}
        {wedding.mediaUrl && (
          <motion.div
            className="relative mx-auto mb-8 max-w-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Glow effect */}
            <div
              className="absolute -inset-4 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(75,0,130,0.5), rgba(138,43,226,0.5))',
                filter: 'blur(20px)'
              }}
            />

            <div
              className="relative rounded-lg overflow-hidden"
              style={{
                border: '2px solid rgba(255,215,0,0.5)',
                boxShadow: '0 0 30px rgba(255,215,0,0.3)'
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
          </motion.div>
        )}

        {/* Names - neon sign effect */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <h1
            className="text-4xl md:text-5xl font-bold mb-2"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: '0.1em'
            }}
          >
            <NeonText color="#FF6B9D" delay={0}>{wedding.groomName}</NeonText>
          </h1>

          <motion.div
            className="flex items-center justify-center gap-4 my-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
          >
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #FFD700)' }} />
            <Heart
              className="w-6 h-6"
              style={{
                color: '#FFD700',
                filter: 'drop-shadow(0 0 10px #FFD700)'
              }}
              fill="#FFD700"
            />
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, #FFD700, transparent)' }} />
          </motion.div>

          <h1
            className="text-4xl md:text-5xl font-bold"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: '0.1em'
            }}
          >
            <NeonText color="#00FFFF" delay={0.5}>{wedding.brideName}</NeonText>
          </h1>
        </motion.div>

        {/* Invitation text */}
        <motion.p
          className="text-center text-lg mb-8"
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontFamily: "'Assistant', sans-serif"
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {wedding.description || 'מים רבים לא יוכלו לכבות את האהבה ונהרות לא ישטפוה'}
        </motion.p>

        {/* Date card */}
        <motion.div
          className="rounded-lg p-6 mb-6 text-center relative overflow-hidden"
          style={{
            background: 'rgba(26, 26, 46, 0.8)',
            border: '1px solid rgba(255,215,0,0.3)',
            boxShadow: '0 0 30px rgba(138,43,226,0.2)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div
            className="text-5xl font-bold mb-2"
            style={{
              color: '#FFD700',
              fontFamily: "'Bebas Neue', sans-serif",
              textShadow: '0 0 20px rgba(255,215,0,0.5)'
            }}
          >
            {dateParts.day}
          </div>
          <div
            className="text-xl mb-1"
            style={{ color: 'rgba(255,255,255,0.9)' }}
          >
            {dateParts.month} {dateParts.year}
          </div>
          <div
            className="text-lg mb-3"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            {dateParts.weekday}
          </div>
          <div
            className="text-sm px-4 py-1 rounded inline-block"
            style={{
              background: 'rgba(255,215,0,0.2)',
              color: '#FFD700',
              border: '1px solid rgba(255,215,0,0.3)'
            }}
          >
            {dateParts.hebrewDate}
          </div>
        </motion.div>

        {/* Time and Location */}
        <motion.div
          className="space-y-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {/* Reception time */}
          <div
            className="flex items-center gap-4 p-4 rounded-lg"
            style={{
              background: 'rgba(26, 26, 46, 0.6)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(255,215,0,0.2)',
                boxShadow: '0 0 15px rgba(255,215,0,0.3)'
              }}
            >
              <Clock className="w-6 h-6" style={{ color: '#FFD700' }} />
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>קבלת פנים</div>
              <div className="text-xl" style={{ color: '#FFD700' }}>{wedding.eventTime}</div>
            </div>
          </div>

          {/* Chuppah time */}
          {wedding.chuppahTime && (
            <div
              className="flex items-center gap-4 p-4 rounded-lg"
              style={{
                background: 'rgba(26, 26, 46, 0.6)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255,107,157,0.2)',
                  boxShadow: '0 0 15px rgba(255,107,157,0.3)'
                }}
              >
                <Heart className="w-6 h-6" style={{ color: '#FF6B9D' }} />
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>חופה</div>
                <div className="text-xl" style={{ color: '#FF6B9D' }}>{wedding.chuppahTime}</div>
              </div>
            </div>
          )}

          {/* Location */}
          <div
            className="p-4 rounded-lg"
            style={{
              background: 'rgba(26, 26, 46, 0.6)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(0,255,255,0.2)',
                  boxShadow: '0 0 15px rgba(0,255,255,0.3)'
                }}
              >
                <MapPin className="w-6 h-6" style={{ color: '#00FFFF' }} />
              </div>
              <div className="flex-1">
                <div className="text-xl" style={{ color: '#00FFFF' }}>{wedding.venue}</div>
                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{wedding.venueAddress}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all"
                style={{
                  background: 'transparent',
                  color: '#FFD700',
                  border: '1px solid #FFD700'
                }}
                whileHover={{
                  background: 'rgba(255,215,0,0.2)',
                  boxShadow: '0 0 20px rgba(255,215,0,0.4)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Navigation className="w-5 h-5" />
                <span>Maps</span>
              </motion.a>
              <motion.a
                href={`https://waze.com/ul?q=${encodeURIComponent(wedding.venueAddress)}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all"
                style={{
                  background: 'transparent',
                  color: '#00FFFF',
                  border: '1px solid #00FFFF'
                }}
                whileHover={{
                  background: 'rgba(0,255,255,0.2)',
                  boxShadow: '0 0 20px rgba(0,255,255,0.4)'
                }}
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
              themeColor="#FFD700"
            />
          </motion.div>
        )}

        {/* Gift section */}
        {wedding.enableBitGifts && wedding.bitPhone && (
          <motion.div
            className="mt-6 p-6 rounded-lg text-center"
            style={{
              background: 'rgba(26, 26, 46, 0.8)',
              border: '1px solid rgba(255,215,0,0.3)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <h3 className="text-lg mb-2" style={{ color: '#FFD700' }}>🎷 רוצים לשלוח מתנה?</h3>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>תודה מראש על המחשבה</p>

            <a
              href={wedding.bitPhone}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:shadow-[0_0_20px_rgba(255,215,0,0.4)]"
              style={{
                background: 'transparent',
                color: '#FFD700',
                border: '1px solid #FFD700'
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
          animate={{ opacity: 0.5 }}
          transition={{ delay: 2 }}
        >
          <span style={{ fontSize: '2rem' }}>🎵</span>
        </motion.div>
      </div>
    </div>
  );
}
