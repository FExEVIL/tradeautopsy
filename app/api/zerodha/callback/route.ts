import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { generateZerodhaSession } from '@/lib/zerodha'
import { ensureDefaultProfile } from '@/lib/profile-utils'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const requestToken = requestUrl.searchParams.get('request_token')
  
  if (!requestToken) {
    return NextResponse.redirect(new URL('/dashboard/settings/brokers?error=no_token', request.url))
  }

  const cookieStore = await cookies()
  
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

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const sessionResult = await generateZerodhaSession(requestToken)
  
  if (sessionResult.success && sessionResult.data) {
    const apiKey = process.env.NEXT_PUBLIC_KITE_API_KEY || process.env.ZERODHA_API_KEY
    
    // Ensure default profile exists
    const profileId = await ensureDefaultProfile(user.id)
    
    // Store in new brokers table
    const { data: broker, error: brokerError } = await supabase
      .from('brokers')
      .upsert({
        user_id: user.id,
        name: 'Zerodha',
        broker_type: 'zerodha',
        api_key: apiKey || '',
        access_token: sessionResult.data.access_token,
        connection_status: 'connected',
        last_sync_at: null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,broker_type'
      })
      .select()
      .single()

    // Also store in zerodha_tokens for backward compatibility
    await supabase.from('zerodha_tokens').upsert({
      user_id: user.id,
      request_token: requestToken,
      access_token: sessionResult.data.access_token,
      created_at: new Date().toISOString(),
    })

    // Link broker to default profile
    if (!brokerError && broker) {
      await supabase
        .from('broker_profiles')
        .upsert({
          broker_id: broker.id,
          profile_id: profileId
        }, {
          onConflict: 'broker_id,profile_id'
        })
    }
    
    return NextResponse.redirect(new URL('/dashboard/settings/brokers?zerodha=connected', request.url))
  } else {
    return NextResponse.redirect(new URL('/dashboard/settings/brokers?zerodha=error', request.url))
  }
}