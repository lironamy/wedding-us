'use client';

import { motion } from 'framer-motion';
import { RSVPForm } from '@/components/invitation/RSVPForm';
import { getGenderText, type PartnerType } from '@/lib/utils/genderText';
import type { InvitationTemplateProps } from './types';

// Art Deco decorative elements
const DecoCorner = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
  const rotations = { tl: 0, tr: 90, bl: -90, br: 180 };
  const positions = {
    tl: 'top-0 left-0',
    tr: 'top-0 right-0',
    bl: 'bottom-0 left-0',
    br: 'bottom-0 right-0',
  };

  return (
    <div className={`absolute ${positions[position]} w-16 h-16`}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className="w-full h-full"
        style={{ transform: `rotate(${rotations[position]}deg)` }}
      >
        <path d="M0 0 L64 0 L64 8 L8 8 L8 64 L0 64 Z" fill="#D4AF37" />
        <path d="M16 0 L16 16 L0 16" stroke="#D4AF37" strokeWidth="2" fill="none" />
        <circle cx="24" cy="24" r="4" fill="#D4AF37" />
      </svg>
    </div>
  );
};

// Animated fan/sunburst element
const Sunburst = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    className="absolute inset-0 overflow-hidden pointer-events-none"
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.1 }}
    transition={{ delay, duration: 1 }}
  >
    <svg viewBox="0 0 400 400" className="w-full h-full">
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.line
          key={i}
          x1="200"
          y1="200"
          x2="200"
          y2="0"
          stroke="#D4AF37"
          strokeWidth="1"
          transform={`rotate(${i * 15} 200 200)`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: delay + i * 0.05, duration: 0.5 }}
        />
      ))}
    </svg>
  </motion.div>
);

// Geometric line animation
const GeometricBorder = () => (
  <motion.svg
    viewBox="0 0 100 20"
    className="w-full h-6"
    preserveAspectRatio="none"
  >
    <motion.path
      d="M0 10 L10 0 L20 10 L30 0 L40 10 L50 0 L60 10 L70 0 L80 10 L90 0 L100 10"
      stroke="#D4AF37"
      strokeWidth="1"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, ease: 'easeOut' }}
    />
  </motion.svg>
);

