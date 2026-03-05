// Affiliate Products Service
// Handles affiliate campaigns and promotable products

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface AffiliateProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  commissionRate: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

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
    try {
      const params = new URLSearchParams();
      
      if (filters?.category) params.append('category', filters.category);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`${API_URL}/api/affiliate/products?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Get product details with commission info
   */
  async getProduct(productId: string): Promise<AffiliateProduct> {
    try {
      const response = await fetch(`${API_URL}/api/affiliate/products/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  /**
   * Get active campaigns
   */
  async getCampaigns(status?: 'active' | 'inactive' | 'upcoming'): Promise<AffiliateCampaign[]> {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);

      const response = await fetch(`${API_URL}/api/affiliate/campaigns?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch campaigns: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  },

  /**
   * Get campaign details
   */
  async getCampaign(campaignId: string): Promise<AffiliateCampaign> {
    try {
      const response = await fetch(`${API_URL}/api/affiliate/campaigns/${campaignId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch campaign: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      throw error;
    }
  },

  /**
   * Get campaign statistics
   */
  async getCampaignStats(campaignId: string): Promise<CampaignStats> {
    try {
      const response = await fetch(`${API_URL}/api/affiliate/campaigns/${campaignId}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch campaign stats: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching campaign stats:', error);
      throw error;
    }
  },

  /**
   * Get popular products by earnings
   */
  async getTopProducts(limit: number = 10): Promise<{ productId: string; name: string; earnings: number; conversions: number }[]> {
    try {
      const response = await fetch(`${API_URL}/api/affiliate/products/top?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch top products: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
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
      const response = await fetch(`${API_URL}/api/affiliate/products/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
};

export default affiliateProductsService;
