import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase-server'
import { getZerodhaLoginURL, ZERODHA_STATE_COOKIE, ZERODHA_STATE_TTL } from '@/lib/zerodha'

export async function GET(request: Request) {
  // Check if user is logged in
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const state = crypto.randomUUID()

  // Redirect to Zerodha login
  const loginUrl = new URL(getZerodhaLoginURL())
  loginUrl.searchParams.set('state', state)

  const response = NextResponse.redirect(loginUrl.toString())
  response.cookies.set({
    name: ZERODHA_STATE_COOKIE,
    value: state,
    maxAge: ZERODHA_STATE_TTL,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  return response
}
