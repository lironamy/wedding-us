'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RSVPForm } from '@/components/invitation/RSVPForm';
import { getGenderText, type PartnerType } from '@/lib/utils/genderText';
import type { InvitationTemplateProps } from './types';

// Shimmer effect component
const ShimmerLine = ({ delay = 0, width = '100%' }: { delay?: number; width?: string }) => (
  <motion.div
    className="h-px relative overflow-hidden"
    style={{ width, background: 'linear-gradient(90deg, #E5E5E5 0%, #E5E5E5 100%)' }}
  >
    <motion.div
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(90deg, transparent 0%, #C9A962 50%, transparent 100%)',
      }}
      animate={{
        x: ['-100%', '100%'],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        repeatDelay: 5,
        ease: 'easeInOut',
      }}
    />
  </motion.div>
);

// Animated line that draws itself
const AnimatedLine = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    className="h-px bg-gradient-to-r from-transparent via-[#C9A962] to-transparent mx-auto"
    initial={{ width: 0 }}
    animate={{ width: '200px' }}
    transition={{ duration: 1.5, delay, ease: 'easeOut' }}
  />
);

export default function LuxuryMinimalTemplate({ wedding, guest, dateParts, isRSVP }: InvitationTemplateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const theme = wedding.theme || {
    primaryColor: '#1A1A1A',
    secondaryColor: '#C9A962',
    fontFamily: 'Assistant'
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Heebo:wght@200;300;400;500;700&display=swap"
        rel="stylesheet"
      />

      <div className="max-w-2xl mx-auto px-8  ">
        {/* Top decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="w-full h-px bg-black/10 mb-16"
        />

        {/* Hero Image - Clean rectangle with thin border */}
        {wedding.mediaUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative mb-16"
          >
            <div className="relative aspect-[4/5] max-w-sm mx-auto">
              <div className="absolute inset-0 border border-black/10" />
              <div className="absolute inset-2">
                {wedding.mediaType === 'video' ? (
                  <video
                    src={wedding.mediaUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover grayscale-[20%]"
                  />
                ) : (
                  <img
                    src={wedding.mediaUrl}
                    alt={`${wedding.groomName} & ${wedding.brideName}`}
                    className="w-full h-full object-cover grayscale-[20%]"
                    style={wedding.mediaPosition ? {
                      objectPosition: `${wedding.mediaPosition.x}% ${wedding.mediaPosition.y}%`
                    } : undefined}
                  />
                )}
              </div>
              {/* Gold corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#C9A962]" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#C9A962]" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#C9A962]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#C9A962]" />
            </div>
          </motion.div>
        )}

        {/* Names - Large, minimal typography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex flex-col items-center gap-2">
            <h1
              className="text-5xl md:text-7xl font-light tracking-[0.2em] text-[#1A1A1A]"
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
            >
              {wedding.groomName}
            </h1>

            <div className="flex items-center gap-6 my-4">
              <ShimmerLine width="60px" />
              <span className="text-[#C9A962] text-2xl font-light">&</span>
              <ShimmerLine width="60px" delay={0.5} />
            </div>

            <h1
              className="text-5xl md:text-7xl font-light tracking-[0.2em] text-[#1A1A1A]"
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
            >
              {wedding.brideName}
            </h1>
          </div>

          <AnimatedLine delay={1} />
        </motion.div>

        {/* Quote - Minimal */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center text-gray-400 text-sm tracking-widest uppercase mb-12"
          style={{ fontFamily: '"Heebo", sans-serif', fontWeight: 200 }}
        >
          {wedding.description || 'מים רבים לא יוכלו לכבות את האהבה'}
        </motion.p>

        {/* Invitation Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center mb-16"
        >
          <p
            className="text-lg text-gray-600 tracking-wide"
            style={{ fontFamily: '"Heebo", sans-serif', fontWeight: 300 }}
          >
            {getGenderText('happy', (wedding.partner1Type || 'groom') as PartnerType, (wedding.partner2Type || 'bride') as PartnerType)} ו{getGenderText('thrilled', (wedding.partner1Type || 'groom') as PartnerType, (wedding.partner2Type || 'bride') as PartnerType)} להזמינכם
          </p>
        </motion.div>

        {/* Date Section - Ultra minimal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-6">
            {dateParts.hebrewDate} • {dateParts.hebrewWeekday}
          </p>

          <div className="flex items-center justify-center">
            <div className="text-center px-8 border-r border-gray-200">
              <p className="text-xs tracking-[0.2em] text-gray-400 uppercase">{dateParts.weekday}</p>
            </div>
            <div className="text-center px-12">
              <p
                className="text-8xl font-light text-[#1A1A1A]"
                style={{ fontFamily: '"Cormorant Garamond", serif' }}
              >
                {dateParts.day}
              </p>
              <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mt-2">
                {dateParts.month} {dateParts.year}
              </p>
            </div>
            <div className="text-center px-8 border-l border-gray-200">
              <p className="text-xs tracking-[0.2em] text-gray-400 uppercase">{wedding.eventTime}</p>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <p className="text-sm text-gray-500">קבלת פנים {wedding.eventTime}</p>
            {wedding.chuppahTime && (
              <p className="text-sm text-gray-500">חופה {wedding.chuppahTime}</p>
            )}
          </div>
        </motion.div>

        {/* Venue - Clean and simple */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="text-center mb-16 py-8 border-y border-gray-100"
        >
          <p className="text-xs tracking-[0.3em] text-[#C9A962] uppercase mb-4">מיקום</p>
          <p className="text-xl text-[#1A1A1A] mb-2" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            {wedding.venue}
          </p>
          <p className="text-sm text-gray-400">{wedding.venueAddress}</p>
        </motion.div>

        {/* RSVP Section */}
        {isRSVP && guest ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="mb-16"
          >
            <div className="border border-gray-100 p-8">
              <RSVPForm guest={guest} themeColor="#C9A962" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-xs tracking-[0.3em] text-[#C9A962] uppercase mb-4">אישור הגעה</p>
            <p className="text-gray-400 text-sm">קישור לאישור הגעה נשלח אליכם בהודעה אישית</p>
          </motion.div>
        )}

        {/* Navigation Buttons - Minimal style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-xs tracking-[0.3em] text-gray-400 uppercase text-center mb-6">ניווט</p>
          <div className="flex justify-center gap-4">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border border-[#1A1A1A] text-[#1A1A1A] text-sm tracking-wider hover:bg-[#1A1A1A] hover:text-white transition-all duration-500"
            >
              GOOGLE MAPS
            </a>
            <a
              href={`https://waze.com/ul?q=${encodeURIComponent(wedding.venueAddress)}&navigate=yes`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border border-[#1A1A1A] text-[#1A1A1A] text-sm tracking-wider hover:bg-[#1A1A1A] hover:text-white transition-all duration-500"
            >
              WAZE
            </a>
          </div>
        </motion.div>

        {/* Gift Section */}
        {wedding.enableBitGifts && wedding.bitPhone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-4">מתנה</p>
            <a
              href={wedding.bitPhone}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-12 py-4 bg-[#1A1A1A] text-white text-sm tracking-wider hover:bg-[#C9A962] transition-all duration-500"
            >
              שליחת מתנה ב-BIT
            </a>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.6 }}
          className="text-center pt-8"
        >
          <div className="w-full h-px bg-black/10 mb-8" />
          <p className="text-xs tracking-[0.3em] text-gray-300 uppercase">
            נשמח לראותכם
          </p>
        </motion.div>
      </div>
    </div>
  );
}
