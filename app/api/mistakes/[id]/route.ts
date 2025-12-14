import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * PATCH: Update mistake (mark as resolved, add notes, etc.)
 * DELETE: Delete mistake
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    const { data: mistake, error } = await supabase
      .from('mistakes')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
        return NextResponse.json({ error: 'Mistakes table does not exist' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ mistake })

  } catch (error: any) {
    console.error('[Mistakes] Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update mistake', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const { error } = await supabase
      .from('mistakes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
        return NextResponse.json({ error: 'Mistakes table does not exist' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('[Mistakes] Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete mistake', details: error.message },
      { status: 500 }
    )
  }
}
