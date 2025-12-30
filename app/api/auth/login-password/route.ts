import { NextRequest, NextResponse } from 'next/server'
import { workos, WORKOS_CLIENT_ID } from '@/lib/workos'
import { createClient } from '@/utils/supabase/server'
import { handleError } from '@/lib/utils/error-handler'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const supabase = await createClient()
    const cookieStore = await cookies()
    const normalizedEmail = email.toLowerCase().trim()

    // Check which auth provider the user is registered with
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('auth_provider, user_id, workos_user_id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    // FIRST: Try Supabase Auth (especially if password was reset via Supabase)
    console.log('[Password Login] Attempting Supabase auth for:', normalizedEmail)
    const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })

    if (supabaseData?.user && !supabaseError) {
      console.log('[Password Login] Supabase auth successful')
      
      // Get or create profile for Supabase user
      let { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', supabaseData.user.id)
        .maybeSingle()

      if (!profile) {
        // Create profile if doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: supabaseData.user.id,
            email: normalizedEmail,
            name: normalizedEmail.split('@')[0],
            auth_provider: 'supabase',
            is_default: true,
          })
          .select('id')
          .single()
        
        if (createError) {
          console.error('[Password Login] Failed to create profile:', createError)
        } else {
          profile = newProfile
        }
      }

      // Set cookies for consistency with WorkOS flow
      const response = NextResponse.json({ 
        success: true, 
        redirectTo: '/dashboard',
        user: {
          id: supabaseData.user.id,
          email: supabaseData.user.email,
        },
        auth_provider: 'supabase'
      })

      response.cookies.set('workos_user_id', supabaseData.user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      if (profile?.id) {
        response.cookies.set('workos_profile_id', profile.id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        })
        response.cookies.set('active_profile_id', profile.id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        })
      }

      return response
    }

    // SECOND: If Supabase fails, try WorkOS (if configured)
    console.log('[Password Login] Supabase auth failed, trying WorkOS:', supabaseError?.message)
    
    if (!workos) {
      console.log('[Password Login] WorkOS not configured, cannot try WorkOS auth')
      return NextResponse.json({ 
        error: 'Invalid email or password' 
      }, { status: 401 })
    }

    try {
      const { user: workosUser, accessToken } = await workos.userManagement.authenticateWithPassword({
        email: normalizedEmail,
        password,
        clientId: WORKOS_CLIENT_ID,
      })

      console.log('[Password Login] WorkOS auth successful')

      // Get or create profile for WorkOS user
      let { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('workos_user_id', workosUser.id)
        .maybeSingle()

      if (!profile) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            workos_user_id: workosUser.id,
            email: workosUser.email || normalizedEmail,
            name: workosUser.firstName ? `${workosUser.firstName} ${workosUser.lastName || ''}`.trim() : normalizedEmail.split('@')[0],
            auth_provider: 'workos',
            is_default: true,
            email_verified: workosUser.emailVerified || false,
            profile_picture_url: workosUser.profilePictureUrl,
          })
          .select('id')
          .single()
        
        if (createError) {
          console.error('[Password Login] Failed to create profile:', createError)
        } else {
          profile = newProfile
        }
      }

      // Set WorkOS cookies
      const response = NextResponse.json({ 
        success: true, 
        redirectTo: '/dashboard',
        user: {
          id: workosUser.id,
          email: workosUser.email || normalizedEmail,
        },
        auth_provider: 'workos'
      })

      response.cookies.set('workos_user_id', workosUser.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })

      if (accessToken) {
        response.cookies.set('workos_access_token', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        })
      }

      if (profile?.id) {
        response.cookies.set('workos_profile_id', profile.id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        })
        response.cookies.set('active_profile_id', profile.id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        })
      }

      return response

    } catch (workosError: any) {
      console.error('[Password Login] WorkOS auth also failed:', workosError.message)
      
      // Both auth methods failed
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid email or password',
          ...(process.env.NODE_ENV === 'development' && {
            details: {
              supabase_error: supabaseError?.message,
              workos_error: workosError.message
            }
          })
        },
        { status: 401 }
      )
    }

  } catch (error: any) {
    console.error('[Password Login] Unexpected error:', error)
    const appError = handleError(error)
    
    return NextResponse.json({ 
      success: false,
      error: appError.message || 'An unexpected error occurred' 
    }, { status: 500 })
  }
}

