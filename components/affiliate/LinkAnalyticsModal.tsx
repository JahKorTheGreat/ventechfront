// Link Analytics Modal Component
// Display detailed analytics for a specific referral link

'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { affiliateLinksService, LinkStats, ReferralLink } from '@/services/affiliateLinks.service';
import toast from 'react-hot-toast';

interface LinkAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: ReferralLink;
}

export default function LinkAnalyticsModal({ isOpen, onClose, link }: LinkAnalyticsModalProps) {
  const [stats, setStats] = useState<LinkStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && link) {
      fetchStats();
    }
  }, [isOpen, link]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await affiliateLinksService.getLinkStats(link.id);
      setStats(data);
    } catch (err) {
      console.error('Error fetching link stats:', err);
      setError('Failed to load analytics');
      toast.error('Failed to load link analytics');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const displayStats = stats || link;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{link.name}</h2>
            <p className="text-sm text-gray-500 mt-1 truncate">{link.url}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 mt-3">Loading analytics...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchStats}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Clicks */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-600">{displayStats.clicks}</div>
                  <p className="text-sm text-gray-600 mt-1">Total Clicks</p>
                </div>

                {/* Conversions */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-600">{displayStats.conversions}</div>
                  <p className="text-sm text-gray-600 mt-1">Conversions</p>
                </div>

                {/* Earnings */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple-600">${displayStats.earnings.toFixed(2)}</div>
                  <p className="text-sm text-gray-600 mt-1">Total Earnings</p>
                </div>

                {/* Conversion Rate */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-orange-600">{(displayStats.conversionRate * 100).toFixed(2)}%</div>
                  <p className="text-sm text-gray-600 mt-1">Conv. Rate</p>
                </div>
              </div>

              {/* Link Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">Link Details</h3>
                <div>
                  <label className="text-xs font-medium text-gray-600">Link Code</label>
                  <p className="text-sm text-gray-900 font-mono mt-1">{link.code}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      link.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-200 text-gray-800'
                    }`}>
                      {link.status.charAt(0).toUpperCase() + link.status.slice(1)}
                    </span>
                  </div>
                </div>
                {link.source && (
                  <div>
                    <label className="text-xs font-medium text-gray-600">Traffic Source</label>
                    <p className="text-sm text-gray-900 mt-1">{link.source}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-gray-600">Created</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(link.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">Performance Metrics</h3>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Avg Earnings per Click</span>
                  <span className="font-semibold text-gray-900">
                    ${displayStats.clicks > 0 ? (displayStats.earnings / displayStats.clicks).toFixed(3) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Avg Earnings per Conversion</span>
                  <span className="font-semibold text-gray-900">
                    ${displayStats.conversions > 0 ? (displayStats.earnings / displayStats.conversions).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Click-to-Conversion Ratio</span>
                  <span className="font-semibold text-gray-900">
                    1:{displayStats.clicks > 0 ? Math.round(displayStats.clicks / (displayStats.conversions || 1)) : 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
