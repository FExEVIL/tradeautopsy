import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sampleTrades, convertSampleTradesToDBFormat } from '@/lib/data/sampleTrades'
import { getCurrentProfileId } from '@/lib/profile-utils'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current profile
    const profileId = await getCurrentProfileId(supabase, user.id)
    if (!profileId) {
      return NextResponse.json(
        { error: 'No profile found' },
        { status: 400 }
      )
    }

    // Check if sample data already exists
    const { data: existingSampleTrades } = await supabase
      .from('trades')
      .select('id')
      .eq('user_id', user.id)
      .eq('profile_id', profileId)
      .eq('is_sample', true)
      .limit(1)

    if (existingSampleTrades && existingSampleTrades.length > 0) {
      return NextResponse.json(
        { 
          message: 'Sample data already loaded',
          count: existingSampleTrades.length 
        },
        { status: 200 }
      )
    }

    // Convert sample trades to database format
    const tradesToInsert = convertSampleTradesToDBFormat(user.id, profileId, sampleTrades)

    // Insert trades
    const { data: insertedTrades, error: insertError } = await supabase
      .from('trades')
      .insert(tradesToInsert)
      .select('id')

    if (insertError) {
      console.error('[Sample Data] Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to load sample data', details: insertError.message },
        { status: 500 }
      )
    }

    // Also create a sample goal
    const { error: goalError } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        profile_id: profileId,
        name: 'Sample Goal: Daily P&L Target',
        type: 'daily_pnl',
        target: 5000,
        period: 'daily',
        start_date: new Date().toISOString(),
        is_sample: true,
      })

    if (goalError) {
      console.warn('[Sample Data] Goal creation failed:', goalError)
      // Don't fail the whole request if goal creation fails
    }

    return NextResponse.json({
      success: true,
      message: 'Sample data loaded successfully',
      count: insertedTrades?.length || 0,
    })

  } catch (error: any) {
    console.error('[Sample Data] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    )
  }
}

