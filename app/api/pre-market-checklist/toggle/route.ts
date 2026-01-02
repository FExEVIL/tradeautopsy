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

export async function POST(request: NextRequest) {
  try {
    const effectiveUserId = await getEffectiveUserId()
    
    if (!effectiveUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { item_id, checked, date } = await request.json()
    const supabase = await createClient()

    // Get or create completion record for today
    const { data: existing } = await supabase
      .from('pre_market_checklist_completions')
      .select('*')
      .eq('user_id', effectiveUserId)
      .eq('date', date)
      .maybeSingle()

    let completedItems = existing?.completed_items || []

    if (checked && !completedItems.includes(item_id)) {
      completedItems.push(item_id)
    } else if (!checked) {
      completedItems = completedItems.filter((id: string) => id !== item_id)
    }

    if (existing) {
      await supabase
        .from('pre_market_checklist_completions')
        .update({ 
          completed_items: completedItems, 
          total_items: completedItems.length,
          updated_at: new Date().toISOString() 
        })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('pre_market_checklist_completions')
        .insert({
          user_id: effectiveUserId,
          date,
          completed_items: completedItems,
          total_items: completedItems.length,
        })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('POST /api/pre-market-checklist/toggle error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

