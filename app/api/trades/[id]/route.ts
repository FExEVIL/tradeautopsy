import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const raw = await request.json()
    const { note, tags } = raw

    const { id } = await context.params

    const { error } = await supabase
      .from('trades')
      .update({
        journal_note: note,
        journal_tags: tags,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .is('deleted_at', null) // Don't update deleted trades

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Soft delete the trade
    const { error } = await supabase
      .from('trades')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .is('deleted_at', null) // Only delete if not already deleted

    if (error) {
      console.error('Error deleting trade:', error)
      return NextResponse.json(
        { error: 'Failed to delete trade', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Trade deleted' })
  } catch (error: any) {
    console.error('Delete trade error:', error)
    return NextResponse.json(
      { error: 'Failed to delete trade', details: error.message },
      { status: 500 }
    )
  }
}
