// Generate Link Modal Component
// Modal for displaying generated affiliate links with copy and share options

'use client';

import { useRef, useEffect } from 'react';
import { ExternalLink, Check, AlertCircle, Loader } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import CopyButton from '@/components/ui/CopyButton';
import toast from 'react-hot-toast';

interface GenerateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  code?: string;
  loading: boolean;
  error: string | null;
  productName?: string;
}

export default function GenerateLinkModal({
  isOpen,
  onClose,
  url,
  code,
  loading,
  error,
  productName
}: GenerateLinkModalProps) {
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Debug logging for modal props
  useEffect(() => {
    if (isOpen && url) {
      console.log('✨ Modal opened with URL:', { url, length: url.length, isValid: url.trim().length > 0 });
    } else if (isOpen && !url) {
      console.warn('⚠️ Modal opened but URL is empty!', { url, isOpen });
    }
  }, [isOpen, url]);

  const handleOpenLink = () => {
    console.log('Preview button clicked:', { url, isEmpty: !url, isTrimEmpty: !url?.trim() });
    if (url && url.trim()) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('No link available to preview');
    }
  };

  const handleSelectText = () => {
    if (urlInputRef.current) {
      urlInputRef.current.select();
    }
  };

  const handleCopyAndClose = async () => {
    console.log('Copy & Close clicked:', { url, isEmpty: !url });
    if (!url || !url.trim()) {
      toast.error('No URL to copy');
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied! Closing...');
      setTimeout(onClose, 1000);
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy');
    }
  };

  // Loading state
  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Generating Your Affiliate Link" size="md" showCloseButton={false}>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-4">
            <Loader className="w-8 h-8 animate-spin text-orange-600" />
          </div>
          <p className="text-center text-slate-700 font-medium">Creating your unique affiliate link...</p>
          <p className="text-center text-slate-500 text-sm mt-2">This usually takes a moment</p>
        </div>
      </Modal>
    );
  }

  // Error state
  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Error Generating Link" size="md">
        <div className="py-6">
          <div className="flex items-start space-x-4 mb-6">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Failed to generate affiliate link</h3>
              <p className="text-sm text-slate-600">{error}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                // Parent component should retry
              }}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // Success state
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Affiliate Link Ready!" size="lg">
      <div className="py-6">
        {/* Success banner */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Link generated successfully!</p>
              <p className="text-sm text-green-700 mt-1">Share this link to start earning commissions</p>
            </div>
          </div>
        </div>

        {/* Product name if provided */}
        {productName && (
          <div className="mb-4">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">Product</p>
            <p className="text-slate-900 font-medium">{productName}</p>
          </div>
        )}

        {/* Link URL section */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Your Affiliate Link
          </label>
          {url && url.trim() ? (
            <div className="flex items-center space-x-2">
              <input
                ref={urlInputRef}
                type="text"
                value={url}
                readOnly
                onClick={handleSelectText}
                className="flex-1 px-3 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-text"
              />
              <CopyButton
                text={url}
                successMessage="Link copied to clipboard!"
                size="md"
              />
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-3 py-3 border border-slate-300 rounded-lg bg-slate-100 text-slate-500">
              <span className="text-sm">URL not yet generated...</span>
            </div>
          )}
          <p className="text-xs text-slate-500 mt-2">Click the input to select, or use the copy button</p>
        </div>

        {/* Link code section */}
        {code && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Link Code
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={code}
                readOnly
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-mono text-sm"
              />
              <CopyButton
                text={code}
                successMessage="Code copied!"
                size="md"
              />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleOpenLink}
            disabled={!url || !url.trim()}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-600"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Preview Link</span>
          </button>
          <button
            onClick={handleCopyAndClose}
            className="flex-1 px-4 py-3 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-medium"
          >
            Copy & Close
          </button>
        </div>

        {/* Info section */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Tips for sharing your link:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Share on social media for better reach</li>
            <li>• Include the product benefits in your post</li>
            <li>• Track clicks and conversions in your dashboard</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}