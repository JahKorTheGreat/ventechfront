// Link Edit Dialog Component
// Modal for editing existing referral links

'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ReferralLink } from '@/services/affiliateLinks.service';
import toast from 'react-hot-toast';

interface LinkEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  link: ReferralLink | null;
  onEdit: (linkId: string, name: string, source?: string) => Promise<void>;
}

export default function LinkEditDialog({ isOpen, onClose, link, onEdit }: LinkEditDialogProps) {
  const [linkName, setLinkName] = useState('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (link) {
      setLinkName(link.name);
      setSource(link.source || '');
    }
  }, [link, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!linkName.trim()) {
      toast.error('Please enter a link name');
      return;
    }

    if (!link) return;

    setLoading(true);
    try {
      await onEdit(link.id, linkName, source || undefined);
      toast.success('Link updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update link');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !link) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Edit Link</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="linkName" className="block text-sm font-medium text-gray-700 mb-2">
              Link Name <span className="text-red-500">*</span>
            </label>
            <input
              id="linkName"
              type="text"
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              placeholder="e.g., Facebook Campaign, Instagram Promo"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Give your link a memorable name for tracking</p>
          </div>

          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
              Traffic Source (Optional)
            </label>
            <select
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              disabled={loading}
            >
              <option value="">Select a source</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="twitter">Twitter/X</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
              <option value="youtube">YouTube</option>
              <option value="email">Email</option>
              <option value="other">Other</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Where will you be promoting this link?</p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <span className="font-semibold">Link Code:</span> {link.code}
            </p>
            <p className="text-xs text-blue-700 mt-1">Note: The link code cannot be changed</p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
