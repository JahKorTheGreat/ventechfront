// Affiliate Dashboard - Payouts Page
// Manage payout requests and payment methods

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { useAffiliatePayouts } from '@/hooks/useAffiliate';
import DashboardSidebar from '@/components/affiliate/DashboardSidebar';
import DashboardHeader from '@/components/affiliate/DashboardHeader';
import PayoutSummaryCard from '@/components/affiliate/PayoutSummaryCard';
import PayoutsList from '@/components/affiliate/PayoutsList';
import PaymentMethods from '@/components/affiliate/PaymentMethods';
import RequestPayoutDialog from '@/components/affiliate/RequestPayoutDialog';

export default function PayoutsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const {
    payouts,
    paymentMethods,
    loading,
    requestPayout,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
  } = useAffiliatePayouts();
  const [mounted, setMounted] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

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

  const handleRequestPayout = async (amount: number, methodId: string) => {
    const success = await requestPayout(amount, methodId);
    if (success) {
      setIsRequestDialogOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-vt-bg-secondary">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={user} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-vt-text-primary">Payouts</h1>
                <p className="text-vt-text-secondary mt-2">Request payouts and manage payment methods</p>
              </div>
              <button
                onClick={() => setIsRequestDialogOpen(true)}
                className="px-4 py-2 bg-vt-primary text-white rounded-lg hover:bg-vt-primary-dark transition-colors"
              >
                Request Payout
              </button>
            </div>

            {/* Payout Summary */}
            <div className="mb-8">
              <PayoutSummaryCard loading={loading} />
            </div>

            {/* Layout: Payment Methods (left) and Payouts List (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Payment Methods - 1 column */}
              <div className="lg:col-span-1">
                <PaymentMethods
                  methods={paymentMethods}
                  loading={loading}
                  onAdd={addPaymentMethod}
                  onRemove={removePaymentMethod}
                  onSetDefault={setDefaultPaymentMethod}
                />
              </div>

              {/* Payouts List - 2 columns */}
              <div className="lg:col-span-2">
                <PayoutsList payouts={payouts} loading={loading} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Request Payout Dialog */}
      <RequestPayoutDialog
        isOpen={isRequestDialogOpen}
        onClose={() => setIsRequestDialogOpen(false)}
        onSubmit={handleRequestPayout}
        paymentMethods={paymentMethods}
      />
    </div>
  );
}
