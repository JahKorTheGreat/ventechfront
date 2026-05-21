// Enhanced HTTP Client for Affiliate Services
// Production-ready with validation, timeouts, retries, caching, and error handling

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, AxiosRequestHeaders } from 'axios';
import { getSupabaseAccessToken } from '@/lib/supabase';

export interface RequestConfig extends AxiosRequestConfig {
  skipCache?: boolean;
  retryCount?: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: ValidationError[];
  retryable?: boolean;
}

// Configuration constants
const CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second base delay
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  RATE_LIMIT_RETRY_DELAY: 60000, // 1 minute for rate limits
};

// Simple in-memory cache
class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number }>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > CONFIG.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache key from request config
  getCacheKey(config: AxiosRequestConfig): string {
    const { method, url, params, data } = config;
    return `${method?.toUpperCase()}_${url}_${JSON.stringify(params || {})}_${JSON.stringify(data || {})}`;
  }
}

const cache = new ApiCache();

// Input validation utilities
export const validators = {
  required: (value: any, fieldName: string): ValidationError | null => {
    if (value === null || value === undefined || value === '') {
      return { field: fieldName, message: `${fieldName} is required` };
    }
    return null;
  },

  string: (value: any, fieldName: string, minLength?: number, maxLength?: number): ValidationError | null => {
    if (typeof value !== 'string') {
      return { field: fieldName, message: `${fieldName} must be a string` };
    }
    if (minLength && value.length < minLength) {
      return { field: fieldName, message: `${fieldName} must be at least ${minLength} characters` };
    }
    if (maxLength && value.length > maxLength) {
      return { field: fieldName, message: `${fieldName} must be no more than ${maxLength} characters` };
    }
    return null;
  },

  number: (value: any, fieldName: string, min?: number, max?: number): ValidationError | null => {
    const num = Number(value);
    if (isNaN(num)) {
      return { field: fieldName, message: `${fieldName} must be a valid number` };
    }
    if (min !== undefined && num < min) {
      return { field: fieldName, message: `${fieldName} must be at least ${min}` };
    }
    if (max !== undefined && num > max) {
      return { field: fieldName, message: `${fieldName} must be no more than ${max}` };
    }
    return null;
  },

  email: (value: string, fieldName: string): ValidationError | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { field: fieldName, message: `${fieldName} must be a valid email address` };
    }
    return null;
  },

  oneOf: (value: any, fieldName: string, allowedValues: any[]): ValidationError | null => {
    if (!allowedValues.includes(value)) {
      return { field: fieldName, message: `${fieldName} must be one of: ${allowedValues.join(', ')}` };
    }
    return null;
  },

  validateObject: (obj: Record<string, any>, validations: Record<string, (value: any) => ValidationError | null>): ValidationError[] => {
    const errors: ValidationError[] = [];
    for (const [field, validator] of Object.entries(validations)) {
      const error = validator(obj[field]);
      if (error) errors.push(error);
    }
    return errors;
  },
};

// Enhanced error handling
export class AffiliateApiError extends Error {
  public status: number;
  public code?: string;
  public details?: ValidationError[];
  public retryable: boolean;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'AffiliateApiError';
    this.status = error.status;
    this.code = error.code;
    this.details = error.details;
    this.retryable = error.retryable ?? false;
  }
}

// Create axios instance with interceptors
function createAffiliateApiClient(): AxiosInstance {
  const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  console.log('API BASE URL:', API_URL);
  console.log('Full baseURL:', API_URL ? `${API_URL}/api/affiliate` : '/api/affiliate');

  // If no external API URL is set, use relative URLs (same origin as the app)
  const baseURL = API_URL ? `${API_URL}/api/affiliate` : '/api/affiliate';

  const client = axios.create({
    baseURL,
    timeout: CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  // Request interceptor for authentication
  client.interceptors.request.use(async (config) => {
    config.withCredentials = true;
    const token = await getSupabaseAccessToken();
    if (token) {
      const headers = config.headers as Record<string, string | undefined>;
      config.headers = {
        ...headers,
        Authorization: `Bearer ${token}`,
      } as any;
    }
    return config;
  });

  // Response interceptor for error handling and caching
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Cache successful GET responses
      const config = response.config as RequestConfig;
      if (config.method?.toLowerCase() === 'get' && !config.skipCache) {
        const cacheKey = cache.getCacheKey(config);
        cache.set(cacheKey, response.data);
      }
      return response;
    },
    async (error: AxiosError) => {
      const config = error.config as RequestConfig;
      const status = error.response?.status;

      // Handle rate limiting
      if (status === 429) {
        const retryAfter = error.response?.headers?.['retry-after'];
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : CONFIG.RATE_LIMIT_RETRY_DELAY;

        if (config && !config.retryCount) {
          config.retryCount = 0;
        }

        if (config && config.retryCount! < 1) { // Only retry once for rate limits
          config.retryCount!++;
          await new Promise(resolve => setTimeout(resolve, delay));
          return client.request(config);
        }
      }

      // Handle retryable errors
      if (config && shouldRetry(error) && (config.retryCount || 0) < CONFIG.RETRY_ATTEMPTS) {
        config.retryCount = (config.retryCount || 0) + 1;
        const delay = CONFIG.RETRY_DELAY * Math.pow(2, config.retryCount - 1); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return client.request(config);
      }

      // Transform error to our custom error format
      throw transformError(error);
    }
  );

  return client;
}

