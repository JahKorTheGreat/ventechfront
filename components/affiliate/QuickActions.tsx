// Quick Actions Component
// Quick action buttons for common tasks

'use client';

import Link from 'next/link';
import { Link2, DollarSign, CreditCard, Package } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    {
      href: '/affiliate/dashboard/links',
      label: 'Create Link',
      description: 'Generate a new referral link',
      icon: Link2,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      href: '/affiliate/dashboard/earnings',
      label: 'View Earnings',
      description: 'Check your commission details',
      icon: DollarSign,
      color: 'bg-green-50 text-green-600',
    },
    {
      href: '/affiliate/dashboard/payouts',
      label: 'Request Payout',
      description: 'Withdraw your earnings',
      icon: CreditCard,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      href: '/affiliate/dashboard/products',
      label: 'Browse Products',
      description: 'Find products to promote',
      icon: Package,
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className="bg-vt-bg-primary border border-vt-border rounded-lg p-4 hover:border-vt-primary transition-colors group"
          >
            <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="font-semibold text-vt-text-primary text-sm">{action.label}</p>
            <p className="text-vt-text-secondary text-xs mt-1">{action.description}</p>
          </Link>
        );
      })}
    </div>
  );
}
