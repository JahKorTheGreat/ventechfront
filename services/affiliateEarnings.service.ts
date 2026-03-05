// Affiliate Earnings Service
// Handles commission tracking, earnings history, and earnings filters

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Earning {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  amount: number;
  commission: number;
  commissionRate: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  date: string;
  paidDate?: string;
}

export interface EarningsSummary {
  totalEarnings: number;
  totalCommissions: number;
  pendingCommissions: number;
  approvedCommissions: number;
  paidCommissions: number;
  rejectedCommissions: number;
  monthlyEarnings: number;
}

export interface EarningsFilter {
  status?: 'pending' | 'approved' | 'rejected' | 'paid' | 'all';
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export const affiliateEarningsService = {
  /**
   * Get earnings with optional filters
   */
  async getEarnings(filters?: EarningsFilter): Promise<{ earnings: Earning[]; total: number; page: number; limit: number }> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`${API_URL}/api/affiliate/earnings?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch earnings: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching earnings:', error);
      throw error;
    }
  },

  /**
   * Get earnings summary (totals by status)
   */
  async getEarningsSummary(): Promise<EarningsSummary> {
    try {
      const response = await fetch(`${API_URL}/api/affiliate/earnings/summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch earnings summary: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching earnings summary:', error);
      throw error;
    }
  },

  /**
   * Get monthly earnings breakdown
   */
  async getMonthlyEarnings(year?: number): Promise<{ month: string; earnings: number; commissions: number }[]> {
    try {
      const params = new URLSearchParams();
      if (year) params.append('year', year.toString());

      const response = await fetch(`${API_URL}/api/affiliate/earnings/monthly?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch monthly earnings: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching monthly earnings:', error);
      throw error;
    }
  },

  /**
   * Get earnings by commission tier
   */
  async getEarningsByTier(): Promise<{ tier: string; rate: number; totalEarnings: number; totalOrders: number }[]> {
    try {
      const response = await fetch(`${API_URL}/api/affiliate/earnings/by-tier`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch earnings by tier: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching earnings by tier:', error);
      throw error;
    }
  },

  /**
   * Export earnings as CSV
   */
  async exportEarnings(filters?: EarningsFilter): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('export', 'csv');
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`${API_URL}/api/affiliate/earnings/export?${params.toString()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to export earnings: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting earnings:', error);
      throw error;
    }
  },
};

export default affiliateEarningsService;
