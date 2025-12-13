import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generateMorningBrief } from '@/lib/morning-brief'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current profile from cookie or use default
    const profileId = request.cookies.get('current_profile_id')?.value || null

    const brief = await generateMorningBrief(user.id, profileId)

    return NextResponse.json(brief)
  } catch (error: any) {
    console.error('Morning brief error:', error)
    return NextResponse.json(
      { error: 'Failed to generate morning brief', details: error.message },
      { status: 500 }
    )
  }
}
