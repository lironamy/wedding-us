'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation, Heart } from 'lucide-react';
import { RSVPForm } from '../RSVPForm';
import type { InvitationTemplateProps } from './types';

// Paper cut layer component
const PaperLayer = ({ children, depth, color }: { children: React.ReactNode; depth: number; color: string }) => (
  <motion.div
    className="relative"
    style={{
      filter: `drop-shadow(0 ${depth * 2}px ${depth * 3}px rgba(0,0,0,0.15))`
    }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: depth * 0.1, duration: 0.6 }}
  >
    <div style={{ background: color }}>{children}</div>
  </motion.div>
);

// Paper cut flower
const PaperFlower = ({ x, y, size, color, delay }: { x: string; y: string; size: number; color: string; delay: number }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: x, top: y }}
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ delay, duration: 0.8, type: "spring" }}
  >
    <svg width={size} height={size} viewBox="0 0 100 100">
      {/* Petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <ellipse
          key={i}
          cx="50"
          cy="20"
          rx="15"
          ry="25"
          fill={color}
          transform={`rotate(${angle} 50 50)`}
          style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.1))' }}
        />
      ))}
      {/* Center */}
      <circle cx="50" cy="50" r="12" fill="#FFD700" style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.1))' }} />
    </svg>
  </motion.div>
);

// Paper cut bird
const PaperBird = ({ x, delay, flip }: { x: string; delay: number; flip?: boolean }) => (
  <motion.div
    className="absolute top-16 pointer-events-none"
    style={{ left: x, transform: flip ? 'scaleX(-1)' : undefined }}
    initial={{ x: flip ? 100 : -100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ delay, duration: 1 }}
  >
    <motion.svg
      width="40"
      height="30"
      viewBox="0 0 40 30"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <path
        d="M0,15 Q10,5 20,15 Q30,5 40,15 Q30,20 20,15 Q10,20 0,15"
        fill="#FFFFFF"
        style={{ filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.15))' }}
      />
    </motion.svg>
  </motion.div>
);

// Layered mountains
const PaperMountains = () => (
  <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none overflow-hidden">
    {/* Back layer */}
    <motion.svg
      className="absolute bottom-0 w-full"
      viewBox="0 0 400 100"
      preserveAspectRatio="none"
      style={{ height: '100%' }}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.8 }}
    >
      <path
        d="M0,100 L0,60 L50,40 L100,70 L150,30 L200,60 L250,20 L300,50 L350,35 L400,60 L400,100 Z"
        fill="#B8D4E3"
        style={{ filter: 'drop-shadow(0 -3px 6px rgba(0,0,0,0.1))' }}
      />
    </motion.svg>
    {/* Middle layer */}
    <motion.svg
      className="absolute bottom-0 w-full"
      viewBox="0 0 400 80"
      preserveAspectRatio="none"
      style={{ height: '80%' }}
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.7, duration: 0.8 }}
    >
      <path
        d="M0,80 L0,50 L80,30 L160,55 L240,25 L320,45 L400,35 L400,80 Z"
        fill="#98C1D9"
        style={{ filter: 'drop-shadow(0 -3px 6px rgba(0,0,0,0.1))' }}
      />
    </motion.svg>
    {/* Front layer */}
    <motion.svg
      className="absolute bottom-0 w-full"
      viewBox="0 0 400 60"
      preserveAspectRatio="none"
      style={{ height: '60%' }}
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.9, duration: 0.8 }}
    >
      <path
        d="M0,60 L0,40 L100,20 L200,40 L300,15 L400,30 L400,60 Z"
        fill="#5C8A9E"
        style={{ filter: 'drop-shadow(0 -4px 8px rgba(0,0,0,0.15))' }}
      />
    </motion.svg>
  </div>
);

