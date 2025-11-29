'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Gift, Navigation, Heart } from 'lucide-react';
import { RSVPForm } from '../RSVPForm';
import type { InvitationTemplateProps } from './types';

// Animated wave component
const Wave = ({ delay, opacity, y }: { delay: number; opacity: number; y: string }) => (
  <motion.div
    className="absolute left-0 right-0 h-24 pointer-events-none"
    style={{ bottom: y }}
    initial={{ opacity: 0 }}
    animate={{ opacity }}
    transition={{ delay, duration: 1 }}
  >
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
      <motion.path
        d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z"
        fill="url(#waveGradient)"
        animate={{
          d: [
            "M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z",
            "M0,60 C150,0 350,120 600,60 C850,0 1050,120 1200,60 L1200,120 L0,120 Z",
            "M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z"
          ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay
        }}
      />
      <defs>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(64, 224, 208, 0.3)" />
          <stop offset="50%" stopColor="rgba(0, 191, 255, 0.3)" />
          <stop offset="100%" stopColor="rgba(64, 224, 208, 0.3)" />
        </linearGradient>
      </defs>
    </svg>
  </motion.div>
);

// Floating sun rays
const SunRay = ({ rotation, delay }: { rotation: number; delay: number }) => (
  <motion.div
    className="absolute w-1 h-16 bg-gradient-to-b from-amber-300/60 to-transparent origin-bottom"
    style={{
      transform: `rotate(${rotation}deg)`,
      top: '10%',
      left: '15%'
    }}
    initial={{ opacity: 0, scaleY: 0 }}
    animate={{ opacity: [0.3, 0.6, 0.3], scaleY: [0.8, 1, 0.8] }}
    transition={{
      duration: 3,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  />
);

// Olive branch decoration
const OliveBranch = ({ side }: { side: 'left' | 'right' }) => (
  <motion.div
    className={`absolute top-1/4 ${side === 'left' ? 'left-4' : 'right-4'} w-16 h-32 pointer-events-none`}
    initial={{ opacity: 0, x: side === 'left' ? -20 : 20 }}
    animate={{ opacity: 0.7, x: 0 }}
    transition={{ duration: 1.5, delay: 0.5 }}
  >
    <svg viewBox="0 0 60 120" className={`w-full h-full ${side === 'right' ? 'transform scale-x-[-1]' : ''}`}>
      {/* Main branch */}
      <motion.path
        d="M30,120 Q25,80 30,40 Q35,20 30,0"
        fill="none"
        stroke="#6B7B3A"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 0.8 }}
      />
      {/* Leaves */}
      {[20, 40, 60, 80, 100].map((y, i) => (
        <motion.ellipse
          key={i}
          cx={i % 2 === 0 ? 20 : 40}
          cy={y}
          rx="10"
          ry="5"
          fill="#8FA94D"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.8, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 + i * 0.2 }}
          transform={`rotate(${i % 2 === 0 ? -30 : 30} ${i % 2 === 0 ? 20 : 40} ${y})`}
        />
      ))}
    </svg>
  </motion.div>
);

