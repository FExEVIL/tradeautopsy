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

    console.log('[OAuth] User authenticated:', user.id, user.email)

    // Get or create profile
    const supabase = await createClient()
    
    let { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('workos_user_id', user.id)
      .maybeSingle()

    if (!profile) {
      // Try to find by email
      const { data: profileByEmail } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', user.email)
        .maybeSingle()

      if (profileByEmail) {
        await supabase
          .from('profiles')
          .update({ workos_user_id: user.id, auth_provider: 'workos' })
          .eq('id', profileByEmail.id)
        profile = profileByEmail
      } else {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            email: user.email,
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
        
        profile = newProfile
      }
    }

    // Set cookies and redirect
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    }

    response.cookies.set('workos_user_id', user.id, cookieOptions)
    
    if (accessToken) {
      response.cookies.set('workos_access_token', accessToken, cookieOptions)
    }
    
    if (profile?.id) {
      response.cookies.set('workos_profile_id', profile.id, cookieOptions)
      response.cookies.set('active_profile_id', profile.id, cookieOptions)
    }

    return response
  } catch (error: any) {
    console.error('[OAuth] Callback error:', error)
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message || 'Authentication failed')}`, request.url))
  }
}