export default function ArtDecoTemplate({ wedding, guest, dateParts, isRSVP }: InvitationTemplateProps) {
  const theme = wedding.theme || {
    primaryColor: '#D4AF37',
    secondaryColor: '#1C1C1C',
    fontFamily: 'Assistant'
  };

  return (
    <div className="min-h-screen bg-[#1C1C1C] text-white overflow-hidden">
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poiret+One&family=Heebo:wght@200;300;400;500;700&family=Secular+One&display=swap"
        rel="stylesheet"
      />

      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 20px,
              #D4AF37 20px,
              #D4AF37 21px
            )`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        {/* Main Frame */}
        <div className="relative border-2 border-[#D4AF37] p-8 md:p-12">
          {/* Decorative Corners */}
          <DecoCorner position="tl" />
          <DecoCorner position="tr" />
          <DecoCorner position="bl" />
          <DecoCorner position="br" />

          {/* Inner border */}
          <div className="absolute inset-4 border border-[#D4AF37]/30 pointer-events-none" />

          {/* Top Decorative Element */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1 }}
            className="flex justify-center mb-8"
          >
            <svg viewBox="0 0 200 40" className="w-48 h-10">
              <path
                d="M0 20 L40 20 L50 10 L60 20 L80 20 L90 30 L100 20 L110 30 L120 20 L140 20 L150 10 L160 20 L200 20"
                stroke="#D4AF37"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="100" cy="20" r="8" fill="#D4AF37" />
            </svg>
          </motion.div>

          {/* Hero Image in Art Deco Frame */}
          {wedding.mediaUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative mb-10"
            >
              <div className="relative max-w-xs mx-auto">
                {/* Octagonal frame effect */}
                <div className="relative aspect-[3/4] overflow-hidden"
                  style={{
                    clipPath: 'polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)'
                  }}
                >
                  <div className="absolute inset-0 border-4 border-[#D4AF37]" />
                  {wedding.mediaType === 'video' ? (
                    <video
                      src={wedding.mediaUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover sepia-[30%]"
                    />
                  ) : (
                    <img
                      src={wedding.mediaUrl}
                      alt={`${wedding.groomName} & ${wedding.brideName}`}
                      className="w-full h-full object-cover sepia-[30%]"
                    />
                  )}
                </div>
                {/* Decorative lines around image */}
                <div className="absolute -top-2 -left-2 -right-2 -bottom-2 border border-[#D4AF37]/50 pointer-events-none"
                  style={{
                    clipPath: 'polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)'
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* Names in Art Deco Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mb-8"
          >
            <GeometricBorder />

            <div className="py-6">
              <h1
                className="text-4xl md:text-6xl tracking-[0.3em] text-[#D4AF37] mb-4"
                style={{ fontFamily: '"Poiret One", cursive' }}
              >
                {wedding.groomName}
              </h1>

              <motion.div
                className="flex items-center justify-center gap-4 my-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: 'spring' }}
              >
                <div className="w-12 h-px bg-[#D4AF37]" />
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#D4AF37]">
                  <path
                    fill="currentColor"
                    d="M12 2L9 9L2 12L9 15L12 22L15 15L22 12L15 9L12 2Z"
                  />
                </svg>
                <div className="w-12 h-px bg-[#D4AF37]" />
              </motion.div>

              <h1
                className="text-4xl md:text-6xl tracking-[0.3em] text-[#D4AF37]"
                style={{ fontFamily: '"Poiret One", cursive' }}
              >
                {wedding.brideName}
              </h1>
            </div>

            <GeometricBorder />
          </motion.div>

          {/* Quote */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center text-gray-400 text-sm tracking-widest mb-8 italic"
          >
            {wedding.description || 'מים רבים לא יוכלו לכבות את האהבה'}
          </motion.p>

          {/* Invitation Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="text-center mb-8"
          >
            <p className="text-lg text-gray-300 tracking-wide">
              {getGenderText('happy', (wedding.partner1Type || 'groom') as PartnerType, (wedding.partner2Type || 'bride') as PartnerType)} ו{getGenderText('thrilled', (wedding.partner1Type || 'groom') as PartnerType, (wedding.partner2Type || 'bride') as PartnerType)} להזמינכם
            </p>
          </motion.div>

          {/* Date Section - Art Deco Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="relative mb-10"
          >
            <Sunburst delay={1.5} />

            <div className="relative z-10 bg-[#1C1C1C]/90 border border-[#D4AF37] p-6">
              <p className="text-center text-xs tracking-[0.3em] text-gray-400 uppercase mb-4">
                {dateParts.hebrewDate} • {dateParts.hebrewWeekday}
              </p>

              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-xs tracking-[0.2em] text-[#D4AF37]">{dateParts.weekday}</p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 border border-[#D4AF37] transform rotate-45 scale-75" />
                  <div className="px-8 py-4">
                    <p
                      className="text-6xl text-[#D4AF37]"
                      style={{ fontFamily: '"Poiret One", cursive' }}
                    >
                      {dateParts.day}
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs tracking-[0.2em] text-[#D4AF37]">{dateParts.month}</p>
                  <p className="text-xs tracking-[0.2em] text-[#D4AF37]">{dateParts.year}</p>
                </div>
              </div>

              <div className="mt-6 text-center space-y-2 text-gray-300">
                <p className="flex items-center justify-center gap-2">
                  <span className="text-[#D4AF37]">◆</span>
                  <span>קבלת פנים {wedding.eventTime}</span>
                </p>
                {wedding.chuppahTime && (
                  <p className="flex items-center justify-center gap-2">
                    <span className="text-[#D4AF37]">◆</span>
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
            transition={{ delay: 1.4, duration: 0.6 }}
            className="text-center mb-10"
          >
            <p className="text-xl text-[#D4AF37] mb-2" style={{ fontFamily: '"Poiret One", cursive' }}>
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
              className="mb-10 bg-white/5 border border-[#D4AF37]/30 p-6"
            >
              <RSVPForm guest={guest} themeColor="#D4AF37" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.6 }}
              className="text-center mb-10"
            >
              <p className="text-xs tracking-[0.3em] text-[#D4AF37] uppercase mb-2">אישור הגעה</p>
              <p className="text-gray-400 text-sm">קישור לאישור הגעה נשלח אליכם בהודעה אישית</p>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            className="flex justify-center gap-4 mb-10"
          >
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-[#D4AF37] text-[#D4AF37] text-sm tracking-wider hover:bg-[#D4AF37] hover:text-[#1C1C1C] transition-all duration-300"
              style={{ clipPath: 'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)' }}
            >
              MAPS
            </a>
            <a
              href={`https://waze.com/ul?q=${encodeURIComponent(wedding.venueAddress)}&navigate=yes`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-[#D4AF37] text-[#D4AF37] text-sm tracking-wider hover:bg-[#D4AF37] hover:text-[#1C1C1C] transition-all duration-300"
              style={{ clipPath: 'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)' }}
            >
              WAZE
            </a>
          </motion.div>

          {/* Gift Section */}
          {wedding.enableBitGifts && wedding.bitPhone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.6 }}
              className="text-center mb-8"
            >
              <a
                href={wedding.bitPhone}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-10 py-4 bg-[#D4AF37] text-[#1C1C1C] text-sm tracking-wider hover:bg-[#B8962E] transition-all duration-300"
                style={{ clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)' }}
              >
                ◆ שליחת מתנה ◆
              </a>
            </motion.div>
          )}

          {/* Bottom Decorative Element */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 2.2 }}
            className="flex justify-center"
          >
            <svg viewBox="0 0 200 40" className="w-48 h-10">
              <path
                d="M0 20 L40 20 L50 30 L60 20 L80 20 L90 10 L100 20 L110 10 L120 20 L140 20 L150 30 L160 20 L200 20"
                stroke="#D4AF37"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="100" cy="20" r="8" fill="#D4AF37" />
            </svg>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 0.6 }}
          className="text-center mt-8"
        >
          <p className="text-xs tracking-[0.3em] text-gray-500 uppercase">
            נשמח לראותכם
          </p>
        </motion.div>
      </div>
    </div>
  );
}
