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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="bg-vt-bg-primary rounded-lg border border-vt-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-vt-text-secondary text-sm font-medium">{card.label}</p>
                <p className="text-2xl font-bold text-vt-text-primary mt-2">
                  {loading ? <span className="text-vt-text-secondary">...</span> : formatValue(card.value, card.format)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
