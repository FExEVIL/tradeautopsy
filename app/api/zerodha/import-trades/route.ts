import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase-server'
import { fetchZerodhaTrades } from '@/lib/zerodha'
import { decryptString } from '@/lib/encryption'

type KiteTrade = {
  trade_id: string
  order_id: string
  exchange: string
  tradingsymbol: string
  instrument_token: number
  transaction_type: string
  quantity: number
  average_price?: number
  price?: number
  product: string
  order_type: string
  fill_timestamp?: string
  exchange_timestamp?: string
}

export async function POST() {
  const supabase = createClient(cookies())
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get Zerodha access token
  const { data: tokenData, error: tokenError } = await supabase
    .from('zerodha_tokens')
    .select('access_token')
    .eq('user_id', user.id)
    .single()

  if (tokenError || !tokenData) {
    return NextResponse.json(
      { error: 'Zerodha not connected. Please connect first.' },
      { status: 400 }
    )
  }

  let accessToken: string
  try {
    accessToken = decryptString(tokenData.access_token)
  } catch (error) {
    console.error('Failed to decrypt Zerodha token:', error)
    return NextResponse.json(
      { error: 'Failed to load Zerodha token. Please reconnect.' },
      { status: 500 }
    )
  }

  // Fetch trades from Zerodha
  const tradesResult = await fetchZerodhaTrades(accessToken)

  if (!tradesResult.success || !tradesResult.data) {
    return NextResponse.json(
      { error: tradesResult.error || 'Failed to fetch trades' },
      { status: 500 }
    )
  }

  const trades = tradesResult.data

  // Transform and insert trades into Supabase
  const tradesToInsert = trades.map((trade: KiteTrade) => ({
    user_id: user.id,
    trade_id: trade.trade_id,
    order_id: trade.order_id,
    exchange: trade.exchange,
    tradingsymbol: trade.tradingsymbol,
    instrument_token: trade.instrument_token,
    transaction_type: trade.transaction_type,
    quantity: trade.quantity,
    price: trade.average_price ?? trade.price ?? 0,
    product: trade.product,
    order_type: trade.order_type,
    trade_date: trade.fill_timestamp ? new Date(trade.fill_timestamp).toISOString().split('T')[0] : null,
    exchange_timestamp: trade.exchange_timestamp,
    pnl: 0, // We'll calculate this later
  }))

  // Insert trades (ignore duplicates)
  const { error: insertError, data: insertedTrades } = await supabase
    .from('trades')
    .upsert(tradesToInsert, { 
      onConflict: 'user_id,trade_id',
      ignoreDuplicates: true 
    })
    .select()

  if (insertError) {
    console.error('Failed to insert trades:', insertError)
    return NextResponse.json(
      { error: 'Failed to save trades' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    imported: insertedTrades?.length || 0,
    total: trades.length,
  })
}
