// Affiliate Redux Slice
// Manages global state for affiliate dashboard data and UI

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DashboardStats, ChartDataPoint } from '@/services/affiliateStats.service';
import { ReferralLink } from '@/services/affiliateLinks.service';
import { Earning, EarningsSummary } from '@/services/affiliateEarnings.service';
import { Payout, PaymentMethod } from '@/services/affiliatePayouts.service';
import { AffiliateProduct, AffiliateCampaign } from '@/services/affiliateProducts.service';
import affiliateStatsService from '@/services/affiliateStats.service';
import affiliateLinksService from '@/services/affiliateLinks.service';
import affiliateEarningsService from '@/services/affiliateEarnings.service';
import affiliatePayoutsService from '@/services/affiliatePayouts.service';
import affiliateProductsService from '@/services/affiliateProducts.service';

// Async Thunks for API calls
export const fetchDashboardStats = createAsyncThunk(
  'affiliate/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      return await affiliateStatsService.getDashboardStats();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchChartData = createAsyncThunk(
  'affiliate/fetchChartData',
  async (timeframe: 'week' | 'month' | 'year' = 'month', { rejectWithValue }) => {
    try {
      return await affiliateStatsService.getChartData(timeframe);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch chart data');
    }
  }
);

export const fetchLinks = createAsyncThunk(
  'affiliate/fetchLinks',
  async (_, { rejectWithValue }) => {
    try {
      return await affiliateLinksService.getLinks();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch links');
    }
  }
);

export const createLink = createAsyncThunk(
  'affiliate/createLink',
  async (data: { name: string; source?: string }, { rejectWithValue }) => {
    try {
      return await affiliateLinksService.createLink(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create link');
    }
  }
);

export const deleteLink = createAsyncThunk(
  'affiliate/deleteLink',
  async (linkId: string, { rejectWithValue }) => {
    try {
      await affiliateLinksService.deleteLink(linkId);
      return linkId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete link');
    }
  }
);

export const fetchEarnings = createAsyncThunk(
  'affiliate/fetchEarnings',
  async (filters: { status?: "pending" | "approved" | "rejected" | "paid" | "all"; page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      return await affiliateEarningsService.getEarnings(filters);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch earnings');
    }
  }
);

export const fetchEarningsSummary = createAsyncThunk(
  'affiliate/fetchEarningsSummary',
  async (_, { rejectWithValue }) => {
    try {
      return await affiliateEarningsService.getEarningsSummary();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch earnings summary');
    }
  }
);

export const fetchPayments = createAsyncThunk(
  'affiliate/fetchPayments',
  async (_, { rejectWithValue }) => {
    try {
      const [payouts, methods] = await Promise.all([
        affiliatePayoutsService.getPayouts(),
        affiliatePayoutsService.getPaymentMethods(),
      ]);
      return { payouts, methods };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch payments');
    }
  }
);

export const fetchProducts = createAsyncThunk(
  'affiliate/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      return await affiliateProductsService.getProducts();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

export const fetchCampaigns = createAsyncThunk(
  'affiliate/fetchCampaigns',
  async (_, { rejectWithValue }) => {
    try {
      return await affiliateProductsService.getCampaigns();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch campaigns');
    }
  }
);

// State interface
interface AffiliateState {
  // Dashboard
  stats: DashboardStats | null;
  chartData: ChartDataPoint[] | null;
  
  // Links
  links: ReferralLink[];
  
  // Earnings
  earnings: Earning[];
  earningsSummary: EarningsSummary | null;
  
  // Payouts
  payouts: Payout[];
  paymentMethods: PaymentMethod[];
  
  // Products & Campaigns
  products: AffiliateProduct[];
  campaigns: AffiliateCampaign[];
  
  // UI States
  loading: {
    stats: boolean;
    chartData: boolean;
    links: boolean;
    earnings: boolean;
    payouts: boolean;
    products: boolean;
    campaigns: boolean;
  };
  
  error: string | null;
  selectedTimeframe: 'week' | 'month' | 'year';
}

const initialState: AffiliateState = {
  stats: null,
  chartData: null,
  links: [],
  earnings: [],
  earningsSummary: null,
  payouts: [],
  paymentMethods: [],
  products: [],
  campaigns: [],
  loading: {
    stats: false,
    chartData: false,
    links: false,
    earnings: false,
    payouts: false,
    products: false,
    campaigns: false,
  },
  error: null,
  selectedTimeframe: 'month',
};

const affiliateSlice = createSlice({
  name: 'affiliate',
  initialState,
  reducers: {
    // Sync actions
    clearError: (state) => {
      state.error = null;
    },
    setTimeframe: (state, action: PayloadAction<'week' | 'month' | 'year'>) => {
      state.selectedTimeframe = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading.stats = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.error = action.payload as string;
      });

    // Fetch Chart Data
    builder
      .addCase(fetchChartData.pending, (state) => {
        state.loading.chartData = true;
        state.error = null;
      })
      .addCase(fetchChartData.fulfilled, (state, action) => {
        state.loading.chartData = false;
        state.chartData = action.payload;
      })
      .addCase(fetchChartData.rejected, (state, action) => {
        state.loading.chartData = false;
        state.error = action.payload as string;
      });

    // Fetch Links
    builder
      .addCase(fetchLinks.pending, (state) => {
        state.loading.links = true;
        state.error = null;
      })
      .addCase(fetchLinks.fulfilled, (state, action) => {
        state.loading.links = false;
        state.links = action.payload;
      })
      .addCase(fetchLinks.rejected, (state, action) => {
        state.loading.links = false;
        state.error = action.payload as string;
      });

    // Create Link
    builder
      .addCase(createLink.pending, (state) => {
        state.error = null;
      })
      .addCase(createLink.fulfilled, (state, action) => {
        state.links.push(action.payload);
      })
      .addCase(createLink.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete Link
    builder
      .addCase(deleteLink.fulfilled, (state, action) => {
        state.links = state.links.filter((link) => link.id !== action.payload);
      })
      .addCase(deleteLink.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch Earnings
    builder
      .addCase(fetchEarnings.pending, (state) => {
        state.loading.earnings = true;
        state.error = null;
      })
      .addCase(fetchEarnings.fulfilled, (state, action) => {
        state.loading.earnings = false;
        state.earnings = action.payload.earnings;
      })
      .addCase(fetchEarnings.rejected, (state, action) => {
        state.loading.earnings = false;
        state.error = action.payload as string;
      });

    // Fetch Earnings Summary
    builder.addCase(fetchEarningsSummary.fulfilled, (state, action) => {
      state.earningsSummary = action.payload;
    });

    // Fetch Payments
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading.payouts = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading.payouts = false;
        state.payouts = action.payload.payouts;
        state.paymentMethods = action.payload.methods;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading.payouts = false;
        state.error = action.payload as string;
      });

    // Fetch Products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading.products = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading.products = false;
        state.products = action.payload.products;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading.products = false;
        state.error = action.payload as string;
      });

    // Fetch Campaigns
    builder
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading.campaigns = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading.campaigns = false;
        state.campaigns = action.payload;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading.campaigns = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setTimeframe } = affiliateSlice.actions;
export default affiliateSlice.reducer;
