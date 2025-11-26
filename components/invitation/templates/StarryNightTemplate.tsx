'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RSVPForm } from '@/components/invitation/RSVPForm';
import { getGenderText, type PartnerType } from '@/lib/utils/genderText';
import type { InvitationTemplateProps } from './types';

// Twinkling star component
const Star = ({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) => (
  <motion.div
    className="absolute rounded-full bg-white"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: size,
      height: size,
    }}
    animate={{
      opacity: [0.2, 1, 0.2],
      scale: [0.8, 1.2, 0.8],
    }}
    transition={{
      duration: 2 + Math.random() * 2,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
);

// Shooting star animation
const ShootingStar = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute w-1 h-1 bg-white rounded-full"
    initial={{ x: '100%', y: '0%', opacity: 0 }}
    animate={{
      x: ['100%', '0%'],
      y: ['0%', '80%'],
      opacity: [0, 1, 1, 0],
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      repeatDelay: 8 + Math.random() * 10,
      ease: 'linear',
    }}
    style={{
      boxShadow: '0 0 6px 2px white, -20px -10px 10px white, -40px -20px 8px rgba(255,255,255,0.5)',
    }}
  />
);

// Glowing dust particles
const DustParticle = ({ x, y, delay }: { x: number; y: number; delay: number }) => (
  <motion.div
    className="absolute w-0.5 h-0.5 bg-yellow-200 rounded-full"
    style={{ left: `${x}%`, top: `${y}%` }}
    animate={{
      opacity: [0, 0.8, 0],
      y: [0, -20, -40],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: 'easeOut',
    }}
  />
);

// Moon component
const Moon = () => (
  <motion.div
    className="absolute top-12 right-8 w-16 h-16 md:w-24 md:h-24"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 1.5, delay: 0.5 }}
  >
    <div
      className="w-full h-full rounded-full"
      style={{
        background: 'radial-gradient(circle at 30% 30%, #FFF9C4 0%, #FFE082 40%, #FFD54F 100%)',
        boxShadow: '0 0 60px 20px rgba(255, 215, 0, 0.3), 0 0 100px 40px rgba(255, 215, 0, 0.1)',
      }}
    />
    {/* Moon craters */}
    <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-yellow-100/30" />
    <div className="absolute bottom-6 left-4 w-2 h-2 rounded-full bg-yellow-100/30" />
  </motion.div>
);

