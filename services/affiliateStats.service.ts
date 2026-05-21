// Affiliate Stats Service
// Handles dashboard statistics, chart data, and earnings summaries
// Updated to use affiliateApiClient for consistent API calls

import { apiRequest } from '@/lib/affiliateApiClient';

const API_BASE = '/stats';

// Type definitions
export interface DashboardStats {
  totalEarnings: number;
  totalClicks: number;
  totalConversions: number;
  totalReferrals: number;
}

export interface ChartDataPoint {
  date: string;
  earnings: number;
  clicks: number;
}

export interface ChartResponse {
  labels: string[];
  earnings: number[];
  clicks: number[];
  conversions: number[];
}

export interface RecentEarning {
  id: string;
  productName: string;
  commission: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  date: string;
  orderId: string;
}

export const affiliateStatsService = {
  /**
   * Get dashboard statistics for the authenticated affiliate
   * GET /api/affiliate/dashboard/stats
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      console.log('📊 Fetching dashboard stats...');
      const response = await apiRequest<DashboardStats>({
        method: 'GET',
        url: '/dashboard/stats',
        skipCache: false,
      });

      console.log('✅ Dashboard stats received:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Get chart data (earnings and clicks over time)
   * GET /api/affiliate/dashboard/chart-data
   */
  async getChartData(timeframe: 'week' | 'month' | 'year' = 'month'): Promise<ChartResponse> {
    try {
      console.log(`📈 Fetching chart data for timeframe: ${timeframe}`);

      const chartData = await apiRequest<ChartResponse>({
        method: 'GET',
        url: '/dashboard/chart-data',
        params: { timeframe },
        skipCache: false,
      });

      console.log(`✅ Chart data received:`, chartData);
      return chartData;
    } catch (error) {
      console.error(`❌ Error fetching chart data:`, error);
      throw error;
    }
  },

  /**
   * Get recent earnings
   */
  async getRecentEarnings(limit: number = 5): Promise<RecentEarning[]> {
    try {
      console.log(`💰 Fetching recent earnings (limit: ${limit})...`);

      const response = await apiRequest<RecentEarning[] | { data?: RecentEarning[] }>({
        method: 'GET',
        url: `/dashboard/recent-earnings`,
        params: { limit },
        skipCache: true, // Don't cache earnings data
      });

      const earnings = Array.isArray(response) ? response : (response as any)?.data || [];
      console.log(`✅ Recent earnings received: ${earnings.length} records`);
      return earnings;
    } catch (error) {
      console.error('❌ Error fetching recent earnings:', error);
      throw error;
    }
  },

  /**
   * Get monthly comparison data
   */
  async getMonthlyComparison(): Promise<{ current: number; previous: number; growth: number }> {
    try {
      console.log('📊 Fetching monthly comparison...');

      const response = await apiRequest<{ current: number; previous: number; growth: number }>({
        method: 'GET',
        url: `/dashboard/monthly-comparison`,
        skipCache: false,
      });

      console.log('✅ Monthly comparison received:', response);
      return response || { current: 0, previous: 0, growth: 0 };
    } catch (error) {
      console.error('❌ Error fetching monthly comparison:', error);
      throw error;
    }
  },
};
