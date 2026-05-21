// Stats Cards Component
// Display key metrics

'use client';

import { DashboardStats } from '@/services/affiliateStats.service';
import { TrendingUp, Users, Target, Award } from 'lucide-react';

interface StatsCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export default function StatsCards({ stats, loading }: StatsCardsProps) {
  const cards = [
    {
      label: 'Total Earnings',
      value: stats?.totalEarnings || 0,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      format: 'currency',
    },
    {
      label: 'Total Clicks',
      value: stats?.totalClicks || 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      format: 'number',
    },
    {
      label: 'Conversions',
      value: stats?.totalConversions || 0,
      icon: Target,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      format: 'number',
    },
    {
      label: 'Referrals',
      value: stats?.totalReferrals || 0,
      icon: Award,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      format: 'number',
    },
  ];

  const formatValue = (val: string | number, format: string) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(val));
    }
    if (format === 'number') {
      return Number(val).toString();
    }
    return String(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="min-h-[150px] rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium uppercase tracking-[0.08em] text-slate-500">{card.label}</p>
                <p className="mt-4 text-2xl font-bold text-slate-900 truncate">
                  {loading ? (
                    <span className="inline-block h-10 w-28 rounded-2xl bg-slate-200 animate-pulse" />
                  ) : (
                    formatValue(card.value, card.format)
                  )}
                </p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-3xl ${card.bgColor}`}>
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
