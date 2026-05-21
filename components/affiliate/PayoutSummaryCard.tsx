// Payout Summary Card Component
// Display payout summary information

'use client';

import { useAffiliatePayouts } from '@/hooks/useAffiliate';
import { useAppSelector } from '@/store';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PayoutSummaryCardProps {
  loading: boolean;
}

export default function PayoutSummaryCard({ loading }: PayoutSummaryCardProps) {
  const { getPayoutSummary } = useAffiliatePayouts();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(loading);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await getPayoutSummary();
        if (data) {
          setSummary(data);
        }
      } catch (err) {
        console.error('Error fetching payout summary:', err);
        setSummary({
          totalPaid: 0,
          pendingPayouts: 0,
          nextPayoutDate: null,
          minimumPayout: 0,
        });
        setError('Unable to load payout summary. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [getPayoutSummary, isAuthenticated]);

  const cards = [
    {
      label: 'Total Paid',
      value: summary?.totalPaid || 0,
      icon: DollarSign,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Pending Payouts',
      value: summary?.pendingPayouts || 0,
      icon: TrendingUp,
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      label: 'Next Payout Date',
      value: summary?.nextPayoutDate ? new Date(summary.nextPayoutDate).toLocaleDateString() : 'TBA',
      icon: Calendar,
      color: 'bg-blue-50 text-blue-600',
      isDate: true,
    },
  ];

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-gray-50 rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-vt-text-secondary text-xs sm:text-sm font-medium">{card.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-vt-text-primary mt-2 truncate">
                    {isLoading
                      ? <span className="inline-block animate-pulse">...</span>
                      : card.isDate
                        ? card.value
                        : `$${Number(card.value).toFixed(2)}`}
                  </p>
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${card.color} flex items-center justify-center flex-shrink-0 ml-2`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
