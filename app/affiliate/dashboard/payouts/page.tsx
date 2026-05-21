// Affiliate Dashboard - Payouts Page
// Manage payout requests and payment methods

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { useAffiliatePayouts } from '@/hooks/useAffiliate';
import { PayoutSummary, PaymentMethodInput } from '@/services/affiliatePayouts.service';
import DashboardSidebar from '@/components/affiliate/DashboardSidebar';
import DashboardHeader from '@/components/affiliate/DashboardHeader';
import PayoutSummaryCard from '@/components/affiliate/PayoutSummaryCard';
import PayoutsList from '@/components/affiliate/payments/PayoutsList';
import PaymentMethodForm from '@/components/affiliate/payments/PaymentMethodForm';
import PaymentMethodsList from '@/components/affiliate/payments/PaymentMethodsList';
import PayoutRequestModal from '@/components/affiliate/payments/PayoutRequestModal';

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
    getPayoutSummary,
    cancelPayout,
  } = useAffiliatePayouts();
  const [mounted, setMounted] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [payoutSummary, setPayoutSummary] = useState<PayoutSummary | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed'>('all');

  const normalizedPaymentMethods = ((paymentMethods || []) as any[]).map((method: any) => ({
    id: method.id,
    type: method.type === 'bank_transfer' ? 'BANK' : method.type === 'mobile_money' ? 'MOBILE' : 'CRYPTO',
    details: method.details,
    is_default: method.isDefault,
    created_at: method.createdAt,
    name: method.name,
  }));

  useEffect(() => {
    setMounted(true);
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, mounted, router]);

  useEffect(() => {
    const loadSummary = async () => {
      if (!isAuthenticated) return;
      const summary = await getPayoutSummary();
      setPayoutSummary(summary);
    };
    loadSummary();
  }, [getPayoutSummary, isAuthenticated]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-vt-text-secondary">Loading...</div>
      </div>
    );
  }

  const handleRequestPayout = async (data: { amount: number; paymentMethodId: string }) => {
    const success = await requestPayout(data.amount, data.paymentMethodId);
    if (success) {
      setIsRequestDialogOpen(false);
    }
  };

  const handleCancelPayout = async (payoutId: string) => {
    const success = await cancelPayout(payoutId);
    if (!success) {
      console.error('Failed to cancel payout:', payoutId);
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
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-vt-text-primary mb-4">Payout Overview</h2>
              <PayoutSummaryCard loading={loading.payouts} />
            </div>

            {/* Layout: Payment Methods (left) and Payouts List (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
              {/* Payment Methods - 1 column */}
              <div className="lg:col-span-1 space-y-6">
                <PaymentMethodForm
                  onSubmit={async (data) => {
                    try {
                      let name = '';
                      let details = '';

                      if (data.type === 'BANK') {
                        name = `${data.details.bankCode} ${data.details.accountNumber}`;
                        details = JSON.stringify(data.details);
                      } else if (data.type === 'MOBILE') {
                        name = `Mobile Money (${data.details.phoneNumber})`;
                        details = data.details.phoneNumber || '';
                      } else if (data.type === 'CRYPTO') {
                        name = `Crypto Wallet (${data.details.walletAddress?.substring(0, 10)}...)`;
                        details = data.details.walletAddress || '';
                      }

                      const methodData: PaymentMethodInput = {
                        type: data.type === 'BANK' ? 'bank_transfer' : data.type === 'MOBILE' ? 'mobile_money' : 'crypto_usdt',
                        name,
                        details,
                      };

                      const success = await addPaymentMethod(methodData);
                      if (!success) {
                        throw new Error('Unable to save payment method');
                      }
                    } catch (err) {
                      console.error(err);
                      throw err;
                    }
                  }}
                  loading={loading.payouts}
                />

                <PaymentMethodsList
                  methods={normalizedPaymentMethods as any}
                  loading={loading.payouts}
                  onDelete={async (id) => {
                    const success = await removePaymentMethod(id);
                    if (!success) {
                      throw new Error('Unable to delete payment method');
                    }
                  }}
                  onSetDefault={async (id) => {
                    const success = await setDefaultPaymentMethod(id);
                    if (!success) {
                      throw new Error('Unable to set default payment method');
                    }
                  }}
                />
              </div>

              {/* Payouts List - 2 columns */}
              <div className="lg:col-span-2">
                <PayoutsList
                  payouts={(payouts as any) || []}
                  loading={loading.payouts}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  onCancel={handleCancelPayout}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      <PayoutRequestModal
        isOpen={isRequestDialogOpen}
        onClose={() => setIsRequestDialogOpen(false)}
        onSubmit={handleRequestPayout}
        paymentMethods={normalizedPaymentMethods as any}
        availableBalance={payoutSummary?.totalRequested || 0}
        minimumPayout={payoutSummary?.minimumPayout || 50}
        loading={loading.payouts}
      />
    </div>
  );
}
