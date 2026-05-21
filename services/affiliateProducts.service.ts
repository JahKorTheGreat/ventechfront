// Affiliate Products Service
// Handles affiliate campaigns and promotable products
// Enhanced with production-ready features: validation, timeouts, retries, caching

import { apiRequest, validators } from '@/lib/affiliateApiClient';

const API_BASE = '/products';
const CAMPAIGNS_BASE = '/campaigns';

export interface AffiliateProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  commissionRate: number;
  commission?: number;
  affiliate_link?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

type RawAffiliateProduct = Record<string, unknown>;

const normalizeRawProduct = (raw: RawAffiliateProduct): AffiliateProduct => {
  const priceValue = Number(raw.price ?? raw.amount ?? 0);
  const commissionRateValue = Number(raw.commissionRate ?? raw.commission_rate ?? raw.commissionPct ?? raw.commission_pct ?? 0);
  const commissionValue = Number(raw.commission ?? raw.commissionAmount ?? raw.commission_amount ?? 0);

  const imageValue = (raw.image ?? raw.image_url ?? raw.thumbnail ?? raw.thumbnail_url) as string | undefined;
  const linkValue = String(raw.affiliate_link ?? raw.affiliateLink ?? raw.link ?? raw.url ?? '');

  return {
    id: String(raw.id ?? raw.productId ?? raw.product_id ?? ''),
    name: String(raw.name ?? raw.title ?? 'Unnamed product'),
    description: String(raw.description ?? raw.short_description ?? ''),
    price: Number.isNaN(priceValue) ? 0 : priceValue,
    image: imageValue || '/placeholders/product.png',
    category: String(raw.category ?? raw.category_name ?? 'General'),
    commissionRate: Number.isNaN(commissionRateValue) ? 0 : commissionRateValue,
    commission: Number.isNaN(commissionValue) ? 0 : commissionValue,
    affiliate_link: linkValue || undefined,
    status: String(raw.status ?? 'active') as 'active' | 'inactive',
    createdAt: String(raw.createdAt ?? raw.created_at ?? ''),
  };
};

const normalizeProductResponse = (data: unknown): { products: AffiliateProduct[]; total: number } => {
  const payload =
    data && typeof data === 'object' && !Array.isArray(data)
      ? (data as Record<string, unknown>).data ?? (data as Record<string, unknown>).products ?? (data as Record<string, unknown>).result ?? data
      : data;

  const productsArray: unknown[] = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && !Array.isArray(payload)
      ? Array.isArray((payload as Record<string, unknown>).products)
        ? (payload as Record<string, unknown>).products as unknown[]
        : Array.isArray((payload as Record<string, unknown>).data)
          ? (payload as Record<string, unknown>).data as unknown[]
          : []
      : [];

  const normalizedProducts = productsArray
    .filter((item) => item && typeof item === 'object')
    .map((item) => normalizeRawProduct(item as RawAffiliateProduct));

  const totalValue = Number(
    data && typeof data === 'object' && !Array.isArray(data)
      ? ((data as Record<string, unknown>).total ??
        (data as Record<string, unknown>).count ??
        ((data as Record<string, unknown>).result && typeof (data as Record<string, unknown>).result === 'object'
          ? ((data as Record<string, unknown>).result as Record<string, unknown>).total ??
            ((data as Record<string, unknown>).result as Record<string, unknown>).count
          : undefined)
        ?? normalizedProducts.length)
      : normalizedProducts.length
  );

  return {
    products: normalizedProducts,
    total: Number.isNaN(totalValue) ? normalizedProducts.length : totalValue,
  };
};

export interface AffiliateCampaign {
  id: string;
  name: string;
  description: string;
  products: AffiliateProduct[];
  startDate: string;
  endDate: string;
  commissionBonus?: number;
  status: 'active' | 'inactive' | 'upcoming';
  imageUrl?: string;
}

export interface CampaignStats {
  campaignId: string;
  clicks: number;
  conversions: number;
  earnings: number;
  products: { productId: string; clicks: number; conversions: number; earnings: number }[];
}

