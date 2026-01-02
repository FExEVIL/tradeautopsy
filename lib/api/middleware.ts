/**
 * API Middleware System
 * Rate limiting, request handling, validation, and response helpers
 */

import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import type { ApiResponse, ApiError } from '@/lib/types'

// ============================================
// RATE LIMITING CONFIGURATIONS
// ============================================

let redisClient: Redis | null = null

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
} catch (error) {
  console.warn('Redis not configured for rate limiting')
}

// Rate limit configurations
const rateLimitConfigs = {
  standard: {
    limit: 100,
    window: '1 m',
  },
  auth: {
    limit: 10,
    window: '1 m',
  },
  ai: {
    limit: 20,
    window: '1 m',
  },
  import: {
    limit: 5,
    window: '1 m',
  },
} as const

function createRatelimit(config: { limit: number; window: string }) {
  if (!redisClient) {
    // Fallback: No rate limiting if Redis not available
    return {
      limit: async () => ({ success: true, limit: config.limit, remaining: config.limit, reset: Date.now() }),
    }
  }

  return new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(config.limit, config.window),
    analytics: true,
  })
}

const rateLimiters = {
  standard: createRatelimit(rateLimitConfigs.standard),
  auth: createRatelimit(rateLimitConfigs.auth),
  ai: createRatelimit(rateLimitConfigs.ai),
  import: createRatelimit(rateLimitConfigs.import),
}

// ============================================
// MIDDLEWARE OPTIONS
// ============================================

export interface MiddlewareOptions {
  rateLimit?: keyof typeof rateLimitConfigs
  requireAuth?: boolean
  validateBody?: z.ZodSchema
  validateQuery?: z.ZodSchema
  requireProfile?: boolean
}

// ============================================
// MIDDLEWARE WRAPPER
// ============================================

export function withMiddleware<T = any>(
  handler: (req: NextRequest, context: { userId: string | null; profileId: string | null }) => Promise<NextResponse<ApiResponse<T>>>,
  options: MiddlewareOptions = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // 1. Rate limiting
      if (options.rateLimit) {
        const identifier = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
        const rateLimitResult = await rateLimiters[options.rateLimit].limit(identifier)

        if (!rateLimitResult.success) {
          return rateLimitResponse(rateLimitResult.reset)
        }
      }

      // 2. Authentication
      let userId: string | null = null
      let profileId: string | null = null

      if (options.requireAuth !== false) {
        const supabase = await createClient()
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        // Check WorkOS auth (fallback)
        const cookieHeader = req.headers.get('cookie') || ''
        const workosUserId = cookieHeader.match(/workos_user_id=([^;]+)/)?.[1]
        const workosProfileId = cookieHeader.match(/workos_profile_id=([^;]+)/)?.[1] || 
                                cookieHeader.match(/active_profile_id=([^;]+)/)?.[1]

        // Must have either Supabase user OR WorkOS session
        if ((authError || !user) && !workosUserId) {
          return unauthorizedResponse('Authentication required')
        }

        // CRITICAL: For WorkOS users, we need to look up the profile to get the correct user_id
        // This is because trades are linked to user_id, not workos_profile_id
        if (workosProfileId && !user) {
          // Look up the profile to get the associated user_id
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, user_id')
            .eq('id', workosProfileId)
            .maybeSingle()
          
          if (profile) {
            // Use user_id if available (for linked accounts), otherwise use profile id
            userId = profile.user_id || profile.id
            profileId = profile.id
          } else {
            userId = workosProfileId
            profileId = workosProfileId
          }
        } else {
          userId = user?.id || workosProfileId || null
          
          // Extract profile ID from header or cookie
          const profileHeader = req.headers.get('x-profile-id')
          if (profileHeader) {
            profileId = profileHeader === 'null' ? null : profileHeader
          } else {
            // Try to get from cookie or user preferences
            const cookieProfileId = req.cookies.get('profile_id')?.value || workosProfileId
            profileId = cookieProfileId === 'null' || !cookieProfileId ? null : cookieProfileId
          }
        }
      }

      // 3. Body validation
      if (options.validateBody) {
        try {
          const body = await req.json()
          options.validateBody.parse(body)
          // Re-create request with validated body (attach to request)
          ;(req as any).validatedBody = body
        } catch (error) {
          if (error instanceof z.ZodError) {
            return validationErrorResponse(error)
          }
          return errorResponse('Invalid request body', 400)
        }
      }

      // 4. Query validation
      if (options.validateQuery) {
        try {
          const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries())
          options.validateQuery.parse(searchParams)
          ;(req as any).validatedQuery = searchParams
        } catch (error) {
          if (error instanceof z.ZodError) {
            return validationErrorResponse(error)
          }
          return errorResponse('Invalid query parameters', 400)
        }
      }

      // 5. Profile requirement
      if (options.requireProfile && !profileId) {
        return errorResponse('Profile ID is required', 400)
      }

      // 6. Call handler
      // For public routes (requireAuth: false), userId can be null
      // The handler should handle this case appropriately
      return await handler(req, { userId: userId || null, profileId })
    } catch (error) {
      console.error('Middleware error:', error)
      return errorResponse('Internal server error', 500)
    }
  }
}

