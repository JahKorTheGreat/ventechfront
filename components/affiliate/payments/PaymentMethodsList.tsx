'use client';

import { Trash2, Check } from 'lucide-react';
import { useState } from 'react';

interface PaymentMethod {
  id: string;
  type: 'BANK' | 'MOBILE' | 'CRYPTO' | 'PAYPAL';
  details: string;
  is_default: boolean;
  created_at: string;
}

interface PaymentMethodsListProps {
  methods: PaymentMethod[];
  loading?: boolean;
  onDelete?: (id: string) => Promise<void>;
  onSetDefault?: (id: string) => Promise<void>;
}

export default function PaymentMethodsList({ 
  methods, 
  loading = false,
  onDelete,
  onSetDefault 
}: PaymentMethodsListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'BANK': return '🏦';
      case 'MOBILE': return '📱';
      case 'PAYPAL': return '💲';
      case 'CRYPTO': return '₿';
      default: return '💳';
    }
  };

  const formatDetails = (type: string, details: string) => {
    if (type === 'BANK') {
      const parts = details.split(':');
      return `${parts[1]?.slice(-4) || '****'} (${parts[0] || 'Bank'})`;
    }
    if (type === 'MOBILE') {
      return details.replace(/(\d{3})(\d{3})(\d{4})/, '+233 $1 $2 $3');
    }
    return details.slice(0, 12) + '...';
  };

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    try {
      setDeleting(id);
      setError('');
      await onDelete(id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete payment method');
      setDeleting(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!onSetDefault) return;
    try {
      setError('');
      await onSetDefault(id);
    } catch (err: any) {
      setError(err.message || 'Failed to set default payment method');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Methods</h3>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Payment Methods</h3>
        {methods.length > 0 && (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
            {methods.length} {methods.length === 1 ? 'method' : 'methods'}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {methods.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">💳</div>
          <p className="text-gray-600">No payment methods added yet</p>
          <p className="text-gray-500 text-sm mt-1">Add a bank account, mobile money, PayPal, or crypto wallet to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {methods.map(method => (
            <div
              key={method.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                method.is_default
                  ? 'border-chart-earnings bg-green-50'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-2xl">{getMethodIcon(method.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-900">{method.type}</h4>
                      {method.is_default && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-chart-earnings text-white text-xs font-medium rounded">
                          <Check size={14} /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm font-mono mt-1">{formatDetails(method.type, method.details)}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      Added {new Date(method.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {!method.is_default && onSetDefault && (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      className="px-3 py-2 text-sm font-medium text-chart-earnings bg-green-50 border border-green-300 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => handleDelete(method.id)}
                      disabled={deleting === method.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
