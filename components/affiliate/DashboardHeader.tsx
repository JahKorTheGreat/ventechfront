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
    <header className="bg-gray-50 shadow-md border-b border-gray-200">
      {/* Top Bar */}
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side - Logo and Mobile menu toggle */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-vt-text-secondary hover:text-vt-text-primary transition-colors"
            title="Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo - Hidden on mobile, shown on tablet and up */}
          <Link href="/affiliate/dashboard" className="hidden sm:flex items-center">
            <Image
              src="/logo/ventech_logo-black.png"
              alt="Ventech Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Right side - Notifications, User, and Home with spacing */}
        <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 lg:space-x-8 pr-2 lg:pr-4">
          {/* Notifications */}
          <button className="relative text-vt-text-secondary hover:text-vt-text-primary transition-colors p-2 hover:bg-gray-100 rounded-lg" title="Notifications">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile - Responsive */}
          <div className="hidden sm:flex items-center space-x-2 md:space-x-3 pl-2 sm:pl-3 md:pl-4 border-l border-gray-300">
            <div className="text-right hidden md:block">
              <p className="text-xs md:text-sm font-medium text-vt-text-primary">{user?.full_name || 'User'}</p>
              <p className="text-xs text-vt-text-secondary hidden lg:block">{user?.email}</p>
            </div>
            <div className="w-8 h-8 md:w-9 md:h-9 bg-vt-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.full_name ? user.full_name[0].toUpperCase() : <User className="w-4 h-4" />}
            </div>
          </div>

          {/* Home Button - Only visible on larger screens with spacing */}
          <Link
            href="/"
            className="hidden md:inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all font-medium text-sm ml-2 lg:ml-4"
            title="Back to Home"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <nav className="lg:hidden border-t border-gray-200 bg-white p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-orange-700 font-semibold'
                    : 'text-vt-text-secondary hover:bg-gray-50 hover:text-vt-text-primary'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          
          {/* Home Link in Mobile Menu */}
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors font-medium text-sm mt-4"
            title="Back to Home"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </nav>
      )}
    </header>
  );
}
