import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

/**
 * POST /api/auth/link-accounts
 * Links a WorkOS account to an existing Supabase account by email.
 * Used when a user signs in with Google SSO but has an existing account.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const cookieStore = await cookies()
    
    // Get current WorkOS session
    const workosUserId = cookieStore.get('workos_user_id')?.value
    
    if (!workosUserId) {
      return NextResponse.json(
        { success: false, error: 'No WorkOS session found. Please sign in with Google first.' },
        { status: 401 }
      )
    }

    // Get the email from request body
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Find existing profile by email
    const { data: existingProfile, error: findError } = await supabase
      .from('profiles')
      .select('id, user_id, email, name, workos_user_id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (findError) {
      console.error('[Link Accounts] Error finding profile:', findError)
      return NextResponse.json(
        { success: false, error: 'Failed to search for account' },
        { status: 500 }
      )
    }

    // If no profile found by email, try to find by user_id from auth.users
    let profileToLink = existingProfile

    if (!profileToLink) {
      // Check if there's a Supabase auth user with this email
      const { data: authUsers } = await supabase
        .from('profiles')
        .select('id, user_id, email, name, workos_user_id')
        .not('user_id', 'is', null)

      // Find a profile whose associated auth user has this email
      for (const profile of authUsers || []) {
        if (profile.user_id) {
          try {
            const { data: { user: authUser } } = await supabase.auth.admin.getUserById(profile.user_id)
            if (authUser?.email?.toLowerCase() === normalizedEmail) {
              profileToLink = profile
              break
            }
          } catch (e) {
            // Continue checking other profiles
          }
        }
      }
    }

    if (!profileToLink) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email. Please check your email or create a new account.' },
        { status: 404 }
      )
    }

    // Check if this profile is already linked to a different WorkOS user
    if (profileToLink.workos_user_id && profileToLink.workos_user_id !== workosUserId) {
      return NextResponse.json(
        { success: false, error: 'This account is already linked to a different Google account.' },
        { status: 409 }
      )
    }

    // Link WorkOS to existing profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        workos_user_id: workosUserId,
        email: normalizedEmail,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileToLink.id)

    if (updateError) {
      console.error('[Link Accounts] Error linking accounts:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to link accounts' },
        { status: 500 }
      )
    }

    // Update cookies to use the linked profile
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    }

    // Create response with updated cookies
    const response = NextResponse.json({
      success: true,
      message: 'Accounts linked successfully! Your trading data is now accessible.',
      profile_id: profileToLink.id,
      user_id: profileToLink.user_id,
    })

    response.cookies.set('workos_profile_id', profileToLink.id, cookieOptions)
    response.cookies.set('active_profile_id', profileToLink.id, cookieOptions)

    console.log('[Link Accounts] Successfully linked WorkOS user', workosUserId, 'to profile', profileToLink.id)

    return response

  } catch (error: any) {
    console.error('[Link Accounts] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/link-accounts
 * Check if the current session needs account linking
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const cookieStore = await cookies()
    
    const workosUserId = cookieStore.get('workos_user_id')?.value
    const activeProfileId = cookieStore.get('active_profile_id')?.value

    if (!workosUserId) {
      return NextResponse.json({
        success: true,
        needsLinking: false,
        reason: 'not_workos_session',
      })
    }

    // Check if profile has data
    if (activeProfileId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, user_id, email')
        .eq('id', activeProfileId)
        .single()

      if (profile) {
        // Check if there are any trades for this user
        const effectiveUserId = profile.user_id || profile.id
        const { count } = await supabase
          .from('trades')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', effectiveUserId)
          .is('deleted_at', null)

        return NextResponse.json({
          success: true,
          needsLinking: (count || 0) === 0,
          reason: (count || 0) === 0 ? 'no_trades' : 'has_data',
          email: profile.email,
          tradesCount: count || 0,
        })
      }
    }

    return NextResponse.json({
      success: true,
      needsLinking: true,
      reason: 'no_profile',
    })

  } catch (error: any) {
    console.error('[Link Accounts Check] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check linking status' },
      { status: 500 }
    )
  }
}