// Determine if an error should be retried
function shouldRetry(error: AxiosError): boolean {
  const status = error.response?.status;
  // Retry on network errors, 5xx server errors, and timeouts
  return !status || status >= 500 || status === 408 || status === 429;
}

// Transform axios error to our custom error format
function transformError(error: AxiosError): AffiliateApiError {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    const errorData = data as any;
    const apiError = new AffiliateApiError({
      message: errorData?.message || error.message || `Request failed with status ${status}`,
      status,
      code: errorData?.code,
      details: errorData?.details,
      retryable: shouldRetry(error),
    });

    // Preserve the original Axios error and response for richer logging
    (apiError as any).originalError = error;
    (apiError as any).response = error.response;
    (apiError as any).request = error.request;
    (apiError as any).config = error.config;

    return apiError;
  } else if (error.request) {
    // Network error
    const apiError = new AffiliateApiError({
      message: 'Network error - please check your connection',
      status: 0,
      retryable: true,
    });

    (apiError as any).originalError = error;
    (apiError as any).request = error.request;
    (apiError as any).config = error.config;

    return apiError;
  } else {
    // Other error
    return new AffiliateApiError({
      message: error.message || 'An unexpected error occurred',
      status: 0,
      retryable: false,
    });
  }
}

// Main API client instance
export const affiliateApiClient = createAffiliateApiClient();

// Enhanced request method with caching and error handling
export async function apiRequest<T>(
  config: RequestConfig
): Promise<T> {
  // Check cache for GET requests
  if (config.method?.toLowerCase() === 'get' && !config.skipCache) {
    const cacheKey = cache.getCacheKey(config);
    const cachedData = cache.get<T>(cacheKey);
    if (cachedData) {
      console.log('📦 [CACHE HIT]', config.url);
      return cachedData;
    }
  }

  try {
    // Log the request details
    const baseURL = affiliateApiClient.defaults.baseURL || '/api/affiliate';
    const fullUrl = `${baseURL}${config.url}`;
    const queryString = config.params ? `?${new URLSearchParams(config.params).toString()}` : '';
    
    console.log(`🌐 [API REQUEST] ${config.method?.toUpperCase()} ${fullUrl}${queryString}`);
    console.log('📋 [REQUEST CONFIG]', {
      method: config.method,
      url: config.url,
      baseURL,
      params: config.params,
    });

    const response = await affiliateApiClient.request(config);
    
    console.log(`📡 [API RESPONSE] Status: ${response.status} | URL: ${fullUrl}${queryString}`);
    console.log('✅ [RESPONSE DATA]', {
      success: response.data?.success,
      hasData: !!response.data?.data,
      hasMessage: !!response.data?.message,
      dataKeys: Object.keys(response.data?.data || {}),
      fullStructure: response.data,
    });

    // Return the full response data - services handle the wrapper structure
    // Backend wraps responses as { success, data, message }
    return response.data;
  } catch (error: any) {
    // Log error details
    const baseURL = affiliateApiClient.defaults.baseURL || '/api/affiliate';
    const fullUrl = `${baseURL}${config.url}`;
    const queryString = config.params ? `?${new URLSearchParams(config.params).toString()}` : '';
    
    const rawError = error?.originalError || error;
    const responseData = rawError.response?.data ?? error.response?.data;

    console.error(`❌ [API ERROR] ${config.method?.toUpperCase()} ${fullUrl}${queryString}`);
    console.error('🔴 [ERROR DETAILS]', {
      status: rawError.response?.status ?? error.status,
      statusText: rawError.response?.statusText,
      message: error.message,
      url: rawError.config?.url ?? config.url,
      fullUrl: fullUrl + queryString,
      requestData: config.data,
      responseData,
      responseKeys: responseData && typeof responseData === 'object' ? Object.keys(responseData) : undefined,
      stack: error.stack,
    });

    if (error instanceof AffiliateApiError) {
      throw error;
    }
    throw new AffiliateApiError({
      message: 'An unexpected error occurred',
      status: 0,
      retryable: false,
    });
  }
}

// Utility to clear cache
export const clearApiCache = () => cache.clear();

// Export types
export type { AxiosRequestConfig, AxiosResponse };