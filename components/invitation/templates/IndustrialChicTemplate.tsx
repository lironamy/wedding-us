'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation, Heart } from 'lucide-react';
import { RSVPForm } from '../RSVPForm';
import type { InvitationTemplateProps } from './types';

// Rotating gear component
const Gear = ({ size, x, y, direction, delay }: { size: number; x: string; y: string; direction: 1 | -1; delay: number }) => (
  <motion.svg
    className="absolute pointer-events-none"
    style={{ left: x, top: y, width: size, height: size }}
    viewBox="0 0 100 100"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 0.15, scale: 1, rotate: direction * 360 }}
    transition={{
      opacity: { delay, duration: 0.5 },
      scale: { delay, duration: 0.5 },
      rotate: { duration: 20, repeat: Infinity, ease: "linear" }
    }}
  >
    <path
      d="M50 15 L55 15 L57 5 L65 7 L63 17 L70 22 L78 15 L83 22 L75 28 L78 35 L88 33 L90 42 L80 45 L80 55 L90 58 L88 67 L78 65 L75 72 L83 78 L78 85 L70 78 L63 83 L65 93 L57 95 L55 85 L45 85 L43 95 L35 93 L37 83 L30 78 L22 85 L17 78 L25 72 L22 65 L12 67 L10 58 L20 55 L20 45 L10 42 L12 33 L22 35 L25 28 L17 22 L22 15 L30 22 L37 17 L35 7 L43 5 L45 15 Z"
      fill="#8B4513"
    />
    <circle cx="50" cy="50" r="20" fill="#F5F5F5" />
  </motion.svg>
);

