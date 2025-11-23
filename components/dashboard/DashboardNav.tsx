'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';

// Animated Hamburger Icon - Morphing to X with spring physics
function HamburgerIcon({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  const topLineVariants = {
    closed: { rotate: 0, y: 0, width: 24 },
    open: { rotate: 45, y: 8, width: 28 }
  };

  const middleLineVariants = {
    closed: { opacity: 1, x: 0, scale: 1 },
    open: { opacity: 0, x: 20, scale: 0.5 }
  };

  const bottomLineVariants = {
    closed: { rotate: 0, y: 0, width: 18 },
    open: { rotate: -45, y: -8, width: 28 }
  };

  const springConfig = { type: "spring" as const, stiffness: 300, damping: 20 };

  return (
    <motion.button
      onClick={onClick}
      className="md:hidden flex flex-col justify-center items-center w-12 h-12 rounded-xl hover:bg-gray-100 transition-colors relative"
      aria-label={isOpen ? 'סגור תפריט' : 'פתח תפריט'}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
    >
      {/* Glow effect when open */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-primary/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />

      <svg width="28" height="28" viewBox="0 0 28 28" className="relative z-10">
        {/* Top line */}
        <motion.rect
          x="2"
          y="6"
          height="2.5"
          rx="1.25"
          fill={isOpen ? '#ec4899' : '#4b5563'}
          variants={topLineVariants}
          animate={isOpen ? "open" : "closed"}
          transition={springConfig}
          style={{ originX: '14px', originY: '14px' }}
        />

        {/* Middle line */}
        <motion.rect
          x="2"
          y="13"
          width="24"
          height="2.5"
          rx="1.25"
          fill={isOpen ? '#ec4899' : '#4b5563'}
          variants={middleLineVariants}
          animate={isOpen ? "open" : "closed"}
          transition={{ ...springConfig, duration: 0.2 }}
        />

        {/* Bottom line */}
        <motion.rect
          x="8"
          y="20"
          height="2.5"
          rx="1.25"
          fill={isOpen ? '#ec4899' : '#4b5563'}
          variants={bottomLineVariants}
          animate={isOpen ? "open" : "closed"}
          transition={springConfig}
          style={{ originX: '14px', originY: '14px' }}
        />
      </svg>
    </motion.button>
  );
}

interface DashboardNavProps {
  user: {
    name: string;
    email: string;
    role: 'couple' | 'admin';
  };
}

// Animated Icons for Navbar
const NavIcons = {
  // Overview/Stats icon - bar chart with growing bars
  overview: ({ isActive }: { isActive: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <motion.rect
        x="3" y="14" width="4" height="7" rx="1"
        fill={isActive ? 'currentColor' : '#9ca3af'}
        animate={{
          height: isActive ? [7, 9, 7] : 7,
          y: isActive ? [14, 12, 14] : 14
        }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
      />
      <motion.rect
        x="10" y="8" width="4" height="13" rx="1"
        fill={isActive ? 'currentColor' : '#9ca3af'}
        animate={{
          height: isActive ? [13, 15, 13] : 13,
          y: isActive ? [8, 6, 8] : 8
        }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5, delay: 0.2 }}
      />
      <motion.rect
        x="17" y="3" width="4" height="18" rx="1"
        fill={isActive ? 'currentColor' : '#9ca3af'}
        animate={{
          height: isActive ? [18, 16, 18] : 18,
          y: isActive ? [3, 5, 3] : 3
        }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5, delay: 0.4 }}
      />
    </svg>
  ),

  // Guests icon - people with subtle animation
  guests: ({ isActive }: { isActive: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      {/* Left person */}
      <motion.circle
        cx="7" cy="7" r="3"
        fill={isActive ? 'currentColor' : '#9ca3af'}
        animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      />
      <motion.path
        d="M1 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
        stroke={isActive ? 'currentColor' : '#9ca3af'}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right person */}
      <motion.circle
        cx="17" cy="7" r="3"
        fill={isActive ? 'currentColor' : '#9ca3af'}
        animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.path
        d="M17 11a4 4 0 0 1 4 4v2"
        stroke={isActive ? 'currentColor' : '#9ca3af'}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  ),

  // Messages icon - chat bubble with dots
  messages: ({ isActive }: { isActive: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <motion.path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        stroke={isActive ? 'currentColor' : '#9ca3af'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Typing dots */}
      <motion.circle
        cx="8" cy="12" r="1"
        fill={isActive ? 'currentColor' : '#9ca3af'}
        animate={{ opacity: isActive ? [0.4, 1, 0.4] : 1 }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <motion.circle
        cx="12" cy="12" r="1"
        fill={isActive ? 'currentColor' : '#9ca3af'}
        animate={{ opacity: isActive ? [0.4, 1, 0.4] : 1 }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
      />
      <motion.circle
        cx="16" cy="12" r="1"
        fill={isActive ? 'currentColor' : '#9ca3af'}
        animate={{ opacity: isActive ? [0.4, 1, 0.4] : 1 }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
      />
    </svg>
  ),

  // Seating icon - table with chairs
  seating: ({ isActive }: { isActive: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      {/* Table */}
      <motion.ellipse
        cx="12" cy="12" rx="8" ry="4"
        stroke={isActive ? 'currentColor' : '#9ca3af'}
        strokeWidth="2"
        fill="none"
      />
      {/* Chairs around table */}
      <motion.circle
        cx="12" cy="5" r="2"
        fill={isActive ? 'currentColor' : '#9ca3af'}
        animate={{ y: isActive ? [0, -1, 0] : 0 }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.circle
        cx="5" cy="12" r="2"
        fill={isActive ? 'currentColor' : '#9ca3af'}
        animate={{ x: isActive ? [0, -1, 0] : 0 }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
      />
      <motion.circle
        cx="19" cy="12" r="2"
        fill={isActive ? 'currentColor' : '#9ca3af'}
        animate={{ x: isActive ? [0, 1, 0] : 0 }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
      />
      <motion.circle
        cx="12" cy="19" r="2"
        fill={isActive ? 'currentColor' : '#9ca3af'}
        animate={{ y: isActive ? [0, 1, 0] : 0 }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
      />
    </svg>
  ),

  // Gifts icon - gift box with ribbon
  gifts: ({ isActive }: { isActive: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      {/* Box bottom */}
      <motion.rect
        x="3" y="12" width="18" height="9" rx="1"
        stroke={isActive ? 'currentColor' : '#9ca3af'}
        strokeWidth="2"
        fill="none"
      />
      {/* Box top/lid */}
      <motion.rect
        x="2" y="7" width="20" height="5" rx="1"
        stroke={isActive ? 'currentColor' : '#9ca3af'}
        strokeWidth="2"
        fill="none"
        animate={{ y: isActive ? [7, 5, 7] : 7 }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Vertical ribbon */}
      <motion.line
        x1="12" y1="7" x2="12" y2="21"
        stroke={isActive ? 'currentColor' : '#9ca3af'}
        strokeWidth="2"
      />
      {/* Bow */}
      <motion.path
        d="M12 7c-2-2-4-2-4 0s2 2 4 0c2 2 4 2 4 0s-2-2-4 0"
        stroke={isActive ? 'currentColor' : '#9ca3af'}
        strokeWidth="2"
        fill="none"
        animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </svg>
  ),

  // Settings icon - rotating gear
  settings: ({ isActive }: { isActive: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <motion.g
        animate={{ rotate: isActive ? 360 : 0 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: 'center' }}
      >
        <path
          d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
          stroke={isActive ? 'currentColor' : '#9ca3af'}
          strokeWidth="2"
        />
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
          stroke={isActive ? 'currentColor' : '#9ca3af'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </svg>
  ),

  // Admin icon - wrench tool
  admin: ({ isActive }: { isActive: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <motion.path
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
        stroke={isActive ? 'currentColor' : '#9ca3af'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        animate={{ rotate: isActive ? [0, -10, 0, 10, 0] : 0 }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ transformOrigin: 'center' }}
      />
    </svg>
  ),
};

type NavIconKey = keyof typeof NavIcons;

// Wrapper component to handle hover state
function NavIcon({ type, isActive }: { type: NavIconKey; isActive: boolean }) {
  const IconComponent = NavIcons[type];
  return <IconComponent isActive={isActive} />;
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { href: '/dashboard', label: 'סקירה כללית', iconType: 'overview' as NavIconKey },
    { href: '/dashboard/guests', label: 'ניהול אורחים', iconType: 'guests' as NavIconKey },
    { href: '/dashboard/messages', label: 'הודעות', iconType: 'messages' as NavIconKey },
    { href: '/dashboard/seating', label: 'סידורי ישיבה', iconType: 'seating' as NavIconKey },
    { href: '/dashboard/gifts', label: 'מתנות', iconType: 'gifts' as NavIconKey },
    { href: '/dashboard/settings', label: 'הגדרות', iconType: 'settings' as NavIconKey },
  ];

  const adminNavItems = [
    { href: '/admin', label: 'ניהול מערכת', iconType: 'admin' as NavIconKey },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">פלטפורמת חתונות</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    active
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-muted hover:text-primary'
                  }`}
                >
                  <NavIcon type={item.iconType} isActive={active} />
                  {item.label}
                </Link>
              );
            })}
            {user.role === 'admin' && adminNavItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    active
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-muted hover:text-primary'
                  }`}
                >
                  <NavIcon type={item.iconType} isActive={active} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User Menu & Hamburger */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-sm text-gray-600 hidden sm:block">
              <div className="font-medium">{user.name}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="hidden sm:inline-flex"
            >
              התנתק
            </Button>
            <HamburgerIcon
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay & Drawer */}
      <AnimatePresence mode="wait">
        {isMobileMenuOpen && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu - Slide from top with bounce */}
            <motion.div
              initial={{ opacity: 0, y: '-100%', scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: '-100%', scale: 0.95 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                mass: 1
              }}
              className="fixed top-0 overflow-y-hidden left-0 right-0 bg-white/95 backdrop-blur-xl shadow-2xl z-50 md:hidden max-h-[90vh] overflow-y-auto"
              style={{
                borderBottomLeftRadius: '24px',
                borderBottomRightRadius: '24px'
              }}
            >
              {/* Decorative top bar */}
              <div className="h-1 bg-linear-to-r from-primary via-pink-400 to-purple-500" />

              <div className="container mx-auto px-5 py-6">
                {/* Header with close button */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-between mb-6"
                >
                  <span className="text-xl font-bold bg-linear-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                    תפריט
                  </span>
                  <motion.button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1, backgroundColor: '#fce7f3' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </motion.button>
                </motion.div>

                {/* User Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-pink-500 to-purple-600 p-5 mb-6 shadow-lg shadow-primary/30"
                >
                  {/* Decorative circles */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
                  <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full" />

                  <div className="relative flex items-center gap-4">
                    <motion.div
                      className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold shadow-inner"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      {user.name.charAt(0)}
                    </motion.div>
                    <div className="text-white">
                      <div className="font-bold text-lg">{user.name}</div>
                      <div className="text-white/70 text-sm">{user.email}</div>
                    </div>
                  </div>
                </motion.div>

                {/* Navigation Items with stagger */}
                <nav className="space-y-2">
                  {navItems.map((item, index) => {
                    const active = isActive(item.href);
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.2 + index * 0.07,
                          type: 'spring',
                          stiffness: 200,
                          damping: 20
                        }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <motion.div
                            className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-medium transition-all ${
                              active
                                ? 'bg-primary text-white shadow-lg shadow-primary/40'
                                : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                            }`}
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <motion.span
                              className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                                active ? 'bg-white/20' : 'bg-gradient-to-br from-gray-100 to-gray-50'
                              }`}
                              whileHover={{ rotate: [0, -5, 5, 0] }}
                            >
                              <NavIcon type={item.iconType} isActive={active} />
                            </motion.span>
                            <span>{item.label}</span>
                            {active && (
                              <motion.div
                                layoutId="mobileActiveIndicator"
                                className="mr-auto flex items-center gap-1"
                              >
                                <span className="w-2 h-2 rounded-full bg-white" />
                                <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                              </motion.div>
                            )}
                          </motion.div>
                        </Link>
                      </motion.div>
                    );
                  })}

                  {/* Admin Items */}
                  {user.role === 'admin' && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ delay: 0.5 }}
                        className="h-px bg-linear-to-r from-transparent via-gray-300 to-transparent my-4"
                      />
                      {adminNavItems.map((item, index) => {
                        const active = isActive(item.href);
                        return (
                          <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 0.55 + index * 0.07,
                              type: 'spring',
                              stiffness: 200
                            }}
                          >
                            <Link
                              href={item.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <motion.div
                                className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-medium transition-all ${
                                  active
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40'
                                    : 'text-purple-600 hover:bg-purple-50 active:bg-purple-100'
                                }`}
                                whileHover={{ scale: 1.02, x: 5 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                                  active ? 'bg-white/20' : 'bg-purple-100'
                                }`}>
                                  <NavIcon type={item.iconType} isActive={active} />
                                </span>
                                {item.label}
                              </motion.div>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </>
                  )}
                </nav>

                {/* Logout Button */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                  className="mt-6 pt-4"
                >
                  <motion.button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl text-base font-medium text-red-600 bg-red-50 border-2 border-red-100"
                    whileHover={{ scale: 1.02, backgroundColor: '#fef2f2', borderColor: '#fecaca' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.svg
                      width="22" height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      whileHover={{ x: [0, 5, 0] }}
                      transition={{ duration: 0.3 }}
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16,17 21,12 16,7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </motion.svg>
                    התנתקות מהמערכת
                  </motion.button>
                </motion.div>

                {/* Bottom safe area */}
                <div className="h-6" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
