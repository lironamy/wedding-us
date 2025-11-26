'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RSVPForm } from '@/components/invitation/RSVPForm';
import { getGenderText, type PartnerType } from '@/lib/utils/genderText';
import type { InvitationTemplateProps } from './types';

// Floating petal component
const FloatingPetal = ({ delay, startX, size }: { delay: number; startX: number; size: number }) => (
  <motion.div
    className="absolute pointer-events-none"
    initial={{
      x: startX,
      y: -20,
      rotate: 0,
      opacity: 0
    }}
    animate={{
      x: [startX, startX + 30, startX - 20, startX + 10],
      y: ['0vh', '100vh'],
      rotate: [0, 180, 360],
      opacity: [0, 1, 1, 0]
    }}
    transition={{
      duration: 12 + Math.random() * 5,
      delay,
      repeat: Infinity,
      ease: 'linear'
    }}
    style={{
      width: size,
      height: size * 1.2,
      filter: 'blur(0.5px)'
    }}
  >
    <svg viewBox="0 0 24 30" fill="none">
      <path
        d="M12 0C12 0 24 10 24 20C24 25.5 18.6 30 12 30C5.4 30 0 25.5 0 20C0 10 12 0 12 0Z"
        fill="#FFB6C1"
        fillOpacity="0.6"
      />
    </svg>
  </motion.div>
);

// Golden sparkle effect
const Sparkle = ({ x, y, delay }: { x: string; y: string; delay: number }) => (
  <motion.div
    className="absolute w-1 h-1 bg-yellow-300 rounded-full"
    style={{ left: x, top: y }}
    animate={{
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 3,
    }}
  />
);

