import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies() // ✅ AWAIT!
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.delete(name)
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { apiKey, apiSecret, accessToken } = await request.json()

    // Check if Zerodha credentials are configured
    const zerodhaApiKey = apiKey || process.env.ZERODHA_API_KEY
    const zerodhaApiSecret = apiSecret || process.env.ZERODHA_API_SECRET
    const zerodhaAccessToken = accessToken || process.env.ZERODHA_ACCESS_TOKEN

    if (!zerodhaApiKey || !zerodhaApiSecret) {
      return NextResponse.json(
        { 
          error: 'Zerodha API credentials not configured',
          message: 'Please configure ZERODHA_API_KEY and ZERODHA_API_SECRET in environment variables, or provide them in the request.'
        },
        { status: 400 }
      )
    }

    if (!zerodhaAccessToken) {
      return NextResponse.json(
        {
          error: 'Zerodha access token required',
          message: 'Please authenticate with Zerodha first to obtain an access token. Use Zerodha OAuth flow to get the token.',
          authUrl: `https://kite.zerodha.com/connect/login?api_key=${zerodhaApiKey}`
        },
        { status: 401 }
      )
    }

    // Fetch trades from Zerodha API
    // Note: This is a placeholder - implement actual Zerodha API calls based on their documentation
    // Zerodha Kite Connect API endpoint: https://kite.trade/docs/connect/v3/
    
    const today = new Date().toISOString().split('T')[0]
    const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    // Example API call structure (adjust based on Zerodha API documentation)
    const zerodhaResponse = await fetch(
      `https://kite.zerodha.com/oms/orders?from=${fromDate}&to=${today}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `token ${zerodhaApiKey}:${zerodhaAccessToken}`,
          'X-Kite-Version': '3'
        }
      }
    )

    if (!zerodhaResponse.ok) {
      const errorData = await zerodhaResponse.json().catch(() => ({}))
      return NextResponse.json(
        {
          error: 'Failed to fetch trades from Zerodha',
          details: errorData.message || 'Please check your API credentials and access token',
          status: zerodhaResponse.status
        },
        { status: zerodhaResponse.status }
      )
    }

    const zerodhaData = await zerodhaResponse.json()
    const trades = zerodhaData.data || []

    // Transform Zerodha trades to TradeAutopsy format and save
    // This transformation depends on Zerodha's response structure
    const transformedTrades = trades.map((trade: any) => ({
      user_id: user.id,
      trade_date: trade.order_timestamp || trade.timestamp || new Date().toISOString(),
      tradingsymbol: trade.tradingsymbol || trade.instrument_token,
      symbol: trade.tradingsymbol?.split('-')[0] || trade.symbol,
      quantity: trade.quantity || trade.filled_quantity || 0,
      average_price: trade.average_price || trade.price || 0,
      pnl: trade.pnl || 0,
      product: trade.product || 'MIS',
      transaction_type: trade.transaction_type || trade.side || 'BUY',
      // Add other fields as needed based on Zerodha response
    }))

    // Insert trades into database
    const { data: insertedTrades, error: insertError } = await supabase
      .from('trades')
      .insert(transformedTrades)
      .select()

    if (insertError) {
      console.error('Error inserting trades:', insertError)
      return NextResponse.json(
        { error: 'Failed to save trades', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${insertedTrades?.length || 0} trades from Zerodha`,
      trades: insertedTrades
    })
  } catch (error: any) {
    console.error('Zerodha import error:', error)
    return NextResponse.json(
      {
        error: 'Failed to import trades from Zerodha',
        details: error.message,
        message: 'Please ensure Zerodha API credentials are correctly configured and the access token is valid.'
      },
      { status: 500 }
    )
  }
}