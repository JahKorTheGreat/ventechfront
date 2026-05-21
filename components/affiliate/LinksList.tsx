// Links List Component
// Display affiliate referral links in a table

'use client';

import { useState } from 'react';
import { ReferralLink } from '@/services/affiliateLinks.service';
import { Copy, Trash2, Eye, BarChart3, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import LinkAnalyticsModal from './LinkAnalyticsModal';
import LinkEditDialog from './LinkEditDialog';

interface LinksListProps {
  links: ReferralLink[];
  loading: boolean;
  onDelete: (linkId: string) => Promise<void>;
  onEdit: (linkId: string, name: string, source?: string) => Promise<void>;
  onCopy: (url: string) => Promise<boolean>;
}

export default function LinksList({ links, loading, onDelete, onEdit, onCopy }: LinksListProps) {
  const safeLinks = Array.isArray(links) ? links : [];
  const [selectedLinkForAnalytics, setSelectedLinkForAnalytics] = useState<ReferralLink | null>(null);
  const [selectedLinkForEdit, setSelectedLinkForEdit] = useState<ReferralLink | null>(null);
  const handleCopy = async (url: string) => {
    const success = await onCopy(url);
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
    <>
      <div className="bg-gray-50 rounded-lg shadow-md">
        {loading ? (
          <div className="p-8 text-center text-vt-text-secondary">Loading links...</div>
        ) : safeLinks.length === 0 ? (
          <div className="p-8 text-center text-vt-text-secondary">
            <p>No referral links yet</p>
            <p className="text-sm mt-2">Create your first link to start tracking referrals</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-vt-border-subtle bg-vt-bg-secondary">
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
                {safeLinks.map((link) => {
                  const linkData = link as any;
                  return (
                    <tr key={linkData.id} className="border-b border-vt-border-subtle hover:bg-vt-bg-secondary transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-vt-text-primary">{linkData.name}</p>
                          <p className="text-xs text-vt-text-secondary mt-1 truncate">{linkData.generated_url || linkData.url}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-vt-text-primary flex items-center space-x-2">
                          <span>{linkData.clicks}</span>
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-vt-text-primary">{linkData.conversions}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-green-600">${Number(linkData.earnings || 0).toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-vt-text-secondary">{Number((linkData.conversionRate ?? 0) * 100).toFixed(2)}%</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleCopy(linkData.generated_url || linkData.url || '')}
                            className="p-2 text-vt-text-secondary hover:text-vt-primary hover:bg-vt-bg-secondary rounded transition-colors"
                            title="Copy link"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedLinkForEdit(linkData)}
                            className="p-2 text-vt-text-secondary hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit link"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedLinkForAnalytics(linkData)}
                            className="p-2 text-vt-text-secondary hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View analytics"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(linkData.id)}
                            className="p-2 text-vt-text-secondary hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Delete link"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Analytics Modal */}
      {selectedLinkForAnalytics && (
        <LinkAnalyticsModal
          isOpen={!!selectedLinkForAnalytics}
          onClose={() => setSelectedLinkForAnalytics(null)}
          link={selectedLinkForAnalytics}
        />
      )}

      {/* Edit Dialog */}
      {selectedLinkForEdit && (
        <LinkEditDialog
          isOpen={!!selectedLinkForEdit}
          onClose={() => setSelectedLinkForEdit(null)}
          link={selectedLinkForEdit}
          onEdit={onEdit}
        />
      )}
    </>
  );
}
