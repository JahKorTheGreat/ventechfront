// Payouts List Component
// Display payout request history

'use client';

import { Payout } from '@/services/affiliatePayouts.service';
import { Copy, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface PayoutsListProps {
  payouts: Payout[];
  loading: boolean;
}

export default function PayoutsList({ payouts, loading }: PayoutsListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-vt-bg-secondary text-vt-text-secondary';
    }
  };

  const handleCopyTransaction = (transactionId?: string) => {
    if (transactionId) {
      navigator.clipboard.writeText(transactionId);
      toast.success('Transaction ID copied');
    }
  };

  return (
    <div className="bg-vt-bg-primary rounded-lg border border-vt-border">
      <div className="p-6 border-b border-vt-border">
        <h3 className="text-lg font-bold text-vt-text-primary">Payout Requests</h3>
        <p className="text-vt-text-secondary text-sm mt-1">History of your withdrawal requests</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-vt-text-secondary">Loading payouts...</div>
      ) : payouts.length === 0 ? (
        <div className="p-8 text-center text-vt-text-secondary">
          <p>No payout requests yet</p>
          <p className="text-sm mt-2">Request a payout once you reach the minimum amount</p>
        </div>
      ) : (
        <div className="divide-y divide-vt-border">
          {payouts.map((payout) => (
            <div key={payout.id} className="p-6 hover:bg-vt-bg-secondary transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-vt-text-primary flex items-center space-x-2">
                    <span>${payout.amount.toFixed(2)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(payout.status)}`}>
                      {payout.status}
                    </span>
                  </p>
                  <p className="text-sm text-vt-text-secondary mt-1">
                    {payout.paymentMethod.type.replace(/_/g, ' ')} - {payout.paymentMethod.name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-vt-text-secondary">Requested</p>
                  <p className="text-vt-text-primary font-medium">{new Date(payout.requestedAt).toLocaleDateString()}</p>
                </div>
                {payout.processedAt && (
                  <div>
                    <p className="text-vt-text-secondary">Processed</p>
                    <p className="text-vt-text-primary font-medium">{new Date(payout.processedAt).toLocaleDateString()}</p>
                  </div>
                )}
                {payout.transactionId && (
                  <div className="col-span-2">
                    <p className="text-vt-text-secondary mb-1">Transaction ID</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-vt-text-primary font-mono text-sm">{payout.transactionId}</p>
                      <button
                        onClick={() => handleCopyTransaction(payout.transactionId)}
                        className="p-1 hover:bg-vt-bg-primary rounded transition-colors"
                      >
                        <Copy className="w-4 h-4 text-vt-text-secondary" />
                      </button>
                    </div>
                  </div>
                )}
                {payout.failureReason && (
                  <div className="col-span-2 bg-red-50 border border-red-200 rounded p-3">
                    <div className="flex items-start space-x-2">
                      <X className="w-4 h-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-red-800">Failure Reason</p>
                        <p className="text-xs text-red-700 mt-1">{payout.failureReason}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
