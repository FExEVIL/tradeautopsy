/**
 * Optimized Query Hook
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isStale: boolean;
}

interface QueryOptions<T> {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchInterval?: number;
  refetchOnFocus?: boolean;
  retry?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  initialData?: T;
}

interface QueryResult<T> extends QueryState<T> {
  refetch: () => Promise<void>;
  invalidate: () => void;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  staleTime: number;
}

const queryCache = new Map<string, CacheEntry<unknown>>();
const inFlightQueries = new Map<string, Promise<unknown>>();

function getCachedData<T>(key: string, staleTime: number): { data: T; isStale: boolean } | null {
  const entry = queryCache.get(key) as CacheEntry<T> | undefined;
  
  if (!entry) return null;
  
  const age = Date.now() - entry.timestamp;
  const isStale = age > staleTime;
  
  return { data: entry.data, isStale };
}

function setCachedData<T>(key: string, data: T, staleTime: number): void {
  queryCache.set(key, {
    data,
    timestamp: Date.now(),
    staleTime,
  });
}

function invalidateCache(key: string): void {
  queryCache.delete(key);
}

export function useOptimizedQuery<T>(
  key: string | string[],
  fetcher: () => Promise<T>,
  options: QueryOptions<T> = {}
): QueryResult<T> {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000,
    cacheTime = 30 * 60 * 1000,
    refetchInterval,
    refetchOnFocus = true,
    retry = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    initialData,
  } = options;

  const queryKey = Array.isArray(key) ? key.join(':') : key;
  const mountedRef = useRef(true);

  const [state, setState] = useState<QueryState<T>>(() => {
    const cached = getCachedData<T>(queryKey, staleTime);
    
    return {
      data: cached?.data ?? initialData ?? null,
      isLoading: !cached && enabled,
      isError: false,
      error: null,
      isStale: cached?.isStale ?? true,
    };
  });

  const fetchData = useCallback(async (): Promise<void> => {
    if (!enabled) return;

    const existingRequest = inFlightQueries.get(queryKey);
    if (existingRequest) {
      try {
        const data = await existingRequest as T;
        if (mountedRef.current) {
          setState({
            data,
            isLoading: false,
            isError: false,
            error: null,
            isStale: false,
          });
        }
        return;
      } catch (error) {
        // Continue to normal handling
      }
    }

    const cached = getCachedData<T>(queryKey, staleTime);
    if (cached && !cached.isStale) {
      if (mountedRef.current) {
        setState({
          data: cached.data,
          isLoading: false,
          isError: false,
          error: null,
          isStale: false,
        });
      }
      return;
    }

    if (mountedRef.current) {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        isStale: true,
      }));
    }

    const fetchPromise = (async () => {
      let lastError: Error | null = null;
      
      for (let attempt = 0; attempt <= retry; attempt++) {
        try {
          const data = await fetcher();
          return data;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          
          if (attempt < retry) {
            await new Promise((resolve) => 
              setTimeout(resolve, retryDelay * Math.pow(2, attempt))
            );
          }
        }
      }
      
      throw lastError;
    })();

    inFlightQueries.set(queryKey, fetchPromise);

    try {
      const data = await fetchPromise;
      
      setCachedData(queryKey, data, staleTime);
      
      if (mountedRef.current) {
        setState({
          data,
          isLoading: false,
          isError: false,
          error: null,
          isStale: false,
        });
        onSuccess?.(data);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      if (mountedRef.current) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isError: true,
          error: err,
        }));
        onError?.(err);
      }
    } finally {
      inFlightQueries.delete(queryKey);
    }
  }, [queryKey, fetcher, enabled, staleTime, retry, retryDelay, onSuccess, onError]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  useEffect(() => {
    if (!refetchInterval || !enabled) return;
    
    const interval = setInterval(fetchData, refetchInterval);
    return () => clearInterval(interval);
  }, [fetchData, refetchInterval, enabled]);

  useEffect(() => {
    if (!refetchOnFocus) return;
    
    const handleFocus = () => {
      const cached = getCachedData<T>(queryKey, staleTime);
      if (!cached || cached.isStale) {
        fetchData();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [queryKey, staleTime, fetchData, refetchOnFocus]);

  const invalidate = useCallback(() => {
    invalidateCache(queryKey);
    fetchData();
  }, [queryKey, fetchData]);

  return {
    ...state,
    refetch: fetchData,
    invalidate,
  };
}

export async function prefetchQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  staleTime: number = 5 * 60 * 1000
): Promise<void> {
  const cached = getCachedData<T>(key, staleTime);
  if (cached && !cached.isStale) return;

  try {
    const data = await fetcher();
    setCachedData(key, data, staleTime);
  } catch {
    // Silently fail - prefetch is best-effort
  }
}
