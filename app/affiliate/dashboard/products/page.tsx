// Affiliate Dashboard - Products & Campaigns Page
// Browse products and special campaigns to promote with link generation

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { useAffiliateProducts } from '@/hooks/useAffiliate';
import DashboardSidebar from '@/components/affiliate/DashboardSidebar';
import DashboardHeader from '@/components/affiliate/DashboardHeader';
import ProductsList from '@/components/affiliate/ProductsList';
import CampaignsList from '@/components/affiliate/CampaignsList';
import { Package, TrendingUp } from 'lucide-react';

export default function ProductsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { products, campaigns, loadingProducts, loadingCampaigns } = useAffiliateProducts();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'campaigns'>('products');

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

  const safeProducts = Array.isArray(products) ? products : [];
  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />

      <div className="flex min-h-[calc(100vh-4rem)] overflow-hidden">
        <DashboardSidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">Products</p>
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Browse & Promote</h1>
                  </div>
                </div>
                <p className="text-slate-600 max-w-3xl">Find products to promote and generate unique affiliate links. Click "Generate Link" on any product to create your unique referral URL.</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-8">
              <div className="flex space-x-1 border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`flex items-center space-x-2 px-4 py-3 font-medium border-b-2 transition-all ${
                    activeTab === 'products'
                      ? 'border-orange-600 text-orange-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>All Products ({safeProducts.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('campaigns')}
                  className={`flex items-center space-x-2 px-4 py-3 font-medium border-b-2 transition-all ${
                    activeTab === 'campaigns'
                      ? 'border-orange-600 text-orange-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Active Campaigns ({safeCampaigns.length})</span>
                </button>
              </div>
            </div>

            {/* Info Banner */}
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-900">
                <span className="font-semibold">💡 Pro Tip:</span> Generate unique links for different platforms to track which channels drive the most conversions. Visit your <a href="/affiliate/dashboard/links" className="underline hover:no-underline text-amber-700 font-medium">Links Dashboard</a> to see detailed analytics.
              </p>
            </div>

            {/* Content */}
            <div className="animate-fade-in">
              {activeTab === 'products' ? (
                <ProductsList products={safeProducts} loading={loadingProducts} />
              ) : (
                <CampaignsList campaigns={safeCampaigns} loading={loadingCampaigns} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
