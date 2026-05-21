// Copy Button Component
// Reusable component for copying text to clipboard

'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface CopyButtonProps {
  text: string;
  successMessage?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function CopyButton({
  text,
  successMessage = 'Copied to clipboard!',
  className = '',
  size = 'md'
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (!text || !text.trim()) {
        toast.error('No text available to copy');
        return;
      }
      if (!navigator?.clipboard?.writeText) {
        toast.error('Clipboard is not available');
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(successMessage);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center justify-center rounded-lg border border-vt-border hover:bg-vt-bg-secondary transition-colors ${sizeClasses[size]} ${className}`}
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className={`${iconSizeClasses[size]} text-green-600`} />
      ) : (
        <Copy className={`${iconSizeClasses[size]} text-vt-text-secondary`} />
      )}
    </button>
  );
}