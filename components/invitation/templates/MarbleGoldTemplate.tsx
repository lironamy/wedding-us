'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation, Heart } from 'lucide-react';
import { RSVPForm } from '../RSVPForm';
import type { InvitationTemplateProps } from './types';

// Gold shimmer line component
const GoldLine = ({ delay, width }: { delay: number; width: string }) => (
  <motion.div
    className="h-px mx-auto relative overflow-hidden"
    style={{ width, background: '#C9A962' }}
    initial={{ scaleX: 0 }}
    animate={{ scaleX: 1 }}
    transition={{ duration: 1.5, delay, ease: "easeOut" }}
  >
    <motion.div
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
        width: '50%'
      }}
      animate={{ x: ['-100%', '300%'] }}
      transition={{ duration: 3, repeat: Infinity, delay: delay + 1, ease: "easeInOut" }}
    />
  </motion.div>
);

export default function MarbleGoldTemplate({ wedding, guest, dateParts, isRSVP = false }: InvitationTemplateProps) {
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
        background: `
          linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(245,245,245,0.95) 100%),
          url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 Q25 10 50 5 T100 10 L100 0 Z' fill='%23e8e8e8' opacity='0.3'/%3E%3Cpath d='M0 20 Q30 35 60 25 T100 30 L100 20 Z' fill='%23e0e0e0' opacity='0.2'/%3E%3C/svg%3E")
        `,
        backgroundSize: 'cover'
      }}
      dir="rtl"
    >
      {/* Marble texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 40%, rgba(200,200,200,0.1) 45%, transparent 50%),
            linear-gradient(-45deg, transparent 40%, rgba(200,200,200,0.1) 45%, transparent 50%)
          `,
          backgroundSize: '30px 30px'
        }}
      />

      {/* Gold border frame */}
      <div
        className="absolute inset-4 pointer-events-none"
        style={{
          border: '1px solid #C9A962',
          opacity: 0.5
        }}
      />
      <div
        className="absolute inset-6 pointer-events-none"
        style={{
          border: '2px solid #C9A962',
          opacity: 0.3
        }}
      />

      {/* Corner decorations */}
      {['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4'].map((position, i) => (
        <motion.div
          key={i}
          className={`absolute ${position} w-8 h-8 pointer-events-none`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
        >
          <svg viewBox="0 0 32 32" className="w-full h-full">
            <path
              d={i < 2
                ? (i === 0 ? 'M0,16 L0,0 L16,0' : 'M16,0 L32,0 L32,16')
                : (i === 2 ? 'M0,16 L0,32 L16,32' : 'M16,32 L32,32 L32,16')
              }
              fill="none"
              stroke="#C9A962"
              strokeWidth="2"
            />
          </svg>
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 max-w-lg mx-auto px-8 py-12">

        {/* Welcome text */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span
            className="text-sm tracking-[0.3em] uppercase"
            style={{
              color: '#C9A962',
              fontFamily: "'Cinzel', serif"
            }}
          >
            {guest ? `${guest.name} מוזמנים` : 'הנכם מוזמנים'}
          </span>
        </motion.div>

        <GoldLine delay={0.3} width="60%" />

        {/* Media */}
        {wedding.mediaUrl && (
          <motion.div
            className="relative mx-auto my-8 max-w-xs"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div
              className="absolute -inset-2"
              style={{
                border: '1px solid #C9A962',
                background: 'linear-gradient(135deg, rgba(201,169,98,0.1) 0%, transparent 50%, rgba(201,169,98,0.1) 100%)'
              }}
            />

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

            {/* Gold stamp effect */}
            <motion.div
              className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #C9A962 0%, #E8D5A3 50%, #C9A962 100%)',
                boxShadow: '0 4px 15px rgba(201,169,98,0.4)'
              }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1, duration: 0.6, type: "spring" }}
            >
              <Heart className="w-6 h-6 text-white" fill="white" />
            </motion.div>
          </motion.div>
        )}

        {/* Names */}
        <motion.div
          className="text-center my-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <h1
            className="text-4xl md:text-5xl mb-2"
            style={{
              fontFamily: "'Cinzel', serif",
              color: '#1A1A1A',
              fontWeight: 400,
              letterSpacing: '0.05em'
            }}
          >
            {wedding.groomName}
          </h1>

          <motion.div
            className="flex items-center justify-center gap-4 my-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, #C9A962)' }} />
            <span style={{ color: '#C9A962', fontFamily: "'Cinzel', serif", fontSize: '1.5rem' }}>&</span>
            <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, #C9A962, transparent)' }} />
          </motion.div>

          <h1
            className="text-4xl md:text-5xl"
            style={{
              fontFamily: "'Cinzel', serif",
              color: '#1A1A1A',
              fontWeight: 400,
              letterSpacing: '0.05em'
            }}
          >
            {wedding.brideName}
          </h1>
        </motion.div>

        <GoldLine delay={1} width="40%" />

        {/* Invitation text */}
        <motion.p
          className="text-center text-base my-8"
          style={{
            color: '#555',
            fontFamily: "'Assistant', sans-serif",
            lineHeight: 1.8
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {wedding.description || 'מים רבים לא יוכלו לכבות את האהבה ונהרות לא ישטפוה'}
        </motion.p>

        {/* Date card */}
        <motion.div
          className="p-8 mb-8 text-center relative"
          style={{
            background: 'rgba(255,255,255,0.8)',
            border: '1px solid #C9A962'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          <div
            className="text-6xl font-light mb-2"
            style={{ color: '#C9A962', fontFamily: "'Cinzel', serif" }}
          >
            {dateParts.day}
          </div>
          <div
            className="text-xl mb-1"
            style={{ color: '#1A1A1A', fontFamily: "'Cinzel', serif" }}
          >
            {dateParts.month} {dateParts.year}
          </div>
          <div
            className="text-base mb-4"
            style={{ color: '#666' }}
          >
            {dateParts.weekday}
          </div>
          <div
            className="text-sm inline-block px-4 py-1"
            style={{
              color: '#C9A962',
              border: '1px solid #C9A962'
            }}
          >
            {dateParts.hebrewDate}
          </div>
        </motion.div>

        {/* Time and Location */}
        <motion.div
          className="space-y-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {/* Reception time */}
          <div
            className="flex items-center gap-4 p-4"
            style={{
              background: 'rgba(255,255,255,0.6)',
              borderRight: '3px solid #C9A962'
            }}
          >
            <Clock className="w-6 h-6" style={{ color: '#C9A962' }} />
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider" style={{ color: '#999' }}>קבלת פנים</div>
              <div className="text-xl" style={{ color: '#1A1A1A' }}>{wedding.eventTime}</div>
            </div>
          </div>

          {/* Chuppah time */}
          {wedding.chuppahTime && (
            <div
              className="flex items-center gap-4 p-4"
              style={{
                background: 'rgba(255,255,255,0.6)',
                borderRight: '3px solid #C9A962'
              }}
            >
              <Heart className="w-6 h-6" style={{ color: '#C9A962' }} />
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider" style={{ color: '#999' }}>חופה</div>
                <div className="text-xl" style={{ color: '#1A1A1A' }}>{wedding.chuppahTime}</div>
              </div>
            </div>
          )}

          {/* Location */}
          <div
            className="p-4"
            style={{
              background: 'rgba(255,255,255,0.6)',
              borderRight: '3px solid #C9A962'
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <MapPin className="w-6 h-6" style={{ color: '#C9A962' }} />
              <div className="flex-1">
                <div className="text-xl" style={{ color: '#1A1A1A' }}>{wedding.venue}</div>
                <div className="text-sm" style={{ color: '#666' }}>{wedding.venueAddress}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 flex items-center justify-center gap-2 font-medium transition-all"
                style={{
                  background: 'transparent',
                  color: '#C9A962',
                  border: '1px solid #C9A962'
                }}
                whileHover={{ background: '#C9A962', color: '#fff' }}
                whileTap={{ scale: 0.98 }}
              >
                <Navigation className="w-5 h-5" />
                <span>Maps</span>
              </motion.a>
              <motion.a
                href={`https://waze.com/ul?q=${encodeURIComponent(wedding.venueAddress)}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 flex items-center justify-center gap-2 font-medium transition-all"
                style={{
                  background: '#C9A962',
                  color: '#fff',
                  border: '1px solid #C9A962'
                }}
                whileHover={{ background: 'transparent', color: '#C9A962' }}
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
            transition={{ delay: 1.7 }}
          >
            <RSVPForm
              guest={guest}
              themeColor="#C9A962"
            />
          </motion.div>
        )}

        {/* Gift section */}
        {wedding.enableBitGifts && wedding.bitPhone && (
          <motion.div
            className="mt-8 p-6 text-center"
            style={{
              background: 'rgba(255,255,255,0.6)',
              border: '1px solid #C9A962'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.9 }}
          >
            <h3 className="text-lg mb-2" style={{ color: '#1A1A1A', fontFamily: "'Cinzel', serif" }}>רוצים לשלוח מתנה?</h3>
            <p className="text-sm mb-4" style={{ color: '#666' }}>תודה מראש על המחשבה</p>

            <a
              href={wedding.bitPhone}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 font-medium transition-all hover:bg-[#C9A962] hover:text-white"
              style={{
                background: 'transparent',
                color: '#C9A962',
                border: '1px solid #C9A962'
              }}
            >
              <span>💳</span>
              <span>שליחת מתנה ב-Bit</span>
            </a>
          </motion.div>
        )}


        {/* Footer */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.3 }}
        >
          <GoldLine delay={2.3} width="30%" />
        </motion.div>
      </div>
    </div>
  );
}
