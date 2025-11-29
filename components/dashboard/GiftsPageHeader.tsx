'use client';

import { motion } from 'framer-motion';
import { BlurText } from '@/components/ui/animated';

export default function GiftsPageHeader() {
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
          <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
        </svg>
      </motion.div>

      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-white/80 text-sm mb-2">מעקב אחר מתנות</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <BlurText text="מעקב מתנות" className="text-white" />
          </h1>
          <p className="text-white/90 text-lg max-w-xl">
            עקבו אחר המתנות שאורחים שלחו דרך ביט או פייבוקס
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
