'use client';

import { RotateCcw, Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Payout {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: string;
  paymentType: 'BANK' | 'MOBILE' | 'CRYPTO';
  createdAt: string;
  updatedAt: string;
  paystackReference?: string;
}

interface PayoutsListProps {
  payouts: Payout[];
  loading?: boolean;
  onRetry?: (id: string) => Promise<void>;
  onVerify?: (id: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
  onViewDetails?: (payout: Payout) => void;
  statusFilter?: 'all' | 'pending' | 'processing' | 'completed' | 'failed';
  onStatusFilterChange?: (status: 'all' | 'pending' | 'processing' | 'completed' | 'failed') => void;
}

export default function PayoutsList({
  payouts,
  loading = false,
  onRetry,
  onVerify,
  onCancel,
  onViewDetails,
  statusFilter = 'all',
  onStatusFilterChange,
}: PayoutsListProps) {
  const [retrying, setRetrying] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [error, setError] = useState('');

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: string }> = {
      pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: '⏳' },
      processing: { bg: 'bg-blue-50', text: 'text-blue-700', icon: '⚙️' },
      completed: { bg: 'bg-green-50', text: 'text-green-700', icon: '✅' },
      failed: { bg: 'bg-red-50', text: 'text-red-700', icon: '❌' },
    };
    const badge = badges[status] || badges.pending;
    return badge;
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'BANK': return '🏦';
      case 'MOBILE': return '📱';
      case 'CRYPTO': return '₿';
      default: return '💳';
    }
  };

  const handleRetry = async (id: string) => {
    if (!onRetry) return;
    try {
      setRetrying(id);
      setError('');
      await onRetry(id);
    } catch (err: any) {
      setError(err.message || 'Failed to retry payout');
    } finally {
      setRetrying(null);
    }
  };

  const handleVerify = async (id: string) => {
    if (!onVerify) return;
    try {
      setVerifying(id);
      setError('');
      await onVerify(id);
    } catch (err: any) {
      setError(err.message || 'Failed to verify payout');
    } finally {
      setVerifying(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!onCancel) return;
    try {
      setCancelling(id);
      setError('');
      await onCancel(id);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel payout');
    } finally {
      setCancelling(null);
    }
  };

  const filteredPayouts = statusFilter === 'all' 
    ? payouts 
    : payouts.filter(p => p.status === statusFilter);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Payout History</h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Payout History</h3>
          <p className="text-gray-600 text-sm">Manage your payouts</p>
        </div>
        {payouts.length > 0 && (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
            {payouts.length} {payouts.length === 1 ? 'payout' : 'payouts'}
          </span>
        )}
      </div>

      {/* Status Filter */}
      {onStatusFilterChange && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'pending', 'processing', 'completed', 'failed'] as const).map(status => (
            <button
              key={status}
              onClick={() => onStatusFilterChange(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-chart-earnings text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Payouts List */}
      {filteredPayouts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">💰</div>
          <p className="text-gray-600 font-medium">No payouts {statusFilter !== 'all' ? `with status "${statusFilter}"` : 'yet'}</p>
          <p className="text-gray-500 text-sm mt-1">Your payout requests will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayouts.map(payout => {
            const badge = getStatusBadge(payout.status);
            return (
              <div
                key={payout.id}
                className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Icon */}
                    <div className="text-2xl flex-shrink-0">
                      {getPaymentIcon(payout.paymentType)}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-gray-900">
                          GHS {payout.amount.toFixed(2)}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
                          {badge.icon} {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{payout.paymentMethod}</p>
                      <p className="text-gray-500 text-xs mt-2">
                        {new Date(payout.createdAt).toLocaleDateString()} at {new Date(payout.createdAt).toLocaleTimeString()}
                      </p>
                      {payout.paystackReference && (
                        <p className="text-gray-500 text-xs font-mono mt-1">
                          Ref: {payout.paystackReference}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {(payout.status === 'pending' || payout.status === 'processing') && onVerify && (
                      <button
                        onClick={() => handleVerify(payout.id)}
                        disabled={verifying === payout.id}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Verify Status"
                      >
                        <Eye size={18} />
                      </button>
                    )}
                    {(payout.status === 'failed' || payout.status === 'pending') && onRetry && (
                      <button
                        onClick={() => handleRetry(payout.id)}
                        disabled={retrying === payout.id}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Retry"
                      >
                        <RotateCcw size={18} />
                      </button>
                    )}
                    {payout.status === 'pending' && onCancel && (
                      <button
                        onClick={() => handleCancel(payout.id)}
                        disabled={cancelling === payout.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Cancel"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    {onViewDetails && (
                      <button
                        onClick={() => onViewDetails(payout)}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
