'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation, Heart } from 'lucide-react';
import { RSVPForm } from '../RSVPForm';
import type { InvitationTemplateProps } from './types';

// Palm leaf component
const PalmLeaf = ({ side, delay }: { side: 'left' | 'right'; delay: number }) => (
  <motion.svg
    className={`absolute top-0 ${side === 'left' ? 'left-0' : 'right-0'} w-32 h-48 pointer-events-none`}
    viewBox="0 0 100 150"
    style={{ transform: side === 'right' ? 'scaleX(-1)' : undefined }}
    initial={{ opacity: 0, x: side === 'left' ? -50 : 50 }}
    animate={{ opacity: 0.8, x: 0 }}
    transition={{ delay, duration: 1 }}
  >
    <motion.path
      d="M50,150 Q30,100 10,50 Q20,60 30,40 Q25,70 40,60 Q30,90 50,80 Q35,110 50,100 Q40,130 50,150"
      fill="#2D5A27"
      animate={{ rotate: [0, 3, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.path
      d="M50,150 Q70,100 90,50 Q80,60 70,40 Q75,70 60,60 Q70,90 50,80 Q65,110 50,100 Q60,130 50,150"
      fill="#3D7A37"
      animate={{ rotate: [0, -3, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
    />
  </motion.svg>
);

// Floating flower component
const FloatingFlower = ({ x, delay, color }: { x: string; delay: number; color: string }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: x, top: '20%' }}
    initial={{ y: 0, opacity: 0 }}
    animate={{
      y: [0, -15, 5, -10, 0],
      rotate: [0, 5, -5, 3, 0],
      opacity: 1
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  >
    <svg width="40" height="40" viewBox="0 0 40 40">
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <ellipse
          key={i}
          cx="20"
          cy="10"
          rx="8"
          ry="10"
          fill={color}
          transform={`rotate(${angle} 20 20)`}
          opacity="0.9"
        />
      ))}
      <circle cx="20" cy="20" r="6" fill="#FFCD38" />
    </svg>
  </motion.div>
);

export default function TropicalParadiseTemplate({ wedding, guest, dateParts, isRSVP = false }: InvitationTemplateProps) {
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
        background: 'linear-gradient(180deg, #87CEEB 0%, #20E3B2 30%, #FFE4B5 70%, #FF9966 100%)'
      }}
      dir="rtl"
    >
      {/* Palm leaves */}
      <PalmLeaf side="left" delay={0.2} />
      <PalmLeaf side="right" delay={0.4} />

      {/* Floating flowers */}
      <FloatingFlower x="10%" delay={0} color="#FF6F91" />
      <FloatingFlower x="85%" delay={1} color="#FF6F91" />
      <FloatingFlower x="15%" delay={2} color="#FFB6C1" />
      <FloatingFlower x="80%" delay={3} color="#FFB6C1" />

      {/* Wave at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
          <motion.path
            d="M0,40 C200,80 400,0 600,40 C800,80 1000,0 1200,40 L1200,120 L0,120 Z"
            fill="rgba(32, 227, 178, 0.4)"
            animate={{
              d: [
                "M0,40 C200,80 400,0 600,40 C800,80 1000,0 1200,40 L1200,120 L0,120 Z",
                "M0,40 C200,0 400,80 600,40 C800,0 1000,80 1200,40 L1200,120 L0,120 Z",
                "M0,40 C200,80 400,0 600,40 C800,80 1000,0 1200,40 L1200,120 L0,120 Z"
              ]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">

        {/* Hero Card - Names + Photo integrated */}
        <motion.div
          className="rounded-3xl overflow-hidden mb-6"
          style={{
            background: 'rgba(255,255,255,0.95)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Welcome banner */}
          <div
            className="py-3 text-center"
            style={{
              background: 'linear-gradient(90deg, #FF6F91, #20E3B2)',
            }}
          >
            <span
              className="text-lg font-bold text-white"
              style={{ fontFamily: "'Karantina', sans-serif", letterSpacing: '0.1em' }}
            >
              🌺 {guest ? `${guest.name} מוזמנים` : 'הנכם מוזמנים'} 🌺
            </span>
          </div>

          {/* Content grid */}
          <div className="grid md:grid-cols-2">
            {/* Media side */}
            {wedding.mediaUrl && (
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
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
              </motion.div>
            )}

            {/* Names + Date side */}
            <div className="p-6 flex flex-col justify-center items-center text-center">
              <motion.h1
                className="text-4xl md:text-5xl font-bold mb-1"
                style={{
                  fontFamily: "'Karantina', sans-serif",
                  color: '#FF6F91'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {wedding.groomName}
              </motion.h1>

              <motion.div
                className="flex items-center justify-center gap-2 my-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5, type: "spring" }}
              >
                <span className="text-xl">🌴</span>
                <Heart className="w-5 h-5" style={{ color: '#FF6F91' }} fill="#FF6F91" />
                <span className="text-xl">🌴</span>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{
                  fontFamily: "'Karantina', sans-serif",
                  color: '#20E3B2'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                {wedding.brideName}
              </motion.h1>

              {/* Mini date display */}
              <motion.div
                className="mt-2 p-3 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(255,111,145,0.1), rgba(32,227,178,0.1))' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="text-3xl font-bold" style={{ color: '#FF6F91', fontFamily: "'Karantina', sans-serif" }}>
                  {dateParts.day}.{dateParts.month}.{dateParts.year}
                </div>
                <div className="text-sm" style={{ color: '#666' }}>{dateParts.weekday}</div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Invitation text */}
        <motion.p
          className="text-center text-lg mb-6 px-4"
          style={{
            color: '#2D5A27',
            fontFamily: "'Assistant', sans-serif"
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {wedding.description || 'מים רבים לא יוכלו לכבות את האהבה ונהרות לא ישטפוה'}
        </motion.p>

        {/* Date card - Horizontal style */}
        <motion.div
          className="flex items-stretch gap-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          {/* Day */}
          <div
            className="flex-1 rounded-2xl p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.9)' }}
          >
            <div className="text-5xl font-bold" style={{ color: '#FF6F91', fontFamily: "'Karantina', sans-serif" }}>
              {dateParts.day}
            </div>
            <div className="text-sm" style={{ color: '#666' }}>יום</div>
          </div>
          {/* Month + Year */}
          <div
            className="flex-1 rounded-2xl p-4 text-center flex flex-col justify-center"
            style={{ background: 'rgba(255,255,255,0.9)' }}
          >
            <div className="text-xl font-bold" style={{ color: '#2D5A27' }}>{dateParts.month}</div>
            <div className="text-lg" style={{ color: '#20E3B2' }}>{dateParts.year}</div>
          </div>
          {/* Hebrew date */}
          <div
            className="flex-1 rounded-2xl p-4 text-center flex flex-col justify-center"
            style={{ background: '#20E3B2' }}
          >
            <div className="text-sm text-white font-bold">{dateParts.hebrewDate}</div>
            <div className="text-xs text-white/80">{dateParts.weekday}</div>
          </div>
        </motion.div>

        {/* Event Details Card - Unified design */}
        <motion.div
          className="rounded-3xl overflow-hidden mb-6"
          style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          {/* Times row */}
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            {/* Reception time */}
            <div className="p-5 text-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ background: '#FF6F91' }}
              >
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs mb-1" style={{ color: '#666' }}>קבלת פנים</div>
              <div className="text-2xl font-bold" style={{ color: '#2D5A27', fontFamily: "'Karantina', sans-serif" }}>{wedding.eventTime}</div>
            </div>

            {/* Chuppah time */}
            <div className="p-5 text-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ background: '#FFCD38' }}
              >
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs mb-1" style={{ color: '#666' }}>חופה</div>
              <div className="text-2xl font-bold" style={{ color: '#2D5A27', fontFamily: "'Karantina', sans-serif" }}>{wedding.chuppahTime || '—'}</div>
            </div>
          </div>

          {/* Divider with palm */}
          <div className="flex items-center justify-center py-2" style={{ background: 'rgba(32,227,178,0.1)' }}>
            <span className="text-lg">🌴🌺🌴</span>
          </div>

          {/* Location section */}
          <div className="p-5">
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #20E3B2, #2D5A27)' }}
              >
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl font-bold mb-1" style={{ color: '#2D5A27' }}>{wedding.venue}</div>
                <div className="text-sm" style={{ color: '#666' }}>{wedding.venueAddress}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #FF6F91, #FF9966)' }}
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
                style={{ background: 'linear-gradient(135deg, #20E3B2, #2D5A27)' }}
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
            <RSVPForm guest={guest} themeColor="#20E3B2" />
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
            <h3 className="text-lg font-bold mb-2" style={{ color: '#2D5A27' }}>🍍 רוצים לשלוח מתנה?</h3>
            <p className="text-sm mb-4" style={{ color: '#666' }}>תודה מראש על המחשבה</p>

            <a
              href={wedding.bitPhone}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #20E3B2, #87CEEB)' }}
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
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <span className="text-3xl">🌺🌴🦩🌴🌺</span>
        </motion.div>
      </div>
    </div>
  );
}
