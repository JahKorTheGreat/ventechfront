// Dashboard Sidebar Navigation Component
// Left sidebar with navigation menu

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BarChart3, Link2, DollarSign, CreditCard, Package, LogOut } from 'lucide-react';
import { useAppDispatch } from '@/store';
import { logout } from '@/store/authSlice';

const navItems = [
  { href: '/affiliate/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/affiliate/dashboard/links', label: 'Referral Links', icon: Link2 },
  { href: '/affiliate/dashboard/earnings', label: 'Earnings', icon: DollarSign },
  { href: '/affiliate/dashboard/payouts', label: 'Payouts', icon: CreditCard },
  { href: '/affiliate/dashboard/products', label: 'Products', icon: Package },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col bg-white border-r border-slate-200 shadow-sm">
      <div className="flex h-16 items-center px-6 border-b border-slate-200">
        <Link href="/affiliate/dashboard" className="flex items-center gap-3">
          <Image
            src="/logo/ventech_logo_1.png"
            alt="Ventech logo"
            width={120}
            height={40}
            className="h-9 w-auto object-contain"
            style={{ width: 'auto', height: 'auto', maxHeight: '36px' }}
            priority
          />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-orange-50 text-orange-700 shadow-sm border-orange-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${isActive ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'} transition-colors`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 px-5 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
        >
          <LogOut className="h-4.5 w-4.5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
