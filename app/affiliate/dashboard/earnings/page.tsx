// Affiliate Dashboard - Earnings Page
// View and track commissions and earnings

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { useAffiliateEarnings } from '@/hooks/useAffiliate';
import DashboardSidebar from '@/components/affiliate/DashboardSidebar';
import DashboardHeader from '@/components/affiliate/DashboardHeader';
import EarningsSummary from '@/components/affiliate/EarningsSummary';
import EarningsTable from '@/components/affiliate/EarningsTable';
import EarningsFilters from '@/components/affiliate/EarningsFilters';

export default function EarningsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [statusFilter, setStatusFilter] = useState('all');
  const { earnings, summary, loading, exportEarningsCSV } = useAffiliateEarnings({
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  const [mounted, setMounted] = useState(false);

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

  const handleExport = async () => {
    await exportEarningsCSV({ status: statusFilter !== 'all' ? statusFilter : undefined });
  };

  return (
    <div className="flex h-screen bg-vt-bg-secondary">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={user} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-vt-text-primary">Earnings & Commissions</h1>
              <p className="text-vt-text-secondary mt-2">Track your commissions from referred sales</p>
            </div>

            {/* Summary Cards */}
            <div className="mb-8">
              <EarningsSummary summary={summary} loading={loading} />
            </div>

            {/* Filters and Export */}
            <div className="mb-8 flex justify-between items-center">
              <EarningsFilters statusFilter={statusFilter} onStatusChange={setStatusFilter} />
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-vt-primary text-white rounded-lg hover:bg-vt-primary-dark transition-colors"
              >
                Export CSV
              </button>
            </div>

            {/* Earnings Table */}
            <EarningsTable earnings={earnings} loading={loading} />
          </div>
        </main>
      </div>
    </div>
  );
}
