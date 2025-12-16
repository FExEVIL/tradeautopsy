import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      metric,
      value,
      rating,
      id,
      navigationType,
      timestamp,
      url,
    } = body

    // ✅ Store in database for custom analytics
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Only store if user is authenticated (optional - can store anonymous too)
    if (user) {
      const { error } = await supabase
        .from('web_vitals')
        .insert({
          user_id: user.id,
          metric_name: metric,
          metric_value: value,
          metric_rating: rating,
          metric_id: id,
          navigation_type: navigationType,
          page_url: url,
          timestamp: new Date(timestamp).toISOString(),
          user_agent: request.headers.get('user-agent'),
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        })

      if (error) {
        console.error('Error saving vitals:', error)
        // Don't fail the request - vitals are non-critical
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Analytics error:', error)
    // Return success even on error - don't break user experience
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
