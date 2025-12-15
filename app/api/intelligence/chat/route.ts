import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getCurrentProfileId } from '@/lib/profile-utils'
import { IntelligenceEngine } from '@/lib/intelligence/core/engine'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, profile_id: profileParam } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const profileId = profileParam || (await getCurrentProfileId(user.id))
    if (!profileId) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 400 })
    }

    const engine = new IntelligenceEngine()
    await engine.initialize(user.id, profileId)
    const assistantMessage = await engine.chat(message)

    return NextResponse.json({ message: assistantMessage })
  } catch (error: any) {
    console.error('[TAI] Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message', details: error.message },
      { status: 500 },
    )
  }
}
