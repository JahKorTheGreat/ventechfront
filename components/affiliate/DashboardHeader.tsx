// Dashboard Header Component
// Top navigation with user info, mobile menu, and home button

'use client';

import { Bell, User, Home, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface UserType {
  id?: string;
  email?: string;
  full_name?: string;
  avatar?: string;
}

interface DashboardHeaderProps {
  user: UserType | null;
}

const navItems = [
  { href: '/affiliate/dashboard', label: 'Dashboard' },
  { href: '/affiliate/dashboard/links', label: 'Referral Links' },
  { href: '/affiliate/dashboard/earnings', label: 'Earnings' },
  { href: '/affiliate/dashboard/payouts', label: 'Payouts' },
  { href: '/affiliate/dashboard/products', label: 'Products' },
];

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:text-orange-600 transition"
            title="Open menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/affiliate/dashboard" className="flex items-center gap-3">
            <Image
              src="/logo/ventech_logo_1.png"
              alt="Ventech logo"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
              style={{ maxHeight: '40px', width: 'auto', height: 'auto' }}
              priority
              loading="eager"
            />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:text-orange-600 transition"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="sr-only">Notifications</span>
            <span className="absolute right-2 top-2 inline-flex h-2 w-2 rounded-full bg-rose-500" />
          </button>

          <div className="hidden md:flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-sm font-semibold text-white">
              {user?.full_name ? user.full_name[0].toUpperCase() : <User className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.full_name || 'Affiliate'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || 'Welcome back'}</p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-slate-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 transition"
            title="Home"
          >
            <Home className="w-5 h-5" />
            <span className="sr-only">Back to Home</span>
          </Link>
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav className="lg:hidden border-t border-slate-200 bg-white px-4 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
