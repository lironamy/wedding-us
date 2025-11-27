'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation, Heart } from 'lucide-react';
import { RSVPForm } from '../RSVPForm';
import type { InvitationTemplateProps } from './types';

// Firefly particle component
const Firefly = ({ delay, x, y }: { delay: number; x: string; y: string }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-full pointer-events-none"
    style={{
      left: x,
      top: y,
      background: 'radial-gradient(circle, #FFE87C 0%, rgba(255,232,124,0) 70%)',
      boxShadow: '0 0 10px #FFE87C, 0 0 20px #FFE87C'
    }}
    animate={{
      opacity: [0.2, 1, 0.2],
      scale: [0.8, 1.2, 0.8],
    }}
    transition={{
      duration: 3 + Math.random() * 2,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  />
);

// Floating mist component
const Mist = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
    style={{
      background: 'linear-gradient(to top, rgba(255,255,255,0.15), transparent)'
    }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: [0.3, 0.5, 0.3], y: [20, 0, 20] }}
    transition={{
      duration: 8,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  />
);

// Branch decoration
const Branch = ({ side }: { side: 'left' | 'right' }) => (
  <motion.svg
    className={`absolute top-0 ${side === 'left' ? 'left-0' : 'right-0'} w-24 h-48 pointer-events-none`}
    viewBox="0 0 100 200"
    style={{ transform: side === 'right' ? 'scaleX(-1)' : undefined }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.6 }}
    transition={{ duration: 2 }}
  >
    <motion.path
      d="M0,0 Q30,50 20,100 Q10,150 30,200"
      fill="none"
      stroke="#2D4A3E"
      strokeWidth="3"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 3, ease: "easeOut" }}
    />
    {[30, 60, 90, 120, 150].map((y, i) => (
      <motion.ellipse
        key={i}
        cx={20 + (i % 2) * 15}
        cy={y}
        rx="12"
        ry="6"
        fill="#3D5A4C"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.7, scale: 1 }}
        transition={{ delay: 1 + i * 0.3, duration: 0.5 }}
        transform={`rotate(${i % 2 === 0 ? -20 : 20} ${20 + (i % 2) * 15} ${y})`}
      />
    ))}
  </motion.svg>
);

