import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const requestToken = requestUrl.searchParams.get('request_token')
  
  if (!requestToken) {
    return NextResponse.redirect(new URL('/dashboard?error=no_token', request.url))
  }

  const cookieStore = await cookies() // ✅ AWAIT!
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.delete(name)
        },
      },
    }
  )

  // Store request token in database
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    await supabase.from('zerodha_tokens').upsert({
      user_id: user.id,
      request_token: requestToken,
      created_at: new Date().toISOString(),
    })
  }

  return NextResponse.redirect(new URL('/dashboard?zerodha=connected', request.url))
}