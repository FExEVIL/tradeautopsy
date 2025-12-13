import { NextRequest, NextResponse } from 'next/server'
import { workos, WORKOS_CLIENT_ID } from '@/lib/workos'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      console.error('[WorkOS] OAuth error:', error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?error=${encodeURIComponent(error)}`
      )
    }

    if (!code) {
      console.error('[WorkOS] No authorization code received')
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?error=no_code`
      )
    }

    if (!workos) {
      throw new Error('WorkOS not configured')
    }

    console.log('[WorkOS] Exchanging code for user profile...')

    // Exchange code for user
    const { user } = await workos.userManagement.authenticateWithCode({
      code,
      clientId: WORKOS_CLIENT_ID,
    })

    console.log('[WorkOS] User authenticated:', {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
    })

    // Get or create user in Supabase
    const supabase = await createClient()

    // Use service role for admin operations if available
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    let adminSupabase: any = null
    
    if (serviceKey) {
      const { createClient: createAdminClient } = await import('@supabase/supabase-js')
      adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey
      )
    }

    let userId: string | null = null
    let profileId: string | null = null

    // Check if profile exists by workos_user_id or email
    const { data: existingProfileByWorkOS } = await supabase
      .from('profiles')
      .select('*')
      .eq('workos_user_id', user.id)
      .maybeSingle()

    if (existingProfileByWorkOS) {
      // Profile exists with this WorkOS ID
      userId = existingProfileByWorkOS.user_id
      profileId = existingProfileByWorkOS.id
      
      // Update last sign in
      await supabase
        .from('profiles')
        .update({
          last_sign_in_at: new Date().toISOString(),
          email_verified: user.emailVerified !== undefined ? user.emailVerified : existingProfileByWorkOS.email_verified,
          profile_picture_url: user.profilePictureUrl || existingProfileByWorkOS.profile_picture_url,
        })
        .eq('id', profileId)
      
      console.log('[WorkOS] Found existing profile by WorkOS ID:', profileId)
    } else {
      // Check if profile exists by email (via user_id lookup)
      // We need to find the auth user first
      if (adminSupabase) {
        // Try to find existing auth user
        const { data: authUsers } = await adminSupabase.auth.admin.listUsers()
        const existingAuthUser = authUsers?.users?.find((u: any) => u.email === user.email)
        
        if (existingAuthUser) {
          userId = existingAuthUser.id
          console.log('[WorkOS] Found existing auth user:', userId)
          
          // Check if profile exists for this user
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle()
          
          if (existingProfile) {
            profileId = existingProfile.id
            // Update with WorkOS info
            await supabase
              .from('profiles')
              .update({
                workos_user_id: user.id,
                auth_provider: 'workos',
                email_verified: user.emailVerified !== undefined ? user.emailVerified : existingProfile.email_verified,
                profile_picture_url: user.profilePictureUrl || existingProfile.profile_picture_url,
                last_sign_in_at: new Date().toISOString(),
              })
              .eq('id', profileId)
            
            console.log('[WorkOS] Updated existing profile with WorkOS info:', profileId)
          } else {
            // Create new profile for existing auth user
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                user_id: userId,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Default',
                workos_user_id: user.id,
                auth_provider: 'workos',
                email_verified: user.emailVerified || false,
                profile_picture_url: user.profilePictureUrl,
                last_sign_in_at: new Date().toISOString(),
                is_default: true,
              })
              .select()
              .single()

            if (createError) {
              console.error('[WorkOS] Failed to create profile:', createError)
              throw new Error(`Failed to create profile: ${createError.message}`)
            }

            profileId = newProfile.id
            console.log('[WorkOS] Created new profile for existing auth user:', profileId)
          }
        } else {
          // Create new auth user and profile
          console.log('[WorkOS] Creating new auth user and profile')
          const { data: newAuthUser, error: authError } = await adminSupabase.auth.admin.createUser({
            email: user.email,
            email_confirm: true,
            user_metadata: {
              full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
              avatar_url: user.profilePictureUrl,
            },
          })

          if (authError || !newAuthUser?.user) {
            console.error('[WorkOS] Failed to create auth user:', authError)
            throw new Error(`Failed to create user: ${authError?.message || 'Unknown error'}`)
          }

          userId = newAuthUser.user.id
          
          // Create profile
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: userId,
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Default',
              workos_user_id: user.id,
              auth_provider: 'workos',
              email_verified: user.emailVerified || false,
              profile_picture_url: user.profilePictureUrl,
              last_sign_in_at: new Date().toISOString(),
              is_default: true,
            })
            .select()
            .single()

          if (createError) {
            console.error('[WorkOS] Failed to create profile:', createError)
            throw new Error(`Failed to create profile: ${createError.message}`)
          }

          profileId = newProfile.id
          console.log('[WorkOS] Created new user and profile:', { userId, profileId })
        }
      } else {
        // No service role key - cannot create users automatically
        // Redirect to signup page with email pre-filled
        console.warn('[WorkOS] Service role key not available')
        return NextResponse.redirect(
          new URL(`/signup?email=${encodeURIComponent(user.email)}&workos_id=${encodeURIComponent(user.id)}`, request.url)
        )
      }
    }

    if (!userId || !profileId) {
      throw new Error('Failed to get or create user')
    }

    // Cookies will be set on the redirect response below

    // For WorkOS users, we'll use cookie-based session
    // Supabase session won't work without password, which is expected

    console.log('[WorkOS] Session created, redirecting to dashboard')

    // Create response with redirect
    const response = NextResponse.redirect(
      new URL('/dashboard', request.url)
    )

    // Set cookies on response
    response.cookies.set('workos_user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    response.cookies.set('workos_profile_id', profileId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    response.cookies.set('workos_email', user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response

  } catch (error: any) {
    console.error('[WorkOS] Callback error:', error)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message || 'Unknown error')}`, request.url)
    )
  }
}
