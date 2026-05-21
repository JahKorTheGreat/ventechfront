// Affiliate Dashboard - Referral Links Page
// Manage and track referral links with comprehensive analytics

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { useAffiliateLinks } from '@/hooks/useAffiliate';
import affiliateLinksService from '@/services/affiliateLinks.service';
import DashboardSidebar from '@/components/affiliate/DashboardSidebar';
import DashboardHeader from '@/components/affiliate/DashboardHeader';
import LinksList from '@/components/affiliate/LinksList';
import CreateLinkDialog from '@/components/affiliate/CreateLinkDialog';
import { Link, TrendingUp, Eye, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LinksPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { links, loading, createNewLink, removeLink } = useAffiliateLinks();
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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-slate-600 font-medium">Loading...</div>
      </div>
    );
  }

  const handleCreateLink = async (linkName: string, source?: string) => {
    const success = await createNewLink({ name: linkName, source });
    if (success) {
      setIsDialogOpen(false);
      toast.success('Link created successfully!');
    }
  };

  const handleEditLink = async (linkId: string, name: string, source?: string) => {
    try {
      await affiliateLinksService.updateLink(linkId, { name, source });
      toast.success('Link updated successfully!');
      // The state should be updated by Redux
    } catch (error) {
      toast.error('Failed to update link');
      throw error;
    }
  };

  const handleCopyLink = async (url: string) => {
    if (!url || !url.trim()) {
      return false;
    }

    return await affiliateLinksService.copyLinkToClipboard(url);
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      await removeLink(linkId);
      toast.success('Link deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete link');
      throw error;
    }
  };

  // Calculate totals
  const safeLinks = Array.isArray(links) ? links : [];
  const totals = {
    links: safeLinks.length,
    clicks: safeLinks.reduce((sum, link) => sum + (link.clicks || 0), 0),
    conversions: safeLinks.reduce((sum, link) => sum + (link.conversions || 0), 0),
    earnings: safeLinks.reduce((sum, link) => sum + (link.earnings || 0), 0),
  };

  const avgConversionRate = totals.clicks > 0 
    ? ((totals.conversions / totals.clicks) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />

      <div className="flex min-h-[calc(100vh-4rem)] overflow-hidden">
        <DashboardSidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                    <Link className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">Affiliate Links</p>
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Your Generated Links</h1>
                  </div>
                </div>
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-orange-700 transition-all duration-200"
                >
                  <Link className="w-4 h-4 mr-2" />
                  Create New Link
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Links"
                value={totals.links}
                icon={<Link className="w-5 h-5" />}
                color="blue"
              />
              <StatsCard
                title="Total Clicks"
                value={totals.clicks.toLocaleString()}
                icon={<Eye className="w-5 h-5" />}
                color="purple"
              />
              <StatsCard
                title="Conversions"
                value={totals.conversions}
                subtext={`${avgConversionRate}% rate`}
                icon={<TrendingUp className="w-5 h-5" />}
                color="green"
              />
              <StatsCard
                title="Total Earnings"
                value={`$${totals.earnings.toFixed(2)}`}
                icon={<Activity className="w-5 h-5" />}
                color="orange"
              />
            </div>

            {/* Links List */}
            <div className="animate-fade-in">
              <LinksList 
                links={safeLinks} 
                loading={loading.links || false} 
                onDelete={handleDeleteLink} 
                onEdit={handleEditLink} 
                onCopy={handleCopyLink}
              />
            </div>

            {/* Empty State */}
            {!loading.links && safeLinks.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                <Link className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No links yet</h3>
                <p className="text-slate-600 mb-6">Create your first referral link to start tracking clicks and conversions</p>
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  <Link className="w-4 h-4" />
                  <span>Create First Link</span>
                </button>
              </div>
            )}

            {/* Tips Section */}
            {safeLinks.length > 0 && (
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
                  <h3 className="font-semibold text-blue-900 mb-3">📊 Link Performance Tips</h3>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li>✓ Share links on multiple platforms for better reach</li>
                    <li>✓ Personalize your message when sharing links</li>
                    <li>✓ Include product benefits in your posts</li>
                    <li>✓ Track which channels perform best</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-green-200 bg-green-50 p-6">
                  <h3 className="font-semibold text-green-900 mb-3">💡 Maximize Your Earnings</h3>
                  <ul className="text-sm text-green-800 space-y-2">
                    <li>✓ High-ticket items earn more per conversion</li>
                    <li>✓ Focus on products you genuinely recommend</li>
                    <li>✓ Use unique links to track different campaigns</li>
                    <li>✓ Monitor conversion rates and adjust strategy</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Link Dialog */}
      <CreateLinkDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onCreate={handleCreateLink} 
      />
    </div>
  );
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  color: 'blue' | 'purple' | 'green' | 'orange';
}

function StatsCard({ title, value, subtext, icon, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
  };

  const iconBgClasses = {
    blue: 'bg-blue-100',
    purple: 'bg-purple-100',
    green: 'bg-green-100',
    orange: 'bg-orange-100',
  };

  return (
    <div className={`rounded-xl border ${colorClasses[color]} p-6 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>
        <div className={`${iconBgClasses[color]} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
