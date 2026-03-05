// Affiliate Stats Service
// Handles dashboard statistics, chart data, and earnings summaries

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface DashboardStats {
  totalEarnings: number;
  monthlyEarnings: number;
  totalCommissions: number;
  totalClicks: number;
  conversionRate: number;
  activeLinks: number;
  tier: string;
  tierProgress?: {
    current: number;
    required: number;
    nextTier?: string;
  };
}

export interface ChartDataPoint {
  date: string;
  earnings: number;
  clicks: number;
  conversions: number;
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
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${API_URL}/api/affiliate/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Get chart data (earnings and clicks over time)
   */
  async getChartData(timeframe: 'week' | 'month' | 'year' = 'month'): Promise<ChartDataPoint[]> {
    try {
      const response = await fetch(`${API_URL}/api/affiliate/dashboard/chart-data?timeframe=${timeframe}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch chart data: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  },

  /**
   * Get recent earnings/commissions
   */
  async getRecentEarnings(limit: number = 10): Promise<RecentEarning[]> {
    try {
      const response = await fetch(`${API_URL}/api/affiliate/dashboard/recent-earnings?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recent earnings: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching recent earnings:', error);
      throw error;
    }
  },

  /**
   * Get affiliate performance metrics
   */
  async getPerformanceMetrics(): Promise<{
    averageOrderValue: number;
    totalOrders: number;
    uniqueCustomers: number;
    repeatCustomerRate: number;
    topProduct: { id: string; name: string; orders: number };
  }> {
    try {
      const response = await fetch(`${API_URL}/api/affiliate/dashboard/performance`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch performance metrics: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      throw error;
    }
  },
};

export default affiliateStatsService;
