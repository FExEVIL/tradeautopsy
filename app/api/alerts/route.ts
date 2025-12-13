import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * Fetch predictive alerts for the authenticated user
 * GET /api/alerts?dismissed=false&limit=10
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const dismissed = searchParams.get('dismissed') === 'true'
    const limit = parseInt(searchParams.get('limit') || '10')

    const query = supabase
      .from('predictive_alerts')
      .select('*')
      .eq('user_id', user.id)
      .eq('dismissed', dismissed)
      .order('created_at', { ascending: false })
      .limit(limit)

    const { data: alerts, error } = await query

    if (error) {
      // Handle table not existing gracefully
      if (error.code === 'PGRST205' || error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        return NextResponse.json({ alerts: [] })
      }
      throw error
    }

    return NextResponse.json({ alerts: alerts || [] })
  } catch (error: any) {
    console.error('Fetch alerts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Update alert (dismiss, mark as heeded, etc.)
 * PATCH /api/alerts/:id
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, dismissed, user_action } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Alert ID required' }, { status: 400 })
    }

    const updateData: any = {}
    if (dismissed !== undefined) {
      updateData.dismissed = dismissed
      updateData.dismissed_at = dismissed ? new Date().toISOString() : null
    }
    if (user_action) {
      updateData.user_action = user_action
    }

    const { data, error } = await supabase
      .from('predictive_alerts')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ alert: data })
  } catch (error: any) {
    console.error('Update alert error:', error)
    return NextResponse.json(
      { error: 'Failed to update alert', details: error.message },
      { status: 500 }
    )
  }
}

