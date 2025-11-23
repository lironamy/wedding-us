'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function EmptyDashboard() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ברוכים הבאים!</h1>
        <p className="text-gray-600">התחילו ליצור את החתונה הדיגיטלית שלכם</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-3xl bg-white shadow-xl border border-gray-100"
      >
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-primary via-pink-500 to-purple-600" />

        <div className="p-12 text-center">
          {/* Animated rings illustration */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="mb-8 relative inline-block"
          >
            <svg width="120" height="150" viewBox="0 0 120 120" fill="none" className="mx-auto">
              {/* Left ring */}
              <motion.ellipse
                cx="45" cy="60" rx="25" ry="30"
                stroke="url(#gradient1)"
                strokeWidth="4"
                fill="none"
                initial={{ pathLength: 0, rotate: -10 }}
                animate={{ pathLength: 1, rotate: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
              {/* Right ring */}
              <motion.ellipse
                cx="75" cy="60" rx="25" ry="30"
                stroke="url(#gradient2)"
                strokeWidth="4"
                fill="none"
                initial={{ pathLength: 0, rotate: 10 }}
                animate={{ pathLength: 1, rotate: 0 }}
                transition={{ duration: 1, delay: 0.7 }}
              />
              {/* Heart */}
              <motion.path
                d="M60 75c-5-5-15-5-15 5s10 15 15 20c5-5 15-10 15-20s-10-10-15-5z"
                fill="url(#gradient3)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.2, type: 'spring' }}
                style={{ transformOrigin: '60px 80px' }}
              />
              {/* Sparkles */}
              <motion.circle
                cx="30" cy="35" r="3"
                fill="#ec4899"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 0] }}
                transition={{ delay: 1.5, duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              />
              <motion.circle
                cx="90" cy="35" r="2"
                fill="#a855f7"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 0] }}
                transition={{ delay: 1.8, duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              />
              <motion.circle
                cx="60" cy="25" r="2.5"
                fill="#f472b6"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 0] }}
                transition={{ delay: 2, duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              />
              <defs>
                <linearGradient id="gradient1" x1="20" y1="60" x2="70" y2="60">
                  <stop stopColor="#ec4899" />
                  <stop offset="1" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="gradient2" x1="50" y1="60" x2="100" y2="60">
                  <stop stopColor="#a855f7" />
                  <stop offset="1" stopColor="#ec4899" />
                </linearGradient>
                <linearGradient id="gradient3" x1="45" y1="75" x2="75" y2="95">
                  <stop stopColor="#ec4899" />
                  <stop offset="1" stopColor="#f472b6" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-2xl font-bold text-gray-900 mb-4"
          >
            עדיין לא יצרתם חתונה
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-gray-600 mb-8 max-w-md mx-auto"
          >
            התחילו בהגדרת פרטי החתונה שלכם - שמות, תאריך, מיקום ותמונות.
            <br />
            <span className="text-primary font-medium">זה לוקח רק כמה דקות!</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Link href="/dashboard/settings">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-primary to-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow"
              >
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  ✨
                </motion.span>
                צור חתונה חדשה
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 7l-5 5m0 0l5 5m-5-5h12" />
                </svg>
              </motion.button>
            </Link>
          </motion.div>

          {/* Features preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-12 pt-8 border-t border-gray-100"
          >
            <p className="text-sm text-gray-500 mb-6">מה תקבלו?</p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: '📱', label: 'הזמנה דיגיטלית' },
                { icon: '👥', label: 'ניהול אורחים' },
                { icon: '💬', label: 'שליחת הודעות' },
                { icon: '🪑', label: 'סידורי ישיבה' },
                { icon: '🎁', label: 'ניהול מתנות' },
              ].map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.7 + index * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-sm"
                >
                  <span>{feature.icon}</span>
                  <span className="text-gray-700">{feature.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