// ============================================
// RESPONSE HELPERS
// ============================================

export function successResponse<T>(data: T, status: number = 200, meta?: ApiResponse<T>['meta']): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
    } as ApiResponse<T>,
    { status }
  )
}

export function errorResponse(message: string, status: number = 500, code?: string, details?: Record<string, any>): NextResponse<ApiResponse<never>> {
  // Ensure message is a valid string
  const errorMessage = typeof message === 'string' && message.trim() && message !== '[object Object]'
    ? message
    : 'An unexpected error occurred'

  const error: ApiError = {
    code: code || 'INTERNAL_ERROR',
    message: errorMessage,
    ...(details && { details }),
  }

  return NextResponse.json(
    {
      success: false,
      error,
    } as ApiResponse<never>,
    { status }
  )
}

export function validationErrorResponse(zodError: z.ZodError): NextResponse<ApiResponse<never>> {
  const firstError = zodError.errors[0]
  const error: ApiError = {
    code: 'VALIDATION_ERROR',
    message: firstError.message,
    field: firstError.path.join('.'),
    details: zodError.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })),
  }

  return NextResponse.json(
    {
      success: false,
      error,
    } as ApiResponse<never>,
    { status: 400 }
  )
}

export function rateLimitResponse(reset: number): NextResponse<ApiResponse<never>> {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000)
  const error: ApiError = {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please try again later.',
  }

  return NextResponse.json(
    {
      success: false,
      error,
    } as ApiResponse<never>,
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Reset': reset.toString(),
      },
    }
  )
}

export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse<ApiResponse<never>> {
  const error: ApiError = {
    code: 'UNAUTHORIZED',
    message,
  }

  return NextResponse.json(
    {
      success: false,
      error,
    } as ApiResponse<never>,
    { status: 401 }
  )
}

export function forbiddenResponse(message: string = 'Forbidden'): NextResponse<ApiResponse<never>> {
  const error: ApiError = {
    code: 'FORBIDDEN',
    message,
  }

  return NextResponse.json(
    {
      success: false,
      error,
    } as ApiResponse<never>,
    { status: 403 }
  )
}

export function notFoundResponse(message: string = 'Resource not found'): NextResponse<ApiResponse<never>> {
  const error: ApiError = {
    code: 'NOT_FOUND',
    message,
  }

  return NextResponse.json(
    {
      success: false,
      error,
    } as ApiResponse<never>,
    { status: 404 }
  )
}

// ============================================
// CORS HANDLING
// ============================================

export function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Profile-ID',
    'Access-Control-Max-Age': '86400',
  }
}

export function optionsHandler(): NextResponse {
  return NextResponse.json({}, { headers: corsHeaders() })
}

// ============================================
// EXPORTS
// ============================================
// All functions are already exported above
