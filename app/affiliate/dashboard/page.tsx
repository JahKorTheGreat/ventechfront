// Affiliate Dashboard - Overview Page
// Main dashboard view with statistics and quick actions

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { useDashboardStats } from '@/hooks/useAffiliate';
import DashboardSidebar from '@/components/affiliate/DashboardSidebar';
import DashboardHeader from '@/components/affiliate/DashboardHeader';
import StatsCards from '@/components/affiliate/StatsCards';
import EarningsChart from '@/components/affiliate/EarningsChart';
import RecentEarnings from '@/components/affiliate/RecentEarnings';
import QuickActions from '@/components/affiliate/QuickActions';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { stats, chartData, loading, selectedTimeframe, changeTimeframe } = useDashboardStats();
  const [mounted, setMounted] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    setMounted(true);
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, mounted, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-vt-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-vt-bg-secondary">
      {/* Sidebar Navigation */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader user={user} />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-vt-text-primary">Welcome back, {user?.full_name || 'Affiliate'}!</h1>
              <p className="text-vt-text-secondary mt-2">Here's your affiliate performance overview</p>
            </div>

            {/* Quick Actions */}
            <QuickActions />

            {/* Stats Cards */}
            <div className="mb-8">
              <StatsCards stats={stats} loading={loading} />
            </div>

            {/* Charts and Recent Activity - 2 Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Earnings Chart - Takes 2 columns */}
              <div className="lg:col-span-2">
                <EarningsChart
                  data={chartData}
                  loading={loading}
                  timeframe={selectedTimeframe}
                  onTimeframeChange={changeTimeframe}
                />
              </div>

              {/* Recent Earnings - 1 column */}
              <div className="lg:col-span-1">
                <RecentEarnings />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
