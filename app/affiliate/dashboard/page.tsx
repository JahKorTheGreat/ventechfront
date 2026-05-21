// Affiliate Dashboard - Overview Page
// Main dashboard view with statistics, modern charts, and payment management

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { useDashboardStats, useAffiliateLinks } from '@/hooks/useAffiliate';
import DashboardSidebar from '@/components/affiliate/DashboardSidebar';
import DashboardHeader from '@/components/affiliate/DashboardHeader';
import StatsCards from '@/components/affiliate/StatsCards';
import DonutChart from '@/components/affiliate/charts/DonutChart';
import ConversionChart from '@/components/affiliate/charts/ConversionChart';
import TrendsChart from '@/components/affiliate/charts/TrendsChart';
import RecentEarnings from '@/components/affiliate/RecentEarnings';
import QuickActions from '@/components/affiliate/QuickActions';
import CreateLinkDialog from '@/components/affiliate/CreateLinkDialog';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { stats, chartData, loading, error, selectedTimeframe, changeTimeframe } = useDashboardStats() || { stats: null, chartData: [], loading: false, error: null, selectedTimeframe: 'week', changeTimeframe: () => {} };
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
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />

      <div className="flex min-h-[calc(100vh-4rem)] overflow-hidden">
        <DashboardSidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-600">Affiliate dashboard</p>
                  <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">Welcome back, {user?.full_name || 'Affiliate'}!</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">View your earnings, referral activity, and campaign performance in one clean dashboard.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsCreateLinkDialogOpen(true)}
                    className="inline-flex items-center justify-center rounded-2xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
                  >
                    Create referral link
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
                <p className="font-semibold">Unable to load the latest dashboard data.</p>
                <p className="mt-1 text-sm">Showing fallback or cached values while the system recovers.</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="animate-fade-in">
                <StatsCards stats={stats} loading={loading} />
              </div>

              {/* Modern Charts Grid */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="animate-fade-in lg:col-span-2">
                  <DonutChart 
                    earnings={stats?.totalEarnings || 0}
                    clicks={stats?.totalClicks || 0}
                    conversions={stats?.totalConversions || 0}
                    loading={loading}
                  />
                </div>
                <div className="animate-fade-in">
                  <ConversionChart 
                    data={[
                      { name: 'Direct', value: Math.floor((stats?.totalConversions || 0) * 0.4) },
                      { name: 'Referral', value: Math.floor((stats?.totalConversions || 0) * 0.35) },
                      { name: 'Organic', value: Math.floor((stats?.totalConversions || 0) * 0.25) },
                    ]}
                    loading={loading}
                  />
                </div>
              </div>

              {/* Trends Chart */}
              <div className="animate-fade-in">
                <TrendsChart 
                  data={chartData?.labels?.map((label, index) => ({
                    date: label,
                    earnings: chartData?.earnings?.[index] || 0,
                    clicks: chartData?.clicks?.[index] || 0,
                    conversions: chartData?.conversions?.[index] || 0,
                  })) ?? []}
                  loading={loading}
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="animate-fade-in">
                  <RecentEarnings />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <CreateLinkDialog
        isOpen={isCreateLinkDialogOpen}
        onClose={() => setIsCreateLinkDialogOpen(false)}
        onCreate={handleCreateLink}
      />
    </div>
  );
}
