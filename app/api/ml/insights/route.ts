import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generatePersonalizedInsights, saveMLInsights } from '@/lib/ml/personalization'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profileId = request.nextUrl.searchParams.get('profile_id') || null

    // Generate insights
    const insights = await generatePersonalizedInsights(user.id, profileId)

    // Save to database
    await saveMLInsights(user.id, insights, profileId)

    return NextResponse.json({ insights })
  } catch (error: any) {
    console.error('ML insights error:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights', details: error.message },
      { status: 500 }
    )
  }
}
