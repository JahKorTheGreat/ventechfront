// Payment Methods Component
// Manage payment methods for payouts

'use client';

import { useState } from 'react';
import { PaymentMethod, PaymentMethodInput } from '@/services/affiliatePayouts.service';
import { Plus, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentMethodsProps {
  methods: PaymentMethod[];
  loading: boolean;
  onAdd: (data: PaymentMethodInput) => Promise<boolean>;
  onRemove: (methodId: string) => Promise<boolean>;
  onSetDefault: (methodId: string) => Promise<boolean>;
}

export default function PaymentMethods({
  methods,
  loading,
  onAdd,
  onRemove,
  onSetDefault,
}: PaymentMethodsProps) {
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [formData, setFormData] = useState({
    type: 'bank_transfer' as const,
    name: '',
    details: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.details) {
      toast.error('Please fill in all fields');
      return;
    }

    const success = await onAdd(formData);
    if (success) {
      setFormData({ type: 'bank_transfer', name: '', details: '' });
      setIsAddingMethod(false);
      toast.success('Payment method added');
    } else {
      toast.error('Failed to add payment method');
    }
  };

  const handleRemove = async (methodId: string) => {
    if (confirm('Are you sure you want to delete this payment method?')) {
      const success = await onRemove(methodId);
      if (success) {
        toast.success('Payment method deleted');
      } else {
        toast.error('Failed to delete payment method');
      }
    }
  };

  const handleSetDefault = async (methodId: string) => {
    const success = await onSetDefault(methodId);
    if (success) {
      toast.success('Default payment method updated');
    }
  };

  const getMethodTypeLabel = (type: string) => {
    switch (type) {
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'mobile_money':
        return 'Mobile Money';
      case 'crypto_usdt':
        return 'Crypto (USDT)';
      default:
        return type;
    }
  };

  return (
    <div className="bg-vt-bg-primary rounded-lg border border-vt-border">
      <div className="p-6 border-b border-vt-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-vt-text-primary">Payment Methods</h3>
            <p className="text-vt-text-secondary text-sm mt-1">Where to send your payouts</p>
          </div>
          <button
            onClick={() => setIsAddingMethod(!isAddingMethod)}
            className="flex items-center space-x-2 px-3 py-2 bg-vt-primary text-white rounded-lg hover:bg-vt-primary-dark transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Method</span>
          </button>
        </div>
      </div>

      {/* Add Method Form */}
      {isAddingMethod && (
        <form onSubmit={handleSubmit} className="p-6 border-b border-vt-border bg-vt-bg-secondary">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-vt-text-primary mb-2">Payment Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 border border-vt-border rounded-lg bg-vt-bg-primary text-vt-text-primary outline-none"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money (MoMo)</option>
                <option value="crypto_usdt">Crypto (USDT)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-vt-text-primary mb-2">Method Name</label>
              <input
                type="text"
                placeholder="e.g., My Bank Account"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-vt-border rounded-lg bg-vt-bg-primary text-vt-text-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-vt-text-primary mb-2">
                {formData.type === 'bank_transfer' && 'Account Number / IBAN'}
                {formData.type === 'mobile_money' && 'Phone Number'}
                {formData.type === 'crypto_usdt' && 'Wallet Address'}
              </label>
              <input
                type="text"
                placeholder="Enter details"
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                className="w-full px-4 py-2 border border-vt-border rounded-lg bg-vt-bg-primary text-vt-text-primary outline-none"
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setIsAddingMethod(false)}
                className="flex-1 px-4 py-2 border border-vt-border rounded-lg text-vt-text-primary hover:bg-vt-border transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-vt-primary text-white rounded-lg hover:bg-vt-primary-dark transition-colors"
              >
                Save Method
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Methods List */}
      {loading ? (
        <div className="p-8 text-center text-vt-text-secondary">Loading methods...</div>
      ) : methods.length === 0 ? (
        <div className="p-8 text-center text-vt-text-secondary">
          <p>No payment methods added</p>
          <p className="text-sm mt-2">Add a payment method to request payouts</p>
        </div>
      ) : (
        <div className="divide-y divide-vt-border">
          {methods.map((method) => (
            <div key={method.id} className="p-4 hover:bg-vt-bg-secondary transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <p className="font-medium text-vt-text-primary">{method.name}</p>
                    {method.isDefault && (
                      <span className="flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                        <Check className="w-3 h-3" />
                        <span>Default</span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-vt-text-secondary mt-1">
                    {getMethodTypeLabel(method.type)} • {method.details.substring(0, 20)}...
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {!method.isDefault && (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      className="px-3 py-1 text-sm text-vt-primary hover:bg-vt-primary hover:text-white rounded transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(method.id)}
                    className="p-2 text-vt-text-secondary hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
