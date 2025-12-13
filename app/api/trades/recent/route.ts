import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getCurrentProfileId } from '@/lib/profile-utils'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const profileId = await getCurrentProfileId(user.id)

    let query = supabase
      .from('trades')
      .select('id, symbol, tradingsymbol, trade_date, trade_type, transaction_type, pnl, strategy, has_audio_journal')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('trade_date', { ascending: false })
      .limit(limit)

    if (profileId) {
      query = query.eq('profile_id', profileId)
    }

    const { data: trades, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ trades: trades || [] })

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}
