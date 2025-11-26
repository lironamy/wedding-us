'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation, Heart } from 'lucide-react';
import { RSVPForm } from '../RSVPForm';
import type { InvitationTemplateProps } from './types';

// Wave animation component
const Wave = ({ delay, opacity }: { delay: number; opacity: number }) => (
  <motion.div
    className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
    initial={{ opacity: 0 }}
    animate={{ opacity }}
    transition={{ delay, duration: 1 }}
  >
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
      <motion.path
        d="M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z"
        fill="rgba(64, 224, 208, 0.3)"
        animate={{
          d: [
            "M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z",
            "M0,60 C200,0 400,120 600,60 C800,0 1000,120 1200,60 L1200,120 L0,120 Z",
            "M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z"
          ]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay
        }}
      />
    </svg>
  </motion.div>
);

// Floating pearl/bubble component
const Pearl = ({ x, delay, size }: { x: string; delay: number; size: number }) => (
  <motion.div
    className="absolute pointer-events-none rounded-full"
    style={{
      left: x,
      bottom: '10%',
      width: size,
      height: size,
      background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.3), transparent)',
      boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.1), 0 0 10px rgba(255,255,255,0.5)'
    }}
    initial={{ y: 0, opacity: 0 }}
    animate={{ y: -300, opacity: [0, 1, 1, 0] }}
    transition={{
      duration: 8,
      repeat: Infinity,
      delay,
      ease: "easeOut"
    }}
  />
);

// Shell decoration component
const Shell = ({ side, top }: { side: 'left' | 'right'; top: string }) => (
  <motion.svg
    className={`absolute ${side === 'left' ? 'left-4' : 'right-4'} w-12 h-12 pointer-events-none`}
    style={{ top }}
    viewBox="0 0 50 50"
    initial={{ opacity: 0, scale: 0, rotate: side === 'left' ? -30 : 30 }}
    animate={{ opacity: 0.6, scale: 1, rotate: 0 }}
    transition={{ duration: 1, delay: 0.5 }}
  >
    <path
      d="M25,5 Q40,15 45,30 Q40,45 25,48 Q10,45 5,30 Q10,15 25,5"
      fill="none"
      stroke="#E8C4A0"
      strokeWidth="2"
    />
    {[10, 15, 20, 25, 30, 35, 40].map((angle, i) => (
      <motion.line
        key={i}
        x1="25"
        y1="5"
        x2={25 + (i - 3) * 3}
        y2="48"
        stroke="#E8C4A0"
        strokeWidth="1"
        opacity="0.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
      />
    ))}
  </motion.svg>
);

