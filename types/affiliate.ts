/**
 * Affiliate Types and Interfaces
 * Comprehensive types for affiliate link generation, tracking, and management
 */

export interface AffiliateLink {
  id: string;
  code: string;
  name: string;
  url: string;
  generated_url?: string;
  source?: string;
  productId?: string;
  productName?: string;
  clicks: number;
  conversions: number;
  earnings: number;
  conversionRate: number;
  createdAt: string;
  updatedAt?: string;
  status: 'active' | 'inactive';
}

export interface GeneratedLinkResponse {
  generated_url?: string;
  url?: string;
  referral_code?: string;
  code?: string;
  id?: string;
  createdAt?: string;
}

export interface LinkStats {
  linkId: string;
  clicks: number;
  conversions: number;
  earnings: number;
  conversionRate: number;
  lastUpdated: string;
}

export interface LinkAnalytics {
  linkId: string;
  linkName: string;
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  conversionRate: number;
  avgOrderValue: number;
  clicksByDate: Array<{
    date: string;
    clicks: number;
    conversions: number;
    earnings: number;
  }>;
  topReferringSources: Array<{
    source: string;
    clicks: number;
    conversions: number;
  }>;
}

export interface GenerateLinkRequest {
  productId: string;
  name?: string;
  source?: string;
}

export interface LinksPageData {
  links: AffiliateLink[];
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  averageConversionRate: number;
}

export interface GenerateLinkModalState {
  isOpen: boolean;
  loading: boolean;
  error: string | null;
  generatedUrl: string;
  generatedCode: string;
}
