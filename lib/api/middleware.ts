/**
 * API Middleware for TradeAutopsy
 */

import { NextRequest, NextResponse } from 'next/server';
import { ValidationError } from '@/lib/validation/schemas';
import { createClient } from '@/utils/supabase/server';

interface RateLimitConfig {
  requests: number;
  window: `${number} ${'s' | 'm' | 'h' | 'd'}`;
}

interface MiddlewareConfig {
  rateLimit?: RateLimitConfig;
  requireAuth?: boolean;
  validateBody?: any;
  validateQuery?: any;
}

interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
  };
  profileId?: string;
}

type ApiHandler<T = unknown> = (
  req: AuthenticatedRequest,
  context?: { params: Record<string, string> }
) => Promise<T>;

let rateLimiter: any = null;

function getRateLimiter(config: RateLimitConfig): any | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  try {
    const { Ratelimit } = require('@upstash/ratelimit');
    const { Redis } = require('@upstash/redis');
    
    if (!rateLimiter) {
      rateLimiter = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(config.requests, config.window),
        analytics: true,
        prefix: 'tradeautopsy:ratelimit:',
      });
    }
    return rateLimiter;
  } catch {
    return null;
  }
}

export const rateLimitConfigs = {
  standard: { requests: 100, window: '1 m' } as RateLimitConfig,
  auth: { requests: 10, window: '1 m' } as RateLimitConfig,
  ai: { requests: 20, window: '1 m' } as RateLimitConfig,
  import: { requests: 5, window: '1 m' } as RateLimitConfig,
  export: { requests: 10, window: '1 m' } as RateLimitConfig,
};

export function successResponse<T>(
  data: T,
  options: { status?: number; headers?: Record<string, string> } = {}
): NextResponse {
  const { status = 200, headers = {} } = options;
  
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }
  );
}

export function errorResponse(
  message: string,
  options: {
    status?: number;
    code?: string;
    details?: unknown;
    headers?: Record<string, string>;
  } = {}
): NextResponse {
  const { status = 500, code = 'INTERNAL_ERROR', details, headers = {} } = options;

  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        details,
      },
      timestamp: new Date().toISOString(),
    },
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }
  );
}

export function validationErrorResponse(error: ValidationError): NextResponse {
  return errorResponse('Validation failed', {
    status: 400,
    code: 'VALIDATION_ERROR',
    details: error.errors,
  });
}

export function rateLimitResponse(retryAfter: number): NextResponse {
  return errorResponse('Rate limit exceeded', {
    status: 429,
    code: 'RATE_LIMIT_EXCEEDED',
    headers: {
      'Retry-After': String(retryAfter),
      'X-RateLimit-Remaining': '0',
    },
  });
}

export function unauthorizedResponse(message = 'Unauthorized'): NextResponse {
  return errorResponse(message, {
    status: 401,
    code: 'UNAUTHORIZED',
  });
}

export function withMiddleware<T>(
  handler: ApiHandler<T>,
  config: MiddlewareConfig = {}
): (req: NextRequest, context?: { params: Record<string, string> }) => Promise<NextResponse> {
  return async (req: NextRequest, context?: { params: Record<string, string> }) => {
    try {
      if (config.rateLimit) {
        const limiter = getRateLimiter(config.rateLimit);
        if (limiter) {
          const identifier = req.headers.get('authorization') || 
            req.headers.get('x-forwarded-for')?.split(',')[0] || 
            'unknown';
          const { success, reset } = await limiter.limit(identifier);
          if (!success) {
            const retryAfter = Math.ceil((reset - Date.now()) / 1000);
            return rateLimitResponse(retryAfter);
          }
        }
      }

      let user: { id: string; email: string } | null = null;
      
      if (config.requireAuth) {
        const supabase = await createClient();
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        
        if (error || !authUser) {
          return unauthorizedResponse();
        }
        
        user = { id: authUser.id, email: authUser.email || '' };
      }

      if (config.validateQuery) {
        const url = new URL(req.url);
        const query = Object.fromEntries(url.searchParams.entries());
        const result = config.validateQuery.safeParse(query);
        if (!result.success) {
          throw new ValidationError(
            'Invalid query parameters',
            result.error.errors.map((e: any) => ({
              field: e.path.join('.'),
              message: e.message,
            }))
          );
        }
      }

      if (config.validateBody && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        let body: unknown;
        try {
          body = await req.json();
        } catch {
          return errorResponse('Invalid JSON body', {
            status: 400,
            code: 'INVALID_JSON',
          });
        }
        
        const result = config.validateBody.safeParse(body);
        if (!result.success) {
          throw new ValidationError(
            'Invalid request body',
            result.error.errors.map((e: any) => ({
              field: e.path.join('.'),
              message: e.message,
            }))
          );
        }
      }

      const authenticatedReq = req as AuthenticatedRequest;
      if (user) {
        authenticatedReq.user = user;
      }

      const profileId = req.headers.get('x-profile-id') || 
        req.cookies.get('selected_profile_id')?.value;
      
      if (profileId) {
        authenticatedReq.profileId = profileId;
      }

      const result = await handler(authenticatedReq, context);

      if (result instanceof NextResponse) {
        return result;
      }

      return successResponse(result);

    } catch (error) {
      console.error('[API Error]', error);

      if (error instanceof ValidationError) {
        return validationErrorResponse(error);
      }

      if (error instanceof Error) {
        const message = process.env.NODE_ENV === 'development'
          ? error.message
          : 'An unexpected error occurred';
        
        return errorResponse(message, {
          status: 500,
          code: 'INTERNAL_ERROR',
        });
      }

      return errorResponse('An unexpected error occurred', {
        status: 500,
        code: 'INTERNAL_ERROR',
      });
    }
  };
}

export function corsHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'https://tradeautopsy.in',
    'https://www.tradeautopsy.in',
  ].filter(Boolean);

  return {
    'Access-Control-Allow-Origin': 
      origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Profile-Id',
    'Access-Control-Max-Age': '86400',
  };
}

export function optionsHandler(req: NextRequest): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get('origin') || undefined),
  });
}

export type { AuthenticatedRequest, MiddlewareConfig, ApiHandler };
