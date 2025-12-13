import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Fetch economic events from external API and cache in database
 * This is a placeholder - integrate with actual economic calendar API
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const fromDate = request.nextUrl.searchParams.get('from') || new Date().toISOString().split('T')[0]
    const toDate = request.nextUrl.searchParams.get('to') || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // TODO: Integrate with economic calendar API
    // Options:
    // 1. Trading Economics API (https://tradingeconomics.com/api)
    // 2. Alpha Vantage Economic Calendar
    // 3. Investing.com (scraping or unofficial API)
    // 4. FXStreet Economic Calendar API

    // For now, return cached events from database
    const { data: events, error } = await supabase
      .from('economic_events')
      .select('*')
      .gte('event_date', fromDate)
      .lte('event_date', toDate)
      .order('event_date', { ascending: true })
      .order('impact', { ascending: false })

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching economic events:', error)
    }

    return NextResponse.json({
      events: events || [],
      message: 'Economic calendar API integration pending. Events shown are from database cache. To populate events, integrate with Trading Economics API or similar service.'
    })
  } catch (error: any) {
    console.error('Economic calendar fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch economic events', details: error.message },
      { status: 500 }
    )
  }
}
