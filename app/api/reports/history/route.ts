import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: history, error } = await supabase
      .from('report_history')
      .select('*')
      .eq('user_id', user.id)
      .order('generated_at', { ascending: false })
      .limit(50) // Last 50 reports

    if (error) {
      console.error('Error fetching report history:', error)
      return NextResponse.json({ error: 'Failed to fetch report history' }, { status: 500 })
    }

    return NextResponse.json(history || [])
  } catch (error: any) {
    console.error('Report history fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report history', details: error.message },
      { status: 500 }
    )
  }
}
