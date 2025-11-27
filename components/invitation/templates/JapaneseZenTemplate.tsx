'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation, Heart } from 'lucide-react';
import { RSVPForm } from '../RSVPForm';
import type { InvitationTemplateProps } from './types';

// Brush stroke path animation
const BrushStroke = ({ delay }: { delay: number }) => (
  <motion.svg
    className="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-16 pointer-events-none"
    viewBox="0 0 200 40"
  >
    <motion.path
      d="M10,20 Q50,5 100,20 T190,20"
      fill="none"
      stroke="#1A1A1A"
      strokeWidth="2"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.3 }}
      transition={{ delay, duration: 2, ease: "easeOut" }}
    />
  </motion.svg>
);

// Red seal/stamp component
const RedSeal = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute top-20 left-8 w-12 h-12 pointer-events-none"
    initial={{ opacity: 0, scale: 0, rotate: -45 }}
    animate={{ opacity: 1, scale: 1, rotate: 0 }}
    transition={{ delay, duration: 0.5, type: "spring" }}
  >
    <div
      className="w-full h-full rounded flex items-center justify-center"
      style={{
        background: '#C41E3A',
        boxShadow: '2px 2px 4px rgba(0,0,0,0.2)'
      }}
    >
      <span className="text-white text-lg font-bold" style={{ fontFamily: "'Noto Serif Hebrew', serif" }}>喜</span>
    </div>
  </motion.div>
);