export default function MediterraneanTemplate({ wedding, guest, dateParts, isRSVP = false, askAboutMeals }: InvitationTemplateProps) {
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
        background: 'linear-gradient(180deg, #FFF5E6 0%, #FFE4C4 30%, #FFCBA4 60%, #F4A460 100%)'
      }}
      dir="rtl"
    >
      {/* Sun glow */}
      <motion.div
        className="absolute top-0 left-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,200,87,0.6) 0%, rgba(255,165,0,0.2) 40%, transparent 70%)'
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2 }}
      />

      {/* Sun rays */}
      {[...Array(8)].map((_, i) => (
        <SunRay key={i} rotation={i * 45 - 90} delay={i * 0.1} />
      ))}

      {/* Olive branches */}
      <OliveBranch side="left" />
      <OliveBranch side="right" />

      {/* Waves at bottom */}
      <Wave delay={0} opacity={0.4} y="0" />
      <Wave delay={0.5} opacity={0.3} y="30px" />
      <Wave delay={1} opacity={0.2} y="60px" />

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
              color: '#8B5A2B',
              fontFamily: wedding.theme?.fontFamily || 'serif'
            }}
          >
            הנכם מוזמנים
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
            {/* Decorative frame */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                border: '3px solid #DAA520',
                background: 'linear-gradient(135deg, rgba(218,165,32,0.2) 0%, transparent 50%, rgba(218,165,32,0.2) 100%)'
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

            {/* Corner decorations */}
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg" style={{ borderColor: '#40E0D0' }} />
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg" style={{ borderColor: '#40E0D0' }} />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 rounded-br-lg" style={{ borderColor: '#40E0D0' }} />
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg" style={{ borderColor: '#40E0D0' }} />
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
            className="text-4xl md:text-5xl font-bold mb-2"
            style={{
              fontFamily: wedding.theme?.fontFamily || 'serif',
              color: '#8B4513',
              textShadow: '2px 2px 4px rgba(139,69,19,0.2)'
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
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #40E0D0, transparent)' }} />
            <Heart className="w-6 h-6" style={{ color: '#DAA520' }} fill="#DAA520" />
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #40E0D0, transparent)' }} />
          </motion.div>

          <h1
            className="text-4xl md:text-5xl font-bold"
            style={{
              fontFamily: wedding.theme?.fontFamily || 'serif',
              color: '#8B4513',
              textShadow: '2px 2px 4px rgba(139,69,19,0.2)'
            }}
          >
            {wedding.brideName}
          </h1>
        </motion.div>

        {/* Invitation text */}
        <motion.p
          className="text-center text-lg mb-8"
          style={{
            color: '#8B5A2B',
            fontFamily: wedding.theme?.fontFamily || 'serif'
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
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,248,240,0.9) 100%)',
            boxShadow: '0 10px 40px rgba(139,69,19,0.15)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          {/* Decorative border */}
          <div
            className="absolute inset-2 rounded-xl pointer-events-none"
            style={{
              border: '2px dashed #40E0D0',
              opacity: 0.5
            }}
          />

          <div
            className="text-5xl font-bold mb-2"
            style={{ color: '#DAA520' }}
          >
            {dateParts.day}
          </div>
          <div
            className="text-xl mb-1"
            style={{ color: '#8B4513' }}
          >
            {dateParts.month} {dateParts.year}
          </div>
          <div
            className="text-lg mb-3"
            style={{ color: '#8B5A2B' }}
          >
            {dateParts.weekday}
          </div>
          <div
            className="text-sm px-4 py-1 rounded-full inline-block"
            style={{
              background: 'linear-gradient(90deg, #40E0D0, #00CED1)',
              color: 'white'
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
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #40E0D0, #00CED1)' }}
            >
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm" style={{ color: '#8B5A2B' }}>קבלת פנים</div>
              <div className="text-xl font-bold" style={{ color: '#8B4513' }}>{wedding.eventTime}</div>
            </div>
          </div>

          {/* Chuppah time */}
          {wedding.chuppahTime && (
            <div
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #DAA520, #FFD700)' }}
              >
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm" style={{ color: '#8B5A2B' }}>חופה</div>
                <div className="text-xl font-bold" style={{ color: '#8B4513' }}>{wedding.chuppahTime}</div>
              </div>
            </div>
          )}

          {/* Location */}
          <div
            className="p-4 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #F4A460, #E9967A)' }}
              >
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold" style={{ color: '#8B4513' }}>{wedding.venue}</div>
                <div className="text-sm" style={{ color: '#8B5A2B' }}>{wedding.venueAddress}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-white font-medium"
                style={{
                  background: 'linear-gradient(135deg, #40E0D0, #00CED1)'
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
                  background: 'linear-gradient(135deg, #DAA520, #FFD700)'
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
              askAboutMeals={wedding.askAboutMeals !== false}
              mealOptions={wedding.mealOptions}
              customOtherMealName={wedding.customOtherMealName}
            />
          </motion.div>
        )}

        {/* Gift section */}
        {wedding.enableBitGifts && wedding.bitPhone && (
          <motion.div
            className="mt-6 p-6 rounded-2xl text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,248,240,0.9) 100%)',
              boxShadow: '0 10px 40px rgba(139,69,19,0.15)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Gift className="w-6 h-6" style={{ color: '#DAA520' }} />
              <h3 className="text-xl font-bold" style={{ color: '#8B4513' }}>רוצים לשלוח מתנה?</h3>
            </div>
            <p className="text-sm mb-4" style={{ color: '#8B5A2B' }}>תודה מראש על המחשבה</p>

            <a
              href={wedding.bitPhone}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium"
              style={{
                background: 'linear-gradient(135deg, #40E0D0, #00CED1)'
              }}
            >
              <span>💳</span>
              <span>שליחת מתנה ב-Bit</span>
            </a>
          </motion.div>
        )}


        {/* Footer decoration */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 2 }}
        >
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, #DAA520)' }} />
            <span style={{ color: '#DAA520' }}>☀</span>
            <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, #DAA520, transparent)' }} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
