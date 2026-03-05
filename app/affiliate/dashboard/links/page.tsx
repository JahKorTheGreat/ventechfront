// Affiliate Dashboard - Referral Links Page
// Manage and track referral links

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { useAffiliateLinks } from '@/hooks/useAffiliate';
import DashboardSidebar from '@/components/affiliate/DashboardSidebar';
import DashboardHeader from '@/components/affiliate/DashboardHeader';
import LinksList from '@/components/affiliate/LinksList';
import CreateLinkDialog from '@/components/affiliate/CreateLinkDialog';

export default function LinksPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { links, loading, createNewLink, removeLink, copyLinkToClipboard } = useAffiliateLinks();
  const [mounted, setMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, mounted, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-vt-text-secondary">Loading...</div>
      </div>
    );
  }

  const handleCreateLink = async (linkName: string, source?: string) => {
    const success = await createNewLink({ name: linkName, source });
    if (success) {
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-vt-bg-secondary">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={user} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-vt-text-primary">Referral Links</h1>
                <p className="text-vt-text-secondary mt-2">Create and manage your affiliate referral links</p>
              </div>
              <button
                onClick={() => setIsDialogOpen(true)}
                className="px-4 py-2 bg-vt-primary text-white rounded-lg hover:bg-vt-primary-dark transition-colors"
              >
                Create New Link
              </button>
            </div>

            {/* Links List */}
            <LinksList links={links} loading={loading} onDelete={removeLink} onCopy={copyLinkToClipboard} />
          </div>
        </main>
      </div>

      {/* Create Link Dialog */}
      <CreateLinkDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} onCreate={handleCreateLink} />
    </div>
  );
}
