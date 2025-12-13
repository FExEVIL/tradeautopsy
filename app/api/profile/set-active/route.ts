import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { profileId } = await request.json()

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID required' }, { status: 400 })
    }

    // Verify profile belongs to user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', profileId)
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Set cookie for server-side access
    const cookieStore = await cookies()
    cookieStore.set('current_profile_id', profileId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
      httpOnly: false, // Allow client-side access too
    })

    // Also update user_preferences for persistence
    await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        current_profile_id: profileId,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    return NextResponse.json({ success: true, profileId })
  } catch (error: any) {
    console.error('Set active profile error:', error)
    return NextResponse.json(
      { error: 'Failed to set active profile', details: error.message },
      { status: 500 }
    )
  }
}
