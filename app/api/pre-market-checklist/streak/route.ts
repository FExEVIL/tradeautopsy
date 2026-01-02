import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

async function getEffectiveUserId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const cookieStore = await cookies()
  const workosProfileId = cookieStore.get('workos_profile_id')?.value
  const activeProfileId = cookieStore.get('active_profile_id')?.value
  return activeProfileId || user?.id || workosProfileId
}

export async function GET(request: NextRequest) {
  try {
    const effectiveUserId = await getEffectiveUserId()
    
    if (!effectiveUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Fetch completion records ordered by date
    const { data: completions } = await supabase
      .from('pre_market_checklist_completions')
      .select('date, completed_at')
      .eq('user_id', effectiveUserId)
      .not('completed_at', 'is', null)
      .order('date', { ascending: false })
      .limit(365)

    if (!completions || completions.length === 0) {
      return NextResponse.json({ success: true, streak: 0, last_completed: null })
    }

    // Calculate streak
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < completions.length; i++) {
      const completionDate = new Date(completions[i].date)
      completionDate.setHours(0, 0, 0, 0)

      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - i)

      if (completionDate.getTime() === expectedDate.getTime()) {
        streak++
      } else if (i === 0 && completionDate < expectedDate) {
        // Today not completed yet, check if yesterday was
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        if (completionDate.getTime() === yesterday.getTime()) {
          streak++
        } else {
          break
        }
      } else {
        break
      }
    }

    return NextResponse.json({
      success: true,
      streak,
      last_completed: completions[0]?.date || null,
    })

  } catch (error) {
    console.error('GET /api/pre-market-checklist/streak error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