export default function RomanticGardenTemplate({ wedding, guest, dateParts, isRSVP }: InvitationTemplateProps) {
  const [petals, setPetals] = useState<Array<{ id: number; delay: number; startX: number; size: number }>>([]);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: string; y: string; delay: number }>>([]);

  useEffect(() => {
    // Generate petals
    const newPetals = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      delay: i * 2,
      startX: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
      size: 15 + Math.random() * 15,
    }));
    setPetals(newPetals);

    // Generate sparkles
    const newSparkles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
    }));
    setSparkles(newSparkles);
  }, []);

  const theme = wedding.theme || {
    primaryColor: '#D4A5A5',
    secondaryColor: '#8FBC8F',
    fontFamily: 'Assistant'
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #FFFEF2 0%, #FFF5F5 50%, #FFFEF2 100%)' }}>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Heebo:wght@300;400;500;700&family=David+Libre:wght@400;500;700&display=swap"
        rel="stylesheet"
      />

      {/* Floating Petals */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
        {petals.map((petal) => (
          <FloatingPetal key={petal.id} {...petal} />
        ))}
      </div>

      {/* Background Sparkles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {sparkles.map((sparkle) => (
          <Sparkle key={sparkle.id} {...sparkle} />
        ))}
      </div>

      {/* Decorative Corner Flourishes */}
      <div className="fixed top-0 left-0 w-32 h-32 opacity-20 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="none">
          <path d="M0 0 Q50 50 0 100 Q50 50 100 100" stroke="#D4A5A5" strokeWidth="1" fill="none" />
          <circle cx="20" cy="20" r="3" fill="#D4A5A5" />
          <circle cx="35" cy="35" r="2" fill="#D4A5A5" />
        </svg>
      </div>
      <div className="fixed top-0 right-0 w-32 h-32 opacity-20 pointer-events-none transform scale-x-[-1]">
        <svg viewBox="0 0 100 100" fill="none">
          <path d="M0 0 Q50 50 0 100 Q50 50 100 100" stroke="#D4A5A5" strokeWidth="1" fill="none" />
          <circle cx="20" cy="20" r="3" fill="#D4A5A5" />
          <circle cx="35" cy="35" r="2" fill="#D4A5A5" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-20 pt-8 pb-16">
        <div className="max-w-lg mx-auto px-4">

          {/* Hero Image with Organic Frame */}
          {wedding.mediaUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="relative mb-8"
            >
              <div className="relative mx-auto w-72 h-72 md:w-96 md:h-96">
                {/* Organic border effect */}
                <div
                  className="absolute inset-0 rounded-[40%_60%_70%_30%/30%_30%_70%_70%]"
                  style={{
                    background: 'linear-gradient(135deg, #D4A5A5 0%, #E8C8C8 50%, #D4A5A5 100%)',
                    padding: '4px',
                    transform: 'rotate(-3deg)'
                  }}
                />
                <div
                  className="absolute inset-1 rounded-[40%_60%_70%_30%/30%_30%_70%_70%] overflow-hidden"
                  style={{ transform: 'rotate(-3deg)' }}
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
                {/* Decorative flowers around frame */}
                <motion.div
                  className="absolute -top-4 -right-4 text-4xl"
                  animate={{ rotate: [0, 10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  🌸
                </motion.div>
                <motion.div
                  className="absolute -bottom-4 -left-4 text-3xl"
                  animate={{ rotate: [0, -10, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                >
                  🌷
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Names with decorative script */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center mb-6"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '60%' }}
              transition={{ duration: 1, delay: 0.8 }}
              className="h-px bg-gradient-to-r from-transparent via-[#D4A5A5] to-transparent mx-auto mb-4"
            />

            <h1
              className="text-5xl md:text-7xl mb-2"
              style={{
                fontFamily: '"Great Vibes", cursive',
                color: '#8B4B5C',
                textShadow: '2px 2px 4px rgba(212, 165, 165, 0.3)'
              }}
            >
              {wedding.groomName}
            </h1>

            <motion.span
              className="inline-block text-3xl text-[#D4A5A5] my-2"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ♥
            </motion.span>

            <h1
              className="text-5xl md:text-7xl"
              style={{
                fontFamily: '"Great Vibes", cursive',
                color: '#8B4B5C',
                textShadow: '2px 2px 4px rgba(212, 165, 165, 0.3)'
              }}
            >
              {wedding.brideName}
            </h1>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '60%' }}
              transition={{ duration: 1, delay: 1 }}
              className="h-px bg-gradient-to-r from-transparent via-[#D4A5A5] to-transparent mx-auto mt-4"
            />
          </motion.div>

          {/* Quote in elegant frame */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="relative bg-white/50 backdrop-blur-sm rounded-2xl p-6 mb-8 mx-4"
            style={{
              border: '1px solid rgba(212, 165, 165, 0.3)',
              boxShadow: '0 4px 20px rgba(212, 165, 165, 0.15)'
            }}
          >
            <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-2xl">🌿</span>
            <p
              className="text-center text-gray-600 italic text-lg"
              style={{ fontFamily: '"David Libre", serif' }}
            >
              {wedding.description || 'מים רבים לא יוכלו לכבות את האהבה ונהרות לא ישטפוה'}
            </p>
          </motion.div>

          {/* Invitation Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center mb-8"
          >
            <p className="text-xl text-[#6B4F4F]" style={{ fontFamily: '"Heebo", sans-serif' }}>
              {getGenderText('happy', (wedding.partner1Type || 'groom') as PartnerType, (wedding.partner2Type || 'bride') as PartnerType)} ו{getGenderText('thrilled', (wedding.partner1Type || 'groom') as PartnerType, (wedding.partner2Type || 'bride') as PartnerType)} להזמינכם ליום המאושר בחיינו
            </p>
          </motion.div>

          {/* Date Card - Watercolor style */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="relative bg-white rounded-3xl p-8 mb-8 mx-4 overflow-hidden"
            style={{
              boxShadow: '0 10px 40px rgba(212, 165, 165, 0.2)',
              border: '2px solid #E8D5D5'
            }}
          >
            {/* Watercolor effect background */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background: 'radial-gradient(circle at 20% 20%, #D4A5A5 0%, transparent 50%), radial-gradient(circle at 80% 80%, #8FBC8F 0%, transparent 50%)'
              }}
            />

            <div className="relative z-10">
              <p className="text-center text-sm text-gray-500 mb-2">
                {dateParts.hebrewDate} {dateParts.hebrewWeekday}
              </p>

              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-[#D4A5A5]">{dateParts.weekday}</p>
                </div>
                <div className="text-center px-6 py-2 rounded-full" style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #E8C8C8 100%)' }}>
                  <p className="text-5xl font-bold text-white">{dateParts.day}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-[#D4A5A5]">{dateParts.month}</p>
                  <p className="text-sm text-[#D4A5A5]">{dateParts.year}</p>
                </div>
              </div>

              <div className="text-center space-y-1 text-[#6B4F4F]">
                <p className="flex items-center justify-center gap-2">
                  <span>🥂</span>
                  <span>קבלת פנים {wedding.eventTime}</span>
                </p>
                {wedding.chuppahTime && (
                  <p className="flex items-center justify-center gap-2">
                    <span>💍</span>
                    <span>חופה וקידושין {wedding.chuppahTime}</span>
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Venue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="text-center mb-8"
          >
            <p className="text-lg font-medium text-[#6B4F4F]">📍 {wedding.venue}</p>
            <p className="text-sm text-gray-500">{wedding.venueAddress}</p>
          </motion.div>

          {/* RSVP Section */}
          {isRSVP && guest ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 mb-8 mx-4"
              style={{ border: '2px solid #E8D5D5' }}
            >
              <RSVPForm guest={guest} themeColor="#D4A5A5" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-bold text-[#6B4F4F] mb-2">אנא אשרו הגעתכם</h2>
              <p className="text-gray-500">קישור לאישור הגעה נשלח אליכם בהודעה אישית</p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="space-y-6"
          >
            {/* Navigation */}
            <div className="text-center">
              <h3 className="text-lg text-[#6B4F4F] mb-4">🗺️ ניווט לאירוע</h3>
              <div className="flex gap-3 justify-center">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-white rounded-full text-[#6B4F4F] border-2 border-[#D4A5A5] hover:bg-[#D4A5A5] hover:text-white transition-all duration-300 shadow-md"
                >
                  Google Maps
                </a>
                <a
                  href={`https://waze.com/ul?q=${encodeURIComponent(wedding.venueAddress)}&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-white rounded-full text-[#6B4F4F] border-2 border-[#D4A5A5] hover:bg-[#D4A5A5] hover:text-white transition-all duration-300 shadow-md"
                >
                  Waze
                </a>
              </div>
            </div>

            {/* Gift */}
            {wedding.enableBitGifts && wedding.bitPhone && (
              <div className="text-center">
                <h3 className="text-lg text-[#6B4F4F] mb-2">🎁 רוצים לשלוח מתנה?</h3>
                <p className="text-sm text-gray-500 mb-4">תודה מראש על המחשבה</p>
                <a
                  href={wedding.bitPhone}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3 rounded-full text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C89292 100%)' }}
                >
                  💝 שליחת מתנה ב-Bit
                </a>
              </div>
            )}
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            className="text-center pt-12 pb-4"
          >
            <div className="flex justify-center gap-2 mb-4">
              <span>🌸</span>
              <span>🌷</span>
              <span>🌺</span>
            </div>
            <p className="text-[#D4A5A5] text-sm">נשמח לראותכם בחגיגה שלנו</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
