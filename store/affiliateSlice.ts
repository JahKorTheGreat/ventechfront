// Affiliate Redux Slice
// Manages global state for affiliate dashboard data and UI
// Includes defensive guards against state corruption

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DashboardStats, ChartDataPoint, ChartResponse, affiliateStatsService } from '@/services/affiliateStats.service';
import { ReferralLink, affiliateLinksService } from '@/services/affiliateLinks.service';
import { Earning, EarningsSummary, affiliateEarningsService } from '@/services/affiliateEarnings.service';
import { Payout, PaymentMethod, affiliatePayoutsService } from '@/services/affiliatePayouts.service';
import { Referral, affiliateReferralsService } from '@/services/affiliateReferrals.service';
import { AffiliateProduct, AffiliateCampaign, affiliateProductsService } from '@/services/affiliateProducts.service';

/**
 * Type Guards and Validators
 * Prevents state corruption by validating payload formats
 */
function isValidLink(obj: any): obj is ReferralLink {
  const hasUrl = typeof obj.url === 'string' && obj.url.length > 0;
  const hasGeneratedUrl = typeof obj.generated_url === 'string' && obj.generated_url.length > 0;

  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    (hasUrl || hasGeneratedUrl) &&
    typeof obj.clicks === 'number' &&
    typeof obj.conversions === 'number' &&
    typeof obj.earnings === 'number'
  );
}

function isLinkArray(obj: any): obj is ReferralLink[] {
  return Array.isArray(obj) && obj.every(item => isValidLink(item));
}

function ensureLinksArray(state: AffiliateState): void {
  if (!Array.isArray(state.links)) {
    console.warn('[Redux] Links state corruption detected, resetting to empty array');
    state.links = [];
  }
}

function extractLinksFromPayload(payload: any): ReferralLink[] {
  // Direct array response
  if (Array.isArray(payload)) {
    return payload;
  }
  // Wrapped response: { data: [...] }
  if (payload?.data && Array.isArray(payload.data)) {
    return payload.data;
  }
  // Wrapped response: { links: [...] }
  if (payload?.links && Array.isArray(payload.links)) {
    return payload.links;
  }
  // Invalid format
  console.warn('[Redux] Unexpected links payload format:', payload);
  return [];
}

function extractSingleLink(payload: any): ReferralLink | null {
  // Direct link object
  if (isValidLink(payload)) {
    return payload;
  }
  // Wrapped response: { data: {...} }
  if (isValidLink(payload?.data)) {
    return payload.data;
  }
  // Wrapped response: { link: {...} }
  if (isValidLink(payload?.link)) {
    return payload.link;
  }
  console.warn('[Redux] Unexpected single link payload format:', payload);
  return null;
}

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
  async (_, { rejectWithValue }) => {
    try {
      return await affiliateEarningsService.getEarnings();
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
      const payouts = await affiliatePayoutsService.getPayouts();
      return { payouts: payouts.payouts, methods: [] };
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

export const fetchReferrals = createAsyncThunk(
  'affiliate/fetchReferrals',
  async (_, { rejectWithValue }) => {
    try {
      return await affiliateReferralsService.getReferrals();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch referrals');
    }
  }
);

// State interface
interface AffiliateLoadingState {
  stats: boolean;
  chartData: boolean;
  links: boolean;
  earnings: boolean;
  referrals: boolean;
  payouts: boolean;
  products: boolean;
  campaigns: boolean;
}

export interface AffiliateState {
  // Dashboard
  stats: DashboardStats | null;
  chartData: ChartResponse | null;
  
  // Links - MUST ALWAYS BE AN ARRAY
  links: ReferralLink[];
  
  // Earnings
  earnings: Earning[];
  earningsSummary: EarningsSummary | null;
  
  // Referrals
  referrals: Referral[];
  
  // Payouts
  payouts: Payout[];
  paymentMethods: PaymentMethod[];
  
  // Products & Campaigns
  products: AffiliateProduct[];
  campaigns: AffiliateCampaign[];
  
  // UI States
  loading: AffiliateLoadingState;
  
  error: string | null;
  selectedTimeframe: 'week' | 'month' | 'year';
}

const initialState: AffiliateState = {
  stats: null,
  chartData: null,
  links: [],
  earnings: [],
  earningsSummary: null,
  referrals: [],
  payouts: [],
  paymentMethods: [],
  products: [],
  campaigns: [],
  loading: {
    stats: false,
    chartData: false,
    links: false,
    earnings: false,
    referrals: false,
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
        ensureLinksArray(state);
        state.loading.links = true;
        state.error = null;
      })
      .addCase(fetchLinks.fulfilled, (state, action) => {
        state.loading.links = false;
        const links = extractLinksFromPayload(action.payload);
        state.links = isLinkArray(links) ? links : [];
      })
      .addCase(fetchLinks.rejected, (state, action) => {
        state.loading.links = false;
        state.error = action.payload as string;
      });

    // Create Link
    builder
      .addCase(createLink.pending, (state) => {
        ensureLinksArray(state);
        state.error = null;
      })
      .addCase(createLink.fulfilled, (state, action) => {
        ensureLinksArray(state);
        const newLink = extractSingleLink(action.payload);
        if (newLink && isValidLink(newLink)) {
          // Add to beginning for better UX (newly created items appear first)
          state.links.unshift(newLink);
        } else {
          console.error('[Redux] Invalid link object received from createLink:', action.payload);
          state.error = 'Failed to create link: Invalid response format';
        }
      })
      .addCase(createLink.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete Link
    builder
      .addCase(deleteLink.pending, (state) => {
        ensureLinksArray(state);
        state.error = null;
      })
      .addCase(deleteLink.fulfilled, (state, action) => {
        ensureLinksArray(state);
        const linkIdToDelete = action.payload;
        if (typeof linkIdToDelete === 'string') {
          state.links = state.links.filter((link) => link.id !== linkIdToDelete);
        }
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
        const payload = action.payload as any;
        // Handle both array and wrapped responses
        state.earnings = Array.isArray(payload?.earnings) 
          ? payload.earnings 
          : Array.isArray(payload) 
            ? payload 
            : [];
      })
      .addCase(fetchEarnings.rejected, (state, action) => {
        state.loading.earnings = false;
        state.error = action.payload as string;
      });

    // Fetch Earnings Summary
    builder.addCase(fetchEarningsSummary.fulfilled, (state, action) => {
      state.earningsSummary = action.payload;
    });

    // Fetch Referrals
    builder
      .addCase(fetchReferrals.pending, (state) => {
        state.loading.referrals = true;
        state.error = null;
      })
      .addCase(fetchReferrals.fulfilled, (state, action) => {
        state.loading.referrals = false;
        state.referrals = action.payload.referrals || [];
      })
      .addCase(fetchReferrals.rejected, (state, action) => {
        state.loading.referrals = false;
        state.error = action.payload as string;
      });

    // Fetch Campaigns
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading.products = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading.products = false;
        const payload = action.payload as any;
        // Handle multiple response formats for robustness
        const productList = Array.isArray(payload?.products)
          ? payload.products
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload)
              ? payload
              : [];
        state.products = productList;
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
