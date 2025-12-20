/**
 * Optimized Dashboard API Route
 * Uses cached metrics function
 */

import { NextRequest } from 'next/server'
import { withMiddleware, successResponse, errorResponse } from '@/lib/api/middleware'
import { getCachedDashboardMetrics } from '@/lib/cache/query-cache'
import { handleError } from '@/lib/utils/error-handler'
import { logApiCall } from '@/lib/utils/logger'
import type { DashboardMetrics } from '@/lib/types'

export const GET = withMiddleware(
  async (req: NextRequest, { userId, profileId }) => {
    const timer = performance.now()

    try {
      const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries())
      const startDate = searchParams.start ? new Date(searchParams.start) : undefined
      const endDate = searchParams.end ? new Date(searchParams.end) : undefined

      const metrics = await getCachedDashboardMetrics(
        userId,
        profileId,
        {
          start: startDate,
          end: endDate,
        }
      )

      const duration = performance.now() - timer
      logApiCall('GET', '/api/dashboard', 200, duration, userId)

      return successResponse<DashboardMetrics>(metrics, 200)
    } catch (error) {
      const duration = performance.now() - timer
      const appError = handleError(error)
      logApiCall('GET', '/api/dashboard', appError.statusCode, duration, userId, appError)
      return errorResponse(appError.message, appError.statusCode, appError.code)
    }
  },
  {
    rateLimit: 'standard',
    requireAuth: true,
  }
)

