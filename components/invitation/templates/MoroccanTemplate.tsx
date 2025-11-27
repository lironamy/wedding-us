'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation, Heart } from 'lucide-react';
import { RSVPForm } from '../RSVPForm';
import type { InvitationTemplateProps } from './types';

// Moroccan lantern component
const Lantern = ({ x, delay }: { x: string; delay: number }) => (
  <motion.div
    className="absolute top-0 pointer-events-none"
    style={{ left: x }}
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay, duration: 0.8 }}
  >
    <motion.svg
      width="40"
      height="80"
      viewBox="0 0 40 80"
      animate={{ rotate: [-3, 3, -3] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Chain */}
      <line x1="20" y1="0" x2="20" y2="15" stroke="#C9A227" strokeWidth="2" />
      {/* Top ornament */}
      <path d="M15,15 L25,15 L23,20 L17,20 Z" fill="#C9A227" />
      {/* Lantern body */}
      <path
        d="M10,20 L30,20 L32,25 L32,55 L28,65 L12,65 L8,55 L8,25 Z"
        fill="none"
        stroke="#C9A227"
        strokeWidth="2"
      />
      {/* Decorative patterns */}
      <path d="M14,30 L20,25 L26,30 L20,35 Z" fill="none" stroke="#C9A227" strokeWidth="1" />
      <path d="M14,45 L20,40 L26,45 L20,50 Z" fill="none" stroke="#C9A227" strokeWidth="1" />
      {/* Glow */}
      <motion.ellipse
        cx="20"
        cy="42"
        rx="8"
        ry="15"
        fill="rgba(255,215,0,0.3)"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.svg>
  </motion.div>
);

// Zellige pattern component
const ZelligePattern = () => (
  <div
    className="absolute inset-0 pointer-events-none opacity-10"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z' fill='none' stroke='%23C9A227' stroke-width='1'/%3E%3Cpath d='M30 15 L45 30 L30 45 L15 30 Z' fill='none' stroke='%23C9A227' stroke-width='0.5'/%3E%3C/svg%3E")`,
      backgroundSize: '60px 60px'
    }}
  />
);

// Moroccan arch frame
const MoroccanArch = ({ children }: { children: React.ReactNode }) => (
  <div className="relative">
    <svg
      className="absolute -top-8 left-1/2 -translate-x-1/2 w-full max-w-sm h-16"
      viewBox="0 0 300 50"
      preserveAspectRatio="none"
    >
      <path
        d="M0,50 L0,30 Q150,0 300,30 L300,50"
        fill="none"
        stroke="#C9A227"
        strokeWidth="2"
      />
    </svg>
    {children}
  </div>
);

