/**
 * Optimized Trades API Route
 * Uses middleware, caching, and validation
 */

import { NextRequest } from 'next/server'
import { withMiddleware, successResponse, errorResponse } from '@/lib/api/middleware'
import { createTradeSchema, tradeFiltersSchema } from '@/lib/validation/schemas'
import { getCachedTrades, invalidateTradesCaches } from '@/lib/cache/query-cache'
import { createClient } from '@/utils/supabase/server'
import { handleError } from '@/lib/utils/error-handler'
import { logApiCall } from '@/lib/utils/logger'
import type { Trade, PaginatedResponse } from '@/lib/types'

// GET /api/trades - Get paginated trades
export const GET = withMiddleware(
  async (req: NextRequest, { userId, profileId }) => {
    const timer = performance.now()

    try {
      const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries())
      const validated = tradeFiltersSchema.parse({
        ...searchParams,
        profileId,
        page: parseInt(searchParams.page || '0'),
        pageSize: parseInt(searchParams.pageSize || '20'),
      })

      const trades = await getCachedTrades(
        userId,
        profileId,
        {
          startDate: validated.startDate ? new Date(validated.startDate) : undefined,
          endDate: validated.endDate ? new Date(validated.endDate) : undefined,
          symbol: validated.symbol,
          strategy: validated.strategy,
          page: validated.page,
          pageSize: validated.pageSize,
        }
      )

      // Get total count for pagination
      const supabase = await createClient()
      let countQuery = supabase
        .from('trades')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('deleted_at', null)

      if (profileId) {
        countQuery = countQuery.eq('profile_id', profileId)
      }

      if (validated.startDate) {
        countQuery = countQuery.gte('trade_date', validated.startDate)
      }

      if (validated.endDate) {
        countQuery = countQuery.lte('trade_date', validated.endDate)
      }

      const { count } = await countQuery

      const duration = performance.now() - timer
      logApiCall('GET', '/api/trades', 200, duration, userId)

      return successResponse<Trade[]>(
        trades,
        200,
        {
          page: validated.page,
          pageSize: validated.pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / validated.pageSize),
        }
      )
    } catch (error) {
      const duration = performance.now() - timer
      const appError = handleError(error)
      logApiCall('GET', '/api/trades', appError.statusCode, duration, userId, appError)
      return errorResponse(appError.message, appError.statusCode, appError.code)
    }
  },
  {
    rateLimit: 'standard',
    requireAuth: true,
    validateQuery: tradeFiltersSchema,
  }
)

// POST /api/trades - Create new trade
export const POST = withMiddleware(
  async (req: NextRequest, { userId, profileId }) => {
    const timer = performance.now()

    try {
      const body = (req as any).validatedBody || await req.json()
      const validated = createTradeSchema.parse(body)

      const supabase = await createClient()

      const { data, error } = await supabase
        .from('trades')
        .insert({
          ...validated,
          user_id: userId,
          profile_id: profileId || validated.profile_id || null,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Invalidate caches
      await invalidateTradesCaches(userId, profileId || null)

      const duration = performance.now() - timer
      logApiCall('POST', '/api/trades', 201, duration, userId)

      return successResponse<Trade>(data, 201)
    } catch (error) {
      const duration = performance.now() - timer
      const appError = handleError(error)
      logApiCall('POST', '/api/trades', appError.statusCode, duration, userId, appError)
      return errorResponse(appError.message, appError.statusCode, appError.code)
    }
  },
  {
    rateLimit: 'standard',
    requireAuth: true,
    validateBody: createTradeSchema,
  }
)

