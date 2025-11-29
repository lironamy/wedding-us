'use client';

import { motion } from 'framer-motion';
import { BlurText } from '@/components/ui/animated';

export default function SeatingPageHeader() {
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
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </motion.div>

      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-white/80 text-sm mb-2">ניהול שולחנות ושיבוץ</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <BlurText text="סידור ישיבה" className="text-white" />
          </h1>
          <p className="text-white/90 text-lg max-w-xl">
            צרו שולחנות ושבצו אורחים לפי משפחות וקבוצות
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
