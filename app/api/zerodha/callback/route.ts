import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase-server'
import { generateZerodhaSession, ZERODHA_STATE_COOKIE } from '@/lib/zerodha'
import { encryptString } from '@/lib/encryption'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const requestToken = url.searchParams.get('request_token')
  const status = url.searchParams.get('status')
  const state = url.searchParams.get('state')
  const cookieStore = cookies()

  const clearStateCookie = (response: NextResponse) => {
    response.cookies.set({
      name: ZERODHA_STATE_COOKIE,
      value: '',
      maxAge: 0,
      path: '/',
    })
  }

  const failRedirect = (path: string) => {
    const response = NextResponse.redirect(new URL(path, request.url))
    clearStateCookie(response)
    return response
  }

  // Check for errors from Zerodha
  if (status === 'error' || !requestToken) {
    return failRedirect('/dashboard?error=zerodha_auth_failed')
  }

  const storedState = cookieStore.get(ZERODHA_STATE_COOKIE)?.value
  if (!state || !storedState || storedState !== state) {
    return failRedirect('/dashboard?error=zerodha_state_mismatch')
  }

  // Get current user
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return failRedirect('/login')
  }

  // Generate session with Zerodha
  const session = await generateZerodhaSession(requestToken)

  if (!session.success || !session.data) {
    return failRedirect('/dashboard?error=zerodha_session_failed')
  }

  let encryptedAccessToken: string
  let encryptedPublicToken: string
  try {
    encryptedAccessToken = encryptString(session.data.access_token)
    encryptedPublicToken = encryptString(session.data.public_token)
  } catch (error) {
    console.error('Failed to encrypt Zerodha tokens:', error)
    return failRedirect('/dashboard?error=token_encryption_failed')
  }

  // Store access token in Supabase
  const { error } = await supabase
    .from('zerodha_tokens')
    .upsert({
      user_id: user.id,
      access_token: encryptedAccessToken,
      public_token: encryptedPublicToken,
      login_time: session.data.login_time,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Failed to store token:', error)
    return failRedirect('/dashboard?error=token_storage_failed')
  }

  // Success! Redirect to dashboard
  const response = NextResponse.redirect(
    new URL('/dashboard?connected=true', request.url)
  )
  clearStateCookie(response)
  return response
}
