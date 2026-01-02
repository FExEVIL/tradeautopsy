import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentProfileId } from '@/lib/profile-utils'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const cookieStore = await cookies()
    
    const { data: { user } } = await supabase.auth.getUser()
    const workosUserId = cookieStore.get('workos_user_id')?.value
    
    if (!user && !workosUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const effectiveUserId = user?.id || workosUserId
    const profileId = await getCurrentProfileId(supabase, effectiveUserId)

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const { data: checklist } = await supabase
      .from('checklists')
      .select('*')
      .eq('user_id', effectiveUserId)
      .eq('profile_id', profileId)
      .eq('date', date)
      .maybeSingle()

    return NextResponse.json({ checklist })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch checklist', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const cookieStore = await cookies()
    
    const { data: { user } } = await supabase.auth.getUser()
    const workosUserId = cookieStore.get('workos_user_id')?.value
    
    if (!user && !workosUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const effectiveUserId = user?.id || workosUserId
    const profileId = await getCurrentProfileId(supabase, effectiveUserId)

    const { items, completed } = await request.json()
    const today = new Date().toISOString().split('T')[0]

    // Upsert checklist
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .upsert({
        user_id: effectiveUserId,
        profile_id: profileId,
        date: today,
        items: items,
        completed_at: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,profile_id,date',
      })
      .select()
      .single()

    if (checklistError) {
      console.error('[Checklist] Error:', checklistError)
      return NextResponse.json(
        { error: 'Failed to save checklist', details: checklistError.message },
        { status: 500 }
      )
    }

    // Update streak if completed
    let streak = null
    if (completed) {
      const { data: existingStreak } = await supabase
        .from('checklist_streaks')
        .select('*')
        .eq('user_id', effectiveUserId)
        .eq('profile_id', profileId)
        .maybeSingle()

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      // Check if completed yesterday
      const { data: yesterdayChecklist } = await supabase
        .from('checklists')
        .select('completed_at')
        .eq('user_id', effectiveUserId)
        .eq('profile_id', profileId)
        .eq('date', yesterdayStr)
        .maybeSingle()

      let currentStreak = existingStreak?.current_streak || 0
      let longestStreak = existingStreak?.longest_streak || 0

      if (yesterdayChecklist?.completed_at) {
        // Continue streak
        currentStreak += 1
      } else {
        // New streak
        currentStreak = 1
      }

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak
      }

      const { data: updatedStreak } = await supabase
        .from('checklist_streaks')
        .upsert({
          user_id: effectiveUserId,
          profile_id: profileId,
          current_streak: currentStreak,
          longest_streak: longestStreak,
          last_completed_date: today,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,profile_id',
        })
        .select()
        .single()

      streak = updatedStreak
    }

    return NextResponse.json({
      success: true,
      checklist,
      streak,
    })
  } catch (error: any) {
    console.error('[Checklist] Error:', error)
    return NextResponse.json(
      { error: 'Failed to save checklist', details: error.message },
      { status: 500 }
    )
  }
}

