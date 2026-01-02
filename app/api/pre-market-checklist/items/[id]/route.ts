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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const effectiveUserId = await getEffectiveUserId()
    
    if (!effectiveUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const supabase = await createClient()

    const { error } = await supabase
      .from('pre_market_checklist_items')
      .update({
        text: body.text,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', effectiveUserId)

    if (error) {
      console.error('Error updating item:', error)
      return NextResponse.json({ success: false, error: 'Failed to update item' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('PATCH /api/pre-market-checklist/items/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const effectiveUserId = await getEffectiveUserId()
    
    if (!effectiveUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createClient()

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('pre_market_checklist_items')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', effectiveUserId)

    if (error) {
      console.error('Error deleting item:', error)
      return NextResponse.json({ success: false, error: 'Failed to delete item' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('DELETE /api/pre-market-checklist/items/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

