import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createKiteClient } from '@/lib/zerodha'
import { BENCHMARK_INSTRUMENTS, type BenchmarkIndex } from '@/lib/benchmark-utils'
import { format, subDays } from 'date-fns'

interface BenchmarkDataPoint {
  date: string
  close: number
  change: number
  changePercent: number
}

/**
 * Fetch historical benchmark data from Zerodha Kite Connect
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const index = (searchParams.get('index') || 'NIFTY_50') as BenchmarkIndex
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    // Validate index
    if (!BENCHMARK_INSTRUMENTS[index]) {
      return NextResponse.json(
        { error: 'Invalid benchmark index. Use NIFTY_50 or SENSEX' },
        { status: 400 }
      )
    }

    // Get user's Zerodha access token
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch stored Zerodha access token
    const { data: tokenData } = await supabase
      .from('zerodha_tokens')
      .select('access_token, request_token')
      .eq('user_id', user.id)
      .single()

    let accessToken = tokenData?.access_token

    // If no access token but request token exists, generate session
    if (!accessToken && tokenData?.request_token) {
      const { generateZerodhaSession } = await import('@/lib/zerodha')
      const sessionResult = await generateZerodhaSession(tokenData.request_token)
      
      if (sessionResult.success && sessionResult.data) {
        accessToken = sessionResult.data.access_token
        // Update database with access token
        await supabase
          .from('zerodha_tokens')
          .update({ access_token: accessToken })
          .eq('user_id', user.id)
      }
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Zerodha not connected. Please connect your account first.' },
        { status: 403 }
      )
    }

    // Initialize Kite Connect client
    const kc = createKiteClient(accessToken)

    // Set date range (default to last 1 year)
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate
      ? new Date(startDate)
      : subDays(end, 365)

    // Fetch historical data
    // Note: Kite Connect uses instrument token, not instrument string for historical data
    const instrumentToken = index === 'NIFTY_50' ? 256265 : 265
    const interval = 'day' // 'day', 'minute', etc.

    try {
      const historicalData = await kc.getHistoricalData(
        instrumentToken,
        interval,
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0],
        false // continuous = false
      )

      // Transform to our format
      const data: BenchmarkDataPoint[] = historicalData.map((point: any, idx: number) => {
        const prevClose = idx > 0 ? historicalData[idx - 1].close : point.close
        const change = point.close - prevClose
        const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0

        return {
          date: format(new Date(point.date), 'yyyy-MM-dd'),
          close: point.close,
          change,
          changePercent,
        }
      })

      return NextResponse.json({
        index,
        data,
        startDate: format(start, 'yyyy-MM-dd'),
        endDate: format(end, 'yyyy-MM-dd'),
      })
    } catch (kiteError: any) {
      console.error('Kite Connect API error:', kiteError)
      
      // Fallback: Return mock data if API fails (for development)
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock benchmark data due to API error')
        return NextResponse.json({
          index,
          data: generateMockBenchmarkData(start, end, index),
          startDate: format(start, 'yyyy-MM-dd'),
          endDate: format(end, 'yyyy-MM-dd'),
          warning: 'Mock data - API unavailable',
        })
      }

      return NextResponse.json(
        { error: 'Failed to fetch benchmark data', details: kiteError.message },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Benchmark API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Generate mock benchmark data for development/testing
 */
function generateMockBenchmarkData(
  start: Date,
  end: Date,
  index: BenchmarkIndex
): BenchmarkDataPoint[] {
  const data: BenchmarkDataPoint[] = []
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  
  let currentPrice = index === 'NIFTY_50' ? 20000 : 65000
  
  for (let i = 0; i < days; i++) {
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    
    // Simulate random price movement
    const changePercent = (Math.random() - 0.5) * 2 // -1% to +1%
    const change = currentPrice * (changePercent / 100)
    currentPrice += change
    
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      close: currentPrice,
      change,
      changePercent,
    })
  }
  
  return data
}

