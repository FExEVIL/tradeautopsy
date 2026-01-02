import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentProfileId } from '@/lib/profile-utils'
import { cookies } from 'next/headers'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const cookieStore = await cookies()
    const { id } = await params
    
    const { data: { user } } = await supabase.auth.getUser()
    const workosUserId = cookieStore.get('workos_user_id')?.value
    
    if (!user && !workosUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const effectiveUserId = user?.id || workosUserId

    // Verify ownership
    const { data: watchlist } = await supabase
      .from('watchlists')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!watchlist || watchlist.user_id !== effectiveUserId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Delete watchlist (items will cascade delete)
    const { error } = await supabase
      .from('watchlists')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete watchlist', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete watchlist', details: error.message },
      { status: 500 }
    )
  }
}