export default function StarryNightTemplate({ wedding, guest, dateParts, isRSVP }: InvitationTemplateProps) {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);
  const [dustParticles, setDustParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Generate stars
    const newStars = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 3,
    }));
    setStars(newStars);

    // Generate dust particles
    const newDust = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 50 + Math.random() * 50,
      delay: Math.random() * 5,
    }));
    setDustParticles(newDust);
  }, []);

  const theme = wedding.theme || {
    primaryColor: '#FFD700',
    secondaryColor: '#191970',
    fontFamily: 'Assistant'
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0D0D2B 0%, #191970 30%, #301934 70%, #1A1A2E 100%)',
      }}
    >
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&family=Heebo:wght@200;300;400;500&family=Rubik:wght@300;400;500&display=swap"
        rel="stylesheet"
      />

      {/* Stars Layer */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <Star key={star.id} {...star} />
        ))}
      </div>

      {/* Shooting Stars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <ShootingStar delay={3} />
        <ShootingStar delay={12} />
        <ShootingStar delay={20} />
      </div>

      {/* Dust Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {dustParticles.map((dust) => (
          <DustParticle key={dust.id} {...dust} />
        ))}
      </div>

      {/* Moon */}
      <Moon />

      {/* Main Content */}
      <div className="relative z-10 max-w-lg mx-auto px-6 py-16">

        {/* Hero Image in Glowing Frame */}
        {wedding.mediaUrl && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative mb-12"
          >
            <div className="relative max-w-xs mx-auto">
              {/* Glow effect */}
              <div
                className="absolute inset-0 rounded-full blur-3xl opacity-30"
                style={{ background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)' }}
              />
              {/* Image frame */}
              <div
                className="relative aspect-square rounded-full overflow-hidden border-2 border-yellow-400/50"
                style={{
                  boxShadow: '0 0 30px rgba(255, 215, 0, 0.3), inset 0 0 30px rgba(255, 215, 0, 0.1)',
                }}
              >
                {wedding.mediaType === 'video' ? (
                  <video
                    src={wedding.mediaUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={wedding.mediaUrl}
                    alt={`${wedding.groomName} & ${wedding.brideName}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              {/* Orbiting stars around image */}
              <motion.div
                className="absolute w-3 h-3"
                animate={{
                  rotate: 360,
                }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                style={{ top: '50%', left: '50%', transformOrigin: '-100px 0' }}
              >
                <div className="w-full h-full bg-yellow-300 rounded-full" style={{ boxShadow: '0 0 10px #FFD700' }} />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Names with Star Dust Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-center mb-8"
        >
          <motion.h1
            className="text-5xl md:text-7xl text-white mb-2"
            style={{
              fontFamily: '"Amatic SC", cursive',
              textShadow: '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
            }}
            animate={{
              textShadow: [
                '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
                '0 0 30px rgba(255, 215, 0, 0.7), 0 0 60px rgba(255, 215, 0, 0.4)',
                '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {wedding.groomName}
          </motion.h1>

          <motion.div
            className="flex items-center justify-center gap-4 my-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: 'spring' }}
          >
            <span className="text-2xl">✦</span>
            <span className="text-3xl text-yellow-400">&</span>
            <span className="text-2xl">✦</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl text-white"
            style={{
              fontFamily: '"Amatic SC", cursive',
              textShadow: '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
            }}
            animate={{
              textShadow: [
                '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
                '0 0 30px rgba(255, 215, 0, 0.7), 0 0 60px rgba(255, 215, 0, 0.4)',
                '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          >
            {wedding.brideName}
          </motion.h1>
        </motion.div>

        {/* Quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-center text-purple-200/70 text-sm mb-8 italic"
        >
          {wedding.description || 'מים רבים לא יוכלו לכבות את האהבה'}
        </motion.p>

        {/* Invitation Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-lg text-purple-100/80">
            {getGenderText('happy', (wedding.partner1Type || 'groom') as PartnerType, (wedding.partner2Type || 'bride') as PartnerType)} ו{getGenderText('thrilled', (wedding.partner1Type || 'groom') as PartnerType, (wedding.partner2Type || 'bride') as PartnerType)} להזמינכם
          </p>
        </motion.div>

        {/* Date Card - Constellation Style */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="relative mb-10"
        >
          <div
            className="relative rounded-2xl p-8 backdrop-blur-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.1), inset 0 0 30px rgba(255, 215, 0, 0.05)',
            }}
          >
            {/* Constellation lines */}
            <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 300 200">
              <line x1="50" y1="50" x2="150" y2="30" stroke="#FFD700" strokeWidth="1" />
              <line x1="150" y1="30" x2="250" y2="50" stroke="#FFD700" strokeWidth="1" />
              <line x1="250" y1="50" x2="200" y2="150" stroke="#FFD700" strokeWidth="1" />
              <line x1="200" y1="150" x2="100" y2="150" stroke="#FFD700" strokeWidth="1" />
              <line x1="100" y1="150" x2="50" y2="50" stroke="#FFD700" strokeWidth="1" />
              <circle cx="50" cy="50" r="3" fill="#FFD700" />
              <circle cx="150" cy="30" r="3" fill="#FFD700" />
              <circle cx="250" cy="50" r="3" fill="#FFD700" />
              <circle cx="200" cy="150" r="3" fill="#FFD700" />
              <circle cx="100" cy="150" r="3" fill="#FFD700" />
            </svg>

            <div className="relative z-10">
              <p className="text-center text-xs tracking-[0.3em] text-purple-200/60 uppercase mb-4">
                {dateParts.hebrewDate} • {dateParts.hebrewWeekday}
              </p>

              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="text-center">
                  <p className="text-sm text-yellow-400">{dateParts.weekday}</p>
                </div>
                <div className="text-center">
                  <p
                    className="text-7xl font-bold text-white"
                    style={{
                      fontFamily: '"Amatic SC", cursive',
                      textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
                    }}
                  >
                    {dateParts.day}
                  </p>
                  <p className="text-sm text-purple-200/60">{dateParts.month} {dateParts.year}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-yellow-400">{wedding.eventTime}</p>
                </div>
              </div>

              <div className="text-center space-y-2 text-purple-100/70">
                <p className="flex items-center justify-center gap-2">
                  <span className="text-yellow-400">☆</span>
                  <span>קבלת פנים {wedding.eventTime}</span>
                </p>
                {wedding.chuppahTime && (
                  <p className="flex items-center justify-center gap-2">
                    <span className="text-yellow-400">☆</span>
                    <span>חופה וקידושין {wedding.chuppahTime}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Venue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-xl text-yellow-400 mb-2" style={{ fontFamily: '"Amatic SC", cursive' }}>
            ✧ {wedding.venue} ✧
          </p>
          <p className="text-sm text-purple-200/60">{wedding.venueAddress}</p>
        </motion.div>

        {/* RSVP Section */}
        {isRSVP && guest ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.6 }}
            className="mb-10 rounded-2xl p-6 backdrop-blur-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
            }}
          >
            <RSVPForm guest={guest} themeColor="#FFD700" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.6 }}
            className="text-center mb-10"
          >
            <p className="text-xs tracking-[0.3em] text-yellow-400 uppercase mb-2">אישור הגעה</p>
            <p className="text-purple-200/60 text-sm">קישור לאישור הגעה נשלח אליכם בהודעה אישית</p>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.6 }}
          className="flex justify-center gap-4 mb-10"
        >
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full border border-yellow-400/50 text-yellow-400 text-sm hover:bg-yellow-400/10 transition-all duration-300"
            style={{ boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)' }}
          >
            ✦ Maps
          </a>
          <a
            href={`https://waze.com/ul?q=${encodeURIComponent(wedding.venueAddress)}&navigate=yes`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full border border-yellow-400/50 text-yellow-400 text-sm hover:bg-yellow-400/10 transition-all duration-300"
            style={{ boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)' }}
          >
            ✦ Waze
          </a>
        </motion.div>

        {/* Gift Section */}
        {wedding.enableBitGifts && wedding.bitPhone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.4, duration: 0.6 }}
            className="text-center mb-10"
          >
            <a
              href={wedding.bitPhone}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-10 py-4 rounded-full text-sm transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                color: '#1A1A2E',
                boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)',
              }}
            >
              ✨ שליחת מתנה ✨
            </a>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6, duration: 0.6 }}
          className="text-center pt-8"
        >
          <div className="flex justify-center gap-3 mb-4">
            <span className="text-yellow-400">✦</span>
            <span className="text-purple-300">✦</span>
            <span className="text-yellow-400">✦</span>
          </div>
          <p className="text-xs tracking-[0.3em] text-purple-200/40 uppercase">
            נשמח לראותכם תחת כיפת הכוכבים
          </p>
        </motion.div>
      </div>
    </div>
  );
}
