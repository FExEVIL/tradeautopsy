import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentProfileId } from '@/lib/profile-utils'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const cookieStore = await cookies()
    const { id: watchlistId } = await params
    
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

    const { symbol, notes, support_levels, resistance_levels, tags } = await request.json()

    if (!symbol || !symbol.trim()) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      )
    }

    // Get max order_index
    const { data: existingItems } = await supabase
      .from('watchlist_items')
      .select('order_index')
      .eq('watchlist_id', watchlistId)
      .order('order_index', { ascending: false })
      .limit(1)

    const maxOrder = existingItems && existingItems.length > 0 
      ? (existingItems[0].order_index || 0) + 1 
      : 0

    const { data: item, error } = await supabase
      .from('watchlist_items')
      .insert({
        watchlist_id: watchlistId,
        symbol: symbol.trim().toUpperCase(),
        notes: notes?.trim() || null,
        support_levels: support_levels || null,
        resistance_levels: resistance_levels || null,
        tags: tags || null,
        order_index: maxOrder,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Symbol already exists in this watchlist' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to add symbol', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ item })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to add symbol', details: error.message },
      { status: 500 }
    )
  }
}

