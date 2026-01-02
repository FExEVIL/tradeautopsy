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
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    // Fetch user's custom checklist items
    const { data: items } = await supabase
      .from('pre_market_checklist_items')
      .select('*')
      .eq('user_id', effectiveUserId)
      .eq('is_active', true)
      .order('order', { ascending: true })

    // Fetch today's completion status
    const { data: completion } = await supabase
      .from('pre_market_checklist_completions')
      .select('*')
      .eq('user_id', effectiveUserId)
      .eq('date', date)
      .maybeSingle()

    return NextResponse.json({
      success: true,
      items: items || [],
      completion: completion || null,
    })

  } catch (error) {
    console.error('GET /api/pre-market-checklist error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