export const affiliateProductsService = {
  /**
   * Get all promotable products
   */
  async getProducts(filters?: { category?: string; status?: string; page?: number; limit?: number }): Promise<{ products: AffiliateProduct[]; total: number }> {
    // Input validation
    if (filters) {
      const validationErrors = validators.validateObject(filters, {
        category: (value) => value ? validators.string(value, 'category') : null,
        status: (value) => value ? validators.oneOf(value, 'status', ['active', 'inactive']) : null,
        page: (value) => value ? validators.number(value, 'page', 1) : null,
        limit: (value) => value ? validators.number(value, 'limit', 1, 100) : null,
      });

      if (validationErrors.length > 0) {
        throw new Error(`Validation errors: ${validationErrors.map(e => e.message).join(', ')}`);
      }
    }

    try {
      const params: Record<string, string> = {};
      if (filters?.category) params.category = filters.category;
      if (filters?.status) params.status = filters.status;
      if (filters?.page) params.page = filters.page.toString();
      if (filters?.limit) params.limit = filters.limit.toString();

      const rawResponse = await apiRequest<unknown>({
        method: 'GET',
        url: API_BASE,
        params,
      });

      return normalizeProductResponse(rawResponse);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Get product details with commission info
   */
  async getProduct(productId: string): Promise<AffiliateProduct> {
    // Input validation
    const idError = validators.string(productId, 'productId', 1);
    if (idError) {
      throw new Error(idError.message);
    }

    try {
      return await apiRequest({
        method: 'GET',
        url: `${API_BASE}/${productId}`,
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  /**
   * Get active campaigns
   */
  async getCampaigns(status?: 'active' | 'inactive' | 'upcoming'): Promise<AffiliateCampaign[]> {
    // Input validation
    if (status) {
      const statusError = validators.oneOf(status, 'status', ['active', 'inactive', 'upcoming']);
      if (statusError) {
        throw new Error(statusError.message);
      }
    }

    try {
      const params: Record<string, string> = {};
      if (status) params.status = status;

      return await apiRequest({
        method: 'GET',
        url: CAMPAIGNS_BASE,
        params,
      });
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  },

  /**
   * Get campaign details
   */
  async getCampaign(campaignId: string): Promise<AffiliateCampaign> {
    // Input validation
    const idError = validators.string(campaignId, 'campaignId', 1);
    if (idError) {
      throw new Error(idError.message);
    }

    try {
      return await apiRequest({
        method: 'GET',
        url: `${CAMPAIGNS_BASE}/${campaignId}`,
      });
    } catch (error) {
      console.error('Error fetching campaign:', error);
      throw error;
    }
  },

  /**
   * Get campaign statistics
   */
  async getCampaignStats(campaignId: string): Promise<CampaignStats> {
    // Input validation
    const idError = validators.string(campaignId, 'campaignId', 1);
    if (idError) {
      throw new Error(idError.message);
    }

    try {
      return await apiRequest({
        method: 'GET',
        url: `${CAMPAIGNS_BASE}/${campaignId}/stats`,
      });
    } catch (error) {
      console.error('Error fetching campaign stats:', error);
      throw error;
    }
  },

  /**
   * Get popular products by earnings
   */
  async getTopProducts(limit: number = 10): Promise<{ productId: string; name: string; earnings: number; conversions: number }[]> {
    // Input validation
    const limitError = validators.number(limit, 'limit', 1, 50);
    if (limitError) {
      throw new Error(limitError.message);
    }

    try {
      return await apiRequest({
        method: 'GET',
        url: `${API_BASE}/top`,
        params: { limit: limit.toString() },
      });
    } catch (error) {
      console.error('Error fetching top products:', error);
      throw error;
    }
  },

  /**
   * Get product categories for filtering
   */
  async getCategories(): Promise<{ id: string; name: string; productCount: number }[]> {
    try {
      return await apiRequest({
        method: 'GET',
        url: `${API_BASE}/categories`,
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
};

export default affiliateProductsService;
