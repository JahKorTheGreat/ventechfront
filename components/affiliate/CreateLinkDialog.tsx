// Create Link Dialog Component
// Modal for creating new referral links

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (linkName: string, source?: string) => Promise<void>;
}

export default function CreateLinkDialog({ isOpen, onClose, onCreate }: CreateLinkDialogProps) {
  const [linkName, setLinkName] = useState('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!linkName.trim()) {
      toast.error('Please enter a link name');
      return;
    }

    setLoading(true);
    try {
      await onCreate(linkName, source || undefined);
      toast.success('Link created successfully');
      setLinkName('');
      setSource('');
    } catch (error) {
      toast.error('Failed to create link');
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
          <h2 className="text-xl font-bold text-gray-900">Create New Link</h2>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vt-primary focus:border-transparent outline-none"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vt-primary focus:border-transparent outline-none"
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
              disabled={loading}
              className="flex-1 px-4 py-2 bg-vt-primary text-white rounded-lg hover:bg-vt-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
