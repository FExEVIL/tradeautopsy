import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getCurrentProfileId } from '@/lib/profile-utils'

/**
 * GET: Fetch all mistakes for user
 * PATCH: Update mistake (mark as resolved, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profileId = await getCurrentProfileId(user.id)

    let query = supabase
      .from('mistakes')
      .select('*')
      .eq('user_id', user.id)
      .order('detected_at', { ascending: false })

    if (profileId) {
      query = query.eq('profile_id', profileId)
    }

    const { data: mistakes, error } = await query

    if (error) {
      // Table might not exist
      if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
        return NextResponse.json({ mistakes: [] })
      }
      throw error
    }

    return NextResponse.json({ mistakes: mistakes || [] })

  } catch (error: any) {
    console.error('[Mistakes] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mistakes', details: error.message },
      { status: 500 }
    )
  }
}
