import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Soft delete all trades for user (set deleted_at timestamp)
    const { error } = await supabase
      .from('trades')
      .update({ deleted_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('deleted_at', null) // Only update non-deleted trades

    if (error) {
      console.error('Error soft-deleting trades:', error)
      return NextResponse.json(
        { error: 'Failed to delete trades', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'All trades have been deleted' 
    })
  } catch (error: any) {
    console.error('Delete all trades error:', error)
    return NextResponse.json(
      { error: 'Failed to delete trades', details: error.message },
      { status: 500 }
    )
  }
}
