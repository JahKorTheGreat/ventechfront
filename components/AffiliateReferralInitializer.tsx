'use client';

import { useEffect } from 'react';
import AffiliateReferralTracker from '@/lib/affiliateReferralTracker';

export default function AffiliateReferralInitializer() {
  useEffect(() => {
    // Initialize referral tracking on mount
    AffiliateReferralTracker.init();
  }, []);

  // This component doesn't render anything
  return null;
}