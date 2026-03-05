// Affiliate Dashboard Configuration Documentation
// Environment Setup Guide

/**
 * AFFILIATE DASHBOARD - ENVIRONMENT VARIABLES
 * 
 * This document explains the environment variables required for the affiliate
 * dashboard to function properly.
 */

// PUBLIC ENVIRONMENT VARIABLES (exposed to browser)
// These should be prefixed with NEXT_PUBLIC_ in your .env.local file

const PUBLIC_ENV_VARS = {
  // Backend API Configuration
  NEXT_PUBLIC_API_URL: {
    description: 'Base URL for the backend API',
    example: 'http://localhost:5000',
    production: 'https://api.ventechgadgets.com',
    required: true,
  },

  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: {
    description: 'Supabase project URL',
    required: false, // Already configured
  },

  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    description: 'Supabase anonymous key',
    required: false, // Already configured
  },

  // Payment Gateway
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: {
    description: 'Paystack public key for payment processing',
    required: false,
  },
};

/**
 * SETUP INSTRUCTIONS
 * 
 * 1. Create a .env.local file in the root of your project
 * 2. Add the environment variables listed above
 * 3. Restart your development server
 * 
 * Example .env.local file:
 * 
 * NEXT_PUBLIC_API_URL=http://localhost:5000
 * NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
 * NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
 * NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your-paystack-key
 */

/**
 * DEVELOPMENT SETUP
 * 
 * For local development with the affiliate API:
 * 
 * .env.local:
 * ----------
 * NEXT_PUBLIC_API_URL=http://localhost:5000
 * NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
 * NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * 
 * Make sure your backend API is running at http://localhost:5000
 * and accessible from your development environment.
 */

/**
 * PRODUCTION SETUP
 * 
 * For production deployment:
 * 
 * .env.production:
 * ----------------
 * NEXT_PUBLIC_API_URL=https://api.ventechgadgets.com
 * NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
 * NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-key
 * 
 * Set these environment variables on your hosting platform:
 * - Vercel: Project Settings → Environment Variables
 * - Docker/Self-hosted: Configure via .env file
 */

/**
 * AFFILIATE API ENDPOINTS EXPECTED
 * 
 * The backend API should provide the following endpoints:
 * 
 * Dashboard:
 * - GET  /api/affiliate/dashboard/stats
 * - GET  /api/affiliate/dashboard/chart-data
 * - GET  /api/affiliate/dashboard/recent-earnings
 * - GET  /api/affiliate/dashboard/performance
 * 
 * Referral Links:
 * - GET  /api/affiliate/links
 * - POST /api/affiliate/links
 * - PUT  /api/affiliate/links/{id}
 * - DELETE /api/affiliate/links/{id}
 * - GET  /api/affiliate/links/{id}/stats
 * 
 * Earnings:
 * - GET  /api/affiliate/earnings
 * - GET  /api/affiliate/earnings/summary
 * - GET  /api/affiliate/earnings/monthly
 * - GET  /api/affiliate/earnings/by-tier
 * - GET  /api/affiliate/earnings/export
 * 
 * Payouts:
 * - GET  /api/affiliate/payouts
 * - POST /api/affiliate/payouts/request
 * - POST /api/affiliate/payouts/{id}/cancel
 * - GET  /api/affiliate/payouts/summary
 * 
 * Payment Methods:
 * - GET  /api/affiliate/payment-methods
 * - POST /api/affiliate/payment-methods
 * - PUT  /api/affiliate/payment-methods/{id}
 * - DELETE /api/affiliate/payment-methods/{id}
 * - POST /api/affiliate/payment-methods/{id}/set-default
 * 
 * Products & Campaigns:
 * - GET  /api/affiliate/products
 * - GET  /api/affiliate/products/{id}
 * - GET  /api/affiliate/products/top
 * - GET  /api/affiliate/products/categories
 * - GET  /api/affiliate/campaigns
 * - GET  /api/affiliate/campaigns/{id}
 * - GET  /api/affiliate/campaigns/{id}/stats
 */

/**
 * AUTHENTICATION
 * 
 * All affiliate API endpoints require authentication.
 * The token is sent as:
 * 
 * Authorization: Bearer {token}
 * 
 * The token is retrieved from localStorage using:
 * localStorage.getItem('token')
 * 
 * Ensure your auth service stores the token correctly
 * after successful login.
 */

/**
 * TROUBLESHOOTING
 * 
 * 1. API Connection Errors
 *    - Check NEXT_PUBLIC_API_URL is correct
 *    - Ensure backend is running
 *    - Check CORS settings on backend
 *    - Verify token is being sent correctly
 * 
 * 2. Environment Variables Not Applied
 *    - Rebuild the project: npm run build
 *    - Clear .next folder: rm -rf .next
 *    - Restart development server: npm run dev
 * 
 * 3. Unauthorized Errors (401)
 *    - Check token is stored in localStorage
 *    - Verify token is valid and not expired
 *    - Login again to get new token
 *    - Check auth middleware is working correctly
 */

export const AFFILIATE_API_CONFIG = {
  // This is set in affiliateStats.service.ts and other service files
  // Uses: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  AFFILIATE_BASE: '/api/affiliate',
  TIMEOUT: 30000, // 30 seconds
  RETRY_INTERVAL: 1000,
  MAX_RETRIES: 3,
};

export default PUBLIC_ENV_VARS;
