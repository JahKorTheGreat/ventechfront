// Affiliate Earnings Service
// Handles commission tracking, earnings history, and earnings filters
// Enhanced with production-ready features: validation, timeouts, retries, caching

import { apiRequest, validators } from '@/lib/affiliateApiClient';

const API_BASE = '/earnings';

export interface Earning {
  id: string;
  amount: number;
  date: string;
  status: string;
  productName?: string;
  orderId?: string;
  commission?: number;
}

export interface EarningsResponse {
  earnings: Earning[];
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
   * Get earnings
   * GET /api/affiliate/earnings
   */
  async getEarnings(): Promise<EarningsResponse> {
    try {
      return await apiRequest<EarningsResponse>({
        method: 'GET',
        url: API_BASE,
      });
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
      return await apiRequest({
        method: 'GET',
        url: `${API_BASE}/summary`,
      });
    } catch (error) {
      console.error('Error fetching earnings summary:', error);
      throw error;
    }
  },

  /**
   * Get monthly earnings breakdown
   */
  async getMonthlyEarnings(year?: number): Promise<{ month: string; earnings: number; commissions: number }[]> {
    // Input validation
    if (year) {
      const yearError = validators.number(year, 'year', 2000, new Date().getFullYear() + 10);
      if (yearError) {
        throw new Error(yearError.message);
      }
    }

    try {
      return await apiRequest({
        method: 'GET',
        url: `${API_BASE}/monthly`,
        params: year ? { year: year.toString() } : undefined,
      });
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
      return await apiRequest({
        method: 'GET',
        url: `${API_BASE}/by-tier`,
      });
    } catch (error) {
      console.error('Error fetching earnings by tier:', error);
      throw error;
    }
  },

  /**
   * Export earnings as CSV
   */
  async exportEarnings(filters?: EarningsFilter): Promise<Blob> {
    if (filters) {
      const validationErrors = validators.validateObject(filters, {
        status: (value) => value ? validators.oneOf(value, 'status', ['pending', 'approved', 'rejected', 'paid', 'all']) : null,
        startDate: (value) => value ? validators.string(value, 'startDate') : null,
        endDate: (value) => value ? validators.string(value, 'endDate') : null,
      });

      if (validationErrors.length > 0) {
        throw new Error(`Validation errors: ${validationErrors.map(e => e.message).join(', ')}`);
      }
    }

    try {
      const params: Record<string, string> = {};
      if (filters?.status) params.status = filters.status;
      if (filters?.startDate) params.startDate = filters.startDate;
      if (filters?.endDate) params.endDate = filters.endDate;

      const response = await apiRequest<EarningsResponse>({
        method: 'GET',
        url: API_BASE,
        params,
        skipCache: true,
      });

      const earnings = response.earnings ?? [];
      const header = ['Product', 'Order ID', 'Amount', 'Commission', 'Status', 'Date'];
      const rows = earnings.map((earning) => [
        earning.productName || '',
        earning.orderId || '',
        (earning.amount ?? 0).toFixed(2),
        (earning.commission ?? 0).toFixed(2),
        earning.status || '',
        earning.date ? new Date(earning.date).toISOString() : '',
      ]);

      const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

      return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    } catch (error) {
      console.error('Error exporting earnings:', error);
      throw error;
    }
  }
};

export default affiliateEarningsService;
