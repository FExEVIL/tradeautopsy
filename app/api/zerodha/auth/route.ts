import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getZerodhaLoginURL } from '@/lib/zerodha'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const loginUrl = getZerodhaLoginURL()
  return NextResponse.redirect(loginUrl)
}
