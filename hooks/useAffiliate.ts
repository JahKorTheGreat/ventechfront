// Affiliate Custom Hooks
// Follow the services → Redux → components pattern

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchDashboardStats,
  fetchChartData,
  fetchLinks,
  createLink,
  deleteLink,
  fetchEarnings,
  fetchEarningsSummary,
  fetchPayments,
  fetchProducts,
  fetchCampaigns,
  setTimeframe,
} from '@/store/affiliateSlice';
import affiliateLinksService from '@/services/affiliateLinks.service';
import affiliateEarningsService from '@/services/affiliateEarnings.service';
import affiliatePayoutsService from '@/services/affiliatePayouts.service';
import { ReferralLink } from '@/services/affiliateLinks.service';
import { PaymentMethodInput, PayoutSummary } from '@/services/affiliatePayouts.service';

/**
 * Hook for dashboard statistics and overview
 */
export const useDashboardStats = () => {
  const dispatch = useAppDispatch();
  const { stats, loading: statsLoading, chartData, loading: chartLoading, error, selectedTimeframe } = useAppSelector(
    (state) => state.affiliate
  );
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Fetch stats and chart data on mount and when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDashboardStats());
      dispatch(fetchChartData(selectedTimeframe));
    }
  }, [dispatch, isAuthenticated, selectedTimeframe]);

  const changeTimeframe = useCallback(
    (timeframe: 'week' | 'month' | 'year') => {
      dispatch(setTimeframe(timeframe));
      dispatch(fetchChartData(timeframe));
    },
    [dispatch]
  );

  return {
    stats,
    chartData,
    loading: statsLoading || chartLoading,
    error,
    selectedTimeframe,
    changeTimeframe,
    refetch: () => {
      dispatch(fetchDashboardStats());
      dispatch(fetchChartData(selectedTimeframe));
    },
  };
};

/**
 * Hook for managing affiliate referral links
 */
export const useAffiliateLinks = () => {
  const dispatch = useAppDispatch();
  const { links, loading, error } = useAppSelector((state) => state.affiliate);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Fetch links on mount and when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchLinks());
    }
  }, [dispatch, isAuthenticated]);

  const createNewLink = useCallback(
    async (data: { name: string; source?: string }) => {
      try {
        await dispatch(createLink(data)).unwrap();
        return true;
      } catch (error) {
        console.error('Failed to create link:', error);
        return false;
      }
    },
    [dispatch]
  );

  const removeLink = useCallback(
    async (linkId: string) => {
      try {
        await dispatch(deleteLink(linkId)).unwrap();
        return true;
      } catch (error) {
        console.error('Failed to delete link:', error);
        return false;
      }
    },
    [dispatch]
  );

  const copyLinkToClipboard = useCallback((url: string): boolean => {
    return affiliateLinksService.copyLinkToClipboard(url);
  }, []);

  return {
    links,
    loading,
    error,
    createNewLink,
    removeLink,
    copyLinkToClipboard,
    refresh: () => dispatch(fetchLinks()),
  };
};

/**
 * Hook for managing earnings and commissions
 */
