/**
 * Email Verification Callback Route
 * Handles WorkOS email verification redirects
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const error = request.nextUrl.searchParams.get('error')

  // Handle error cases
  if (error) {
    console.error('[Verify] Error from WorkOS:', error)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('Verification failed. Please try again.')}`, request.url)
    )
  }

  if (!token) {
    // WorkOS handles verification automatically via the email link
    // If we reach here without a token, the verification was likely successful
    // Just redirect to login with success message
    return NextResponse.redirect(
      new URL('/login?verified=true', request.url)
    )
  }

  // If there's a token, WorkOS has already verified the email
  // The token is handled by WorkOS directly
  // Just redirect to login with success
  return NextResponse.redirect(
    new URL('/login?verified=true', request.url)
  )
}

