// Payout Summary Card Component
// Display payout summary information

'use client';

import { useAffiliatePayouts } from '@/hooks/useAffiliate';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PayoutSummaryCardProps {
  loading: boolean;
}

export default function PayoutSummaryCard({ loading }: PayoutSummaryCardProps) {
  const { getPayoutSummary } = useAffiliatePayouts();
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(loading);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      const data = await getPayoutSummary();
      if (data) {
        setSummary(data);
      }
      setIsLoading(false);
    };

    fetchSummary();
  }, [getPayoutSummary]);

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="bg-vt-bg-primary rounded-lg border border-vt-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-vt-text-secondary text-sm font-medium">{card.label}</p>
                <p className="text-2xl font-bold text-vt-text-primary mt-2">
                  {isLoading
                    ? '...'
                    : card.isDate
                      ? card.value
                      : `$${Number(card.value).toFixed(2)}`}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
