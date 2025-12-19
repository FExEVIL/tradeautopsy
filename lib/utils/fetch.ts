// ════════════════════════════════════════════════════════════════════
// FETCH UTILITY - Handles absolute/relative URLs correctly
// ════════════════════════════════════════════════════════════════════

/**
 * Get the base URL for API calls
 * Works in both server and client components
 */
export function getBaseUrl(): string {
  // Server-side
  if (typeof window === 'undefined') {
    // Check if running on Vercel
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    // Check if custom domain is set
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL;
    }
    // Local development
    return 'http://localhost:3000';
  }
  
  // Client-side - use current origin
  return window.location.origin;
}

/**
 * Make an API request with automatic URL handling
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`API Request failed [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * Client-side only fetch (use in 'use client' components)
 */
export async function clientFetch<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  if (typeof window === 'undefined') {
    throw new Error('clientFetch can only be used in client components');
  }
  
  return apiRequest<T>(endpoint, options);
}