export default function JapaneseZenTemplate({ wedding, guest, dateParts, isRSVP = false }: InvitationTemplateProps) {
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
        background: '#FAFAFA'
      }}
      dir="rtl"
    >
      {/* Subtle paper texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`
        }}
      />

      <BrushStroke delay={0.5} />
      <RedSeal delay={1.5} />

      {/* Main content */}
      <div className="relative z-10 max-w-lg mx-auto px-6  ">

        {/* Welcome text */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <span
            className="text-sm tracking-[0.5em]"
            style={{
              color: '#666',
              fontFamily: "'Noto Sans Hebrew', sans-serif"
            }}
          >
            {guest ? `${guest.name}` : 'הנכם מוזמנים'}
          </span>
        </motion.div>

        {/* Media */}
        {wedding.mediaUrl && (
          <motion.div
            className="relative mx-auto mb-12 max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div
              className="absolute -inset-4"
              style={{
                border: '1px solid #E0E0E0'
              }}
            />

            {wedding.mediaType === 'video' ? (
              <video
                src={wedding.mediaUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full aspect-square object-cover grayscale-[20%]"
              />
            ) : (
              <img
                src={wedding.mediaUrl}
                alt={`${wedding.groomName} & ${wedding.brideName}`}
                className="w-full aspect-square object-cover grayscale-[20%]"
                style={wedding.mediaPosition ? {
                  objectPosition: `${wedding.mediaPosition.x}% ${wedding.mediaPosition.y}%`
                } : undefined}
              />
            )}
          </motion.div>
        )}

        {/* Names with brush stroke effect */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <motion.h1
            className="text-4xl md:text-5xl mb-4"
            style={{
              fontFamily: "'Noto Serif Hebrew', serif",
              color: '#1A1A1A',
              fontWeight: 400
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {wedding.groomName}
          </motion.h1>

          <motion.div
            className="flex items-center justify-center my-6"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <div className="h-px w-20" style={{ background: '#1A1A1A' }} />
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl"
            style={{
              fontFamily: "'Noto Serif Hebrew', serif",
              color: '#1A1A1A',
              fontWeight: 400
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            {wedding.brideName}
          </motion.h1>
        </motion.div>

        {/* Invitation text */}
        <motion.p
          className="text-center text-base mb-12"
          style={{
            color: '#666',
            fontFamily: "'Noto Sans Hebrew', sans-serif",
            lineHeight: 2
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          {wedding.description || 'מים רבים לא יוכלו לכבות את האהבה ונהרות לא ישטפוה'}
        </motion.p>

        {/* Date section - minimalist */}
        <motion.div
          className="text-center mb-12 py-8"
          style={{
            borderTop: '1px solid #E0E0E0',
            borderBottom: '1px solid #E0E0E0'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <div
            className="text-6xl font-light mb-4"
            style={{ color: '#1A1A1A', fontFamily: "'Noto Serif Hebrew', serif" }}
          >
            {dateParts.day}
          </div>
          <div
            className="text-lg mb-2"
            style={{ color: '#666' }}
          >
            {dateParts.month} {dateParts.year}
          </div>
          <div
            className="text-sm mb-4"
            style={{ color: '#999' }}
          >
            {dateParts.weekday}
          </div>
          <div
            className="text-xs tracking-wider"
            style={{ color: '#C41E3A' }}
          >
            {dateParts.hebrewDate}
          </div>
        </motion.div>

        {/* Time and Location - clean minimal */}
        <motion.div
          className="space-y-6 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7 }}
        >
          {/* Reception time */}
          <div className="flex items-center gap-6">
            <Clock className="w-5 h-5" style={{ color: '#999' }} />
            <div className="flex-1">
              <div className="text-xs tracking-wider mb-1" style={{ color: '#999' }}>קבלת פנים</div>
              <div className="text-xl" style={{ color: '#1A1A1A', fontFamily: "'Noto Serif Hebrew', serif" }}>{wedding.eventTime}</div>
            </div>
          </div>

          {/* Chuppah time */}
          {wedding.chuppahTime && (
            <div className="flex items-center gap-6">
              <Heart className="w-5 h-5" style={{ color: '#C41E3A' }} />
              <div className="flex-1">
                <div className="text-xs tracking-wider mb-1" style={{ color: '#999' }}>חופה</div>
                <div className="text-xl" style={{ color: '#1A1A1A', fontFamily: "'Noto Serif Hebrew', serif" }}>{wedding.chuppahTime}</div>
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <div className="flex items-center gap-6 mb-4">
              <MapPin className="w-5 h-5" style={{ color: '#999' }} />
              <div className="flex-1">
                <div className="text-xl" style={{ color: '#1A1A1A', fontFamily: "'Noto Serif Hebrew', serif" }}>{wedding.venue}</div>
                <div className="text-sm" style={{ color: '#666' }}>{wedding.venueAddress}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-4 flex items-center justify-center gap-2 transition-all"
                style={{
                  background: 'transparent',
                  color: '#1A1A1A',
                  border: '1px solid #1A1A1A'
                }}
                whileHover={{ background: '#1A1A1A', color: '#FAFAFA' }}
                whileTap={{ scale: 0.98 }}
              >
                <Navigation className="w-4 h-4" />
                <span style={{ fontFamily: "'Noto Sans Hebrew', sans-serif" }}>Maps</span>
              </motion.a>
              <motion.a
                href={`https://waze.com/ul?q=${encodeURIComponent(wedding.venueAddress)}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-4 flex items-center justify-center gap-2 transition-all"
                style={{
                  background: '#1A1A1A',
                  color: '#FAFAFA',
                  border: '1px solid #1A1A1A'
                }}
                whileHover={{ background: 'transparent', color: '#1A1A1A' }}
                whileTap={{ scale: 0.98 }}
              >
                <Navigation className="w-4 h-4" />
                <span style={{ fontFamily: "'Noto Sans Hebrew', sans-serif" }}>Waze</span>
              </motion.a>
            </div>
          </div>
        </motion.div>

        {/* RSVP Section */}
        {isRSVP && guest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.9 }}
          >
            <RSVPForm
              guest={guest}
              themeColor="#1A1A1A"
            />
          </motion.div>
        )}

        {/* Gift section */}
        {wedding.enableBitGifts && wedding.bitPhone && (
          <motion.div
            className="mt-12 py-8 text-center"
            style={{
              borderTop: '1px solid #E0E0E0'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.1 }}
          >
            <h3 className="text-base mb-2" style={{ color: '#1A1A1A', fontFamily: "'Noto Serif Hebrew', serif" }}>רוצים לשלוח מתנה?</h3>
            <p className="text-sm mb-6" style={{ color: '#999' }}>תודה מראש על המחשבה</p>

            <a
              href={wedding.bitPhone}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 transition-all hover:bg-[#1A1A1A] hover:text-white"
              style={{
                background: 'transparent',
                color: '#1A1A1A',
                border: '1px solid #1A1A1A',
                fontFamily: "'Noto Sans Hebrew', sans-serif"
              }}
            >
              <span>💳</span>
              <span>שליחת מתנה ב-Bit</span>
            </a>
          </motion.div>
        )}


        {/* Footer */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 2.5 }}
        >
          <div className="h-px w-8 mx-auto" style={{ background: '#1A1A1A' }} />
        </motion.div>
      </div>
    </div>
  );
}
