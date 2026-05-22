// Dashboard Header Component
// Top navigation with user info, mobile menu, and home button

'use client';

import { Bell, User, Home, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { notificationService, Notification } from '@/services/notification.service';

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [dropdownError, setDropdownError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showWelcomeNotification, setShowWelcomeNotification] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const bellButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!user) return;
    const storageKey = `affiliate-welcome-notification-shown-${user.id || 'guest'}`;
    const alreadySeen = localStorage.getItem(storageKey);
    if (!alreadySeen) {
      setShowWelcomeNotification(true);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownOpen &&
        dropdownRef.current &&
        bellButtonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !bellButtonRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const markWelcomeNotificationSeen = () => {
    if (!user) {
      setShowWelcomeNotification(false);
      return;
    }

    const storageKey = `affiliate-welcome-notification-shown-${user.id || 'guest'}`;
    localStorage.setItem(storageKey, 'true');
    setShowWelcomeNotification(false);
  };

  const fetchNotifications = async () => {
    setDropdownError(null);
    setDropdownLoading(true);
    try {
      const data = await notificationService.getAllNotifications(5);
      setNotifications(data);
    } catch (error) {
      setDropdownError('Unable to load notifications.');
      console.error('Error fetching affiliate notifications:', error);
      setNotifications([]);
    } finally {
      setDropdownLoading(false);
    }
  };

  const toggleNotifications = async () => {
    const nextOpen = !dropdownOpen;
    setDropdownOpen(nextOpen);
    if (nextOpen) {
      if (showWelcomeNotification) {
        markWelcomeNotificationSeen();
      }
      await fetchNotifications();
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;
  const showBadge = showWelcomeNotification || unreadCount > 0;

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
            <div className="relative h-10 w-[120px]">
              <Image
                src="/logo/ventech_logo_1.png"
                alt="Ventech logo"
                fill
                className="object-contain"
                priority
                loading="eager"
              />
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              ref={bellButtonRef}
              type="button"
              onClick={toggleNotifications}
              aria-expanded={dropdownOpen}
              aria-controls="affiliate-notifications-dropdown"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:text-orange-600 transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="sr-only">Notifications</span>
              {showBadge && (
                <span className="absolute right-2 top-2 inline-flex h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            {dropdownOpen && (
              <div
                id="affiliate-notifications-dropdown"
                className="absolute right-0 top-full z-50 mt-3 w-[320px] min-w-[280px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
              >
                <div className="border-b border-slate-200 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">Notifications</p>
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(false)}
                      className="text-xs font-medium text-slate-500 transition hover:text-slate-800"
                    >
                      Close
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Latest affiliate activity and updates.</p>
                </div>
                <div className="max-h-80 space-y-2 overflow-y-auto p-3">
                  {dropdownLoading ? (
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      Loading notifications...
                    </div>
                  ) : dropdownError ? (
                    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                      {dropdownError}
                    </div>
                  ) : (
                    <>
                      {showWelcomeNotification && (
                        <div className="rounded-3xl border border-orange-100 bg-orange-50 p-4">
                          <p className="text-sm font-semibold text-orange-700">Welcome to Ventech Affiliate</p>
                          <p className="mt-1 text-sm leading-6 text-slate-700">
                            Thanks for joining. Your referral dashboard will show your earnings and campaign activity here as soon as you start referring customers.
                          </p>
                        </div>
                      )}

                      {notifications.length === 0 && !showWelcomeNotification ? (
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                          You're all caught up. Check back later for the latest notifications.
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`rounded-3xl border p-4 text-sm ${notification.is_read ? 'border-slate-200 bg-white' : 'border-orange-200 bg-orange-50'}`}
                          >
                            <p className="font-semibold text-slate-900 truncate">{notification.title}</p>
                            <p className="mt-1 text-slate-600 break-words">{notification.message}</p>
                            <p className="mt-2 text-xs text-slate-400">{new Date(notification.created_at).toLocaleString()}</p>
                          </div>
                        ))
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

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
