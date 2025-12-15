import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getCurrentProfileId } from '@/lib/profile-utils'
import { IntelligenceEngine } from '@/lib/intelligence/core/engine'
import type { Trade } from '@/lib/intelligence/core/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const trade: Trade = body.trade

    if (!trade || !trade.id) {
      return NextResponse.json({ error: 'Valid trade payload is required' }, { status: 400 })
    }

    const profileId = trade.profile_id || (await getCurrentProfileId(user.id))
    if (!profileId) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 400 })
    }

    const engine = new IntelligenceEngine()
    await engine.initialize(user.id, profileId)
    const result = await engine.onNewTrade(trade)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[TAI] Trade webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to process trade webhook', details: error.message },
      { status: 500 },
    )
  }
}
