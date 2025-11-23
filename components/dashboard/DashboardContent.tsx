'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import CountUp from '@/components/ui/CountUp';
import CopyLinkButton from '@/components/dashboard/CopyLinkButton';
import ExportPDFButton from '@/components/dashboard/ExportPDFButton';
import { formatHebrewDate, getDaysUntilEvent } from '@/lib/utils/date';

interface DashboardContentProps {
  wedding: {
    _id: string;
    groomName: string;
    brideName: string;
    eventDate: string;
    uniqueUrl: string;
  };
  stats: {
    totalGuests: number;
    confirmed: number;
    declined: number;
    pending: number;
    totalAdults: number;
    totalChildren: number;
    totalGifts: number;
  };
}

// Animated SVG Icons
const AnimatedIcons = {
  guests: ({ color }: { color: string }) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <motion.circle
        cx="9" cy="7" r="4"
        stroke={color}
        strokeWidth="2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
      />
      <motion.path
        d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      />
      <motion.circle
        cx="17" cy="7" r="3"
        stroke={color}
        strokeWidth="2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
      />
      <motion.path
        d="M21 21v-2a3 3 0 0 0-2-2.83"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      />
    </svg>
  ),
  confirmed: ({ color }: { color: string }) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <motion.circle
        cx="12" cy="12" r="10"
        stroke={color}
        strokeWidth="2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      />
      <motion.path
        d="M8 12l3 3 5-6"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      />
    </svg>
  ),
  pending: ({ color }: { color: string }) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <motion.circle
        cx="12" cy="12" r="10"
        stroke={color}
        strokeWidth="2"
        initial={{ rotate: -90 }}
        animate={{ rotate: 0 }}
        transition={{ duration: 0.5 }}
      />
      <motion.path
        d="M12 6v6l4 2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      />
    </svg>
  ),
  gifts: ({ color }: { color: string }) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <motion.rect
        x="3" y="8" width="18" height="4" rx="1"
        stroke={color}
        strokeWidth="2"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
      <motion.rect
        x="5" y="12" width="14" height="9" rx="1"
        stroke={color}
        strokeWidth="2"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        style={{ originY: 0 }}
      />
      <motion.line
        x1="12" y1="8" x2="12" y2="21"
        stroke={color}
        strokeWidth="2"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.4 }}
      />
      <motion.path
        d="M12 8c-2-3-5-3-5 0s3 3 5 0c2 3 5 3 5 0s-3-3-5 0"
        stroke={color}
        strokeWidth="2"
        fill="none"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      />
    </svg>
  ),
};