export default function MoroccanTemplate({ wedding, guest, dateParts, isRSVP = false }: InvitationTemplateProps) {
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
        background: 'linear-gradient(180deg, #1E3A5F 0%, #0F2744 50%, #1E3A5F 100%)'
      }}
      dir="rtl"
    >
      <ZelligePattern />

      {/* Lanterns */}
      <Lantern x="10%" delay={0.3} />
      <Lantern x="88%" delay={0.5} />

      {/* Main content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">

        {/* Hero Section - Large arch with photo and names overlay */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Main arch container */}
          <div
            className="relative rounded-t-[100px] overflow-hidden"
            style={{
              background: 'rgba(30, 58, 95, 0.9)',
              border: '3px solid #C9A227',
              borderBottom: 'none'
            }}
          >
            {/* Photo section */}
            {wedding.mediaUrl && (
              <div className="relative">
                {wedding.mediaType === 'video' ? (
                  <video
                    src={wedding.mediaUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full aspect-[4/3] object-cover"
                  />
                ) : (
                  <img
                    src={wedding.mediaUrl}
                    alt={`${wedding.groomName} & ${wedding.brideName}`}
                    className="w-full aspect-[4/3] object-cover"
                    style={wedding.mediaPosition ? {
                      objectPosition: `${wedding.mediaPosition.x}% ${wedding.mediaPosition.y}%`
                    } : undefined}
                  />
                )}
                {/* Gradient overlay for text */}
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(30, 58, 95, 0.95) 100%)' }}
                />
              </div>
            )}

            {/* Names overlay at bottom of photo */}
            <div className={`${wedding.mediaUrl ? 'absolute bottom-0 left-0 right-0' : ''} p-6 text-center`}>
              {/* Welcome text */}
              <motion.div
                className="mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span
                  className="text-sm px-4 py-1 rounded-full"
                  style={{
                    color: '#C9A227',
                    background: 'rgba(201, 162, 39, 0.2)',
                    border: '1px solid rgba(201, 162, 39, 0.5)',
                    fontFamily: "'Secular One', sans-serif"
                  }}
                >
                  ✦ {guest ? `${guest.name} מוזמנים` : 'הנכם מוזמנים'} ✦
                </span>
              </motion.div>

              {/* Names in a row */}
              <div className="flex items-center justify-center gap-4">
                <motion.h1
                  className="text-3xl md:text-4xl font-bold"
                  style={{ fontFamily: "'Secular One', sans-serif", color: '#FFFFF0' }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {wedding.groomName}
                </motion.h1>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  <svg width="24" height="24" viewBox="0 0 30 30" fill="#C9A227">
                    <path d="M15 0 L17 13 L30 15 L17 17 L15 30 L13 17 L0 15 L13 13 Z" />
                  </svg>
                </motion.div>

                <motion.h1
                  className="text-3xl md:text-4xl font-bold"
                  style={{ fontFamily: "'Secular One', sans-serif", color: '#FFFFF0' }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {wedding.brideName}
                </motion.h1>
              </div>
            </div>
          </div>

          {/* Decorative bottom border */}
          <div
            className="h-2"
            style={{ background: 'linear-gradient(90deg, transparent, #C9A227, transparent)' }}
          />
        </motion.div>

        {/* Invitation text */}
        <motion.p
          className="text-center text-lg mb-6 px-4"
          style={{
            color: 'rgba(255,255,240,0.8)',
            fontFamily: "'Noto Sans Hebrew', sans-serif"
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {wedding.description || 'מים רבים לא יוכלו לכבות את האהבה ונהרות לא ישטפוה'}
        </motion.p>

        {/* Date + Time Tiles - Horizontal grid */}
        <motion.div
          className="grid grid-cols-3 gap-2 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {/* Date tile */}
          <div
            className="p-4 text-center rounded-lg relative overflow-hidden"
            style={{ background: 'rgba(30, 58, 95, 0.8)', border: '1px solid #C9A227' }}
          >
            <div className="text-4xl font-bold" style={{ color: '#C9A227', fontFamily: "'Secular One', sans-serif" }}>
              {dateParts.day}
            </div>
            <div className="text-sm" style={{ color: '#FFFFF0' }}>{dateParts.month}</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,240,0.6)' }}>{dateParts.year}</div>
          </div>

          {/* Reception tile */}
          <div
            className="p-4 text-center rounded-lg flex flex-col justify-center items-center"
            style={{ background: 'rgba(30, 58, 95, 0.8)', border: '1px solid rgba(201, 162, 39, 0.3)' }}
          >
            <Clock className="w-5 h-5 mb-1" style={{ color: '#C9A227' }} />
            <div className="text-xs" style={{ color: 'rgba(255,255,240,0.6)' }}>קבלת פנים</div>
            <div className="text-lg font-bold" style={{ color: '#FFFFF0' }}>{wedding.eventTime}</div>
          </div>

          {/* Chuppah tile */}
          <div
            className="p-4 text-center rounded-lg flex flex-col justify-center items-center"
            style={{ background: 'rgba(30, 58, 95, 0.8)', border: '1px solid rgba(201, 162, 39, 0.3)' }}
          >
            <Heart className="w-5 h-5 mb-1" style={{ color: '#C9A227' }} />
            <div className="text-xs" style={{ color: 'rgba(255,255,240,0.6)' }}>חופה</div>
            <div className="text-lg font-bold" style={{ color: '#FFFFF0' }}>{wedding.chuppahTime || '—'}</div>
          </div>
        </motion.div>

        {/* Hebrew date banner */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <span
            className="text-sm px-4 py-2 rounded"
            style={{
              background: 'rgba(201, 162, 39, 0.2)',
              color: '#C9A227',
              border: '1px solid #C9A227'
            }}
          >
            {dateParts.hebrewDate} • {dateParts.weekday}
          </span>
        </motion.div>

        {/* Location Card */}
        <motion.div
          className="p-5 rounded-lg mb-6"
          style={{
            background: 'rgba(30, 58, 95, 0.8)',
            border: '2px solid #C9A227'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(48, 213, 200, 0.2)', border: '1px solid #30D5C8' }}
            >
              <MapPin className="w-6 h-6" style={{ color: '#30D5C8' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xl font-bold mb-1" style={{ color: '#FFFFF0' }}>{wedding.venue}</div>
              <div className="text-sm" style={{ color: 'rgba(255,255,240,0.6)' }}>{wedding.venueAddress}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <motion.a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-lg flex items-center justify-center gap-2 font-medium"
              style={{
                background: 'linear-gradient(135deg, #C9A227, #DAA520)',
                color: '#1E3A5F'
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
              className="flex-1 py-3 rounded-lg flex items-center justify-center gap-2 font-medium"
              style={{
                background: 'rgba(30, 58, 95, 0.9)',
                color: '#C9A227',
                border: '1px solid #C9A227'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Navigation className="w-5 h-5" />
              <span>Waze</span>
            </motion.a>
          </div>
        </motion.div>

        {/* RSVP Section */}
        {isRSVP && guest && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <RSVPForm guest={guest} themeColor="#C9A227" />
          </motion.div>
        )}

        {/* Gift section */}
        {wedding.enableBitGifts && wedding.bitPhone && (
          <motion.div
            className="mt-6 p-6 rounded-lg text-center"
            style={{
              background: 'rgba(30, 58, 95, 0.6)',
              border: '1px solid rgba(201, 162, 39, 0.3)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <h3 className="text-lg mb-2" style={{ color: '#C9A227' }}>🏺 רוצים לשלוח מתנה?</h3>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,240,0.6)' }}>תודה מראש על המחשבה</p>

            <a
              href={wedding.bitPhone}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium"
              style={{
                background: 'linear-gradient(135deg, #C9A227, #DAA520)',
                color: '#1E3A5F'
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
          <svg width="60" height="30" viewBox="0 0 60 30" fill="#C9A227">
            <path d="M30 0 L32 13 L45 15 L32 17 L30 30 L28 17 L15 15 L28 13 Z" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
