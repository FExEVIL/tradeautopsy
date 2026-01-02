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

    const { date } = await request.json()
    const supabase = await createClient()

    // Get existing completion record
    const { data: existing } = await supabase
      .from('pre_market_checklist_completions')
      .select('*')
      .eq('user_id', effectiveUserId)
      .eq('date', date)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('pre_market_checklist_completions')
        .update({ 
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
    } else {
      // Create new completion record
      const { data: items } = await supabase
        .from('pre_market_checklist_items')
        .select('id')
        .eq('user_id', effectiveUserId)
        .eq('is_active', true)

      await supabase
        .from('pre_market_checklist_completions')
        .insert({
          user_id: effectiveUserId,
          date,
          completed_items: items?.map(i => i.id) || [],
          total_items: items?.length || 0,
          completed_at: new Date().toISOString(),
        })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('POST /api/pre-market-checklist/complete error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

