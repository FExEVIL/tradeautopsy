import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Sign out from Supabase
    await supabase.auth.signOut()

    // Create response
    const response = NextResponse.json({ success: true })

    // Clear WorkOS cookies
    response.cookies.delete('workos_user_id')
    response.cookies.delete('workos_profile_id')
    response.cookies.delete('workos_email')

    // Clear Supabase cookies
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')

    return response

  } catch (error: any) {
    console.error('[Logout] Error:', error)
    return NextResponse.json(
      { error: `Failed to logout: ${error.message}` },
      { status: 500 }
    )
  }
}
