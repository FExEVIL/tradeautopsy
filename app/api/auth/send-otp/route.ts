/**
 * Optimized Send OTP API Route
 * Uses middleware, validation, and error handling
 */

import { NextRequest } from 'next/server'
import { withMiddleware, successResponse, errorResponse } from '@/lib/api/middleware'
import { z } from 'zod'
import { sendMagicAuthCode } from '@/lib/auth/workos-optimized'
import { handleError } from '@/lib/utils/error-handler'
import { logApiCall } from '@/lib/utils/logger'

const sendOTPSchema = z.object({
  email: z.string().email('Invalid email address').transform((val) => val.toLowerCase().trim()),
})

export const POST = withMiddleware(
  async (req: NextRequest, { userId, profileId }: { userId: string | null; profileId: string | null }) => {
    const timer = performance.now()
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

    try {
      const body = (req as any).validatedBody || await req.json()
      const { email } = sendOTPSchema.parse(body)

      // Send OTP via WorkOS Magic Auth
      await sendMagicAuthCode(email)

      const duration = performance.now() - timer
      logApiCall('POST', '/api/auth/send-otp', 200, duration)

      return successResponse(
        {
          message: 'Verification code sent to your email',
          email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email for security
        },
        200
      )
    } catch (error) {
      const duration = performance.now() - timer
      const appError = handleError(error, { endpoint: '/api/auth/send-otp', ipAddress })
      
      // Ensure we have a valid error message
      const errorMessage = appError.message && appError.message !== '[object Object]' 
        ? appError.message 
        : 'Failed to send verification code. Please try again.'
      
      logApiCall('POST', '/api/auth/send-otp', appError.statusCode, duration, undefined, {
        code: appError.code,
        message: errorMessage,
        statusCode: appError.statusCode,
      })

      return errorResponse(
        errorMessage,
        appError.statusCode,
        appError.code
      )
    }
  },
  {
    rateLimit: 'auth', // Stricter rate limit for auth endpoints
    requireAuth: false,
    validateBody: sendOTPSchema,
  }
)

