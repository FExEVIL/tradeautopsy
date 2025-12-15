import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getCurrentProfileId } from '@/lib/profile-utils'
import { IntelligenceEngine } from '@/lib/intelligence/core/engine'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const profileParam = searchParams.get('profile_id')
    const profileId = profileParam || (await getCurrentProfileId(user.id))

    if (!profileId) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 400 })
    }

    const engine = new IntelligenceEngine()
    const context = await engine.initialize(user.id, profileId)
    const dashboard = engine.getDashboard()

    return NextResponse.json({
      dashboard,
      chatHistory: context.chatHistory,
      emotionalState: context.emotionalState,
    })
  } catch (error: any) {
    console.error('[TAI] Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to load intelligence dashboard', details: error.message },
      { status: 500 },
    )
  }
}
