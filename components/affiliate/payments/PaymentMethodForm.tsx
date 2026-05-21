'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface PaymentMethodFormProps {
  onSubmit: (data: {
    type: 'BANK' | 'MOBILE' | 'CRYPTO';
    details: Record<string, string>;
  }) => Promise<void>;
  loading?: boolean;
}

export default function PaymentMethodForm({ onSubmit, loading = false }: PaymentMethodFormProps) {
  const [type, setType] = useState<'BANK' | 'MOBILE' | 'CRYPTO'>('BANK');
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    bankCode: '',
    accountNumber: '',
    accountName: '',
    phoneNumber: '',
    walletAddress: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const bankCodes = [
    { code: 'GTB', name: 'Guarantee Trust Bank' },
    { code: 'ACCESS', name: 'Access Bank' },
    { code: 'UBA', name: 'United Bank for Africa' },
    { code: 'ZENITH', name: 'Zenith Bank' },
  ];

  const handleMethodChange = (newType: 'BANK' | 'MOBILE' | 'CRYPTO') => {
    setType(newType);
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (type === 'BANK') {
      if (!formData.bankCode || !formData.accountNumber || !formData.accountName) {
        setError('Please fill in all bank details');
        return false;
      }
      if (formData.accountNumber.length !== 10) {
        setError('Account number must be 10 digits');
        return false;
      }
    } else if (type === 'MOBILE') {
      if (!formData.phoneNumber) {
        setError('Please enter a phone number');
        return false;
      }
      if (!/^\+?233\d{9}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
        setError('Invalid Ghana phone number');
        return false;
      }
    } else if (type === 'CRYPTO') {
      if (!formData.walletAddress) {
        setError('Please enter a wallet address');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) return;

    try {
      let details: Record<string, string> = {};
      
      if (type === 'BANK') {
        details = {
          bankCode: formData.bankCode,
          accountNumber: formData.accountNumber,
          accountName: formData.accountName,
        };
      } else if (type === 'MOBILE') {
        details = { phoneNumber: formData.phoneNumber };
      } else if (type === 'CRYPTO') {
        details = { walletAddress: formData.walletAddress };
      }

      await onSubmit({ type, details });
      setSuccess(true);
      setFormData({
        bankCode: '',
        accountNumber: '',
        accountName: '',
        phoneNumber: '',
        walletAddress: '',
      });
      setType('BANK');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to add payment method');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Add Payment Method</h3>

      {/* Payment Type Selector */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {(['BANK', 'MOBILE', 'CRYPTO'] as const).map((method) => (
          <button
            key={method}
            onClick={() => handleMethodChange(method)}
            className={`py-3 px-4 rounded-lg font-medium transition-all ${
              type === method
                ? 'bg-chart-earnings text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {method === 'BANK' && '🏦 Bank'}
            {method === 'MOBILE' && '📱 Mobile'}
            {method === 'CRYPTO' && '₿ Crypto'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bank Details */}
        {type === 'BANK' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg flex items-center justify-between hover:border-gray-400"
                >
                  {bankCodes.find(b => b.code === formData.bankCode)?.name || 'Select bank'}
                  <ChevronDown size={18} />
                </button>
                {isOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    {bankCodes.map(bank => (
                      <button
                        key={bank.code}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, bankCode: bank.code }));
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        {bank.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                placeholder="Enter 10-digit account number"
                maxLength={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chart-earnings focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleInputChange}
                placeholder="Enter account holder name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chart-earnings focus:border-transparent"
              />
            </div>
          </>
        )}

        {/* Mobile Details */}
        {type === 'MOBILE' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="e.g., +233 24 123 4567"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chart-earnings focus:border-transparent"
            />
            <p className="text-xs text-gray-600 mt-1">Ghana mobile money number</p>
          </div>
        )}

        {/* Crypto Details */}
        {type === 'CRYPTO' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
            <input
              type="text"
              name="walletAddress"
              value={formData.walletAddress}
              onChange={handleInputChange}
              placeholder="Enter your wallet address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chart-earnings focus:border-transparent"
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">✓ Payment method added successfully!</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-chart-earnings text-white font-medium rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Adding...' : 'Add Payment Method'}
        </button>
      </form>
    </div>
  );
}
