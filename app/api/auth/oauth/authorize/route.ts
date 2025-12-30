/**
 * Optimized OAuth Authorization Route
 * Generates authorization URLs for OAuth providers
 */

import { NextRequest } from 'next/server'
import { withMiddleware, successResponse, errorResponse } from '@/lib/api/middleware'
import { z } from 'zod'
import { getAuthorizationUrl, type OAuthProvider } from '@/lib/auth/workos-optimized'
import { handleError } from '@/lib/utils/error-handler'
import { logApiCall } from '@/lib/utils/logger'

const authorizeSchema = z.object({
  provider: z.enum(['GoogleOAuth', 'GitHubOAuth', 'MicrosoftOAuth', 'AppleOAuth'], {
    errorMap: () => ({ message: 'Invalid OAuth provider' }),
  }),
})

export const POST = withMiddleware(
  async (req: NextRequest, { userId, profileId }: { userId: string | null; profileId: string | null }) => {
    const timer = performance.now()

    try {
      const body = (req as any).validatedBody || await req.json()
      const { provider } = authorizeSchema.parse(body)

      console.log('[OAuth Authorize] Request for provider:', provider)

      const authorizationUrl = getAuthorizationUrl(provider as OAuthProvider)

      console.log('[OAuth Authorize] Generated URL:', authorizationUrl ? authorizationUrl.substring(0, 50) + '...' : 'null')

      const duration = performance.now() - timer
      logApiCall('POST', '/api/auth/oauth/authorize', 200, duration)

      const response = successResponse(
        {
          authorizationUrl,
          provider,
        },
        200
      )

      console.log('[OAuth Authorize] Response structure:', {
        hasData: !!response,
        willHaveData: true,
        willHaveAuthorizationUrl: !!authorizationUrl,
      })

      return response
    } catch (error) {
      const duration = performance.now() - timer
      const appError = handleError(error)
      logApiCall('POST', '/api/auth/oauth/authorize', appError.statusCode, duration, undefined, appError)

      return errorResponse(
        appError.message,
        appError.statusCode,
        appError.code
      )
    }
  },
  {
    rateLimit: 'auth',
    requireAuth: false,
    validateBody: authorizeSchema,
  }
)

