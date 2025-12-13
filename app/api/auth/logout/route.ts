import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  // Clear WorkOS cookies
  cookieStore.delete('workos_user_id')
  cookieStore.delete('workos_profile_id')
  cookieStore.delete('workos_session')

  // Clear Supabase session
  const supabase = await createClient()
  await supabase.auth.signOut()

  return NextResponse.json({ success: true })
}
