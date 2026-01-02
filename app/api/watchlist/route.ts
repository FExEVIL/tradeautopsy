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

    const { data: watchlists } = await supabase
      .from('watchlists')
      .select(`
        *,
        watchlist_items (
          *,
          order by order_index asc
        )
      `)
      .eq('user_id', effectiveUserId)
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })

    return NextResponse.json({ watchlists: watchlists || [] })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch watchlists', details: error.message },
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

    const { name, description } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Watchlist name is required' },
        { status: 400 }
      )
    }

    const { data: watchlist, error } = await supabase
      .from('watchlists')
      .insert({
        user_id: effectiveUserId,
        profile_id: profileId,
        name: name.trim(),
        description: description?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      console.error('[Watchlist] Error:', error)
      return NextResponse.json(
        { error: 'Failed to create watchlist', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ watchlist })
  } catch (error: any) {
    console.error('[Watchlist] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create watchlist', details: error.message },
      { status: 500 }
    )
  }
}

