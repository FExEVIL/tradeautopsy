import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
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

    // Delete sample trades
    const { data: deletedTrades, error: tradesError } = await supabase
      .from('trades')
      .delete()
      .eq('user_id', user.id)
      .eq('profile_id', profileId)
      .eq('is_sample', true)
      .select('id')

    if (tradesError) {
      console.error('[Clear Sample] Trades deletion error:', tradesError)
      return NextResponse.json(
        { error: 'Failed to delete sample trades', details: tradesError.message },
        { status: 500 }
      )
    }

    // Delete sample goals
    const { error: goalsError } = await supabase
      .from('goals')
      .delete()
      .eq('user_id', user.id)
      .eq('profile_id', profileId)
      .eq('is_sample', true)

    if (goalsError) {
      console.warn('[Clear Sample] Goals deletion error:', goalsError)
      // Don't fail if goals deletion fails
    }

    return NextResponse.json({
      success: true,
      message: 'Sample data cleared successfully',
      deletedTrades: deletedTrades?.length || 0,
    })

  } catch (error: any) {
    console.error('[Clear Sample] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    )
  }
}

