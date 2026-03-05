// Recent Earnings Component
// Display recent earnings transactions

'use client';

import { useAffiliateEarnings } from '@/hooks/useAffiliate';

export default function RecentEarnings() {
  const { earnings, loading } = useAffiliateEarnings();

  const recentItems = earnings.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-vt-bg-secondary text-vt-text-secondary';
    }
  };

  return (
    <div className="bg-vt-bg-primary rounded-lg border border-vt-border p-6">
      <h3 className="text-lg font-bold text-vt-text-primary mb-2">Recent Earnings</h3>
      <p className="text-vt-text-secondary text-sm mb-6">Latest commission activity</p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-vt-bg-secondary rounded animate-pulse" />
          ))}
        </div>
      ) : recentItems.length === 0 ? (
        <div className="text-center py-8 text-vt-text-secondary">No earnings yet</div>
      ) : (
        <div className="space-y-3">
          {recentItems.map((earning) => (
            <div key={earning.id} className="flex items-center justify-between py-3 border-b border-vt-border last:border-0">
              <div className="flex-1">
                <p className="font-medium text-vt-text-primary text-sm">{earning.productName}</p>
                <p className="text-xs text-vt-text-secondary">{earning.date}</p>
              </div>
              <div className="flex items-center space-x-3">
                <p className="font-bold text-vt-text-primary">${earning.commission.toFixed(2)}</p>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(earning.status)}`}
                >
                  {earning.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
