/**
 * Optimized Verify OTP API Route
 * Uses middleware, validation, and creates session
 */

import { NextRequest } from 'next/server'
import { withMiddleware, successResponse, errorResponse } from '@/lib/api/middleware'
import { z } from 'zod'
import { authenticateWithMagicAuth } from '@/lib/auth/workos-optimized'
import { createClient } from '@/utils/supabase/server'
import { handleError } from '@/lib/utils/error-handler'
import { logApiCall, logEvent } from '@/lib/utils/logger'
import type { AppError } from '@/lib/utils/error-handler'

const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email address').transform((val) => val.toLowerCase().trim()),
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d{6}$/, 'Code must contain only numbers'),
})

export const POST = withMiddleware(
  async (req: NextRequest, { userId, profileId }: { userId: string | null; profileId: string | null }) => {
    const timer = performance.now()
    const ipAddress = req.headers.get('x-forwarded-for') || undefined
    const userAgent = req.headers.get('user-agent') || undefined

    try {
      const body = (req as any).validatedBody || await req.json()
      const { email, code } = verifyOTPSchema.parse(body)

      // Authenticate with WorkOS Magic Auth
      const workosUser = await authenticateWithMagicAuth(email, code, ipAddress, userAgent)

      // Get or create Supabase user and profile
      const supabase = await createClient()
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (!serviceKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured')
      }

      const { createClient: createAdminClient } = await import('@supabase/supabase-js')
      const adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey
      )

      let userId: string
      let profileId: string

      // Check for existing profile by workos_user_id
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('workos_user_id', workosUser.id)
        .maybeSingle()

      if (existingProfile) {
        userId = existingProfile.user_id
        profileId = existingProfile.id

        // Update last sign-in
        await supabase
          .from('profiles')
          .update({
            last_sign_in_at: new Date().toISOString(),
            email_verified: workosUser.emailVerified ?? existingProfile.email_verified,
            profile_picture_url: workosUser.profilePictureUrl || existingProfile.profile_picture_url,
          })
          .eq('id', profileId)
      } else {
        // Find or create Supabase auth user
        const { data: authUsers } = await adminSupabase.auth.admin.listUsers()
        const existingAuthUser = authUsers?.users?.find((u: any) => u.email === workosUser.email)

        if (existingAuthUser) {
          userId = existingAuthUser.id
        } else {
          // Create new Supabase auth user
          const { data: newAuthUser, error: authError } = await adminSupabase.auth.admin.createUser({
            email: workosUser.email,
            email_confirm: true,
            user_metadata: {
              full_name: `${workosUser.firstName || ''} ${workosUser.lastName || ''}`.trim() || workosUser.email,
              avatar_url: workosUser.profilePictureUrl,
            },
          })

          if (authError || !newAuthUser?.user) {
            throw new Error(`Failed to create user: ${authError?.message || 'Unknown error'}`)
          }

          userId = newAuthUser.user.id
        }

        // Check for existing profile by user_id
        const { data: existingProfileByUserId } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()

        if (existingProfileByUserId) {
          profileId = existingProfileByUserId.id

          // Update with WorkOS info
          await supabase
            .from('profiles')
            .update({
              workos_user_id: workosUser.id,
              auth_provider: 'workos',
              email_verified: workosUser.emailVerified ?? existingProfileByUserId.email_verified,
              profile_picture_url: workosUser.profilePictureUrl || existingProfileByUserId.profile_picture_url,
              last_sign_in_at: new Date().toISOString(),
            })
            .eq('id', profileId)
        } else {
          // Create new profile
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: userId,
              name: `${workosUser.firstName || ''} ${workosUser.lastName || ''}`.trim() || workosUser.email || 'Default',
              workos_user_id: workosUser.id,
              auth_provider: 'workos',
              email_verified: workosUser.emailVerified ?? false,
              profile_picture_url: workosUser.profilePictureUrl,
              last_sign_in_at: new Date().toISOString(),
              is_default: true,
            })
            .select()
            .single()

          if (createError || !newProfile) {
            throw new Error(`Failed to create profile: ${createError?.message || 'Unknown error'}`)
          }

          profileId = newProfile.id
        }
      }

      // Create session cookies
      const response = successResponse(
        {
          success: true,
          userId,
          profileId,
        },
        200
      )

      // Set secure cookies
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      }

      response.cookies.set('workos_user_id', workosUser.id, cookieOptions)
      response.cookies.set('workos_profile_id', profileId, cookieOptions)
      response.cookies.set('active_profile_id', profileId, cookieOptions)
      response.cookies.set('workos_email', workosUser.email || email, cookieOptions)

      const duration = performance.now() - timer
      logApiCall('POST', '/api/auth/verify-otp', 200, duration, userId)
      logEvent('user_login', userId, { method: 'otp', provider: 'workos' })

      return response
    } catch (error) {
      const duration = performance.now() - timer
      const appError = handleError(error)
      logApiCall('POST', '/api/auth/verify-otp', appError.statusCode, duration, undefined, appError)

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
    validateBody: verifyOTPSchema,
  }
)

