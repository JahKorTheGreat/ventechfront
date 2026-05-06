// Affiliate Dashboard - Overview Page
// Main dashboard view with statistics and quick actions

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { useDashboardStats, useAffiliateLinks } from '@/hooks/useAffiliate';
import DashboardSidebar from '@/components/affiliate/DashboardSidebar';
import DashboardHeader from '@/components/affiliate/DashboardHeader';
import StatsCards from '@/components/affiliate/StatsCards';
import EarningsChart from '@/components/affiliate/EarningsChart';
import RecentEarnings from '@/components/affiliate/RecentEarnings';
import QuickActions from '@/components/affiliate/QuickActions';
import CreateLinkDialog from '@/components/affiliate/CreateLinkDialog';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { stats, chartData, loading, selectedTimeframe, changeTimeframe } = useDashboardStats() || { stats: null, chartData: [], loading: false, selectedTimeframe: 'week', changeTimeframe: () => {} };
  const { createNewLink } = useAffiliateLinks();
  const [mounted, setMounted] = useState(false);
  const [isCreateLinkDialogOpen, setIsCreateLinkDialogOpen] = useState(false);

  const handleCreateLink = async (linkName: string, source?: string) => {
    try {
      await createNewLink({ name: linkName, source });
      toast.success('Link generated successfully!');
      setIsCreateLinkDialogOpen(false);
    } catch (error) {
      toast.error('Failed to generate link');
      throw error;
    }
  };

  // // Redirect to login if not authenticated
  // useEffect(() => {
  //   setMounted(true);
  //   if (mounted && !isAuthenticated) {
  //     router.push('/login');
  //   }
  // }, [isAuthenticated, mounted, router]);

  // if (!mounted || !isAuthenticated) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-vt-text-secondary">Loading...</div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex min-h-screen flex-col bg-vt-bg-secondary">
      {/* Header */}
      <DashboardHeader user={user} />

      {/* Main Layout - Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile */}
        <DashboardSidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full flex flex-col px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
            {/* Welcome Section - Compact */}
            <div className="mb-3 sm:mb-4 flex-shrink-0">
              <h1 className="text-xl sm:text-2xl font-bold text-vt-text-primary">Welcome back, {user?.full_name || 'Affiliate'}!</h1>
              <p className="text-vt-text-secondary mt-0.5 text-xs sm:text-sm">Your affiliate performance overview</p>
            </div>

            {/* Quick Actions - Compact */}
            <div className="mb-3 sm:mb-4 flex-shrink-0">
              <QuickActions onGenerateLink={() => setIsCreateLinkDialogOpen(true)} />
            </div>

            {/* Main Content - Scrollable if needed */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {/* Stats Cards - Compact spacing */}
              <div className="mb-3 sm:mb-4 animate-fade-in">
                <StatsCards stats={stats} loading={loading} />
              </div>

              {/* Charts and Recent Activity - 2 Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Earnings Chart - Takes 2 columns */}
                <div className="lg:col-span-2 animate-fade-in" style={{animationDelay: '100ms'}}>
                  <EarningsChart
                    data={chartData}
                    loading={loading}
                    timeframe={selectedTimeframe}
                    onTimeframeChange={changeTimeframe}
                  />
                </div>

                {/* Recent Earnings - 1 column */}
                <div className="lg:col-span-1 animate-fade-in" style={{animationDelay: '200ms'}}>
                  <RecentEarnings />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Create Link Dialog */}
      <CreateLinkDialog
        isOpen={isCreateLinkDialogOpen}
        onClose={() => setIsCreateLinkDialogOpen(false)}
        onCreate={handleCreateLink}
      />
    </div>
  );
}
