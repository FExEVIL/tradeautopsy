import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { execution_rating } = await request.json()

    if (execution_rating < 0 || execution_rating > 5) {
      return NextResponse.json({ error: 'Rating must be 0-5' }, { status: 400 })
    }

    // Verify trade belongs to user
    const { data: trade, error: tradeError } = await supabase
      .from('trades')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (tradeError || !trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    // Update rating
    const { error } = await supabase
      .from('trades')
      .update({ execution_rating })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, execution_rating })

  } catch (error: any) {
    console.error('Rating update error:', error)
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}
