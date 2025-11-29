'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation, Heart } from 'lucide-react';
import { RSVPForm } from '../RSVPForm';
import type { InvitationTemplateProps } from './types';

// Twinkling star component
const Star = ({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      left: x,
      top: y,
      width: size,
      height: size,
      background: '#FFFFFF'
    }}
    animate={{
      opacity: [0.3, 1, 0.3],
      scale: [1, 1.2, 1]
    }}
    transition={{
      duration: 2 + Math.random() * 2,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  />
);

// Shooting star component
const ShootingStar = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{
      top: `${Math.random() * 30}%`,
      right: '-10%',
      width: '100px',
      height: '2px',
      background: 'linear-gradient(90deg, transparent, #00D9FF, #FFFFFF)',
      borderRadius: '2px',
      boxShadow: '0 0 10px #00D9FF, 0 0 20px #00D9FF'
    }}
    initial={{ x: 0, y: 0, opacity: 0 }}
    animate={{
      x: [-100, -400],
      y: [0, 200],
      opacity: [0, 1, 0]
    }}
    transition={{
      duration: 1.5,
      delay,
      repeat: Infinity,
      repeatDelay: 8 + Math.random() * 5
    }}
  />
);

// Nebula cloud component
const Nebula = ({ color, x, y, size }: { color: string; x: string; y: string; size: number }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      left: x,
      top: y,
      width: size,
      height: size,
      background: color,
      filter: 'blur(50px)'
    }}
    animate={{
      opacity: [0.4, 0.6, 0.4],
      scale: [1, 1.1, 1]
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
);

export default function CosmicGalaxyTemplate({ wedding, guest, dateParts, isRSVP = false, askAboutMeals }: InvitationTemplateProps) {
  const handleNavigation = () => {
    if (wedding.venueCoordinates) {
      const { lat, lng } = wedding.venueCoordinates;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`, '_blank');
    }
  };

  // Generate stars
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    size: 1 + Math.random() * 3,
    delay: Math.random() * 3
  }));

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0B0B2B 0%, #1A0A2E 40%, #0D0D2B 100%)'
      }}
      dir="rtl"
    >
      {/* Nebula clouds */}
      <Nebula color="rgba(123, 45, 142, 0.3)" x="10%" y="20%" size={300} />
      <Nebula color="rgba(255, 107, 157, 0.2)" x="70%" y="10%" size={250} />
      <Nebula color="rgba(0, 217, 255, 0.15)" x="50%" y="60%" size={350} />
      <Nebula color="rgba(123, 45, 142, 0.2)" x="20%" y="70%" size={200} />

      {/* Stars */}
      {stars.map((star) => (
        <Star key={star.id} x={star.x} y={star.y} size={star.size} delay={star.delay} />
      ))}

      {/* Shooting stars */}
      <ShootingStar delay={2} />
      <ShootingStar delay={7} />
      <ShootingStar delay={12} />

      {/* Galaxy spiral hint in background */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-10"
        style={{
          background: 'conic-gradient(from 0deg, transparent, rgba(123,45,142,0.3), transparent, rgba(0,217,255,0.2), transparent)'
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">

        {/* Welcome text */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <span
            className="text-sm tracking-[0.3em]"
            style={{
              color: '#00D9FF',
              fontFamily: "'Secular One', sans-serif",
              textShadow: '0 0 10px rgba(0,217,255,0.5)'
            }}
          >
            הנכם מוזמנים
          </span>
        </motion.div>

        {/* Media */}
        {wedding.mediaUrl && (
          <motion.div
            className="relative mx-auto mb-8 max-w-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            {/* Glow ring */}
            <motion.div
              className="absolute -inset-4 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, #7B2D8E, #FF6B9D, #00D9FF, #7B2D8E)',
                filter: 'blur(15px)',
                opacity: 0.6
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />

            <div
              className="relative rounded-full overflow-hidden"
              style={{
                border: '2px solid rgba(0,217,255,0.5)',
                boxShadow: '0 0 30px rgba(0,217,255,0.3), inset 0 0 30px rgba(123,45,142,0.2)'
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

        {/* Names with glow effect */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-2"
            style={{
              fontFamily: "'Secular One', sans-serif",
              color: '#FFFFFF',
              textShadow: '0 0 20px rgba(0,217,255,0.8), 0 0 40px rgba(0,217,255,0.4)'
            }}
            animate={{
              textShadow: [
                '0 0 20px rgba(0,217,255,0.8), 0 0 40px rgba(0,217,255,0.4)',
                '0 0 30px rgba(0,217,255,1), 0 0 60px rgba(0,217,255,0.6)',
                '0 0 20px rgba(0,217,255,0.8), 0 0 40px rgba(0,217,255,0.4)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {wedding.groomName}
          </motion.h1>

          <motion.div
            className="flex items-center justify-center gap-3 my-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
          >
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #FF6B9D)' }} />
            <Heart
              className="w-6 h-6"
              style={{ color: '#FF6B9D', filter: 'drop-shadow(0 0 10px #FF6B9D)' }}
              fill="#FF6B9D"
            />
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, #FF6B9D, transparent)' }} />
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl font-bold"
            style={{
              fontFamily: "'Secular One', sans-serif",
              color: '#FFFFFF',
              textShadow: '0 0 20px rgba(255,107,157,0.8), 0 0 40px rgba(255,107,157,0.4)'
            }}
            animate={{
              textShadow: [
                '0 0 20px rgba(255,107,157,0.8), 0 0 40px rgba(255,107,157,0.4)',
                '0 0 30px rgba(255,107,157,1), 0 0 60px rgba(255,107,157,0.6)',
                '0 0 20px rgba(255,107,157,0.8), 0 0 40px rgba(255,107,157,0.4)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
          >
            {wedding.brideName}
          </motion.h1>
        </motion.div>

        {/* Invitation text */}
        <motion.p
          className="text-center text-lg mb-8"
          style={{
            color: 'rgba(255,255,255,0.8)',
            fontFamily: "'Heebo', sans-serif"
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {wedding.description || 'מים רבים לא יוכלו לכבות את האהבה ונהרות לא ישטפוה'}
        </motion.p>

        {/* Date card */}
        <motion.div
          className="rounded-2xl p-6 mb-6 text-center relative overflow-hidden"
          style={{
            background: 'rgba(11, 11, 43, 0.8)',
            border: '1px solid rgba(0,217,255,0.3)',
            boxShadow: '0 0 30px rgba(123,45,142,0.3)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div
            className="text-5xl font-bold mb-2"
            style={{
              color: '#00D9FF',
              fontFamily: "'Secular One', sans-serif",
              textShadow: '0 0 20px rgba(0,217,255,0.6)'
            }}
          >
            {dateParts.day}
          </div>
          <div className="text-xl mb-1 text-white">
            {dateParts.month} {dateParts.year}
          </div>
          <div className="text-lg mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {dateParts.weekday}
          </div>
          <div
            className="text-sm px-4 py-1 rounded-full inline-block"
            style={{
              background: 'rgba(123,45,142,0.4)',
              color: '#FF6B9D',
              border: '1px solid rgba(255,107,157,0.3)'
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
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{
              background: 'rgba(11, 11, 43, 0.6)',
              border: '1px solid rgba(0,217,255,0.2)'
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(0,217,255,0.2)',
                boxShadow: '0 0 15px rgba(0,217,255,0.3)'
              }}
            >
              <Clock className="w-6 h-6" style={{ color: '#00D9FF' }} />
            </div>
            <div className="flex-1">
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>קבלת פנים</div>
              <div className="text-xl text-white">{wedding.eventTime}</div>
            </div>
          </div>

          {/* Chuppah time */}
          {wedding.chuppahTime && (
            <div
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{
                background: 'rgba(11, 11, 43, 0.6)',
                border: '1px solid rgba(255,107,157,0.2)'
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
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>חופה</div>
                <div className="text-xl text-white">{wedding.chuppahTime}</div>
              </div>
            </div>
          )}

          {/* Location */}
          <div
            className="p-4 rounded-xl"
            style={{
              background: 'rgba(11, 11, 43, 0.6)',
              border: '1px solid rgba(123,45,142,0.3)'
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(123,45,142,0.3)',
                  boxShadow: '0 0 15px rgba(123,45,142,0.3)'
                }}
              >
                <MapPin className="w-6 h-6" style={{ color: '#7B2D8E' }} />
              </div>
              <div className="flex-1">
                <div className="text-xl text-white">{wedding.venue}</div>
                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{wedding.venueAddress}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-medium"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,217,255,0.3), rgba(123,45,142,0.3))',
                  color: '#00D9FF',
                  border: '1px solid rgba(0,217,255,0.4)'
                }}
                whileHover={{
                  boxShadow: '0 0 25px rgba(0,217,255,0.5)',
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
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-medium"
                style={{
                  background: 'linear-gradient(135deg, rgba(123,45,142,0.3), rgba(0,217,255,0.3))',
                  color: '#00D9FF',
                  border: '1px solid rgba(123,45,142,0.4)'
                }}
                whileHover={{
                  boxShadow: '0 0 25px rgba(123,45,142,0.5)',
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
              themeColor="#00D9FF"
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
              background: 'rgba(11, 11, 43, 0.8)',
              border: '1px solid rgba(0,217,255,0.3)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <h3 className="text-lg mb-2 text-white">✨ רוצים לשלוח מתנה?</h3>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>תודה מראש על המחשבה</p>

            <a
              href={wedding.bitPhone}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(0,217,255,0.3), rgba(255,107,157,0.3))',
                color: '#00D9FF',
                border: '1px solid rgba(0,217,255,0.4)'
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
          transition={{ delay: 2 }}
        >
          <span style={{ fontSize: '1.5rem' }}>🌌</span>
        </motion.div>
      </div>
    </div>
  );
}
