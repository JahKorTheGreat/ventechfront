// Affiliate Referrals Service
// Handles referral tracking and management

import { apiRequest } from '@/lib/affiliateApiClient';

const API_BASE = '/referrals';

export interface Referral {
  id: string;
  name: string;
  email: string;
  date: string;
  status: string;
}

export interface ReferralsResponse {
  referrals: Referral[];
}

export const affiliateReferralsService = {
  /**
   * Get all referrals for authenticated affiliate
   * GET /api/affiliate/referrals
   */
  async getReferrals(): Promise<ReferralsResponse> {
    try {
      return await apiRequest<ReferralsResponse>({
        method: 'GET',
        url: API_BASE,
      });
    } catch (error) {
      console.error('Error fetching referrals:', error);
      throw error;
    }
  },
};