export default function PaperCutTemplate({ wedding, guest, dateParts, isRSVP = false, askAboutMeals }: InvitationTemplateProps) {
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
        background: 'linear-gradient(180deg, #E8F4F8 0%, #D4E5EC 50%, #C5D8E3 100%)'
      }}
      dir="rtl"
    >
      {/* Paper birds */}
      <PaperBird x="15%" delay={0.5} />
      <PaperBird x="75%" delay={0.7} flip />

      {/* Paper flowers */}
      <PaperFlower x="5%" y="20%" size={60} color="#FFB6C1" delay={0.3} />
      <PaperFlower x="85%" y="15%" size={50} color="#FF69B4" delay={0.5} />
      <PaperFlower x="10%" y="55%" size={45} color="#FFC0CB" delay={0.7} />
      <PaperFlower x="88%" y="60%" size={55} color="#FFB6C1" delay={0.9} />

      {/* Mountains at bottom */}
      <PaperMountains />

      {/* Main content */}
      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">

        {/* Welcome banner - paper cut style */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div
            className="inline-block px-8 py-3 relative"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              clipPath: 'polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)'
            }}
          >
            <span
              className="text-lg"
              style={{
                color: '#5C8A9E',
                fontFamily: "'Varela Round', sans-serif"
              }}
            >
              הנכם מוזמנים
            </span>
          </div>
        </motion.div>

        {/* Media with layered frame */}
        {wedding.mediaUrl && (
          <motion.div
            className="relative mx-auto mb-8 max-w-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Paper layers behind */}
            <div
              className="absolute -inset-4 rounded-lg"
              style={{
                background: '#E8F4F8',
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                transform: 'rotate(-2deg)'
              }}
            />
            <div
              className="absolute -inset-3 rounded-lg"
              style={{
                background: '#FFFFFF',
                boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
                transform: 'rotate(1deg)'
              }}
            />

            <div className="relative rounded-lg overflow-hidden" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
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
                  style={wedding.mediaPosition ? {
                    objectPosition: `${wedding.mediaPosition.x}% ${wedding.mediaPosition.y}%`
                  } : undefined}
                />
              )}
            </div>

            {/* Decorative paper cut corners */}
            {['top-0 left-0 -translate-x-2 -translate-y-2', 'top-0 right-0 translate-x-2 -translate-y-2 rotate-90', 'bottom-0 left-0 -translate-x-2 translate-y-2 -rotate-90', 'bottom-0 right-0 translate-x-2 translate-y-2 rotate-180'].map((pos, i) => (
              <motion.div
                key={i}
                className={`absolute ${pos}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
              >
                <svg width="30" height="30" viewBox="0 0 30 30">
                  <path d="M0,30 L0,10 Q0,0 10,0 L30,0 L30,5 L10,5 Q5,5 5,10 L5,30 Z" fill="#FFB6C1" style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.1))' }} />
                </svg>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Names - layered paper effect */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <h1
            className="text-4xl md:text-5xl font-bold mb-2"
            style={{
              fontFamily: "'Varela Round', sans-serif",
              color: '#5C8A9E',
              textShadow: '2px 2px 0 #FFFFFF, 3px 3px 0 rgba(0,0,0,0.1)'
            }}
          >
            {wedding.groomName}
          </h1>

          <motion.div
            className="flex items-center justify-center gap-3 my-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
          >
            <svg width="40" height="20" viewBox="0 0 40 20">
              <path d="M0,10 Q10,5 20,10 T40,10" fill="none" stroke="#FFB6C1" strokeWidth="3" style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.1))' }} />
            </svg>
            <Heart className="w-6 h-6" style={{ color: '#FF69B4', filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.1))' }} fill="#FF69B4" />
            <svg width="40" height="20" viewBox="0 0 40 20">
              <path d="M0,10 Q10,15 20,10 T40,10" fill="none" stroke="#FFB6C1" strokeWidth="3" style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.1))' }} />
            </svg>
          </motion.div>

          <h1
            className="text-4xl md:text-5xl font-bold"
            style={{
              fontFamily: "'Varela Round', sans-serif",
              color: '#98C1D9',
              textShadow: '2px 2px 0 #FFFFFF, 3px 3px 0 rgba(0,0,0,0.1)'
            }}
          >
            {wedding.brideName}
          </h1>
        </motion.div>

        {/* Invitation text */}
        <motion.p
          className="text-center text-lg mb-8"
          style={{
            color: '#5C8A9E',
            fontFamily: "'Assistant', sans-serif"
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {wedding.description || 'מים רבים לא יוכלו לכבות את האהבה ונהרות לא ישטפוה'}
        </motion.p>

        {/* Date card - paper layers */}
        <motion.div
          className="rounded-2xl p-6 mb-6 text-center relative"
          style={{
            background: '#FFFFFF',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          {/* Paper fold effect */}
          <div
            className="absolute top-0 right-0 w-12 h-12"
            style={{
              background: 'linear-gradient(135deg, transparent 50%, #E8F4F8 50%)',
              boxShadow: '-2px 2px 5px rgba(0,0,0,0.1)'
            }}
          />

          <div
            className="text-5xl font-bold mb-2"
            style={{
              color: '#5C8A9E',
              fontFamily: "'Varela Round', sans-serif",
              textShadow: '2px 2px 0 #E8F4F8'
            }}
          >
            {dateParts.day}
          </div>
          <div className="text-xl mb-1" style={{ color: '#98C1D9' }}>
            {dateParts.month} {dateParts.year}
          </div>
          <div className="text-lg mb-3" style={{ color: '#B8D4E3' }}>
            {dateParts.weekday}
          </div>
          <div
            className="text-sm px-4 py-1 rounded-full inline-block"
            style={{
              background: '#FFB6C1',
              color: '#FFFFFF',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
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
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: '#E8F4F8' }}
            >
              <Clock className="w-6 h-6" style={{ color: '#5C8A9E' }} />
            </div>
            <div className="flex-1">
              <div className="text-xs" style={{ color: '#B8D4E3' }}>קבלת פנים</div>
              <div className="text-xl font-bold" style={{ color: '#5C8A9E' }}>{wedding.eventTime}</div>
            </div>
          </div>

          {/* Chuppah time */}
          {wedding.chuppahTime && (
            <div
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{
                background: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: '#FFE4E9' }}
              >
                <Heart className="w-6 h-6" style={{ color: '#FF69B4' }} />
              </div>
              <div className="flex-1">
                <div className="text-xs" style={{ color: '#FFB6C1' }}>חופה</div>
                <div className="text-xl font-bold" style={{ color: '#FF69B4' }}>{wedding.chuppahTime}</div>
              </div>
            </div>
          )}

          {/* Location */}
          <div
            className="p-4 rounded-xl"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
            }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: '#E8F4F8' }}
              >
                <MapPin className="w-6 h-6" style={{ color: '#98C1D9' }} />
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold" style={{ color: '#5C8A9E' }}>{wedding.venue}</div>
                <div className="text-sm" style={{ color: '#B8D4E3' }}>{wedding.venueAddress}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venueAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold"
                style={{
                  background: 'linear-gradient(135deg, #98C1D9, #5C8A9E)',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 15px rgba(92,138,158,0.3)'
                }}
                whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(92,138,158,0.4)' }}
                whileTap={{ scale: 0.98 }}
              >
                <Navigation className="w-5 h-5" />
                <span>Maps</span>
              </motion.a>
              <motion.a
                href={`https://waze.com/ul?q=${encodeURIComponent(wedding.venueAddress)}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold"
                style={{
                  background: 'linear-gradient(135deg, #FFB6C1, #FF69B4)',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 15px rgba(255,105,180,0.3)'
                }}
                whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(255,105,180,0.4)' }}
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
            <RSVPForm guest={guest} themeColor="#5C8A9E" askAboutMeals={wedding.askAboutMeals !== false} mealOptions={wedding.mealOptions} customOtherMealName={wedding.customOtherMealName} />
          </motion.div>
        )}

        {/* Gift section */}
        {wedding.enableBitGifts && wedding.bitPhone && (
          <motion.div
            className="mt-6 p-6 rounded-2xl text-center"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <h3 className="text-lg font-bold mb-2" style={{ color: '#5C8A9E' }}>🎀 רוצים לשלוח מתנה?</h3>
            <p className="text-sm mb-4" style={{ color: '#B8D4E3' }}>תודה מראש על המחשבה</p>

            <a
              href={wedding.bitPhone}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #FFB6C1, #FF69B4)',
                color: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(255,105,180,0.3)'
              }}
            >
              <span>💳</span>
              <span>שליחת מתנה ב-Bit</span>
            </a>
          </motion.div>
        )}


        {/* Footer */}
        <motion.div
          className="mt-12 flex justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 2 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            >
              <Heart size={16} fill="#FFB6C1" color="#FFB6C1" style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.1))' }} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