export default function BeachShellsTemplate({ wedding, guest, dateParts, isRSVP = false }: InvitationTemplateProps) {
  const handleNavigation = () => {
    if (wedding.venueCoordinates) {
      const { lat, lng } = wedding.venueCoordinates;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`, '_blank');
    }
  };

  // Generate pearls
  const pearls = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: `${10 + Math.random() * 80}%`,
    delay: Math.random() * 5,
    size: 8 + Math.random() * 12
  }));

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #E0F4FF 0%, #F5E6D3 40%, #FFF8F0 100%)'
      }}
      dir="rtl"
    >
      {/* Sand texture at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #E8D4B8 0%, #F5E6D3 50%, transparent 100%)',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundBlendMode: 'soft-light',
          opacity: 0.5
        }}
      />

      {/* Waves */}
      <Wave delay={0} opacity={0.4} />
      <Wave delay={0.5} opacity={0.3} />

      {/* Pearls */}
      {pearls.map((pearl) => (
        <Pearl key={pearl.id} x={pearl.x} delay={pearl.delay} size={pearl.size} />
      ))}

      {/* Shell decorations */}
      <Shell side="left" top="20%" />
      <Shell side="right" top="35%" />
      <Shell side="left" top="60%" />

      {/* Main content */}
      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">

        {/* Welcome text */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span
            className="text-lg tracking-widest"
            style={{
              color: '#5D9B9B',
              fontFamily: "'Cormorant Garamond', serif"
            }}
          >
            {guest ? `${guest.name} מוזמנים` : 'הנכם מוזמנים'}
          </span>
        </motion.div>

        {/* Media */}
        {wedding.mediaUrl && (
          <motion.div
            className="relative mx-auto mb-6 max-w-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div
              className="absolute -inset-3 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.3), rgba(255, 215, 0, 0.3))',
                filter: 'blur(20px)'
              }}
            />

            {wedding.mediaType === 'video' ? (
              <video
                src={wedding.mediaUrl}
                autoPlay
                loop
                muted
                playsInline
                className="relative w-full aspect-square object-cover rounded-full border-4 border-white shadow-xl"
              />
            ) : (
              <img
                src={wedding.mediaUrl}
                alt={`${wedding.groomName} & ${wedding.brideName}`}
                className="relative w-full aspect-square object-cover rounded-full border-4 border-white shadow-xl"
              />
            )}

            {/* Pearl decorations around image */}
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, white, #F5E6D3)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  left: `calc(50% + ${Math.cos((angle * Math.PI) / 180) * 52}%)`,
                  top: `calc(50% + ${Math.sin((angle * Math.PI) / 180) * 52}%)`,
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              />
            ))}
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
            className="text-4xl md:text-5xl font-light mb-2"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: '#3D7A7A'
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
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #5D9B9B)' }} />
            <span style={{ color: '#DAA520', fontSize: '1.5rem' }}>🐚</span>
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, #5D9B9B, transparent)' }} />
          </motion.div>

          <h1
            className="text-4xl md:text-5xl font-light"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: '#3D7A7A'
            }}
          >
            {wedding.brideName}
          </h1>
        </motion.div>

        {/* Invitation text */}
        <motion.p
          className="text-center text-lg mb-8"
          style={{
            color: '#5D9B9B',
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
          className="rounded-2xl p-6 mb-6 text-center relative overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 40px rgba(93, 155, 155, 0.2)',
            border: '1px solid rgba(93, 155, 155, 0.2)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div
            className="text-5xl font-light mb-2"
            style={{ color: '#40E0D0', fontFamily: "'Cormorant Garamond', serif" }}
          >
            {dateParts.day}
          </div>
          <div
            className="text-xl mb-1"
            style={{ color: '#3D7A7A' }}
          >
            {dateParts.month} {dateParts.year}
          </div>
          <div
            className="text-lg mb-3"
            style={{ color: '#5D9B9B' }}
          >
            {dateParts.weekday}
          </div>
          <div
            className="text-sm px-4 py-1 rounded-full inline-block"
            style={{
              background: 'linear-gradient(90deg, rgba(64, 224, 208, 0.2), rgba(218, 165, 32, 0.2))',
              color: '#5D9B9B'
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
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #40E0D0, #5D9B9B)' }}
            >
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm" style={{ color: '#5D9B9B' }}>קבלת פנים</div>
              <div className="text-xl font-bold" style={{ color: '#3D7A7A' }}>{wedding.eventTime}</div>
            </div>
          </div>

          {/* Chuppah time */}
          {wedding.chuppahTime && (
            <div
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #DAA520, #E8C4A0)' }}
              >
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm" style={{ color: '#5D9B9B' }}>חופה</div>
                <div className="text-xl font-bold" style={{ color: '#3D7A7A' }}>{wedding.chuppahTime}</div>
              </div>
            </div>
          )}

          {/* Location */}
          <div
            className="p-4 rounded-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #E8C4A0, #DAA520)' }}
              >
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold" style={{ color: '#3D7A7A' }}>{wedding.venue}</div>
                <div className="text-sm" style={{ color: '#5D9B9B' }}>{wedding.venueAddress}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-white font-medium"
                style={{
                  background: 'linear-gradient(135deg, #40E0D0, #5D9B9B)'
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
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-white font-medium"
                style={{
                  background: 'linear-gradient(135deg, #5D9B9B, #3D7A7A)'
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
              themeColor="#40E0D0"
            />
          </motion.div>
        )}

        {/* Gift section */}
        {wedding.enableBitGifts && wedding.bitPhone && (
          <motion.div
            className="mt-6 p-6 rounded-2xl text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(93, 155, 155, 0.2)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <h3 className="text-xl font-bold mb-2" style={{ color: '#3D7A7A' }}>🐚 רוצים לשלוח מתנה?</h3>
            <p className="text-sm mb-4" style={{ color: '#5D9B9B' }}>תודה מראש על המחשבה</p>

            <a
              href={wedding.bitPhone}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium"
              style={{
                background: 'linear-gradient(135deg, #40E0D0, #5D9B9B)'
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
          <span style={{ color: '#5D9B9B', fontSize: '1.5rem' }}>🌊 ⚓ 🌊</span>
        </motion.div>
      </div>
    </div>
  );
}