export default function EnchantedForestTemplate({ wedding, guest, dateParts, isRSVP = false }: InvitationTemplateProps) {
  const handleNavigation = () => {
    if (wedding.venueCoordinates) {
      const { lat, lng } = wedding.venueCoordinates;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`, '_blank');
    }
  };

  // Generate fireflies
  const fireflies = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    delay: Math.random() * 3
  }));

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #1a2f23 0%, #243b2f 30%, #1e3329 60%, #152822 100%)'
      }}
      dir="rtl"
    >
      {/* Mist layers */}
      <Mist delay={0} />
      <Mist delay={2} />

      {/* Branches */}
      <Branch side="left" />
      <Branch side="right" />

      {/* Fireflies */}
      {fireflies.map((firefly) => (
        <Firefly key={firefly.id} x={firefly.x} y={firefly.y} delay={firefly.delay} />
      ))}

      {/* Main content */}
      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">

        {/* Welcome text */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1 }}
        >
          <span
            className="text-lg tracking-widest"
            style={{
              color: '#A8C5A8',
              fontFamily: "'Bellefair', serif"
            }}
          >
            {guest ? `${guest.name} מוזמנים` : 'הנכם מוזמנים'}
          </span>
        </motion.div>

        {/* Media */}
        {wedding.mediaUrl && (
          <motion.div
            className="relative mx-auto mb-6 max-w-sm"
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                border: '2px solid rgba(168, 197, 168, 0.4)',
                boxShadow: '0 0 30px rgba(168, 197, 168, 0.2)'
              }}
            />

            {wedding.mediaType === 'video' ? (
              <video
                src={wedding.mediaUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full aspect-square object-cover rounded-2xl"
              />
            ) : (
              <img
                src={wedding.mediaUrl}
                alt={`${wedding.groomName} & ${wedding.brideName}`}
                className="w-full aspect-square object-cover rounded-2xl"
                style={wedding.mediaPosition ? {
                  objectPosition: `${wedding.mediaPosition.x}% ${wedding.mediaPosition.y}%`
                } : undefined}
              />
            )}
          </motion.div>
        )}

        {/* Names */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <h1
            className="text-4xl md:text-5xl font-bold mb-2"
            style={{
              fontFamily: "'Bellefair', serif",
              color: '#E8F0E8',
              textShadow: '0 0 20px rgba(168, 197, 168, 0.5)'
            }}
          >
            {wedding.groomName}
          </h1>

          <motion.div
            className="flex items-center justify-center gap-3 my-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7, type: "spring" }}
          >
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #A8C5A8, transparent)' }} />
            <Heart className="w-5 h-5" style={{ color: '#FFE87C' }} fill="#FFE87C" />
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #A8C5A8, transparent)' }} />
          </motion.div>

          <h1
            className="text-4xl md:text-5xl font-bold"
            style={{
              fontFamily: "'Bellefair', serif",
              color: '#E8F0E8',
              textShadow: '0 0 20px rgba(168, 197, 168, 0.5)'
            }}
          >
            {wedding.brideName}
          </h1>
        </motion.div>

        {/* Invitation text */}
        <motion.p
          className="text-center text-lg mb-8"
          style={{
            color: '#A8C5A8',
            fontFamily: "'Assistant', sans-serif"
          }}
          initial={{ opacity: 0, filter: 'blur(5px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          {wedding.description || 'מים רבים לא יוכלו לכבות את האהבה ונהרות לא ישטפוה'}
        </motion.p>

        {/* Date card */}
        <motion.div
          className="rounded-2xl p-6 mb-6 text-center relative overflow-hidden"
          style={{
            background: 'rgba(45, 74, 62, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(168, 197, 168, 0.3)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div
            className="text-5xl font-bold mb-2"
            style={{ color: '#FFE87C', fontFamily: "'Bellefair', serif" }}
          >
            {dateParts.day}
          </div>
          <div
            className="text-xl mb-1"
            style={{ color: '#E8F0E8' }}
          >
            {dateParts.month} {dateParts.year}
          </div>
          <div
            className="text-lg mb-3"
            style={{ color: '#A8C5A8' }}
          >
            {dateParts.weekday}
          </div>
          <div
            className="text-sm px-4 py-1 rounded-full inline-block"
            style={{
              background: 'rgba(168, 197, 168, 0.2)',
              color: '#E8F0E8',
              border: '1px solid rgba(168, 197, 168, 0.3)'
            }}
          >
            {dateParts.hebrewDate}
          </div>
        </motion.div>

        {/* Time and Location */}
        <motion.div
          className="space-y-4 mb-6"
          initial={{ opacity: 0, filter: 'blur(5px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          {/* Reception time */}
          <div
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{
              background: 'rgba(45, 74, 62, 0.5)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(168, 197, 168, 0.2)'
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(168, 197, 168, 0.3)' }}
            >
              <Clock className="w-6 h-6" style={{ color: '#FFE87C' }} />
            </div>
            <div className="flex-1">
              <div className="text-sm" style={{ color: '#A8C5A8' }}>קבלת פנים</div>
              <div className="text-xl font-bold" style={{ color: '#E8F0E8' }}>{wedding.eventTime}</div>
            </div>
          </div>

          {/* Chuppah time */}
          {wedding.chuppahTime && (
            <div
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{
                background: 'rgba(45, 74, 62, 0.5)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(168, 197, 168, 0.2)'
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(168, 197, 168, 0.3)' }}
              >
                <Heart className="w-6 h-6" style={{ color: '#FFE87C' }} />
              </div>
              <div className="flex-1">
                <div className="text-sm" style={{ color: '#A8C5A8' }}>חופה</div>
                <div className="text-xl font-bold" style={{ color: '#E8F0E8' }}>{wedding.chuppahTime}</div>
              </div>
            </div>
          )}

          {/* Location */}
          <div
            className="p-4 rounded-xl"
            style={{
              background: 'rgba(45, 74, 62, 0.5)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(168, 197, 168, 0.2)'
            }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(168, 197, 168, 0.3)' }}
              >
                <MapPin className="w-6 h-6" style={{ color: '#FFE87C' }} />
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold" style={{ color: '#E8F0E8' }}>{wedding.venue}</div>
                <div className="text-sm" style={{ color: '#A8C5A8' }}>{wedding.venueAddress}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-medium"
                style={{
                  background: 'rgba(168, 197, 168, 0.3)',
                  color: '#E8F0E8',
                  border: '1px solid rgba(168, 197, 168, 0.4)'
                }}
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(168, 197, 168, 0.3)' }}
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
                  background: 'rgba(168, 197, 168, 0.3)',
                  color: '#E8F0E8',
                  border: '1px solid rgba(168, 197, 168, 0.4)'
                }}
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(168, 197, 168, 0.3)' }}
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
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            <RSVPForm
              guest={guest}
              themeColor="#A8C5A8"
            />
          </motion.div>
        )}

        {/* Gift section */}
        {wedding.enableBitGifts && wedding.bitPhone && (
          <motion.div
            className="mt-6 p-6 rounded-2xl text-center"
            style={{
              background: 'rgba(45, 74, 62, 0.6)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(168, 197, 168, 0.3)'
            }}
            initial={{ opacity: 0, filter: 'blur(5px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ delay: 1.6, duration: 0.8 }}
          >
            <h3 className="text-xl font-bold mb-2" style={{ color: '#E8F0E8' }}>רוצים לשלוח מתנה?</h3>
            <p className="text-sm mb-4" style={{ color: '#A8C5A8' }}>תודה מראש על המחשבה</p>

            <a
              href={wedding.bitPhone}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all"
              style={{
                background: 'rgba(168, 197, 168, 0.3)',
                color: '#E8F0E8',
                border: '1px solid rgba(168, 197, 168, 0.4)'
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
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, #A8C5A8)' }} />
            <span style={{ color: '#FFE87C' }}>✨</span>
            <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, #A8C5A8, transparent)' }} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
