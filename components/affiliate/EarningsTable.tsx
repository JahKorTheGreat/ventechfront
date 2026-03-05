// Earnings Table Component
// Display detailed earnings transactions

'use client';

import { Earning } from '@/services/affiliateEarnings.service';

interface EarningsTableProps {
  earnings: Earning[];
  loading: boolean;
}

export default function EarningsTable({ earnings, loading }: EarningsTableProps) {
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
    <div className="bg-vt-bg-primary rounded-lg border border-vt-border">
      {loading ? (
        <div className="p-8 text-center text-vt-text-secondary">Loading earnings...</div>
      ) : earnings.length === 0 ? (
        <div className="p-8 text-center text-vt-text-secondary">
          <p>No earnings found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-vt-border bg-vt-bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-vt-text-primary">Product</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-vt-text-primary">Order ID</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-vt-text-primary">Sale Amount</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-vt-text-primary">Commission</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-vt-text-primary">Rate</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-vt-text-primary">Date</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-vt-text-primary">Status</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((earning) => (
                <tr key={earning.id} className="border-b border-vt-border hover:bg-vt-bg-secondary transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-vt-text-primary">{earning.productName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-vt-text-secondary font-mono">{earning.orderId}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-medium text-vt-text-primary">${earning.amount.toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-semibold text-green-600">${earning.commission.toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-vt-text-secondary">{(earning.commissionRate * 100).toFixed(0)}%</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-vt-text-secondary text-sm">{new Date(earning.date).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(earning.status)}`}>
                      {earning.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
