import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { markBriefAsRead } from '@/lib/morning-brief'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await markBriefAsRead(user.id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Mark brief as read error:', error)
    return NextResponse.json(
      { error: 'Failed to mark brief as read', details: error.message },
      { status: 500 }
    )
  }
}
