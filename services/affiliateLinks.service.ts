// Affiliate Links Service
// Handles referral link creation, management, and tracking

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ReferralLink {
  id: string;
  code: string;
  name: string;
  url: string;
  source?: string;
  clicks: number;
  conversions: number;
  earnings: number;
  conversionRate: number;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface LinkStats {
  linkId: string;
  clicks: number;
  conversions: number;
  earnings: number;
  conversionRate: number;
}

export const affiliateLinksService = {
  /**
   * Get all referral links for authenticated affiliate
   */
  async getLinks(): Promise<ReferralLink[]> {
    try {
      const response = await fetch(`${API_URL}/api/affiliate/links`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch links: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching links:', error);
      throw error;
    }
  },

  /**
   * Create a new referral link
   */
  async createLink(data: { name: string; source?: string }): Promise<ReferralLink> {
    try {
      const response = await fetch(`${API_URL}/api/affiliate/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to create link: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating link:', error);
      throw error;
    }
  },

  /**
   * Update a referral link
   */
  async updateLink(linkId: string, data: { name?: string; source?: string; status?: 'active' | 'inactive' }): Promise<ReferralLink> {
    try {
      const response = await fetch(`${API_URL}/api/affiliate/links/${linkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update link: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error updating link:', error);
      throw error;
    }
  },

  /**
   * Delete a referral link
   */
  async deleteLink(linkId: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/affiliate/links/${linkId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete link: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting link:', error);
      throw error;
    }
  },

  /**
   * Get detailed statistics for a specific link
   */
  async getLinkStats(linkId: string): Promise<LinkStats> {
    try {
      const response = await fetch(`${API_URL}/api/affiliate/links/${linkId}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch link stats: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching link stats:', error);
      throw error;
    }
  },

  /**
   * Bulk copy links to clipboard with custom text
   */
  copyLinkToClipboard(url: string): boolean {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(url);
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
