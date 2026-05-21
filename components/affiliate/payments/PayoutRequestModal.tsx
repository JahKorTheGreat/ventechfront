'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface PayoutRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: number; paymentMethodId: string }) => Promise<void>;
  paymentMethods: Array<{ id: string; type: string; details: string; is_default: boolean }>;
  availableBalance?: number;
  minimumPayout?: number;
  loading?: boolean;
}

export default function PayoutRequestModal({
  isOpen,
  onClose,
  onSubmit,
  paymentMethods,
  availableBalance = 0,
  minimumPayout = 50,
  loading = false,
}: PayoutRequestModalProps) {
  const [amount, setAmount] = useState('');
  const [selectedMethodId, setSelectedMethodId] = useState(
    paymentMethods.find(m => m.is_default)?.id || paymentMethods[0]?.id || ''
  );
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const defaultMethod = paymentMethods.find(m => m.is_default);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount)) {
      setError('Please enter a valid amount');
      return;
    }

    if (numAmount < minimumPayout) {
      setError(`Minimum payout is ${minimumPayout} GHS`);
      return;
    }

    if (numAmount > availableBalance) {
      setError(`Insufficient balance. Available: ${availableBalance} GHS`);
      return;
    }

    if (!selectedMethodId) {
      setError('Please select a payment method');
      return;
    }

    try {
      await onSubmit({
        amount: numAmount,
        paymentMethodId: selectedMethodId,
      });
      setSuccess(true);
      setAmount('');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to request payout');
    }
  };

  if (!isOpen) return null;

  const formatMethodDisplay = (method: any) => {
    const typeIcon = {
      BANK: '🏦',
      MOBILE: '📱',
      CRYPTO: '₿',
    }[method.type as 'BANK' | 'MOBILE' | 'CRYPTO'] || '💳';
    
    let details = method.details;
    if (method.type === 'BANK') {
      const parts = details.split(':');
      details = `${parts[1]?.slice(-4) || '****'} (${parts[0] || 'Bank'})`;
    }
    
    return `${typeIcon} ${method.type} - ${details}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Request Payout</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Balance Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">Available Balance</p>
            <p className="text-2xl font-bold text-blue-900">GHS {availableBalance.toFixed(2)}</p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payout Amount (GHS)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₵</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chart-earnings focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 mt-3">
              {[50, 100, 250, 500].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  disabled={preset > availableBalance}
                  className="flex-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {preset}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Minimum payout: GHS {minimumPayout}
            </p>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            {paymentMethods.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  ⚠️ No payment methods configured. Please add one first.
                </p>
              </div>
            ) : (
              <select
                value={selectedMethodId}
                onChange={(e) => {
                  setSelectedMethodId(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chart-earnings focus:border-transparent"
              >
                {paymentMethods.map(method => (
                  <option key={method.id} value={method.id}>
                    {formatMethodDisplay(method)}
                    {method.is_default ? ' (Default)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">✓ Payout requested successfully!</p>
            </div>
          )}

          {/* Summary */}
          {amount && !error && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Payout Amount:</span>
                <span className="font-semibold text-gray-900">GHS {parseFloat(amount || '0').toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-300">
                <span className="text-gray-600">Remaining Balance:</span>
                <span className="font-semibold text-gray-900">
                  GHS {(availableBalance - parseFloat(amount || '0')).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedMethodId || paymentMethods.length === 0}
              className="flex-1 px-4 py-2 bg-chart-earnings text-white font-medium rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Request Payout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
