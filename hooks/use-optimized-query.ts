/**
 * Optimized Query Hook
 * Request deduplication, caching, stale-while-revalidate, retry logic
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getCache, setCache, CacheKeys, CacheTTL, type CacheOptions } from '@/lib/cache/redis'

// ============================================
// TYPES
// ============================================

export interface UseOptimizedQueryOptions<T> {
  enabled?: boolean
  staleTime?: number
  refetchInterval?: number
  retry?: number
  retryDelay?: number
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  cacheOptions?: CacheOptions
}

export interface UseOptimizedQueryResult<T> {
  data: T | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => Promise<void>
  invalidate: () => void
}

// ============================================
// REQUEST DEDUPLICATION
// ============================================

const inFlightRequests = new Map<string, Promise<any>>()

function deduplicateRequest<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const existingRequest = inFlightRequests.get(key)
  if (existingRequest) {
    return existingRequest as Promise<T>
  }

  const request = fetcher()
    .then((result) => {
      inFlightRequests.delete(key)
      return result
    })
    .catch((error) => {
      inFlightRequests.delete(key)
      throw error
    })

  inFlightRequests.set(key, request)
  return request
}

// ============================================
// QUERY HOOK
// ============================================

export function useOptimizedQuery<T>(
  key: string | string[],
  fetcher: () => Promise<T>,
  options: UseOptimizedQueryOptions<T> = {}
): UseOptimizedQueryResult<T> {
  const {
    enabled = true,
    staleTime = 30000, // 30 seconds default
    refetchInterval,
    retry = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    cacheOptions = {},
  } = options

  const cacheKey = Array.isArray(key) ? key.join(':') : key
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Retry logic with exponential backoff
  const fetchWithRetry = useCallback(
    async (attempt: number = 1): Promise<T> => {
      try {
        // Check cache first
        const cached = await getCache<T>(cacheKey, cacheOptions)
        const now = Date.now()

        // Return cached data if still fresh
        if (cached && now - lastFetchTime < staleTime) {
          return cached
        }

        // Fetch fresh data with deduplication
        const result = await deduplicateRequest(cacheKey, async () => {
          const response = await fetcher()
          // Cache the result
          await setCache(cacheKey, response, {
            ttl: staleTime,
            ...cacheOptions,
          })
          return response
        })

        setLastFetchTime(now)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))

        // Retry on failure
        if (attempt < retry) {
          const delay = retryDelay * Math.pow(2, attempt - 1)
          await new Promise((resolve) => setTimeout(resolve, delay))
          return fetchWithRetry(attempt + 1)
        }

        throw error
      }
    },
    [cacheKey, fetcher, staleTime, retry, retryDelay, lastFetchTime, cacheOptions]
  )

  // Main fetch function
  const fetchData = useCallback(async () => {
    if (!enabled) {
      return
    }

    setIsLoading(true)
    setIsError(false)
    setError(null)

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      const result = await fetchWithRetry()
      setData(result)
      setIsLoading(false)
      onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      setIsError(true)
      setIsLoading(false)
      onError?.(error)
    }
  }, [enabled, fetchWithRetry, onSuccess, onError])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Refetch on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (enabled && Date.now() - lastFetchTime > staleTime) {
        fetchData()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [enabled, lastFetchTime, staleTime, fetchData])

  // Refetch interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      intervalRef.current = setInterval(() => {
        fetchData()
      }, refetchInterval)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [refetchInterval, enabled, fetchData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Refetch function
  const refetch = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  // Invalidate function
  const invalidate = useCallback(async () => {
    const { deleteCache } = await import('@/lib/cache/redis')
    await deleteCache(cacheKey)
    setData(null)
    setLastFetchTime(0)
  }, [cacheKey])

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    invalidate,
  }
}

// ============================================
// MUTATION HOOK
// ============================================

export interface UseOptimizedMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData) => void
  onError?: (error: Error) => void
  invalidateKeys?: string[]
}

export interface UseOptimizedMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => void
  mutateAsync: (variables: TVariables) => Promise<TData>
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  error: Error | null
  reset: () => void
}

export function useOptimizedMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseOptimizedMutationOptions<TData, TVariables> = {}
): UseOptimizedMutationResult<TData, TVariables> {
  const { onSuccess, onError, invalidateKeys = [] } = options

  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setIsLoading(true)
      setIsError(false)
      setIsSuccess(false)
      setError(null)

      try {
        const result = await mutationFn(variables)

        // Invalidate cache keys
        if (invalidateKeys.length > 0) {
          const { deleteCache } = await import('@/lib/cache/redis')
          for (const key of invalidateKeys) {
            await deleteCache(key)
          }
        }

        setIsLoading(false)
        setIsSuccess(true)
        onSuccess?.(result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        setIsError(true)
        setIsLoading(false)
        onError?.(error)
        throw error
      }
    },
    [mutationFn, invalidateKeys, onSuccess, onError]
  )

  const mutate = useCallback(
    (variables: TVariables) => {
      mutateAsync(variables).catch(() => {
        // Error already handled in mutateAsync
      })
    },
    [mutateAsync]
  )

  const reset = useCallback(() => {
    setIsLoading(false)
    setIsError(false)
    setIsSuccess(false)
    setError(null)
  }, [])

  return {
    mutate,
    mutateAsync,
    isLoading,
    isError,
    isSuccess,
    error,
    reset,
  }
}
