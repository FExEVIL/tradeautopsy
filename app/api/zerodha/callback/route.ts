import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { generateZerodhaSession } from '@/lib/zerodha'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const requestToken = url.searchParams.get('request_token')
  const status = url.searchParams.get('status')

  if (status === 'error' || !requestToken) {
    return NextResponse.redirect(
      new URL('/dashboard?error=zerodha_auth_failed', request.url)
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const session = await generateZerodhaSession(requestToken)

  if (!session.success || !session.data) {
    return NextResponse.redirect(
      new URL('/dashboard?error=zerodha_session_failed', request.url)
    )
  }

  const { error } = await supabase
  .from('zerodha_tokens')
  .upsert({
    user_id: user.id,
    access_token: session.data.access_token,
    public_token: session.data.public_token,
    login_time: session.data.login_time,
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'user_id'
  })

if (error) {
  console.error('❌ ZERODHA TOKEN STORAGE ERROR:', error)
  console.error('Error details:', JSON.stringify(error, null, 2))
  return NextResponse.redirect(
    new URL('/dashboard?error=token_storage_failed', request.url)
  )
}

  if (error) {
    return NextResponse.redirect(
      new URL('/dashboard?error=token_storage_failed', request.url)
    )
  }

  return NextResponse.redirect(
    new URL('/dashboard?connected=true', request.url)
  )
}
