'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { MapPin, Clock, Navigation, Heart } from 'lucide-react';
import { RSVPForm } from '../RSVPForm';
import type { InvitationTemplateProps } from './types';
import { useRef } from 'react';

// Minimal line icon component
const LineIcon = ({ type }: { type: 'leaf' | 'heart' | 'branch' }) => {
  const paths = {
    leaf: "M12,2 C12,2 4,10 4,16 C4,20 8,22 12,22 C16,22 20,20 20,16 C20,10 12,2 12,2 M12,22 L12,8",
    heart: "M12,21 L10.55,19.7 C5.4,15.1 2,12.1 2,8.5 C2,5.4 4.4,3 7.5,3 C9.2,3 10.9,3.8 12,5.1 C13.1,3.8 14.8,3 16.5,3 C19.6,3 22,5.4 22,8.5 C22,12.1 18.6,15.1 13.45,19.7 L12,21",
    branch: "M12,2 L12,22 M8,6 L12,10 M16,6 L12,10 M6,14 L12,18 M18,14 L12,18"
  };

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[type]} />
    </svg>
  );
};

export default function ScandinavianTemplate({ wedding, guest, dateParts, isRSVP = false, askAboutMeals }: InvitationTemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

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
      ref={containerRef}
      className="min-h-screen relative overflow-hidden"
      style={{ background: '#FAFAF8' }}
      dir="rtl"
    >
      {/* Subtle wood grain texture */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          y: backgroundY,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 Q25 18 50 20 T100 20' fill='none' stroke='%23A0896B' stroke-width='0.5'/%3E%3Cpath d='M0 40 Q25 38 50 40 T100 40' fill='none' stroke='%23A0896B' stroke-width='0.5'/%3E%3Cpath d='M0 60 Q25 62 50 60 T100 60' fill='none' stroke='%23A0896B' stroke-width='0.5'/%3E%3Cpath d='M0 80 Q25 78 50 80 T100 80' fill='none' stroke='%23A0896B' stroke-width='0.5'/%3E%3C/svg%3E")`
        }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">

        {/* Asymmetric Hero - Photo on one side, info on other */}
        <motion.div
          className="grid md:grid-cols-5 gap-8 mb-12 items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Photo side - 3 columns */}
          {wedding.mediaUrl && (
            <motion.div
              className="md:col-span-3 relative"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {wedding.mediaType === 'video' ? (
                <video
                  src={wedding.mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full aspect-[4/5] object-cover rounded-sm"
                  style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.08)' }}
                />
              ) : (
                <img
                  src={wedding.mediaUrl}
                  alt={`${wedding.groomName} & ${wedding.brideName}`}
                  className="w-full aspect-[4/5] object-cover rounded-sm"
                  style={wedding.mediaPosition ? {
                    boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
                    objectPosition: `${wedding.mediaPosition.x}% ${wedding.mediaPosition.y}%`
                  } : { boxShadow: '0 20px 50px rgba(0,0,0,0.08)' }}
                />
              )}
            </motion.div>
          )}

          {/* Info side - 2 columns */}
          <motion.div
            className={`${wedding.mediaUrl ? 'md:col-span-2' : 'md:col-span-5'} flex flex-col justify-center`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Welcome */}
            <div className="mb-6">
              <span
                className="text-[10px] tracking-[0.4em] uppercase"
                style={{ color: '#A0896B', fontFamily: "'Poppins', sans-serif" }}
              >
                {guest ? guest.name : 'הנכם מוזמנים'}
              </span>
            </div>

            {/* Names - stacked with minimal styling */}
            <div className="mb-6">
              <h1
                className="text-4xl md:text-5xl font-extralight mb-2"
                style={{ fontFamily: "'Poppins', sans-serif", color: '#2C2C2C', letterSpacing: '-0.02em' }}
              >
                {wedding.groomName}
              </h1>
              <div className="flex items-center gap-3 my-3 text-[#A0896B]">
                <div className="h-px w-6 bg-current opacity-30" />
                <LineIcon type="leaf" />
                <div className="h-px w-6 bg-current opacity-30" />
              </div>
              <h1
                className="text-4xl md:text-5xl font-extralight"
                style={{ fontFamily: "'Poppins', sans-serif", color: '#2C2C2C', letterSpacing: '-0.02em' }}
              >
                {wedding.brideName}
              </h1>
            </div>

            {/* Date - compact display */}
            <div
              className="p-4 rounded-sm mb-4"
              style={{ background: '#FFFFFF', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-light" style={{ color: '#A0896B' }}>{dateParts.day}</span>
                <span className="text-lg" style={{ color: '#2C2C2C' }}>{dateParts.month} {dateParts.year}</span>
              </div>
              <div className="text-xs mt-1" style={{ color: '#888' }}>{dateParts.weekday} • {dateParts.hebrewDate}</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Invitation text - full width */}
        <motion.p
          className="text-center text-sm mb-10 max-w-md mx-auto"
          style={{
            color: '#666',
            fontFamily: "'Inter', sans-serif",
            lineHeight: 1.8
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {wedding.description || 'מים רבים לא יוכלו לכבות את האהבה ונהרות לא ישטפוה'}
        </motion.p>

        {/* Time Row - Horizontal minimal cards */}
        <motion.div
          className="grid grid-cols-2 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {/* Reception time */}
          <div
            className="p-5 rounded-sm bg-white text-center"
            style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}
          >
            <Clock className="w-4 h-4 mx-auto mb-2" style={{ color: '#A0896B' }} strokeWidth={1.5} />
            <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#999' }}>קבלת פנים</div>
            <div className="text-xl font-light" style={{ color: '#2C2C2C' }}>{wedding.eventTime}</div>
          </div>

          {/* Chuppah time */}
          <div
            className="p-5 rounded-sm bg-white text-center"
            style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}
          >
            <Heart className="w-4 h-4 mx-auto mb-2" style={{ color: '#A0896B' }} strokeWidth={1.5} />
            <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#999' }}>חופה</div>
            <div className="text-xl font-light" style={{ color: '#2C2C2C' }}>{wedding.chuppahTime || '—'}</div>
          </div>
        </motion.div>

        {/* Location - Full width minimal card */}
        <motion.div
          className="p-6 rounded-sm bg-white mb-8"
          style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-start gap-4 mb-5">
            <div className="pt-1">
              <MapPin className="w-5 h-5" style={{ color: '#A0896B' }} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-light mb-1" style={{ color: '#2C2C2C' }}>{wedding.venue}</div>
              <div className="text-sm" style={{ color: '#888' }}>{wedding.venueAddress}</div>
            </div>
          </div>

          <div className="flex gap-3">
            <motion.a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-sm flex items-center justify-center gap-2"
              style={{ background: '#A0896B', color: '#FFF' }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Navigation className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-sm">Maps</span>
            </motion.a>
            <motion.a
              href={`https://waze.com/ul?q=${encodeURIComponent(wedding.venueAddress)}&navigate=yes`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-sm flex items-center justify-center gap-2"
              style={{ background: '#2C2C2C', color: '#FFF' }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Navigation className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-sm">Waze</span>
            </motion.a>
          </div>
        </motion.div>

        {/* RSVP Section */}
        {isRSVP && guest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <RSVPForm
              guest={guest}
              themeColor="#A0896B"
              askAboutMeals={wedding.askAboutMeals !== false}
              mealOptions={wedding.mealOptions}
              customOtherMealName={wedding.customOtherMealName}
            />
          </motion.div>
        )}

        {/* Gift section */}
        {wedding.enableBitGifts && wedding.bitPhone && (
          <motion.div
            className="mt-8 p-6 rounded-sm bg-white text-center"
            style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <h3 className="text-base font-light mb-2" style={{ color: '#2C2C2C' }}>רוצים לשלוח מתנה?</h3>
            <p className="text-xs mb-4" style={{ color: '#888' }}>תודה מראש על המחשבה</p>

            <a
              href={wedding.bitPhone}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-sm text-sm transition-all"
              style={{
                background: '#A0896B',
                color: '#FFF'
              }}
            >
              <span>💳</span>
              <span>שליחת מתנה ב-Bit</span>
            </a>
          </motion.div>
        )}


        {/* Footer */}
        <motion.div
          className="mt-12 flex justify-center text-[#A0896B] opacity-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.5 }}
        >
          <LineIcon type="branch" />
        </motion.div>
      </div>
    </div>
  );
}
