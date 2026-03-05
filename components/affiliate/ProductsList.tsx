// Products List Component
// Display promotable products in a grid

'use client';

import { AffiliateProduct } from '@/services/affiliateProducts.service';
import { ExternalLink, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductsListProps {
  products: AffiliateProduct[];
  loading: boolean;
}

export default function ProductsList({ products, loading }: ProductsListProps) {
  const handleCopyLink = (productId: string) => {
    const affiliateLink = `${window.location.origin}?aff=${productId}`;
    navigator.clipboard.writeText(affiliateLink);
    toast.success('Product link copied!');
  };

  return (
    <div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-vt-bg-primary rounded-lg border border-vt-border h-80 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-vt-bg-primary rounded-lg border border-vt-border p-12 text-center">
          <p className="text-vt-text-secondary">No products available to promote</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-vt-bg-primary rounded-lg border border-vt-border overflow-hidden hover:border-vt-primary transition-colors group">
              {/* Product Image */}
              <div className="relative w-full h-40 bg-vt-bg-secondary overflow-hidden">
                <img
                  src={product.image || '/placeholders/product.png'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute top-3 right-3 bg-vt-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {(product.commissionRate * 100).toFixed(0)}%
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <p className="text-xs text-vt-text-secondary uppercase font-semibold">{product.category}</p>
                <h3 className="text-vt-text-primary font-bold mt-2 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-vt-text-secondary mt-2 line-clamp-2">{product.description}</p>

                {/* Price and Commission */}
                <div className="mt-4 pt-4 border-t border-vt-border">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-2xl font-bold text-vt-text-primary">${product.price.toFixed(2)}</p>
                    <p className="text-sm text-green-600">
                      +${(product.price * product.commissionRate).toFixed(2)} per sale
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleCopyLink(product.id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-vt-primary text-white rounded-lg hover:bg-vt-primary-dark transition-colors text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </button>
                  <a
                    href={`/shop/product/${product.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 border border-vt-primary text-vt-primary rounded-lg hover:bg-vt-primary hover:text-white transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
