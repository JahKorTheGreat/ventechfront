// Payouts List Component
// Display payout request history

'use client';

import { useState } from 'react';
import { Payout } from '@/services/affiliatePayouts.service';
import { Copy, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface PayoutsListProps {
  payouts: Payout[];
  loading: boolean;
  onCancel?: (payoutId: string) => Promise<void>;
}

export default function PayoutsList({ payouts, loading, onCancel }: PayoutsListProps) {
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const safePayouts = Array.isArray(payouts) ? payouts : [];
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

  const handleCancelPayout = async (payoutId: string) => {
    if (!onCancel) return;
    
    if (!confirm('Are you sure you want to cancel this payout request?')) {
      return;
    }

    setCancelingId(payoutId);
    try {
      await onCancel(payoutId);
      toast.success('Payout cancelled successfully');
    } catch (error) {
      console.error('Error cancelling payout:', error);
      toast.error('Failed to cancel payout');
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg shadow-md">
      <div className="p-6 shadow-sm">
        <h3 className="text-lg font-bold text-vt-text-primary">Payout Requests</h3>
        <p className="text-vt-text-secondary text-sm mt-1">History of your withdrawal requests</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-vt-text-secondary">Loading payouts...</div>
      ) : safePayouts.length === 0 ? (
        <div className="p-8 text-center text-vt-text-secondary">
          <p>No payout requests yet</p>
          <p className="text-sm mt-2">Request a payout once you reach the minimum amount</p>
        </div>
      ) : (
        <div className="divide-y divide-vt-border">
          {safePayouts.map((payout) => {
            const payoutData = payout as any;
            return (
              <div key={payoutData.id} className="p-6 hover:bg-vt-bg-secondary transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-vt-text-primary flex items-center space-x-2">
                      <span>${payoutData.amount.toFixed(2)}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(payoutData.status)}`}>
                        {payoutData.status}
                      </span>
                    </p>
                    <p className="text-sm text-vt-text-secondary mt-1">
                      {(payoutData.paymentMethod?.type || 'payment_method').replace(/_/g, ' ')} - {payoutData.paymentMethod?.name || 'Method'}
                    </p>
                  </div>
                {payoutData.status === 'pending' && onCancel && (
                  <button
                    onClick={() => handleCancelPayout(payoutData.id)}
                    disabled={cancelingId === payoutData.id}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50 font-medium"
                  >
                    {cancelingId === payoutData.id ? 'Cancelling...' : 'Cancel'}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-vt-text-secondary">Requested</p>
                  <p className="text-vt-text-primary font-medium">{new Date(payoutData.requestedAt).toLocaleDateString()}</p>
                </div>
                {payoutData.processedAt && (
                  <div>
                    <p className="text-vt-text-secondary">Processed</p>
                    <p className="text-vt-text-primary font-medium">{new Date(payoutData.processedAt).toLocaleDateString()}</p>
                  </div>
                )}
                {payoutData.transactionId && (
                  <div className="col-span-2">
                    <p className="text-vt-text-secondary mb-1">Transaction ID</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-vt-text-primary font-mono text-sm">{payoutData.transactionId}</p>
                      <button
                        onClick={() => handleCopyTransaction(payoutData.transactionId)}
                        className="p-1 hover:bg-gray-50 rounded transition-colors"
                      >
                        <Copy className="w-4 h-4 text-vt-text-secondary" />
                      </button>
                    </div>
                  </div>
                )}
                {payoutData.failureReason && (
                  <div className="col-span-2 bg-red-50 border border-red-200 rounded p-3">
                    <div className="flex items-start space-x-2">
                      <X className="w-4 h-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-red-800">Failure Reason</p>
                        <p className="text-xs text-red-700 mt-1">{payoutData.failureReason}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
