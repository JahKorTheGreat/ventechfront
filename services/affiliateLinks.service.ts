// Affiliate Links Service
// Handles referral link creation, management, and tracking
// Enhanced with production-ready features: validation, timeouts, retries, caching, and authentication

import { apiRequest, validators } from '@/lib/affiliateApiClient';

const API_BASE = '/links';

export interface ReferralLink {
  id: string;
  productId: string;
  code: string;
  link: string;
  clicks: number;
  conversions: number;
  earnings: number;
}

export interface LinksResponse {
  links: ReferralLink[];
}

export interface LinkStats {
  linkId: string;
  clicks: number;
  conversions: number;
  earnings: number;
  conversionRate: number;
}

export interface GeneratedLink {
  generated_url?: string;
  url?: string;
  referral_code?: string;
  code?: string;
  id?: string;
  createdAt?: string;
}

export const affiliateLinksService = {
  /**
   * Get all referral links for authenticated affiliate
   * GET /api/affiliate/links
   */
  async getLinks(): Promise<LinksResponse> {
    try {
      return await apiRequest<LinksResponse>({
        method: 'GET',
        url: API_BASE,
      });
    } catch (error) {
      console.error('Error fetching links:', error);
      throw error;
    }
  },

  /**
   * Create a new referral link
   */
  async createLink(data: { name: string; source?: string }): Promise<ReferralLink> {
    // Input validation
    const validationErrors = validators.validateObject(data, {
      name: (value) => validators.required(value, 'name') || validators.string(value, 'name', 1, 100),
      source: (value) => value ? validators.string(value, 'source', 1, 50) : null,
    });

    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.map(e => e.message).join(', ')}`);
    }

    try {
      return await apiRequest({
        method: 'POST',
        url: API_BASE,
        data,
      });
    } catch (error) {
      console.error('Error creating link:', error);
      throw error;
    }
  },

  /**
   * Generate an affiliate link for a specific product
   * POST /api/affiliate/links/generate
   * Authorization: Bearer token or session cookie (automatically included)
   */
  async generateLink(data: { productId: string; name?: string }): Promise<GeneratedLink> {
    // Input validation
    const validationErrors = validators.validateObject(data, {
      productId: (value) => validators.required(value, 'productId') || validators.string(value, 'productId', 1, 100),
      name: (value) => value ? validators.string(value, 'name', 1, 100) : null,
    });

    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.map(e => e.message).join(', ')}`);
    }

    try {
      const response = await apiRequest<{
        success: boolean;
        data?: { generated_url: string; url: string; referral_code: string; code: string; id?: string; createdAt?: string };
        message?: string;
      }>({
        method: 'POST',
        url: '/links/generate',
        data: {
          productId: data.productId,
          name: data.name,
        },
        skipCache: true,
      });

      console.log('🔍 Raw API response from generateLink:', response);

      if (!response || !response.success || !response.data) {
        throw new Error(response?.message || 'Failed to generate link');
      }

      const payload = response.data;
      const result: GeneratedLink = {
        generated_url: payload.generated_url || payload.url || '',
        url: payload.url || payload.generated_url || '',
        code: payload.code || payload.referral_code || '',
        referral_code: payload.referral_code || payload.code || '',
        id: payload.id || '',
        createdAt: payload.createdAt || new Date().toISOString(),
      };

      console.log('📤 Final service response:', result);

      return result;
    } catch (error) {
      console.error('Error generating link:', error);
      throw error;
    }
  },

  /**
   * Update a referral link
   */
  async updateLink(linkId: string, data: { name?: string; source?: string; status?: 'active' | 'inactive' }): Promise<ReferralLink> {
    // Input validation
    const validationErrors = validators.validateObject({ linkId, ...data }, {
      linkId: (value) => validators.required(value, 'linkId') || validators.string(value, 'linkId', 1, 50),
      name: (value) => value ? validators.string(value, 'name', 1, 100) : null,
      source: (value) => value ? validators.string(value, 'source', 1, 50) : null,
      status: (value) => value ? validators.oneOf(value, 'status', ['active', 'inactive']) : null,
    });

    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.map(e => e.message).join(', ')}`);
    }

    try {
      return await apiRequest({
        method: 'PUT',
        url: `${API_BASE}/${linkId}`,
        data,
        skipCache: true, // Skip cache for updates
      });
    } catch (error) {
      console.error('Error updating link:', error);
      throw error;
    }
  },

  /**
   * Delete a referral link
   */
  async deleteLink(linkId: string): Promise<void> {
    // Input validation
    const linkIdError = validators.required(linkId, 'linkId') || validators.string(linkId, 'linkId', 1, 50);
    if (linkIdError) {
      throw new Error(linkIdError.message);
    }

    try {
      await apiRequest({
        method: 'DELETE',
        url: `${API_BASE}/${linkId}`,
        skipCache: true,
      });
    } catch (error) {
      console.error('Error deleting link:', error);
      throw error;
    }
  },

  /**
   * Get detailed statistics for a specific link
   */
  async getLinkStats(linkId: string): Promise<LinkStats> {
    // Input validation
    const linkIdError = validators.required(linkId, 'linkId') || validators.string(linkId, 'linkId', 1, 50);
    if (linkIdError) {
      throw new Error(linkIdError.message);
    }

    try {
      return await apiRequest({
        method: 'GET',
        url: `${API_BASE}/${linkId}/stats`,
      });
    } catch (error) {
      console.error('Error fetching link stats:', error);
      throw error;
    }
  },

  /**
   * Bulk copy links to clipboard with custom text
   */
  async copyLinkToClipboard(link: string | { generated_url?: string; url?: string }): Promise<boolean> {
    try {
      const url = typeof link === 'string' ? link : (link.generated_url || link.url || '');
      if (!url || !url.trim()) {
        return false;
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(url);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error copying link:', error);
      return false;
    }
  },
};

export default affiliateLinksService;
