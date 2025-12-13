import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Delete broker (cascade will handle broker_profiles)
    const { error } = await supabase
      .from('brokers')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting broker:', error)
      return NextResponse.json(
        { error: 'Failed to delete broker', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete broker error:', error)
    return NextResponse.json(
      { error: 'Failed to delete broker', details: error.message },
      { status: 500 }
    )
  }
}
