'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation, Heart } from 'lucide-react';
import { RSVPForm } from '../RSVPForm';
import type { InvitationTemplateProps } from './types';

// Neon line component
const NeonLine = ({ delay, direction }: { delay: number; direction: 'horizontal' | 'vertical' }) => (
  <motion.div
    className={`absolute ${direction === 'horizontal' ? 'h-px w-full' : 'w-px h-full'}`}
    style={{
      background: direction === 'horizontal'
        ? 'linear-gradient(90deg, transparent, #FF00FF, #00FFFF, transparent)'
        : 'linear-gradient(180deg, transparent, #00FFFF, #FF00FF, transparent)',
      boxShadow: '0 0 10px currentColor'
    }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0.3, 0.7, 0.3], scale: 1 }}
    transition={{ delay, duration: 3, repeat: Infinity }}
  />
);

// Glitch text effect
const GlitchText = ({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <motion.span
    className={`relative inline-block ${className || ''}`}
    style={style}
    animate={{
      textShadow: [
        '2px 0 #FF00FF, -2px 0 #00FFFF',
        '-2px 0 #FF00FF, 2px 0 #00FFFF',
        '2px 0 #FF00FF, -2px 0 #00FFFF'
      ]
    }}
    transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 3 }}
  >
    {children}
  </motion.span>
);

// Floating hologram element
const HologramElement = ({ x, y, delay }: { x: string; y: string; delay: number }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: x, top: y }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 0.5, scale: 1 }}
    transition={{ delay, duration: 0.8 }}
  >
    <motion.div
      className="w-20 h-20"
      style={{
        background: 'linear-gradient(45deg, rgba(255,0,255,0.2), rgba(0,255,255,0.2))',
        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
    />
  </motion.div>
);

// Grid background
const CyberGrid = () => (
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      backgroundImage: `
        linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
      `,
      backgroundSize: '50px 50px',
      perspective: '500px',
      transform: 'rotateX(60deg)',
      transformOrigin: 'center top',
      opacity: 0.3
    }}
  />
);

