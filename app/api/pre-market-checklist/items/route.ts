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

    const body = await request.json()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('pre_market_checklist_items')
      .insert({
        user_id: effectiveUserId,
        text: body.text,
        category: body.category || 'mental',
        order: body.order || 0,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating item:', error)
      return NextResponse.json({ success: false, error: 'Failed to create item' }, { status: 500 })
    }

    return NextResponse.json({ success: true, item: data })

  } catch (error) {
    console.error('POST /api/pre-market-checklist/items error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

