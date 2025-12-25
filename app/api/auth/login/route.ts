/**
 * WorkOS Password Authentication API Route
 * Handles email/password login via WorkOS User Management
 */

import { NextRequest, NextResponse } from 'next/server'
import { workos, WORKOS_CLIENT_ID } from '@/lib/workos'
import { setSession } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if WorkOS is configured
    if (!workos) {
      return NextResponse.json(
        { error: 'Authentication service not configured' },
        { status: 500 }
      )
    }

    if (!WORKOS_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Authentication client not configured' },
        { status: 500 }
      )
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Get request context for enhanced security
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      undefined
    const userAgent = request.headers.get('user-agent') || undefined

    try {
      // Authenticate with WorkOS
      const authResponse = await workos.userManagement.authenticateWithPassword({
        clientId: WORKOS_CLIENT_ID,
        email: normalizedEmail,
        password,
        ipAddress,
        userAgent,
      })

      const { user } = authResponse

      // Check if email is verified (optional - depends on your requirements)
      if (!user.emailVerified && process.env.NODE_ENV === 'development') {
        // You can choose to enforce email verification or not
        // For now, we'll allow login but flag it
        console.log('[Login] User email not verified:', user.id)
      }

      // Get or create profile in Supabase
      const supabase = createAdminClient()
      
      // Check for existing profile
      let { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('workos_user_id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is expected for new users
        if (process.env.NODE_ENV === 'development') {
          console.error('[Login] Profile lookup error:', profileError)
        }
      }

      // Create profile if doesn't exist
      if (!existingProfile) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            workos_user_id: user.id,
            user_id: user.id, // Use WorkOS user ID as user_id
            email: normalizedEmail,
            name: user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}`.trim()
              : user.firstName || 'Default',
            type: 'equity',
            is_default: true,
            auth_provider: 'workos',
            onboarding_completed: false,
            plan_type: 'hobby',
            email_verified: user.emailVerified,
            first_name: user.firstName,
            last_name: user.lastName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (createError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[Login] Profile creation error:', createError)
          }
          // Don't fail login if profile creation fails
        } else {
          existingProfile = newProfile
        }
      } else {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            email: normalizedEmail,
            email_verified: user.emailVerified,
            first_name: user.firstName,
            last_name: user.lastName,
            updated_at: new Date().toISOString(),
          })
          .eq('workos_user_id', user.id)

        if (updateError && process.env.NODE_ENV === 'development') {
          console.error('[Login] Profile update error:', updateError)
        }
      }

      // Create session
      await setSession({
        userId: user.id,
        email: user.email,
        workosUserId: user.id,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        emailVerified: user.emailVerified,
        profileId: existingProfile?.id,
      })

      // Log successful login (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log('[Login] Success:', {
          userId: user.id,
          email: normalizedEmail,
          emailVerified: user.emailVerified,
          profileId: existingProfile?.id,
        })
      }

      // Return success response
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified,
        },
        needsOnboarding: existingProfile ? !existingProfile.onboarding_completed : true,
      })

    } catch (authError: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Login] WorkOS auth error:', authError)
      }

      // Handle specific WorkOS errors
      const errorMessage = authError.message || authError.rawData?.message || ''
      const errorCode = authError.code || authError.rawData?.code || ''
      
      if (errorCode === 'invalid_credentials' || 
          errorMessage.toLowerCase().includes('invalid') ||
          errorMessage.toLowerCase().includes('credentials')) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      if (errorCode === 'email_not_verified' ||
          errorMessage.toLowerCase().includes('not verified')) {
        return NextResponse.json(
          { error: 'Please verify your email before logging in' },
          { status: 403 }
        )
      }

      if (errorCode === 'user_not_found' ||
          errorMessage.toLowerCase().includes('not found')) {
        return NextResponse.json(
          { error: 'No account found with this email. Please sign up first.' },
          { status: 404 }
        )
      }

      if (errorMessage.toLowerCase().includes('rate limit')) {
        return NextResponse.json(
          { error: 'Too many login attempts. Please try again later.' },
          { status: 429 }
        )
      }

      // Generic error
      return NextResponse.json(
        { error: 'Login failed. Please try again.' },
        { status: 401 }
      )
    }

  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Login] Server error:', error)
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

