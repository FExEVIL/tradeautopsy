import { WorkOS } from '@workos-inc/node'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const workos = new WorkOS(process.env.WORKOS_API_KEY)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    console.error('[OAuth] Error:', error, errorDescription)
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url))
  }

  try {
    const { user, accessToken } = await workos.userManagement.authenticateWithCode({
      code,
      clientId: process.env.WORKOS_CLIENT_ID!,
    })

    console.log('[OAuth] WorkOS user authenticated:', user.id, user.email)

    const supabase = await createClient()
    let profileId: string | null = null
    
    // PRIORITY 1: Check if user already has a profile linked via workos_user_id
    const { data: existingWorkOSProfile } = await supabase
      .from('profiles')
      .select('id, user_id, email')
      .eq('workos_user_id', user.id)
      .maybeSingle()

    if (existingWorkOSProfile) {
      console.log('[OAuth] Found existing WorkOS profile:', existingWorkOSProfile.id)
      profileId = existingWorkOSProfile.id
    }

    // PRIORITY 2: Check if a profile with this email already exists (account linking)
    if (!profileId && user.email) {
      const { data: profileByEmail } = await supabase
        .from('profiles')
        .select('id, user_id, workos_user_id')
        .eq('email', user.email.toLowerCase())
        .maybeSingle()

      if (profileByEmail) {
        console.log('[OAuth] Found existing profile by email:', profileByEmail.id, 'Linking WorkOS account...')
        
        // Link WorkOS to existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            workos_user_id: user.id, 
            auth_provider: 'workos',
            profile_picture_url: user.profilePictureUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profileByEmail.id)

        if (updateError) {
          console.error('[OAuth] Failed to link WorkOS to existing profile:', updateError)
        } else {
          console.log('[OAuth] Successfully linked WorkOS account to existing profile')
        }

        profileId = profileByEmail.id
      }
    }

    // PRIORITY 3: Check if there's a Supabase auth user with same email
    if (!profileId && user.email) {
      const { data: authUsers } = await supabase.rpc('get_user_by_email', { 
        email_param: user.email.toLowerCase() 
      }).maybeSingle()
      
      // If RPC doesn't exist, try direct lookup via profile's user_id
      if (!authUsers) {
        // Check if there's a profile with user_id that matches an auth user with this email
        const { data: profilesWithUserId } = await supabase
          .from('profiles')
          .select('id, user_id')
          .not('user_id', 'is', null)
          .limit(100)

        // For each profile, check if the auth user has the same email
        // This is a fallback for when we can't query auth.users directly
        for (const p of profilesWithUserId || []) {
          if (p.user_id) {
            const { data: authUser } = await supabase.auth.admin.getUserById(p.user_id).catch(() => ({ data: null }))
            if (authUser && authUser.user?.email?.toLowerCase() === user.email.toLowerCase()) {
              console.log('[OAuth] Found matching Supabase auth user, linking profile:', p.id)
              
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ 
                  workos_user_id: user.id,
                  email: user.email.toLowerCase(),
                  auth_provider: 'workos',
                  profile_picture_url: user.profilePictureUrl,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', p.id)

              if (!updateError) {
                profileId = p.id
                break
              }
            }
          }
        }
      }
    }

    // PRIORITY 4: Create new profile if none exists
    if (!profileId) {
      console.log('[OAuth] No existing profile found, creating new one for:', user.email)
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          email: user.email?.toLowerCase(),
          name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email?.split('@')[0],
          workos_user_id: user.id,
          auth_provider: 'workos',
          is_default: true,
          email_verified: user.emailVerified || false,
          profile_picture_url: user.profilePictureUrl,
        })
        .select('id')
        .single()
      
      if (createError) {
        console.error('[OAuth] Failed to create profile:', createError)
        throw new Error('Failed to create profile')
      }
      
      profileId = newProfile.id
      console.log('[OAuth] Created new profile:', profileId)
    }

    // Set cookies and redirect
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    }

    response.cookies.set('workos_user_id', user.id, cookieOptions)
    
    if (accessToken) {
      response.cookies.set('workos_access_token', accessToken, cookieOptions)
    }
    
    // CRITICAL: Set profile_id cookies to the CORRECT profile ID
    // This ensures data is loaded for the linked account
    if (profileId) {
      response.cookies.set('workos_profile_id', profileId, cookieOptions)
      response.cookies.set('active_profile_id', profileId, cookieOptions)
      console.log('[OAuth] Set profile cookies:', profileId)
    }

    console.log('[OAuth] Authentication complete, redirecting to dashboard')
    return response

  } catch (error: any) {
    console.error('[OAuth] Callback error:', error)
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message || 'Authentication failed')}`, request.url))
  }
}
