import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { fetchZerodhaTrades } from '@/lib/zerodha'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const { data: tokenData, error: tokenError } = await supabase
    .from('zerodha_tokens')
    .select('access_token')
    .eq('user_id', user.id)
    .single()

  if (tokenError || !tokenData) {
    return NextResponse.redirect(
      new URL('/dashboard?error=zerodha_not_connected', request.url)
    )
  }

  const tradesResult = await fetchZerodhaTrades(tokenData.access_token)

  if (!tradesResult.success || !tradesResult.data) {
    console.error('Failed to fetch trades:', tradesResult.error)
    return NextResponse.redirect(
      new URL('/dashboard?error=failed_to_fetch_trades', request.url)
    )
  }

  const trades = tradesResult.data

  const tradesToInsert = trades.map((trade: any) => ({
    user_id: user.id,
    trade_id: String(trade.trade_id),
    order_id: trade.order_id,
    exchange: trade.exchange,
    tradingsymbol: trade.tradingsymbol,
    instrument_token: trade.instrument_token,
    transaction_type: trade.transaction_type,
    quantity: trade.quantity,
    price: trade.average_price || trade.price,
    product: trade.product,
    order_type: trade.order_type,
    trade_date: trade.fill_timestamp ? new Date(trade.fill_timestamp).toISOString().split('T')[0] : null,
    exchange_timestamp: trade.exchange_timestamp,
    pnl: 0,
  }))

  const { error: insertError } = await supabase
    .from('trades')
    .upsert(tradesToInsert, { 
      onConflict: 'user_id,trade_id',
      ignoreDuplicates: false
    })

  if (insertError) {
    console.error('Failed to insert trades:', insertError)
    return NextResponse.redirect(
      new URL('/dashboard?error=failed_to_save_trades', request.url)
    )
  }

  return NextResponse.redirect(
    new URL(`/dashboard?imported=${trades.length}`, request.url)
  )
}