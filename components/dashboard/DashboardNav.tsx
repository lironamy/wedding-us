'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui';

interface DashboardNavProps {
  user: {
    name: string;
    email: string;
    role: 'couple' | 'admin';
  };
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'סקירה כללית', icon: '📊' },
    { href: '/dashboard/guests', label: 'ניהול אורחים', icon: '👥' },
    { href: '/dashboard/messages', label: 'הודעות', icon: '💬' },
    { href: '/dashboard/seating', label: 'סידורי ישיבה', icon: '🪑' },
    { href: '/dashboard/gifts', label: 'מתנות', icon: '🎁' },
    { href: '/dashboard/settings', label: 'הגדרות', icon: '⚙️' },
  ];

  const adminNavItems = [
    { href: '/admin', label: 'ניהול מערכת', icon: '🔧' },
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
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-muted hover:text-primary'
                }`}
              >
                <span className="ml-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            {user.role === 'admin' && adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-muted hover:text-primary'
                }`}
              >
                <span className="ml-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 hidden sm:block">
              <div className="font-medium">{user.name}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              התנתק
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4 flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-muted hover:text-primary'
              }`}
            >
              <span className="ml-1">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          {user.role === 'admin' && adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-600 hover:bg-purple-100'
              }`}
            >
              <span className="ml-1">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
