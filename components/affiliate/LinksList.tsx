// Links List Component
// Display affiliate referral links in a table

'use client';

import { ReferralLink } from '@/services/affiliateLinks.service';
import { Copy, Trash2, Eye, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

interface LinksListProps {
  links: ReferralLink[];
  loading: boolean;
  onDelete: (linkId: string) => Promise<void>;
  onCopy: (url: string) => boolean;
}

export default function LinksList({ links, loading, onDelete, onCopy }: LinksListProps) {
  const handleCopy = (url: string) => {
    const success = onCopy(url);
    if (success) {
      toast.success('Link copied to clipboard!');
    } else {
      toast.error('Failed to copy link');
    }
  };

  const handleDelete = async (linkId: string) => {
    if (confirm('Are you sure you want to delete this link?')) {
      try {
        await onDelete(linkId);
        toast.success('Link deleted successfully');
      } catch (error) {
        toast.error('Failed to delete link');
      }
    }
  };

  return (
    <div className="bg-vt-bg-primary rounded-lg border border-vt-border">
      {loading ? (
        <div className="p-8 text-center text-vt-text-secondary">Loading links...</div>
      ) : links.length === 0 ? (
        <div className="p-8 text-center text-vt-text-secondary">
          <p>No referral links yet</p>
          <p className="text-sm mt-2">Create your first link to start tracking referrals</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-vt-border bg-vt-bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-vt-text-primary">Link Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-vt-text-primary">Clicks</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-vt-text-primary">Conversions</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-vt-text-primary">Earnings</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-vt-text-primary">Conv. Rate</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-vt-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-b border-vt-border hover:bg-vt-bg-secondary transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-vt-text-primary">{link.name}</p>
                      <p className="text-xs text-vt-text-secondary mt-1 truncate">{link.url}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-vt-text-primary flex items-center space-x-2">
                      <span>{link.clicks}</span>
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-vt-text-primary">{link.conversions}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-green-600">${link.earnings.toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-vt-text-secondary">{(link.conversionRate * 100).toFixed(2)}%</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleCopy(link.url)}
                        className="p-2 text-vt-text-secondary hover:text-vt-primary hover:bg-vt-bg-secondary rounded transition-colors"
                        title="Copy link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-vt-text-secondary hover:text-vt-primary hover:bg-vt-bg-secondary rounded transition-colors"
                        title="View analytics"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="p-2 text-vt-text-secondary hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
