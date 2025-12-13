import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { addDays, addWeeks, addMonths, setHours, setMinutes, startOfWeek, startOfMonth } from 'date-fns'

export async function PATCH(
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
    const body = await request.json()
    const { enabled } = body

    // Get current schedule
    const { data: schedule, error: fetchError } = await supabase
      .from('scheduled_reports')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    // If enabling, recalculate next_send_at
    let updateData: any = { enabled, updated_at: new Date().toISOString() }
    
    if (enabled && schedule.enabled === false) {
      const now = new Date()
      const [hours, minutes] = schedule.schedule_time.split(':').map(Number)
      let nextSendAt = new Date()

      switch (schedule.schedule_frequency) {
        case 'daily':
          nextSendAt = setHours(setMinutes(now, minutes), hours)
          if (nextSendAt <= now) {
            nextSendAt = addDays(nextSendAt, 1)
          }
          break
        case 'weekly':
          const weekStart = startOfWeek(now, { weekStartsOn: 1 })
          nextSendAt = addDays(weekStart, schedule.schedule_day || 0)
          nextSendAt = setHours(setMinutes(nextSendAt, minutes), hours)
          if (nextSendAt <= now) {
            nextSendAt = addWeeks(nextSendAt, 1)
          }
          break
        case 'monthly':
          const monthStart = startOfMonth(now)
          nextSendAt = addDays(monthStart, (schedule.schedule_day || 1) - 1)
          nextSendAt = setHours(setMinutes(nextSendAt, minutes), hours)
          if (nextSendAt <= now) {
            nextSendAt = addMonths(nextSendAt, 1)
          }
          break
      }
      updateData.next_send_at = nextSendAt.toISOString()
    }

    const { data: updated, error } = await supabase
      .from('scheduled_reports')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating scheduled report:', error)
      return NextResponse.json({ error: 'Failed to update scheduled report' }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Scheduled report update error:', error)
    return NextResponse.json(
      { error: 'Failed to update scheduled report', details: error.message },
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
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const { error } = await supabase
      .from('scheduled_reports')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting scheduled report:', error)
      return NextResponse.json({ error: 'Failed to delete scheduled report' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Scheduled report deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete scheduled report', details: error.message },
      { status: 500 }
    )
  }
}