// Stats Card with CountUp
function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color,
  gradient,
  delay = 0
}: {
  title: string;
  value: number;
  subtitle?: string;
  icon: keyof typeof AnimatedIcons;
  color: string;
  gradient: string;
  delay?: number;
  prefix?: string;
  suffix?: string;
}) {
  const IconComponent = AnimatedIcons[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 100 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-100"
    >
      {/* Gradient background decoration */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${gradient}`} />

      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
            <div className="text-4xl font-bold text-gray-900">
              <CountUp
                to={value}
                duration={1.2}
                delay={delay + 0.2}
                separator=","
                prefix={icon === 'gifts' ? '₪' : ''}
              />
            </div>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.8 }}
                className="text-xs text-gray-500 mt-2"
              >
                {subtitle}
              </motion.p>
            )}
          </div>

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
            className={`w-14 h-14 rounded-2xl ${gradient} flex items-center justify-center shadow-lg`}
          >
            <IconComponent color="white" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// Quick Action Card
function QuickAction({
  title,
  description,
  href,
  icon,
  external,
  delay = 0
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
  delay?: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const content = (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="flex items-center gap-4 p-4 rounded-xl cursor-pointer group"
      style={{ backgroundColor: isHovered ? '#fdf2f8' : 'transparent' }}
    >
      <motion.div
        animate={isHovered ? { rotate: [0, -10, 10, 0], scale: 1.1 } : { rotate: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-pink-100 flex items-center justify-center text-2xl"
      >
        {icon}
      </motion.div>
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold transition-colors duration-200 ${isHovered ? 'text-primary' : 'text-gray-900'}`}>
          {title}
        </h3>
        <p className="text-sm text-gray-500 truncate">{description}</p>
      </div>
      <motion.div
        animate={{ x: isHovered ? 5 : 0 }}
        transition={{ duration: 0.2 }}
        className={`transition-colors duration-200 ${isHovered ? 'text-primary' : 'text-gray-400'}`}
      >
        {external ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </motion.div>
    </motion.div>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return <Link href={href}>{content}</Link>;
}

// Days Counter Component
function DaysCounter({ days, isPast }: { days: number; isPast: boolean }) {
  if (isPast) return null;

  let label = '';
  let bgColor = 'bg-gradient-to-r from-primary to-pink-500';

  if (days === 0) {
    label = 'היום היום הגדול!';
    bgColor = 'bg-gradient-to-r from-yellow-400 to-orange-500';
  } else if (days === 1) {
    label = 'מחר!';
    bgColor = 'bg-gradient-to-r from-green-400 to-emerald-500';
  } else {
    label = `עוד ${days} ימים`;
  }

  return (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
      className={`inline-flex items-center gap-2 px-4 py-2 ${bgColor} text-white rounded-full shadow-lg`}
    >
      <motion.span
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {days === 0 ? '🎉' : days <= 7 ? '⏰' : '📅'}
      </motion.span>
      <span className="font-bold">{label}</span>
    </motion.div>
  );
}

export default function DashboardContent({ wedding, stats }: DashboardContentProps) {
  const daysUntilEvent = getDaysUntilEvent(new Date(wedding.eventDate));
  const isEventPast = daysUntilEvent < 0;

  return (
    <div className="space-y-8">
      {/* Header with wedding info */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-pink-500 to-purple-600 p-8 text-white shadow-2xl"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-24 translate-y-24" />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full" />

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-white/80 text-sm mb-2">ברוכים הבאים לדשבורד</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              החתונה של {wedding.groomName} ו{wedding.brideName}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center gap-4"
          >
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatHebrewDate(new Date(wedding.eventDate))}</span>
            </div>
            <DaysCounter days={daysUntilEvent} isPast={isEventPast} />
          </motion.div>
        </div>
      </motion.div>

      {/* Statistics Header */}
      <div className="flex justify-between items-center">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-gray-900"
        >
          סטטיסטיקות
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ExportPDFButton />
        </motion.div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="סה״כ אורחים"
          value={stats.totalGuests}
          icon="guests"
          color="#3b82f6"
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          delay={0}
        />
        <StatsCard
          title="אישרו הגעה"
          value={stats.confirmed}
          subtitle={`${stats.totalAdults} מבוגרים, ${stats.totalChildren} ילדים`}
          icon="confirmed"
          color="#22c55e"
          gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          delay={0.1}
        />
        <StatsCard
          title="בהמתנה"
          value={stats.pending}
          icon="pending"
          color="#eab308"
          gradient="bg-gradient-to-br from-yellow-500 to-amber-600"
          delay={0.2}
        />
        <StatsCard
          title="מתנות"
          value={stats.totalGifts}
          icon="gifts"
          color="#a855f7"
          gradient="bg-gradient-to-br from-purple-500 to-violet-600"
          delay={0.3}
        />
      </div>

      {/* Quick Actions & Invitation Link */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">פעולות מהירות</h2>
          </div>
          <div className="p-2">
            <QuickAction
              title="צפה בהזמנה"
              description="צפה בהזמנה הדיגיטלית שלך"
              href={`/wedding/${wedding.uniqueUrl}`}
              icon={
                <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                  👀
                </motion.span>
              }
              external
              delay={0.5}
            />
            <QuickAction
              title="ערוך פרטי חתונה"
              description="עדכן תאריך, מקום, תמונות ועוד"
              href="/dashboard/settings"
              icon="⚙️"
              delay={0.6}
            />
            <QuickAction
              title="נהל אורחים"
              description="הוסף, ערוך או מחק אורחים"
              href="/dashboard/guests"
              icon="👥"
              delay={0.7}
            />
            <QuickAction
              title="שלח הזמנות"
              description="שלח הזמנות דרך WhatsApp"
              href="/dashboard/messages"
              icon={
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  💬
                </motion.span>
              }
              delay={0.8}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">קישור להזמנה</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">שתפו את הקישור הזה עם האורחים שלכם:</p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="relative"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={`${process.env.NEXT_PUBLIC_APP_URL}/wedding/${wedding.uniqueUrl}`}
                    readOnly
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl bg-gray-50 text-sm font-mono truncate"
                    dir="ltr"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-2 h-2 bg-green-500 rounded-full"
                    />
                  </div>
                </div>
                <CopyLinkButton text={`${process.env.NEXT_PUBLIC_APP_URL}/wedding/${wedding.uniqueUrl}`} />
              </div>
            </motion.div>

            {/* Share buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 pt-4 border-t border-gray-100"
            >
              <p className="text-sm text-gray-500 mb-3">שתף ברשתות חברתיות:</p>
              <div className="flex gap-2">
                <motion.a
                  href={`https://wa.me/?text=${encodeURIComponent(`מוזמנים לחתונה שלנו! ${process.env.NEXT_PUBLIC_APP_URL}/wedding/${wedding.uniqueUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </motion.a>
                <motion.a
                  href={`https://t.me/share/url?url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/wedding/${wedding.uniqueUrl}`)}&text=${encodeURIComponent('מוזמנים לחתונה שלנו!')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </motion.a>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
