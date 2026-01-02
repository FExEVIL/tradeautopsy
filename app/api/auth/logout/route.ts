import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Sign out from Supabase
    await supabase.auth.signOut()

    // Create response
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    })

    // List of all auth-related cookies to clear
    const authCookies = [
      // WorkOS cookies
      'workos_user_id',
      'workos_access_token',
      'workos_refresh_token',
      'workos_profile_id',
      'workos_email',
      // Profile cookies
      'active_profile_id',
      // Supabase cookies
      'sb-access-token',
      'sb-refresh-token',
    ]

    // Cookie options for clearing
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0, // Expire immediately
    }

    // Clear all auth cookies
    for (const cookieName of authCookies) {
      response.cookies.set(cookieName, '', cookieOptions)
    }

    // Also try to delete them (belt and suspenders approach)
    for (const cookieName of authCookies) {
      response.cookies.delete(cookieName)
    }

    return response

  } catch (error: unknown) {
    console.error('[Logout] Error:', error)
    
    // Even on error, try to clear cookies and return success
    // This ensures users can always log out
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out (with cleanup)' 
    })

    const authCookies = [
      'workos_user_id',
      'workos_access_token',
      'workos_refresh_token',
      'workos_profile_id',
      'workos_email',
      'active_profile_id',
      'sb-access-token',
      'sb-refresh-token',
    ]

    for (const cookieName of authCookies) {
      response.cookies.delete(cookieName)
    }

    return response
  }
}