export default function NeonFuturisticTemplate({ wedding, guest, dateParts, isRSVP = false }: InvitationTemplateProps) {
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
        background: 'linear-gradient(180deg, #0D0D0D 0%, #1A0A2E 50%, #0D0D0D 100%)'
      }}
      dir="rtl"
    >
      {/* Cyber grid background */}
      <CyberGrid />

      {/* Neon lines */}
      <div className="absolute top-20 left-0 right-0">
        <NeonLine delay={0.2} direction="horizontal" />
      </div>
      <div className="absolute bottom-40 left-0 right-0">
        <NeonLine delay={0.4} direction="horizontal" />
      </div>
      <div className="absolute top-0 bottom-0 left-10">
        <NeonLine delay={0.6} direction="vertical" />
      </div>
      <div className="absolute top-0 bottom-0 right-10">
        <NeonLine delay={0.8} direction="vertical" />
      </div>

      {/* Hologram elements */}
      <HologramElement x="5%" y="15%" delay={0.3} />
      <HologramElement x="85%" y="25%" delay={0.5} />
      <HologramElement x="10%" y="70%" delay={0.7} />
      <HologramElement x="80%" y="80%" delay={0.9} />

      {/* Scanline effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.1) 50%)',
          backgroundSize: '100% 4px'
        }}
        animate={{ backgroundPosition: ['0 0', '0 4px'] }}
        transition={{ duration: 0.5, repeat: Infinity }}
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
          <GlitchText
            className="text-lg tracking-widest"
            style={{ color: '#00FFFF', fontFamily: "'Orbitron', sans-serif" }}
          >
            {guest ? `// ${guest.name} //` : '// WELCOME //'}
          </GlitchText>
        </motion.div>

        {/* Media with holographic frame */}
        {wedding.mediaUrl && (
          <motion.div
            className="relative mx-auto mb-8 max-w-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Holographic border */}
            <motion.div
              className="absolute -inset-2"
              style={{
                background: 'linear-gradient(45deg, #FF00FF, #00FFFF, #FF00FF, #00FFFF)',
                backgroundSize: '300% 300%'
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <div className="relative bg-black p-1">
              {wedding.mediaType === 'video' ? (
                <video
                  src={wedding.mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full aspect-square object-cover"
                  style={{ filter: 'contrast(1.1) saturate(1.2)' }}
                />
              ) : (
                <img
                  src={wedding.mediaUrl}
                  alt={`${wedding.groomName} & ${wedding.brideName}`}
                  className="w-full aspect-square object-cover"
                  style={{ filter: 'contrast(1.1) saturate(1.2)' }}
                />
              )}
            </div>

            {/* Corner brackets */}
            {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
              <motion.div
                key={i}
                className={`absolute ${pos} w-6 h-6`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <svg viewBox="0 0 24 24" stroke="#00FFFF" strokeWidth="2" fill="none">
                  <path d={
                    i === 0 ? 'M0 8 L0 0 L8 0' :
                    i === 1 ? 'M16 0 L24 0 L24 8' :
                    i === 2 ? 'M0 16 L0 24 L8 24' :
                    'M16 24 L24 24 L24 16'
                  } />
                </svg>
              </motion.div>
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
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-2"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: '#FF00FF',
              textShadow: '0 0 10px #FF00FF, 0 0 20px #FF00FF, 0 0 30px #FF00FF'
            }}
            animate={{
              textShadow: [
                '0 0 10px #FF00FF, 0 0 20px #FF00FF',
                '0 0 20px #FF00FF, 0 0 40px #FF00FF',
                '0 0 10px #FF00FF, 0 0 20px #FF00FF'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {wedding.groomName}
          </motion.h1>

          <motion.div
            className="flex items-center justify-center gap-4 my-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
          >
            <motion.div
              className="h-px w-16"
              style={{ background: 'linear-gradient(90deg, transparent, #00FFFF)' }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Heart className="w-6 h-6" style={{ color: '#FF00FF', filter: 'drop-shadow(0 0 5px #FF00FF)' }} fill="#FF00FF" />
            </motion.div>
            <motion.div
              className="h-px w-16"
              style={{ background: 'linear-gradient(90deg, #00FFFF, transparent)' }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl font-bold"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: '#00FFFF',
              textShadow: '0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF'
            }}
            animate={{
              textShadow: [
                '0 0 10px #00FFFF, 0 0 20px #00FFFF',
                '0 0 20px #00FFFF, 0 0 40px #00FFFF',
                '0 0 10px #00FFFF, 0 0 20px #00FFFF'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            {wedding.brideName}
          </motion.h1>
        </motion.div>

        {/* Invitation text */}
        <motion.p
          className="text-center text-lg mb-8"
          style={{
            color: 'rgba(255,255,255,0.8)',
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
          className="p-6 mb-6 text-center relative overflow-hidden"
          style={{
            background: 'rgba(13,13,13,0.9)',
            border: '1px solid #00FFFF',
            boxShadow: '0 0 20px rgba(0,255,255,0.3), inset 0 0 20px rgba(0,255,255,0.1)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <motion.div
            className="text-6xl font-bold mb-2"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: '#00FFFF',
              textShadow: '0 0 10px #00FFFF'
            }}
            animate={{
              textShadow: ['0 0 10px #00FFFF', '0 0 20px #00FFFF', '0 0 10px #00FFFF']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {dateParts.day}
          </motion.div>
          <div className="text-xl mb-1" style={{ color: '#FF00FF' }}>
            {dateParts.month} {dateParts.year}
          </div>
          <div className="text-lg mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {dateParts.weekday}
          </div>
          <div
            className="text-sm px-4 py-1 inline-block"
            style={{
              border: '1px solid #FF00FF',
              color: '#FF00FF',
              boxShadow: '0 0 10px rgba(255,0,255,0.3)'
            }}
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
              background: 'rgba(13,13,13,0.8)',
              border: '1px solid rgba(0,255,255,0.3)'
            }}
          >
            <div
              className="w-12 h-12 flex items-center justify-center"
              style={{ border: '1px solid #00FFFF' }}
            >
              <Clock className="w-6 h-6" style={{ color: '#00FFFF' }} />
            </div>
            <div className="flex-1">
              <div className="text-xs tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>// RECEPTION</div>
              <div className="text-xl font-bold" style={{ color: '#00FFFF', fontFamily: "'Orbitron', sans-serif" }}>{wedding.eventTime}</div>
            </div>
          </div>

          {/* Chuppah time */}
          {wedding.chuppahTime && (
            <div
              className="flex items-center gap-4 p-4"
              style={{
                background: 'rgba(13,13,13,0.8)',
                border: '1px solid rgba(255,0,255,0.3)'
              }}
            >
              <div
                className="w-12 h-12 flex items-center justify-center"
                style={{ border: '1px solid #FF00FF' }}
              >
                <Heart className="w-6 h-6" style={{ color: '#FF00FF' }} />
              </div>
              <div className="flex-1">
                <div className="text-xs tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>// CEREMONY</div>
                <div className="text-xl font-bold" style={{ color: '#FF00FF', fontFamily: "'Orbitron', sans-serif" }}>{wedding.chuppahTime}</div>
              </div>
            </div>
          )}

          {/* Location */}
          <div
            className="p-4"
            style={{
              background: 'rgba(13,13,13,0.8)',
              border: '1px solid rgba(0,255,255,0.3)'
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-12 h-12 flex items-center justify-center"
                style={{ border: '1px solid #00FFFF' }}
              >
                <MapPin className="w-6 h-6" style={{ color: '#00FFFF' }} />
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold" style={{ color: 'white' }}>{wedding.venue}</div>
                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{wedding.venueAddress}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 flex items-center justify-center gap-2 font-bold tracking-widest"
                style={{
                  background: 'transparent',
                  border: '2px solid #00FFFF',
                  color: '#00FFFF',
                  fontFamily: "'Orbitron', sans-serif"
                }}
                whileHover={{
                  boxShadow: '0 0 20px #00FFFF, inset 0 0 20px rgba(0,255,255,0.2)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Navigation className="w-5 h-5" />
                <span>MAPS</span>
              </motion.a>
              <motion.a
                href={`https://waze.com/ul?q=${encodeURIComponent(wedding.venueAddress)}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 flex items-center justify-center gap-2 font-bold tracking-widest"
                style={{
                  background: 'transparent',
                  border: '2px solid #FF00FF',
                  color: '#FF00FF',
                  fontFamily: "'Orbitron', sans-serif"
                }}
                whileHover={{
                  boxShadow: '0 0 20px #FF00FF, inset 0 0 20px rgba(255,0,255,0.2)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Navigation className="w-5 h-5" />
                <span>WAZE</span>
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
            <RSVPForm guest={guest} themeColor="#00FFFF" />
          </motion.div>
        )}

        {/* Gift section */}
        {wedding.enableBitGifts && wedding.bitPhone && (
          <motion.div
            className="mt-6 p-6 text-center"
            style={{
              background: 'rgba(13,13,13,0.8)',
              border: '1px solid rgba(255,0,255,0.3)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <h3 className="text-lg font-bold mb-2" style={{ color: '#FF00FF', fontFamily: "'Orbitron', sans-serif" }}>// GIFT TRANSFER //</h3>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>תודה מראש על המחשבה</p>

            <a
              href={wedding.bitPhone}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 font-bold tracking-widest transition-all"
              style={{
                border: '2px solid #FF00FF',
                color: '#FF00FF',
                fontFamily: "'Orbitron', sans-serif"
              }}
            >
              <span>💳</span>
              <span>SEND VIA BIT</span>
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
          <motion.div
            className="text-xs tracking-[0.5em]"
            style={{ color: '#00FFFF' }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {'</ END TRANSMISSION />'}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