// Edison bulb component
const EdisonBulb = ({ x, delay }: { x: string; delay: number }) => (
  <motion.div
    className="absolute top-0 pointer-events-none"
    style={{ left: x }}
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <svg width="30" height="80" viewBox="0 0 30 80">
      {/* Wire */}
      <line x1="15" y1="0" x2="15" y2="25" stroke="#2C2C2C" strokeWidth="2" />
      {/* Socket */}
      <rect x="10" y="25" width="10" height="10" fill="#2C2C2C" />
      {/* Bulb */}
      <motion.ellipse
        cx="15"
        cy="50"
        rx="12"
        ry="18"
        fill="rgba(255, 200, 100, 0.3)"
        stroke="#B87333"
        strokeWidth="1"
        animate={{
          fill: ['rgba(255, 200, 100, 0.3)', 'rgba(255, 200, 100, 0.5)', 'rgba(255, 200, 100, 0.3)']
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      {/* Filament */}
      <motion.path
        d="M12 45 Q15 40 18 45 Q15 50 12 45"
        fill="none"
        stroke="#FFD700"
        strokeWidth="1"
        animate={{
          opacity: [0.6, 1, 0.6]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </svg>
  </motion.div>
);

export default function IndustrialChicTemplate({ wedding, guest, dateParts, isRSVP = false }: InvitationTemplateProps) {
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
        background: '#F5F5F5',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235D5D5D' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}
      dir="rtl"
    >
      {/* Concrete texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='concrete'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23concrete)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Gears */}
      <Gear size={120} x="5%" y="10%" direction={1} delay={0.2} />
      <Gear size={80} x="85%" y="5%" direction={-1} delay={0.4} />
      <Gear size={100} x="0%" y="60%" direction={-1} delay={0.6} />
      <Gear size={90} x="80%" y="70%" direction={1} delay={0.8} />

      {/* Edison bulbs */}
      <EdisonBulb x="15%" delay={0.3} />
      <EdisonBulb x="85%" delay={0.5} />

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
            className="text-sm tracking-[0.4em] uppercase"
            style={{
              color: '#5D5D5D',
              fontFamily: "'Rubik Mono One', monospace"
            }}
          >
            {guest ? `${guest.name} מוזמנים` : 'הנכם מוזמנים'}
          </span>
        </motion.div>

        {/* Media */}
        {wedding.mediaUrl && (
          <motion.div
            className="relative mx-auto mb-8 max-w-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Metal frame */}
            <div
              className="absolute -inset-3"
              style={{
                background: 'linear-gradient(135deg, #5D5D5D, #8B8B8B, #5D5D5D)',
                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), 0 4px 20px rgba(0,0,0,0.3)'
              }}
            />
            <div
              className="absolute -inset-1"
              style={{ background: '#F5F5F5' }}
            />

            {/* Corner bolts */}
            {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
              <div
                key={i}
                className={`absolute ${pos} w-4 h-4 rounded-full`}
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #B87333, #8B4513)',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.3)'
                }}
              />
            ))}

            {wedding.mediaType === 'video' ? (
              <video
                src={wedding.mediaUrl}
                autoPlay
                loop
                muted
                playsInline
                className="relative w-full aspect-square object-cover"
                style={{ filter: 'grayscale(20%) contrast(1.1)' }}
              />
            ) : (
              <img
                src={wedding.mediaUrl}
                alt={`${wedding.groomName} & ${wedding.brideName}`}
                className="relative w-full aspect-square object-cover"
                style={{
                  filter: 'grayscale(20%) contrast(1.1)',
                  ...(wedding.mediaPosition && { objectPosition: `${wedding.mediaPosition.x}% ${wedding.mediaPosition.y}%` })
                }}
              />
            )}
          </motion.div>
        )}

        {/* Names */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h1
            className="text-4xl md:text-5xl font-bold mb-2"
            style={{
              fontFamily: "'Rubik Mono One', monospace",
              color: '#2C2C2C'
            }}
          >
            {wedding.groomName}
          </h1>

          <motion.div
            className="flex items-center justify-center gap-4 my-4"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="h-0.5 w-16" style={{ background: '#B87333' }} />
            <Heart className="w-5 h-5" style={{ color: '#B87333' }} fill="#B87333" />
            <div className="h-0.5 w-16" style={{ background: '#B87333' }} />
          </motion.div>

          <h1
            className="text-4xl md:text-5xl font-bold"
            style={{
              fontFamily: "'Rubik Mono One', monospace",
              color: '#2C2C2C'
            }}
          >
            {wedding.brideName}
          </h1>
        </motion.div>

        {/* Invitation text */}
        <motion.p
          className="text-center text-base mb-8"
          style={{
            color: '#5D5D5D',
            fontFamily: "'Heebo', sans-serif"
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {wedding.description || 'מים רבים לא יוכלו לכבות את האהבה ונהרות לא ישטפוה'}
        </motion.p>

        {/* Date card - stamp style */}
        <motion.div
          className="p-6 mb-6 text-center relative"
          style={{
            background: '#FFFFFF',
            border: '3px solid #2C2C2C',
            boxShadow: '4px 4px 0 #2C2C2C'
          }}
          initial={{ opacity: 0, scale: 1.2, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 1, type: "spring" }}
        >
          <div
            className="text-5xl font-bold mb-2"
            style={{ color: '#B87333', fontFamily: "'Rubik Mono One', monospace" }}
          >
            {dateParts.day}
          </div>
          <div className="text-xl mb-1" style={{ color: '#2C2C2C' }}>
            {dateParts.month} {dateParts.year}
          </div>
          <div className="text-lg mb-3" style={{ color: '#5D5D5D' }}>
            {dateParts.weekday}
          </div>
          <div
            className="text-sm px-4 py-1 inline-block"
            style={{ background: '#2C2C2C', color: '#F5F5F5' }}
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
            className="flex items-center gap-4 p-4"
            style={{
              background: '#FFFFFF',
              borderRight: '4px solid #B87333'
            }}
          >
            <Clock className="w-6 h-6" style={{ color: '#B87333' }} />
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider" style={{ color: '#8B8B8B' }}>קבלת פנים</div>
              <div className="text-xl font-bold" style={{ color: '#2C2C2C', fontFamily: "'Space Grotesk', sans-serif" }}>{wedding.eventTime}</div>
            </div>
          </div>

          {/* Chuppah time */}
          {wedding.chuppahTime && (
            <div
              className="flex items-center gap-4 p-4"
              style={{
                background: '#FFFFFF',
                borderRight: '4px solid #B87333'
              }}
            >
              <Heart className="w-6 h-6" style={{ color: '#B87333' }} />
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider" style={{ color: '#8B8B8B' }}>חופה</div>
                <div className="text-xl font-bold" style={{ color: '#2C2C2C', fontFamily: "'Space Grotesk', sans-serif" }}>{wedding.chuppahTime}</div>
              </div>
            </div>
          )}

          {/* Location */}
          <div
            className="p-4"
            style={{
              background: '#FFFFFF',
              borderRight: '4px solid #B87333'
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <MapPin className="w-6 h-6" style={{ color: '#B87333' }} />
              <div className="flex-1">
                <div className="text-xl font-bold" style={{ color: '#2C2C2C' }}>{wedding.venue}</div>
                <div className="text-sm" style={{ color: '#5D5D5D' }}>{wedding.venueAddress}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 flex items-center justify-center gap-2 font-bold transition-all"
                style={{
                  background: '#2C2C2C',
                  color: '#F5F5F5'
                }}
                whileHover={{ background: '#B87333' }}
                whileTap={{ scale: 0.98 }}
              >
                <Navigation className="w-5 h-5" />
                <span>Maps</span>
              </motion.a>
              <motion.a
                href={`https://waze.com/ul?q=${encodeURIComponent(wedding.venueAddress)}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 flex items-center justify-center gap-2 font-bold transition-all"
                style={{
                  background: '#B87333',
                  color: '#F5F5F5'
                }}
                whileHover={{ background: '#2C2C2C' }}
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
            <RSVPForm guest={guest} themeColor="#B87333" />
          </motion.div>
        )}

        {/* Gift section */}
        {wedding.enableBitGifts && wedding.bitPhone && (
          <motion.div
            className="mt-6 p-6 text-center"
            style={{
              background: '#FFFFFF',
              border: '2px solid #2C2C2C'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <h3 className="text-lg font-bold mb-2" style={{ color: '#2C2C2C' }}>⚙️ רוצים לשלוח מתנה?</h3>
            <p className="text-sm mb-4" style={{ color: '#5D5D5D' }}>תודה מראש על המחשבה</p>

            <a
              href={wedding.bitPhone}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 font-bold transition-all hover:bg-[#B87333]"
              style={{
                background: '#2C2C2C',
                color: '#F5F5F5'
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
          <div className="h-0.5 w-20 mx-auto" style={{ background: '#B87333' }} />
        </motion.div>
      </div>
    </div>
  );
}
