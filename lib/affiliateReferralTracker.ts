// Affiliate Referral Tracking Utility
// Handles detection, storage, and tracking of affiliate referrals

interface ReferralData {
  code: string;
  source: string;
  timestamp: number;
  tracked: boolean;
}

interface TrackingResponse {
  success: boolean;
  message?: string;
}

class AffiliateReferralTracker {
  private static readonly COOKIE_NAME = 'affiliate_referral';
  private static readonly STORAGE_KEY = 'affiliate_referral_data';
  private static readonly COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds
  private static readonly SESSION_TRACK_KEY = 'affiliate_tracked_session';

  /**
   * Initialize referral tracking on page load
   */
  static init(): void {
    if (typeof window === 'undefined') return;

    this.log('Initializing affiliate referral tracking');

    // Check for referral code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');

    if (refCode) {
      this.log(`Referral code detected: ${refCode}`);
      this.storeReferral(refCode, window.location.pathname);
      this.trackReferral(refCode);
    } else {
      // Check if we have stored referral data
      const storedData = this.getStoredReferral();
      if (storedData && !storedData.tracked) {
        this.log(`Found stored referral: ${storedData.code}`);
        this.trackReferral(storedData.code);
      }
    }
  }

  /**
   * Store referral data in both cookie and localStorage
   */
  private static storeReferral(code: string, source: string): void {
    const referralData: ReferralData = {
      code,
      source,
      timestamp: Date.now(),
      tracked: false
    };

    // Store in localStorage
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(referralData));
      this.log(`Stored referral in localStorage: ${code}`);
    } catch (error) {
      this.log('Failed to store referral in localStorage', error);
    }

    // Store in cookie
    try {
      const cookieValue = encodeURIComponent(JSON.stringify(referralData));
      document.cookie = `${this.COOKIE_NAME}=${cookieValue}; path=/; max-age=${this.COOKIE_MAX_AGE}; SameSite=Lax`;
      this.log(`Stored referral in cookie: ${code}`);
    } catch (error) {
      this.log('Failed to store referral in cookie', error);
    }
  }

  /**
   * Get stored referral data from localStorage or cookie
   */
  static getStoredReferral(): ReferralData | null {
    // Try localStorage first
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // Validate data structure
        if (data.code && data.timestamp) {
          return data;
        }
      }
    } catch (error) {
      this.log('Failed to read from localStorage', error);
    }

    // Fallback to cookie
    try {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === this.COOKIE_NAME && value) {
          const data = JSON.parse(decodeURIComponent(value));
          if (data.code && data.timestamp) {
            return data;
          }
        }
      }
    } catch (error) {
      this.log('Failed to read from cookie', error);
    }

    return null;
  }

  /**
   * Get current referral code
   */
  static getReferralCode(): string | null {
    const data = this.getStoredReferral();
    return data?.code || null;
  }

  /**
   * Track referral by sending request to backend
   */
  private static async trackReferral(code: string): Promise<void> {
    // Check if already tracked in this session
    const sessionKey = `${this.SESSION_TRACK_KEY}_${code}`;
    if (sessionStorage.getItem(sessionKey)) {
      this.log(`Referral ${code} already tracked in this session`);
      return;
    }

    try {
      this.log(`Tracking referral: ${code}`);

      const response = await fetch('/api/affiliate/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referralCode: code,
          page: window.location.pathname,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        })
      });

      const result: TrackingResponse = await response.json();

      if (result.success) {
        this.log(`Referral tracking successful: ${code}`);
        sessionStorage.setItem(sessionKey, 'true');

        // Mark as tracked in stored data
        this.markAsTracked();
      } else {
        this.log(`Referral tracking failed: ${result.message}`);
      }
    } catch (error) {
      this.log(`Error tracking referral: ${code}`, error);
    }
  }

  /**
   * Mark stored referral as tracked
   */
  private static markAsTracked(): void {
    const data = this.getStoredReferral();
    if (data) {
      data.tracked = true;

      // Update localStorage
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        this.log('Failed to update localStorage', error);
      }

      // Update cookie
      try {
        const cookieValue = encodeURIComponent(JSON.stringify(data));
        document.cookie = `${this.COOKIE_NAME}=${cookieValue}; path=/; max-age=${this.COOKIE_MAX_AGE}; SameSite=Lax`;
      } catch (error) {
        this.log('Failed to update cookie', error);
      }
    }
  }

  /**
   * Clear stored referral data
   */
  static clearReferral(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      document.cookie = `${this.COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      this.log('Cleared referral data');
    } catch (error) {
      this.log('Failed to clear referral data', error);
    }
  }

  /**
   * Debug logging (only in development)
   */
  private static log(message: string, error?: any): void {
    if (process.env.NODE_ENV === 'development') {
      if (error) {
        console.log(`[AffiliateReferral] ${message}`, error);
      } else {
        console.log(`[AffiliateReferral] ${message}`);
      }
    }
  }
}

export default AffiliateReferralTracker;