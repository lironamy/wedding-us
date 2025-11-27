'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation, Heart } from 'lucide-react';
import { RSVPForm } from '../RSVPForm';
import type { InvitationTemplateProps } from './types';

// Botanical leaf SVG drawing animation
const BotanicalLeaf = ({ side, delay }: { side: 'left' | 'right'; delay: number }) => (
  <motion.svg
    className={`absolute ${side === 'left' ? 'left-2' : 'right-2'} top-1/4 w-20 h-40 pointer-events-none`}
    viewBox="0 0 80 160"
    style={{ transform: side === 'right' ? 'scaleX(-1)' : undefined }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.6 }}
    transition={{ delay, duration: 1 }}
  >
    {/* Main stem */}
    <motion.path
      d="M40,160 L40,20"
      fill="none"
      stroke="#228B22"
      strokeWidth="2"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay, duration: 2, ease: "easeOut" }}
    />
    {/* Leaves */}
    {[30, 60, 90, 120].map((y, i) => (
      <motion.path
        key={i}
        d={i % 2 === 0
          ? `M40,${y} Q20,${y-15} 10,${y} Q20,${y+15} 40,${y}`
          : `M40,${y} Q60,${y-15} 70,${y} Q60,${y+15} 40,${y}`
        }
        fill="none"
        stroke="#228B22"
        strokeWidth="1.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.8 }}
        transition={{ delay: delay + 0.5 + i * 0.3, duration: 0.8 }}
      />
    ))}
    {/* Leaf veins */}
    {[30, 60, 90, 120].map((y, i) => (
      <motion.line
        key={`vein-${i}`}
        x1="40"
        y1={y}
        x2={i % 2 === 0 ? "15" : "65"}
        y2={y}
        stroke="#228B22"
        strokeWidth="0.5"
        opacity="0.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: delay + 1 + i * 0.2, duration: 0.5 }}
      />
    ))}
  </motion.svg>
);

