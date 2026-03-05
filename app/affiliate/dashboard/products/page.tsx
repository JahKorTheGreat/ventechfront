// Affiliate Dashboard - Products & Campaigns Page
// Browse products and special campaigns to promote

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { useAffiliateProducts } from '@/hooks/useAffiliate';
import DashboardSidebar from '@/components/affiliate/DashboardSidebar';
import DashboardHeader from '@/components/affiliate/DashboardHeader';
import ProductsList from '@/components/affiliate/ProductsList';
import CampaignsList from '@/components/affiliate/CampaignsList';

export default function ProductsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { products, campaigns, loading } = useAffiliateProducts();
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-vt-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-vt-bg-secondary">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={user} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-vt-text-primary">Products & Campaigns</h1>
              <p className="text-vt-text-secondary mt-2">Browse and promote our products and special campaigns</p>
            </div>

            {/* Tabs */}
            <div className="mb-8 border-b border-vt-border">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`pb-4 px-2 font-medium transition-colors ${
                    activeTab === 'products'
                      ? 'text-vt-primary border-b-2 border-vt-primary'
                      : 'text-vt-text-secondary hover:text-vt-text-primary'
                  }`}
                >
                  All Products
                </button>
                <button
                  onClick={() => setActiveTab('campaigns')}
                  className={`pb-4 px-2 font-medium transition-colors ${
                    activeTab === 'campaigns'
                      ? 'text-vt-primary border-b-2 border-vt-primary'
                      : 'text-vt-text-secondary hover:text-vt-text-primary'
                  }`}
                >
                  Active Campaigns
                </button>
              </div>
            </div>

            {/* Content */}
            {activeTab === 'products' ? (
              <ProductsList products={products} loading={loading} />
            ) : (
              <CampaignsList campaigns={campaigns} loading={loading} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
