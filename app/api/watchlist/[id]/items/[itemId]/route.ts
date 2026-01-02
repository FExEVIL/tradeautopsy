import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const supabase = await createClient()
    const cookieStore = await cookies()
    const { id: watchlistId, itemId } = await params
    
    const { data: { user } } = await supabase.auth.getUser()
    const workosUserId = cookieStore.get('workos_user_id')?.value
    
    if (!user && !workosUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const effectiveUserId = user?.id || workosUserId

    // Verify watchlist ownership
    const { data: watchlist } = await supabase
      .from('watchlists')
      .select('user_id')
      .eq('id', watchlistId)
      .single()

    if (!watchlist || watchlist.user_id !== effectiveUserId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('watchlist_items')
      .delete()
      .eq('id', itemId)
      .eq('watchlist_id', watchlistId)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete item', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete item', details: error.message },
      { status: 500 }
    )
  }
}

