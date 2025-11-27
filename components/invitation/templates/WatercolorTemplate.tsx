'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation, Heart } from 'lucide-react';
import { RSVPForm } from '../RSVPForm';
import type { InvitationTemplateProps } from './types';

// Watercolor blob component
const WatercolorBlob = ({ color, x, y, size, delay }: { color: string; x: string; y: string; size: number; delay: number }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      left: x,
      top: y,
      width: size,
      height: size,
      background: color,
      filter: 'blur(30px)',
      opacity: 0.5
    }}
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 0.5 }}
    transition={{ delay, duration: 1.5 }}
  />
);

// Brush stroke underline
const BrushStroke = ({ delay, color }: { delay: number; color: string }) => (
  <motion.svg
    className="w-40 h-4 mx-auto"
    viewBox="0 0 160 16"
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.6 }}
    transition={{ delay, duration: 0.8 }}
  >
    <motion.path
      d="M0,8 Q40,2 80,8 T160,8"
      fill="none"
      stroke={color}
      strokeWidth="6"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay, duration: 1.2, ease: "easeOut" }}
    />
  </motion.svg>
);

export default function WatercolorTemplate({ wedding, guest, dateParts, isRSVP = false }: InvitationTemplateProps) {
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
        background: '#FFFEF8',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)' opacity='0.03'/%3E%3C/svg%3E")`
      }}
      dir="rtl"
    >
      {/* Watercolor blobs */}
      <WatercolorBlob color="#FFCCCB" x="5%" y="10%" size={200} delay={0.2} />
      <WatercolorBlob color="#AED9E0" x="70%" y="5%" size={180} delay={0.4} />
      <WatercolorBlob color="#E6E6FA" x="10%" y="50%" size={150} delay={0.6} />
      <WatercolorBlob color="#98FF98" x="75%" y="60%" size={170} delay={0.8} />
      <WatercolorBlob color="#FFCCCB" x="40%" y="80%" size={160} delay={1} />

      {/* Paint drip effect on sides */}
      <motion.div
        className="absolute top-0 left-4 w-8 h-40 rounded-b-full pointer-events-none"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(174, 217, 224, 0.4))' }}
        initial={{ scaleY: 0, transformOrigin: 'top' }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.5, duration: 1.5 }}
      />
      <motion.div
        className="absolute top-0 right-8 w-6 h-32 rounded-b-full pointer-events-none"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(255, 204, 203, 0.4))' }}
        initial={{ scaleY: 0, transformOrigin: 'top' }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.7, duration: 1.5 }}
      />

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
            className="text-lg"
            style={{
              color: '#7A6B5D',
              fontFamily: "'Frank Ruhl Libre', serif"
            }}
          >
            {guest ? `${guest.name} מוזמנים` : 'הנכם מוזמנים'}
          </span>
        </motion.div>

        {/* Media */}
        {wedding.mediaUrl && (
          <motion.div
            className="relative mx-auto mb-8 max-w-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Watercolor frame effect */}
            <div
              className="absolute -inset-4 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,204,203,0.3), rgba(174,217,224,0.3), rgba(230,230,250,0.3))',
                filter: 'blur(15px)'
              }}
            />

            {wedding.mediaType === 'video' ? (
              <video
                src={wedding.mediaUrl}
                autoPlay
                loop
                muted
                playsInline
                className="relative w-full aspect-square object-cover rounded-2xl"
                style={{ border: '4px solid white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
              />
            ) : (
              <img
                src={wedding.mediaUrl}
                alt={`${wedding.groomName} & ${wedding.brideName}`}
                className="relative w-full aspect-square object-cover rounded-2xl"
                style={{
                  border: '4px solid white',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  ...(wedding.mediaPosition && { objectPosition: `${wedding.mediaPosition.x}% ${wedding.mediaPosition.y}%` })
                }}
              />
            )}
          </motion.div>
        )}

        {/* Names */}
        <motion.div
          className="text-center mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <h1
            className="text-4xl md:text-5xl mb-1"
            style={{
              fontFamily: "'Frank Ruhl Libre', serif",
              color: '#5C4C4C',
              fontWeight: 400
            }}
          >
            {wedding.groomName}
          </h1>
          <BrushStroke delay={0.6} color="#FFCCCB" />
        </motion.div>

        <motion.div
          className="flex items-center justify-center gap-3 my-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
        >
          <Heart className="w-5 h-5" style={{ color: '#DAA520' }} fill="#DAA520" />
        </motion.div>

        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <h1
            className="text-4xl md:text-5xl mb-1"
            style={{
              fontFamily: "'Frank Ruhl Libre', serif",
              color: '#5C4C4C',
              fontWeight: 400
            }}
          >
            {wedding.brideName}
          </h1>
          <BrushStroke delay={1} color="#AED9E0" />
        </motion.div>

        {/* Invitation text */}
        <motion.p
          className="text-center text-lg mb-8"
          style={{
            color: '#7A6B5D',
            fontFamily: "'Assistant', sans-serif"
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {wedding.description || 'מים רבים לא יוכלו לכבות את האהבה ונהרות לא ישטפוה'}
        </motion.p>

        {/* Date card */}
        <motion.div
          className="rounded-2xl p-6 mb-6 text-center relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.05)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          {/* Watercolor accent */}
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'rgba(255,204,203,0.3)', filter: 'blur(20px)' }}
          />

          <div
            className="text-5xl mb-2 relative"
            style={{ color: '#DAA520', fontFamily: "'Frank Ruhl Libre', serif" }}
          >
            {dateParts.day}
          </div>
          <div className="text-xl mb-1" style={{ color: '#5C4C4C' }}>
            {dateParts.month} {dateParts.year}
          </div>
          <div className="text-lg mb-3" style={{ color: '#7A6B5D' }}>
            {dateParts.weekday}
          </div>
          <div
            className="text-sm px-4 py-1 rounded-full inline-block"
            style={{ background: 'rgba(174,217,224,0.4)', color: '#5C4C4C' }}
          >
            {dateParts.hebrewDate}
          </div>
        </motion.div>

        {/* Time and Location */}
        <motion.div
          className="space-y-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {/* Reception time */}
          <div
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.7)' }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,204,203,0.5)' }}
            >
              <Clock className="w-5 h-5" style={{ color: '#7A6B5D' }} />
            </div>
            <div className="flex-1">
              <div className="text-xs" style={{ color: '#9A8B7D' }}>קבלת פנים</div>
              <div className="text-lg" style={{ color: '#5C4C4C', fontFamily: "'Frank Ruhl Libre', serif" }}>{wedding.eventTime}</div>
            </div>
          </div>

          {/* Chuppah time */}
          {wedding.chuppahTime && (
            <div
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.7)' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(218,165,32,0.3)' }}
              >
                <Heart className="w-5 h-5" style={{ color: '#7A6B5D' }} />
              </div>
              <div className="flex-1">
                <div className="text-xs" style={{ color: '#9A8B7D' }}>חופה</div>
                <div className="text-lg" style={{ color: '#5C4C4C', fontFamily: "'Frank Ruhl Libre', serif" }}>{wedding.chuppahTime}</div>
              </div>
            </div>
          )}

          {/* Location */}
          <div
            className="p-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.7)' }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(174,217,224,0.5)' }}
              >
                <MapPin className="w-5 h-5" style={{ color: '#7A6B5D' }} />
              </div>
              <div className="flex-1">
                <div className="text-lg" style={{ color: '#5C4C4C', fontFamily: "'Frank Ruhl Libre', serif" }}>{wedding.venue}</div>
                <div className="text-sm" style={{ color: '#9A8B7D' }}>{wedding.venueAddress}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,204,203,0.6), rgba(174,217,224,0.6))',
                  color: '#5C4C4C'
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
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(174,217,224,0.6), rgba(255,204,203,0.6))',
                  color: '#5C4C4C'
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
            transition={{ delay: 1.7 }}
          >
            <RSVPForm guest={guest} themeColor="#DAA520" />
          </motion.div>
        )}

        {/* Gift section */}
        {wedding.enableBitGifts && wedding.bitPhone && (
          <motion.div
            className="mt-6 p-6 rounded-2xl text-center"
            style={{ background: 'rgba(255,255,255,0.7)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.9 }}
          >
            <h3 className="text-lg mb-2" style={{ color: '#5C4C4C', fontFamily: "'Frank Ruhl Libre', serif" }}>🎨 רוצים לשלוח מתנה?</h3>
            <p className="text-sm mb-4" style={{ color: '#9A8B7D' }}>תודה מראש על המחשבה</p>

            <a
              href={wedding.bitPhone}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,204,203,0.6), rgba(174,217,224,0.6))',
                color: '#5C4C4C'
              }}
            >
              <span>💳</span>
              <span>שליחת מתנה ב-Bit</span>
            </a>
          </motion.div>
        )}


        {/* Footer */}
        <motion.div
          className="mt-12 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 2.3 }}
        >
          <svg width="60" height="20" viewBox="0 0 60 20">
            <path d="M0,10 Q15,5 30,10 T60,10" fill="none" stroke="#DAA520" strokeWidth="2" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