export const useAffiliateEarnings = (filters?: { status?: string }) => {
  const dispatch = useAppDispatch();
  const { earnings, earningsSummary, loading: earningsLoading, error } = useAppSelector((state) => state.affiliate);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Fetch earnings on mount and when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchEarnings(filters));
      dispatch(fetchEarningsSummary());
    }
  }, [dispatch, isAuthenticated, filters?.status]);

  const getEarningsByStatus = useCallback(
    async (status: string) => {
      try {
        const result = await affiliateEarningsService.getEarnings({ status });
        return result.earnings;
      } catch (error) {
        console.error('Failed to get earnings by status:', error);
        return [];
      }
    },
    []
  );

  const getMonthlyBreakdown = useCallback(async (year?: number) => {
    try {
      return await affiliateEarningsService.getMonthlyEarnings(year);
    } catch (error) {
      console.error('Failed to get monthly earnings:', error);
      return [];
    }
  }, []);

  const exportEarningsCSV = useCallback(
    async (filters?: { status?: string; startDate?: string; endDate?: string }) => {
      try {
        const blob = await affiliateEarningsService.exportEarnings(filters);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `earnings-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        return true;
      } catch (error) {
        console.error('Failed to export earnings:', error);
        return false;
      }
    },
    []
  );

  return {
    earnings,
    summary: earningsSummary,
    loading: earningsLoading,
    error,
    getEarningsByStatus,
    getMonthlyBreakdown,
    exportEarningsCSV,
    refresh: () => {
      dispatch(fetchEarnings(filters));
      dispatch(fetchEarningsSummary());
    },
  };
};

/**
 * Hook for managing payouts and payment methods
 */
export const useAffiliatePayouts = () => {
  const dispatch = useAppDispatch();
  const { payouts, paymentMethods, loading: payoutsLoading, error } = useAppSelector((state) => state.affiliate);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Fetch payouts and payment methods on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchPayments());
    }
  }, [dispatch, isAuthenticated]);

  const requestPayout = useCallback(
    async (amount: number, paymentMethodId: string) => {
      try {
        await affiliatePayoutsService.requestPayout({ amount, paymentMethodId });
        dispatch(fetchPayments()); // Refresh payout list
        return true;
      } catch (error) {
        console.error('Failed to request payout:', error);
        return false;
      }
    },
    [dispatch]
  );

  const addPaymentMethod = useCallback(
    async (data: PaymentMethodInput) => {
      try {
        await affiliatePayoutsService.addPaymentMethod(data);
        dispatch(fetchPayments()); // Refresh payment methods
        return true;
      } catch (error) {
        console.error('Failed to add payment method:', error);
        return false;
      }
    },
    [dispatch]
  );

  const updatePaymentMethod = useCallback(
    async (methodId: string, data: Partial<PaymentMethodInput>) => {
      try {
        await affiliatePayoutsService.updatePaymentMethod(methodId, data);
        dispatch(fetchPayments()); // Refresh payment methods
        return true;
      } catch (error) {
        console.error('Failed to update payment method:', error);
        return false;
      }
    },
    [dispatch]
  );

  const removePaymentMethod = useCallback(
    async (methodId: string) => {
      try {
        await affiliatePayoutsService.deletePaymentMethod(methodId);
        dispatch(fetchPayments()); // Refresh payment methods
        return true;
      } catch (error) {
        console.error('Failed to remove payment method:', error);
        return false;
      }
    },
    [dispatch]
  );

  const setDefaultPaymentMethod = useCallback(
    async (methodId: string) => {
      try {
        await affiliatePayoutsService.setDefaultPaymentMethod(methodId);
        dispatch(fetchPayments()); // Refresh payment methods
        return true;
      } catch (error) {
        console.error('Failed to set default payment method:', error);
        return false;
      }
    },
    [dispatch]
  );

  const getPayoutSummary = useCallback(async (): Promise<PayoutSummary | null> => {
    try {
      return await affiliatePayoutsService.getPayoutSummary();
    } catch (error) {
      console.error('Failed to get payout summary:', error);
      return null;
    }
  }, []);

  const cancelPayout = useCallback(
    async (payoutId: string) => {
      try {
        await affiliatePayoutsService.cancelPayout(payoutId);
        dispatch(fetchPayments()); // Refresh payout list
        return true;
      } catch (error) {
        console.error('Failed to cancel payout:', error);
        return false;
      }
    },
    [dispatch]
  );

  return {
    payouts,
    paymentMethods,
    loading: payoutsLoading,
    error,
    requestPayout,
    addPaymentMethod,
    updatePaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    getPayoutSummary,
    cancelPayout,
    refresh: () => dispatch(fetchPayments()),
  };
};

/**
 * Hook for managing promotable products
 */
export const useAffiliateProducts = () => {
  const dispatch = useAppDispatch();
  const { products, campaigns, loading: productsLoading, error } = useAppSelector((state) => state.affiliate);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Fetch products and campaigns on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProducts());
      dispatch(fetchCampaigns());
    }
  }, [dispatch, isAuthenticated]);

  const getTopProducts = useCallback(async (limit: number = 10) => {
    try {
      return await affiliateProductsService.getTopProducts(limit);
    } catch (error) {
      console.error('Failed to get top products:', error);
      return [];
    }
  }, []);

  const getCategories = useCallback(async () => {
    try {
      return await affiliateProductsService.getCategories();
    } catch (error) {
      console.error('Failed to get categories:', error);
      return [];
    }
  }, []);

  return {
    products,
    campaigns,
    loading: productsLoading,
    error,
    getTopProducts,
    getCategories,
    refresh: () => {
      dispatch(fetchProducts());
      dispatch(fetchCampaigns());
    },
  };
};

// Import for hook
import affiliateProductsService from '@/services/affiliateProducts.service';
