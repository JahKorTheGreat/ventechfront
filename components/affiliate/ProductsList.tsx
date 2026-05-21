// Products List Component
// Display promotable products in a grid with affiliate link generation

'use client';

import { useState } from 'react';
import { useAppSelector } from '@/store';
import { AffiliateProduct } from '@/services/affiliateProducts.service';
import { ExternalLink, Link, Zap } from 'lucide-react';
import affiliateLinksService from '@/services/affiliateLinks.service';
import GenerateLinkModal from './GenerateLinkModal';
import toast from 'react-hot-toast';

interface ProductsListProps {
  products: AffiliateProduct[];
  loading: boolean;
}

interface GenerateLinkState {
  productId: string | null;
  url: string;
  code?: string;
  error: string | null;
  loading: boolean;
  productName?: string;
}

export default function ProductsList({ products, loading }: ProductsListProps) {
  const safeProducts = Array.isArray(products) ? products : [];
  const { user } = useAppSelector((state) => state.auth);
  const [modalState, setModalState] = useState<GenerateLinkState>({
    productId: null,
    url: '',
    code: undefined,
    error: null,
    loading: false,
    productName: undefined
  });

  const handleGenerateLink = async (product: AffiliateProduct) => {
    const productId = String(product?.id || '').trim();

    if (!productId) {
      toast.error('Cannot generate affiliate link: invalid product selected');
      return;
    }

    if (!user?.id) {
      toast.error('You must be logged in to generate affiliate links');
      return;
    }

    setModalState({
      productId,
      url: '',
      code: undefined,
      error: null,
      loading: true,
      productName: product.name
    });

    try {
      const response = await affiliateLinksService.generateLink({
        productId,
        name: `${product.name || 'Affiliate Product'} - Affiliate Link`
      });

      console.log('🎯 Component received response:', {
        response,
        generatedUrl: response.generated_url || response.url,
        code: response.referral_code || response.code,
      });

      const finalUrl = response?.generated_url || response?.url || '';
      const finalCode = response?.referral_code || response?.code || '';

      console.log('🔐 Final modal state URL:', { finalUrl, isEmpty: !finalUrl });

      if (!finalUrl) {
        console.error('❌ ERROR: No URL in response!', response);
        toast.error('Link generated but URL is missing');
      }

      setModalState({
        productId: product.id,
        url: finalUrl,
        code: finalCode,
        error: null,
        loading: false,
        productName: product.name
      });
      toast.success('Affiliate link generated! 🎉');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to generate affiliate link';
      setModalState({
        productId: product.id,
        url: '',
        code: undefined,
        error: errorMessage,
        loading: false,
        productName: product.name
      });
      toast.error(errorMessage);
    }
  };

  const handleCloseModal = () => {
    setModalState({
      productId: null,
      url: '',
      code: undefined,
      error: null,
      loading: false,
      productName: undefined
    });
  };

  const handleRetry = () => {
    if (modalState.productId) {
      const product = safeProducts.find(p => p.id === modalState.productId);
      if (product) {
        handleGenerateLink(product);
      }
    }
  };

  const isModalOpen = modalState.productId !== null;

  return (
    <div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl shadow-md h-80 animate-pulse"
            />
          ))}
        </div>
      ) : safeProducts.length === 0 ? (
        <div className="bg-slate-50 rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Zap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">No products available to promote</p>
          <p className="text-slate-500 text-sm mt-2">Check back soon for promotable products</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeProducts.map((product) => (
            <div 
              key={product.id} 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group border border-slate-100"
            >
              {/* Product Image */}
              <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
                <img
                  src={product.image || '/placeholders/product.png'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Commission Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                  {product.commissionRate
                    ? `${(product.commissionRate * 100).toFixed(0)}%`
                    : product.commission
                      ? `$${product.commission.toFixed(2)}`
                      : '0%'}
                </div>
                {/* Popular badge */}
                <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Popular
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{product.category}</p>
                <h3 className="text-slate-900 font-bold mt-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{product.description}</p>

                {/* Price and Commission Info */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Price</p>
                      <p className="text-2xl font-bold text-slate-900">${product.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 mb-0.5">Your Commission</p>
                      <p className="text-xl font-bold text-green-600">
                        +${(product.commission ?? (product.price * (product.commissionRate || 0))).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleGenerateLink(product)}
                    disabled={modalState.productId === product.id && modalState.loading}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-orange-600 disabled:hover:to-orange-700 shadow-sm hover:shadow-md"
                  >
                    <Link className="w-4 h-4" />
                    <span>{modalState.productId === product.id && modalState.loading ? 'Generating...' : 'Generate Link'}</span>
                  </button>
                  <a
                    href={`/shop/product/${product.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-3 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:border-orange-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200 text-sm font-medium"
                    title="View product on store"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate Link Modal */}
      <GenerateLinkModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        url={modalState.url}
        code={modalState.code}
        loading={modalState.loading}
        error={modalState.error}
        productName={modalState.productName}
      />
    </div>
  );
}
