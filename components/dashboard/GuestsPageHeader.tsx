'use client';

import { motion } from 'framer-motion';
import { BlurText } from '@/components/ui/animated';

export default function GuestsPageHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-6 md:p-8 mb-6 text-white"
    >
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-24 translate-y-24" />
      <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full" />

      {/* Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="absolute top-6 left-6 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
      </motion.div>

      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-white/80 text-sm mb-2">ניהול רשימת האורחים</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <BlurText text="ניהול אורחים" className="text-white" />
          </h1>
          <p className="text-white/90 text-lg max-w-xl">
            הוסיפו, ערכו ונהלו את רשימת האורחים לחתונה שלכם
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
