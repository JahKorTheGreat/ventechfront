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
      label: 'Monthly Earnings',
      value: stats?.monthlyEarnings || 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      format: 'currency',
    },
    {
      label: 'Active Links',
      value: stats?.activeLinks || 0,
      icon: Target,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      format: 'number',
    },
    {
      label: 'Tier Status',
      value: stats?.tier || 'Starter',
      icon: Award,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      format: 'text',
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
          <div key={idx} className="bg-gray-50 rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-vt-text-secondary text-xs sm:text-sm font-medium">{card.label}</p>
                <p className="text-lg sm:text-2xl font-bold text-vt-text-primary mt-2 truncate min-h-7">
                  {loading ? (
                    <span className="inline-block w-16 h-6 bg-gray-200 rounded animate-pulse"></span>
                  ) : (
                    formatValue(card.value, card.format)
                  )}
                </p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${card.bgColor} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
