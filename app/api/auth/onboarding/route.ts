import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { name, planType } = await request.json()

    if (!name || !planType) {
      return NextResponse.json(
        { error: 'Name and plan type are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Update user profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        name,
        plan_type: planType,
        onboarding_completed: true,
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('[Onboarding] Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to save preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('[Onboarding] Error:', error)
    return NextResponse.json(
      { error: `Failed to save preferences: ${error.message}` },
      { status: 500 }
    )
  }
}
