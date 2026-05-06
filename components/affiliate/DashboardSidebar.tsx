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
    <aside className="hidden lg:flex lg:w-64 bg-gray-50 shadow-lg flex-col overflow-y-auto">
      <div className="h-16 flex items-center justify-center px-4 lg:px-6 shadow-md border-b border-gray-200">
        <Link href="/affiliate/dashboard" className="hover:opacity-80 transition-opacity">
          <Image
            src="/logo/ventech_logo-black.png"
            alt="VENTECH"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
        </Link>
      </div>

      <nav className="flex-1 p-4 lg:p-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Exact match only - each tab at same level
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-all duration-200 border-l-4 text-sm lg:text-base ${
                isActive
                  ? 'bg-orange-50 text-orange-700 border-l-orange-500 font-semibold'
                  : 'text-vt-text-secondary border-l-transparent hover:bg-gray-100 hover:text-vt-text-primary'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 lg:p-6 border-t border-gray-200 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 text-vt-text-secondary hover:bg-vt-bg-secondary hover:text-vt-text-primary rounded-lg transition-colors text-sm lg:text-base"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
