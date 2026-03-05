// Affiliate Dashboard Layout
// Main wrapper for affiliate dashboard pages

import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Affiliate Dashboard | VENTECH',
  description: 'Manage your affiliate campaign, earnings, and payouts',
  robots: 'noindex, nofollow', // Don't index dashboard pages
};

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-vt-bg-primary">
      {/* Dashboard content rendered by child pages */}
      {children}
    </div>
  );
}
