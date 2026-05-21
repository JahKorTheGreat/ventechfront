'use client';

import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface PayoutDetailsModalProps {
  payout?: {
    id: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    paymentMethod: string;
    paymentType: 'BANK' | 'MOBILE' | 'CRYPTO';
    createdAt: string;
    updatedAt: string;
    paystackReference?: string;
    errorMessage?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PayoutDetailsModal({ 
  payout, 
  isOpen, 
  onClose 
}: PayoutDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !payout) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'processing': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'processing': return '⚙️';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'BANK': return '🏦';
      case 'MOBILE': return '📱';
      case 'CRYPTO': return '₿';
      default: return '💳';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const createdDate = formatDate(payout.createdAt);
  const updatedDate = formatDate(payout.updatedAt);
  const daysSince = Math.floor((Date.now() - new Date(payout.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Payout Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Card */}
          <div className={`p-4 rounded-lg border-2 ${getStatusColor(payout.status)}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{getStatusIcon(payout.status)}</span>
              <div>
                <p className="text-xs font-medium opacity-75">Current Status</p>
                <p className="text-lg font-bold">{payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}</p>
              </div>
            </div>
          </div>

          {/* Payout Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-1">Amount</p>
              <p className="text-2xl font-bold text-gray-900">GHS {payout.amount.toFixed(2)}</p>
            </div>

            {/* Request ID */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-1">Request ID</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm text-gray-900 truncate">{payout.id}</p>
                <button
                  onClick={() => copyToClipboard(payout.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Copy"
                >
                  {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Payment Type */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-1">Payment Method</p>
              <div className="flex items-center gap-2">
                <span className="text-xl">{getPaymentIcon(payout.paymentType)}</span>
                <span className="text-sm font-medium text-gray-900">{payout.paymentType}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-1">Details</p>
              <p className="text-sm font-mono text-gray-900 break-all">{payout.paymentMethod}</p>
            </div>

            {/* Created Date */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-1">Requested On</p>
              <p className="text-sm font-medium text-gray-900">{createdDate.date}</p>
              <p className="text-xs text-gray-600">{createdDate.time}</p>
            </div>

            {/* Updated Date */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-1">Last Updated</p>
              <p className="text-sm font-medium text-gray-900">{updatedDate.date}</p>
              <p className="text-xs text-gray-600">{updatedDate.time}</p>
            </div>
          </div>

          {/* Paystack Reference */}
          {payout.paystackReference && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-medium text-blue-700 mb-2">Paystack Reference</p>
              <div className="flex items-center gap-2 bg-white p-2 rounded border border-blue-200">
                <code className="text-sm font-mono text-gray-900 flex-1 break-all">
                  {payout.paystackReference}
                </code>
                <button
                  onClick={() => copyToClipboard(payout.paystackReference!)}
                  className="p-1 hover:bg-blue-100 rounded flex-shrink-0"
                  title="Copy"
                >
                  {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {payout.errorMessage && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs font-medium text-red-700 mb-2">Error Details</p>
              <p className="text-sm text-red-600">{payout.errorMessage}</p>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              {/* Step 1: Created */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-chart-earnings rounded-full"></div>
                  <div className="w-0.5 h-8 bg-gray-300"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Payout Requested</p>
                  <p className="text-xs text-gray-600">{createdDate.date} at {createdDate.time}</p>
                </div>
              </div>

              {/* Step 2: Status changed */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${payout.status !== 'pending' ? 'bg-chart-earnings' : 'bg-gray-300'}`}></div>
                  <div className={`w-0.5 h-8 ${payout.status === 'completed' || payout.status === 'failed' ? 'bg-chart-earnings' : 'bg-gray-300'}`}></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Status Updated to {payout.status}</p>
                  <p className="text-xs text-gray-600">{updatedDate.date} at {updatedDate.time}</p>
                  {daysSince > 0 && (
                    <p className="text-xs text-gray-500 mt-1">({daysSince} {daysSince === 1 ? 'day' : 'days'} ago)</p>
                  )}
                </div>
              </div>

              {/* Step 3: Final status */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${payout.status === 'completed' || payout.status === 'failed' ? 'bg-chart-earnings' : 'bg-gray-300'}`}></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {payout.status === 'completed' && '✅ Payout Completed'}
                    {payout.status === 'failed' && '❌ Payout Failed'}
                    {payout.status === 'pending' && '⏳ Awaiting Processing'}
                    {payout.status === 'processing' && '⚙️ Processing'}
                  </p>
                  {(payout.status === 'completed' || payout.status === 'failed') && (
                    <p className="text-xs text-gray-600">Finalized {daysSince === 0 ? 'today' : `${daysSince} days ago`}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-700">
              <strong>ℹ️ Note:</strong> Payout processing may take 24-48 hours. Please check your payment method for confirmation.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-6 border-t border-gray-200 bg-white">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
