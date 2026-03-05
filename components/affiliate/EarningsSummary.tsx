// Earnings Summary Component
// Display earning totals by status

'use client';

import { EarningsSummary as EarningsSummaryType } from '@/services/affiliateEarnings.service';
import { DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';

interface EarningsSummaryProps {
  summary: EarningsSummaryType | null;
  loading: boolean;
}

export default function EarningsSummary({ summary, loading }: EarningsSummaryProps) {
  const cards = [
    {
      label: 'Total Earnings',
      value: summary?.totalEarnings || 0,
      icon: DollarSign,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Pending',
      value: summary?.pendingCommissions || 0,
      icon: Clock,
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      label: 'Approved',
      value: summary?.approvedCommissions || 0,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Paid',
      value: summary?.paidCommissions || 0,
      icon: DollarSign,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="bg-vt-bg-primary rounded-lg border border-vt-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-vt-text-secondary text-sm font-medium">{card.label}</p>
                <p className="text-2xl font-bold text-vt-text-primary mt-2">
                  {loading ? '...' : `$${Number(card.value).toFixed(2)}`}
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
