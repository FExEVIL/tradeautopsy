import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { addDays, addWeeks, addMonths, setHours, setMinutes, startOfWeek, startOfMonth } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: schedules, error } = await supabase
      .from('scheduled_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching scheduled reports:', error)
      return NextResponse.json({ error: 'Failed to fetch scheduled reports' }, { status: 500 })
    }

    return NextResponse.json(schedules || [])
  } catch (error: any) {
    console.error('Scheduled reports fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scheduled reports', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      report_type,
      schedule_frequency,
      schedule_time,
      schedule_day,
      email_enabled,
      email_address,
      include_notes,
      include_tags
    } = body

    // Calculate next_send_at
    const now = new Date()
    const [hours, minutes] = schedule_time.split(':').map(Number)
    let nextSendAt = new Date()

    switch (schedule_frequency) {
      case 'daily':
        nextSendAt = setHours(setMinutes(now, minutes), hours)
        if (nextSendAt <= now) {
          nextSendAt = addDays(nextSendAt, 1)
        }
        break
      case 'weekly':
        const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday
        nextSendAt = addDays(weekStart, schedule_day || 0)
        nextSendAt = setHours(setMinutes(nextSendAt, minutes), hours)
        if (nextSendAt <= now) {
          nextSendAt = addWeeks(nextSendAt, 1)
        }
        break
      case 'monthly':
        const monthStart = startOfMonth(now)
        nextSendAt = addDays(monthStart, (schedule_day || 1) - 1)
        nextSendAt = setHours(setMinutes(nextSendAt, minutes), hours)
        if (nextSendAt <= now) {
          nextSendAt = addMonths(nextSendAt, 1)
        }
        break
    }

    const { data: schedule, error } = await supabase
      .from('scheduled_reports')
      .insert({
        user_id: user.id,
        report_type: report_type || 'performance',
        schedule_frequency,
        schedule_time,
        schedule_day: schedule_day || null,
        email_enabled: email_enabled !== false,
        email_address: email_enabled ? email_address : null,
        include_notes: include_notes !== false,
        include_tags: include_tags !== false,
        enabled: true,
        next_send_at: nextSendAt.toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating scheduled report:', error)
      return NextResponse.json({ error: 'Failed to create scheduled report' }, { status: 500 })
    }

    return NextResponse.json(schedule)
  } catch (error: any) {
    console.error('Scheduled report creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create scheduled report', details: error.message },
      { status: 500 }
    )
  }
}