export default function BotanicalTemplate({ wedding, guest, dateParts, isRSVP = false }: InvitationTemplateProps) {
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
        background: '#F5F5DC',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='old-paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23old-paper)' opacity='0.05'/%3E%3C/svg%3E")`
      }}
      dir="rtl"
    >
      {/* Sepia tint overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'rgba(112, 66, 20, 0.05)' }}
      />

      {/* Botanical leaves */}
      <BotanicalLeaf side="left" delay={0.3} />
      <BotanicalLeaf side="right" delay={0.5} />

      {/* Main content */}
      <div className="relative z-10 max-w-lg mx-auto px-6 py-8">

        {/* Scientific label style header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div
            className="inline-block px-6 py-2 border-2 relative"
            style={{ borderColor: '#704214' }}
          >
            <span
              className="text-xs tracking-[0.3em] uppercase"
              style={{
                color: '#704214',
                fontFamily: "'Frank Ruhl Libre', serif"
              }}
            >
              {guest ? `${guest.name}` : 'הנכם מוזמנים'}
            </span>
            {/* Corner marks */}
            {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
              <div
                key={i}
                className={`absolute ${pos} w-2 h-2`}
                style={{
                  borderTop: pos.includes('top') ? '2px solid #704214' : 'none',
                  borderBottom: pos.includes('bottom') ? '2px solid #704214' : 'none',
                  borderLeft: pos.includes('left') ? '2px solid #704214' : 'none',
                  borderRight: pos.includes('right') ? '2px solid #704214' : 'none',
                  margin: '-1px'
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Media with vintage frame */}
        {wedding.mediaUrl && (
          <motion.div
            className="relative mx-auto mb-8 max-w-xs"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div
              className="absolute -inset-3"
              style={{
                border: '2px solid #704214',
                background: 'rgba(112, 66, 20, 0.05)'
              }}
            />

            {wedding.mediaType === 'video' ? (
              <video
                src={wedding.mediaUrl}
                autoPlay
                loop
                muted
                playsInline
                className="relative w-full aspect-square object-cover"
                style={{ filter: 'sepia(20%)' }}
              />
            ) : (
              <img
                src={wedding.mediaUrl}
                alt={`${wedding.groomName} & ${wedding.brideName}`}
                className="relative w-full aspect-square object-cover"
                style={{
                  filter: 'sepia(20%)',
                  ...(wedding.mediaPosition && { objectPosition: `${wedding.mediaPosition.x}% ${wedding.mediaPosition.y}%` })
                }}
              />
            )}

            {/* Specimen label */}
            <motion.div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-4 py-1"
              style={{ background: '#F5F5DC', border: '1px solid #704214' }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <span className="text-xs" style={{ color: '#704214', fontFamily: "monospace" }}>
                Fig. 1
              </span>
            </motion.div>
          </motion.div>
        )}

        {/* Names */}
        <motion.div
          className="text-center mb-6 mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <h1
            className="text-4xl md:text-5xl mb-1"
            style={{
              fontFamily: "'Frank Ruhl Libre', serif",
              color: '#228B22',
              fontWeight: 400
            }}
          >
            {wedding.groomName}
          </h1>
          <div className="text-xs tracking-widest mb-3" style={{ color: '#808000', fontStyle: 'italic' }}>
            Genus Amor
          </div>

          <motion.div
            className="flex items-center justify-center gap-4 my-4"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="h-px w-12" style={{ background: '#704214' }} />
            <Heart className="w-4 h-4" style={{ color: '#CFB53B' }} fill="#CFB53B" />
            <div className="h-px w-12" style={{ background: '#704214' }} />
          </motion.div>

          <h1
            className="text-4xl md:text-5xl mb-1"
            style={{
              fontFamily: "'Frank Ruhl Libre', serif",
              color: '#228B22',
              fontWeight: 400
            }}
          >
            {wedding.brideName}
          </h1>
          <div className="text-xs tracking-widest" style={{ color: '#808000', fontStyle: 'italic' }}>
            Species Eternus
          </div>
        </motion.div>

        {/* Invitation text */}
        <motion.p
          className="text-center text-base mb-8"
          style={{
            color: '#704214',
            fontFamily: "'Heebo', sans-serif",
            lineHeight: 1.8
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {wedding.description || 'מים רבים לא יוכלו לכבות את האהבה ונהרות לא ישטפוה'}
        </motion.p>

        {/* Date card - encyclopedia style */}
        <motion.div
          className="p-6 mb-6 text-center relative"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            border: '1px solid #704214'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          {/* Page number */}
          <div className="absolute top-2 right-4 text-xs" style={{ color: '#704214' }}>
            PLATE XII
          </div>

          <div
            className="text-5xl mb-2"
            style={{ color: '#228B22', fontFamily: "'Frank Ruhl Libre', serif" }}
          >
            {dateParts.day}
          </div>
          <div className="text-xl mb-1" style={{ color: '#704214' }}>
            {dateParts.month} {dateParts.year}
          </div>
          <div className="text-base mb-3" style={{ color: '#808000' }}>
            {dateParts.weekday}
          </div>
          <div
            className="text-sm px-3 py-1 inline-block border"
            style={{ borderColor: '#CFB53B', color: '#CFB53B' }}
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
              background: 'rgba(255, 255, 255, 0.4)',
              borderRight: '3px solid #228B22'
            }}
          >
            <Clock className="w-5 h-5" style={{ color: '#228B22' }} />
            <div className="flex-1">
              <div className="text-xs tracking-wider" style={{ color: '#808000' }}>קבלת פנים</div>
              <div className="text-xl" style={{ color: '#704214', fontFamily: "'Frank Ruhl Libre', serif" }}>{wedding.eventTime}</div>
            </div>
          </div>

          {/* Chuppah time */}
          {wedding.chuppahTime && (
            <div
              className="flex items-center gap-4 p-4"
              style={{
                background: 'rgba(255, 255, 255, 0.4)',
                borderRight: '3px solid #228B22'
              }}
            >
              <Heart className="w-5 h-5" style={{ color: '#CFB53B' }} />
              <div className="flex-1">
                <div className="text-xs tracking-wider" style={{ color: '#808000' }}>חופה</div>
                <div className="text-xl" style={{ color: '#704214', fontFamily: "'Frank Ruhl Libre', serif" }}>{wedding.chuppahTime}</div>
              </div>
            </div>
          )}

          {/* Location */}
          <div
            className="p-4"
            style={{
              background: 'rgba(255, 255, 255, 0.4)',
              borderRight: '3px solid #228B22'
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <MapPin className="w-5 h-5" style={{ color: '#228B22' }} />
              <div className="flex-1">
                <div className="text-xl" style={{ color: '#704214', fontFamily: "'Frank Ruhl Libre', serif" }}>{wedding.venue}</div>
                <div className="text-sm" style={{ color: '#808000' }}>{wedding.venueAddress}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 flex items-center justify-center gap-2 transition-all"
                style={{
                  background: '#228B22',
                  color: '#F5F5DC'
                }}
                whileHover={{ opacity: 0.9 }}
                whileTap={{ scale: 0.98 }}
              >
                <Navigation className="w-4 h-4" />
                <span>Google Maps</span>
              </motion.a>
              <motion.a
                href={`https://waze.com/ul?q=${encodeURIComponent(wedding.venueAddress)}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 flex items-center justify-center gap-2 transition-all"
                style={{
                  background: '#704214',
                  color: '#F5F5DC'
                }}
                whileHover={{ opacity: 0.9 }}
                whileTap={{ scale: 0.98 }}
              >
                <Navigation className="w-4 h-4" />
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
            <RSVPForm guest={guest} themeColor="#228B22" />
          </motion.div>
        )}

        {/* Gift section */}
        {wedding.enableBitGifts && wedding.bitPhone && (
          <motion.div
            className="mt-6 p-6 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.4)',
              border: '1px solid #704214'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <h3 className="text-base mb-2" style={{ color: '#704214', fontFamily: "'Frank Ruhl Libre', serif" }}>🌿 רוצים לשלוח מתנה?</h3>
            <p className="text-sm mb-4" style={{ color: '#808000' }}>תודה מראש על המחשבה</p>

            <a
              href={wedding.bitPhone}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 transition-all"
              style={{
                background: '#228B22',
                color: '#F5F5DC'
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
          <div className="text-xs tracking-widest" style={{ color: '#704214' }}>
            — FINIS —
          </div>
        </motion.div>
      </div>
    </div>
  );
}
