// Dashboard Sidebar Navigation Component
// Left sidebar with navigation menu

'use client';

import Link from 'next/link';
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
    <aside className="w-64 bg-vt-bg-primary border-r border-vt-border overflow-y-auto">
      <div className="h-16 flex items-center px-6 border-b border-vt-border">
        <Link href="/affiliate" className="text-xl font-bold text-vt-primary">
          VENTECH <span className="text-xs text-vt-text-secondary">Affiliate</span>
        </Link>
      </div>

      <nav className="p-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-vt-primary text-white'
                  : 'text-vt-text-secondary hover:bg-vt-bg-secondary hover:text-vt-text-primary'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-6 left-6 right-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-vt-text-secondary hover:bg-vt-bg-secondary hover:text-vt-text-primary rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
