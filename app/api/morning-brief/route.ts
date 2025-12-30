import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generateMorningBrief } from '@/lib/morning-brief'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Check WorkOS auth (fallback)
    const cookieHeader = request.headers.get('cookie') || ''
    const workosUserId = cookieHeader.match(/workos_user_id=([^;]+)/)?.[1]
    const workosProfileId = cookieHeader.match(/workos_profile_id=([^;]+)/)?.[1] || 
                            cookieHeader.match(/active_profile_id=([^;]+)/)?.[1]

    // Must have either Supabase user OR WorkOS session
    if (!user && !workosUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use effective user ID for queries
    const effectiveUserId = user?.id || workosProfileId

    // Get current profile from cookie or use default
    const profileId = request.cookies.get('current_profile_id')?.value || workosProfileId || null

    const brief = await generateMorningBrief(effectiveUserId, profileId)

    return NextResponse.json(brief)
  } catch (error: any) {
    console.error('Morning brief error:', error)
    return NextResponse.json(
      { error: 'Failed to generate morning brief', details: error.message },
      { status: 500 }
    )
  }
}
