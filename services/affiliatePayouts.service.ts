// Affiliate Payouts Service
// Handles payout requests, payment methods, and payout history
// Enhanced with production-ready features: validation, timeouts, retries, caching

import { apiRequest, validators } from '@/lib/affiliateApiClient';

const API_BASE = '/payouts';
const PAYMENT_METHODS_BASE = '/payment-methods';

export type PaymentMethodType = 'bank_transfer' | 'mobile_money' | 'paypal';

export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentMethodType;
  name: string;
  details: string; // encrypted
  isDefault: boolean;
  createdAt: string;
  verified?: boolean;
}

export interface PaymentMethodInput {
  type: PaymentMethodType;
  name: string;
  details: string;
}

export interface Payout {
  id: string;
  amount: number;
  date: string;
  status: string;
}

export interface PayoutsResponse {
  payouts: Payout[];
}

export interface PayoutSummary {
  totalRequested: number;
  totalPaid: number;
  pendingPayouts: number;
  nextPayoutDate: string;
  minimumPayout: number;
}

export const affiliatePayoutsService = {
  /**
   * Get all payouts for the authenticated affiliate
   * GET /api/affiliate/payouts
   */
  async getPayouts(): Promise<PayoutsResponse> {
    try {
      return await apiRequest<PayoutsResponse>({
        method: 'GET',
        url: API_BASE,
      });
    } catch (error) {
      console.error('Error fetching payouts:', error);
      throw error;
    }
  },

  /**
   * Get payout summary (totals and next payout info)
   */
  async getPayoutSummary(): Promise<PayoutSummary> {
    try {
      return await apiRequest({
        method: 'GET',
        url: `${API_BASE}/summary`,
      });
    } catch (error) {
      console.error('Error fetching payout summary:', error);
      throw error;
    }
  },

  /**
   * Request a new payout
   */
  async requestPayout(data: { amount: number; paymentMethodId: string }): Promise<Payout> {
    // Input validation
    const validationErrors = validators.validateObject(data, {
      amount: (value) => validators.required(value, 'amount') || validators.number(value, 'amount', 0.01),
      paymentMethodId: (value) => validators.required(value, 'paymentMethodId') || validators.string(value, 'paymentMethodId', 1, 50),
    });

    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.map(e => e.message).join(', ')}`);
    }

    try {
      return await apiRequest({
        method: 'POST',
        url: `${API_BASE}/request`,
        data,
        skipCache: true,
      });
    } catch (error) {
      console.error('Error requesting payout:', error);
      throw error;
    }
  },

  /**
   * Cancel a payout request (only if pending)
   */
  async cancelPayout(payoutId: string): Promise<Payout> {
    // Input validation
    const payoutIdError = validators.required(payoutId, 'payoutId') || validators.string(payoutId, 'payoutId', 1, 50);
    if (payoutIdError) {
      throw new Error(payoutIdError.message);
    }

    try {
      return await apiRequest({
        method: 'POST',
        url: `${API_BASE}/${payoutId}/cancel`,
        skipCache: true,
      });
    } catch (error) {
      console.error('Error cancelling payout:', error);
      throw error;
    }
  },

  /**
   * Get all payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      return await apiRequest({
        method: 'GET',
        url: PAYMENT_METHODS_BASE,
      });
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  /**
   * Add a new payment method
   */
  async addPaymentMethod(data: PaymentMethodInput): Promise<PaymentMethod> {
    // Input validation
    const validationErrors = validators.validateObject(data, {
      type: (value) => validators.required(value, 'type') || validators.oneOf(value, 'type', ['bank_transfer', 'mobile_money', 'paypal']),
      name: (value) => validators.required(value, 'name') || validators.string(value, 'name', 1, 100),
      details: (value) => validators.required(value, 'details') || validators.string(value, 'details', 1, 500),
    });

    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.map(e => e.message).join(', ')}`);
    }

    try {
      return await apiRequest({
        method: 'POST',
        url: PAYMENT_METHODS_BASE,
        data,
        skipCache: true,
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  },

  /**
   * Update a payment method
   */
  async updatePaymentMethod(methodId: string, data: Partial<PaymentMethodInput>): Promise<PaymentMethod> {
    // Input validation
    const validationErrors = validators.validateObject({ methodId, ...data }, {
      methodId: (value) => validators.required(value, 'methodId') || validators.string(value, 'methodId', 1, 50),
      type: (value) => value ? validators.oneOf(value, 'type', ['bank_transfer', 'mobile_money', 'paypal']) : null,
      name: (value) => value ? validators.string(value, 'name', 1, 100) : null,
      details: (value) => value ? validators.string(value, 'details', 1, 500) : null,
    });

    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.map(e => e.message).join(', ')}`);
    }

    try {
      return await apiRequest({
        method: 'PUT',
        url: `${PAYMENT_METHODS_BASE}/${methodId}`,
        data,
        skipCache: true,
      });
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  },

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(methodId: string): Promise<void> {
    // Input validation
    const methodIdError = validators.required(methodId, 'methodId') || validators.string(methodId, 'methodId', 1, 50);
    if (methodIdError) {
      throw new Error(methodIdError.message);
    }

    try {
      await apiRequest({
        method: 'DELETE',
        url: `${PAYMENT_METHODS_BASE}/${methodId}`,
        skipCache: true,
      });
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  },

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(methodId: string): Promise<PaymentMethod> {
    // Input validation
    const methodIdError = validators.required(methodId, 'methodId') || validators.string(methodId, 'methodId', 1, 50);
    if (methodIdError) {
      throw new Error(methodIdError.message);
    }

    try {
      return await apiRequest({
        method: 'POST',
        url: `${PAYMENT_METHODS_BASE}/${methodId}/set-default`,
        skipCache: true,
      });
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  },
};

export default affiliatePayoutsService;
