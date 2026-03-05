// Affiliate Payouts Service
// Handles payout requests, payment methods, and payout history

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export type PaymentMethodType = 'bank_transfer' | 'mobile_money' | 'crypto_usdt';

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
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: PaymentMethod;
  requestedAt: string;
  processedAt?: string;
  failureReason?: string;
  transactionId?: string;
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
   */
  async getPayouts(status?: string): Promise<Payout[]> {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);

      const response = await fetch(`${API_URL}/api/affiliate/payouts?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payouts: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
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
      const response = await fetch(`${API_URL}/api/affiliate/payouts/summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payout summary: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching payout summary:', error);
      throw error;
    }
  },

  /**
   * Request a new payout
   */
  async requestPayout(data: { amount: number; paymentMethodId: string }): Promise<Payout> {
    try {
      const response = await fetch(`${API_URL}/api/affiliate/payouts/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to request payout: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error requesting payout:', error);
      throw error;
    }
  },

  /**
   * Cancel a payout request (only if pending)
   */
  async cancelPayout(payoutId: string): Promise<Payout> {
    try {
      const response = await fetch(`${API_URL}/api/affiliate/payouts/${payoutId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel payout: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
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
      const response = await fetch(`${API_URL}/api/affiliate/payment-methods`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payment methods: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  /**
   * Add a new payment method
   */
  async addPaymentMethod(data: PaymentMethodInput): Promise<PaymentMethod> {
    try {
      const response = await fetch(`${API_URL}/api/affiliate/payment-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add payment method: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  },

  /**
   * Update a payment method
   */
  async updatePaymentMethod(methodId: string, data: Partial<PaymentMethodInput>): Promise<PaymentMethod> {
    try {
      const response = await fetch(`${API_URL}/api/affiliate/payment-methods/${methodId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update payment method: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  },

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(methodId: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/affiliate/payment-methods/${methodId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete payment method: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  },

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(methodId: string): Promise<PaymentMethod> {
    try {
      const response = await fetch(`${API_URL}/api/affiliate/payment-methods/${methodId}/set-default`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to set default payment method: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  },
};

export default affiliatePayoutsService;
