// Request Payout Dialog Component
// Modal for requesting a new payout

'use client';

import { useState } from 'react';
import { PaymentMethod } from '@/services/affiliatePayouts.service';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface RequestPayoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, methodId: string) => Promise<void>;
  paymentMethods: PaymentMethod[];
}

export default function RequestPayoutDialog({
  isOpen,
  onClose,
  onSubmit,
  paymentMethods,
}: RequestPayoutDialogProps) {
  const [amount, setAmount] = useState('');
  const [methodId, setMethodId] = useState(paymentMethods[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const MIN_PAYOUT = 50;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);

    if (!amount || isNaN(parsedAmount)) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parsedAmount < MIN_PAYOUT) {
      toast.error(`Minimum payout amount is $${MIN_PAYOUT}`);
      return;
    }

    if (!methodId) {
      toast.error('Please select a payment method');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(parsedAmount, methodId);
      toast.success('Payout request submitted successfully');
      setAmount('');
      onClose();
    } catch (error) {
      toast.error('Failed to request payout');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Request Payout</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={loading}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 font-medium">$</span>
              <input
                id="amount"
                type="number"
                step="0.01"
                min={MIN_PAYOUT}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vt-primary focus:border-transparent outline-none"
                disabled={loading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum payout: ${MIN_PAYOUT}</p>
          </div>

          <div>
            <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              id="method"
              value={methodId}
              onChange={(e) => setMethodId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vt-primary focus:border-transparent outline-none"
              disabled={loading || paymentMethods.length === 0}
            >
              <option value="">Select a payment method</option>
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name} - {method.type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            {paymentMethods.length === 0 && (
              <p className="text-xs text-red-500 mt-1">Please add a payment method first</p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Payouts are processed on the 1st and 15th of each month. Your request will be reviewed and processed accordingly.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || paymentMethods.length === 0}
              className="flex-1 px-4 py-2 bg-vt-primary text-white rounded-lg hover:bg-vt-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Request Payout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
