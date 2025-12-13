import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { processTradesWithPnL, TradeData } from '@/lib/pnl-calculator'

/**
 * Background job to calculate P&L for trades that don't have it
 * This can be called after large imports or for existing trades
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { profileId, limit = 1000 } = await request.json().catch(() => ({ profileId: null, limit: 1000 }))

    // Get current profile ID if not provided
    let activeProfileId = profileId
    if (!activeProfileId) {
      const { getCurrentProfileId } = await import('@/lib/profile-utils')
      activeProfileId = await getCurrentProfileId(user.id)
    }

    // Fetch trades without P&L or with P&L = 0, ordered by date
    let query = supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('trade_date', { ascending: true })
      .limit(limit)

    if (activeProfileId) {
      query = query.eq('profile_id', activeProfileId)
    }

    // Get trades where P&L is null or 0
    const { data: trades, error: fetchError } = await query
      .or('pnl.is.null,pnl.eq.0')

    if (fetchError) throw fetchError

    if (!trades || trades.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No trades need P&L calculation',
        count: 0 
      })
    }

    // Convert to TradeData format
    const tradeDataForPnL: TradeData[] = trades.map((trade: any) => ({
      symbol: trade.tradingsymbol || '',
      quantity: trade.quantity || 0,
      price: trade.average_price || trade.entry_price || trade.exit_price || 0,
      trade_type: (trade.transaction_type || trade.side || '').toUpperCase() as 'BUY' | 'SELL',
      instrument_type: (trade.instrument_type || 'EQUITY') as 'EQUITY' | 'FO' | 'OPTIONS',
      lot_size: trade.lot_size,
      charges: trade.charges,
      trade_date: trade.trade_date || '',
      trade_id: trade.trade_id,
      product: trade.product
    }))

    // Process trades with P&L calculation
    const tradesWithPnL = processTradesWithPnL(tradeDataForPnL)

    // Create a map of calculated P&L by trade identifier
    const pnlMap = new Map<string, { pnl: number; pnl_percentage: number; charges: number }>()
    tradesWithPnL.forEach(t => {
      if (t.trade_id) {
        pnlMap.set(t.trade_id, {
          pnl: t.pnl,
          pnl_percentage: t.pnl_percentage,
          charges: t.charges
        })
      }
      // Also map by date+symbol+quantity for trades without trade_id
      const fallbackKey = `${t.trade_date}_${t.symbol}_${t.quantity}_${t.trade_type}`
      pnlMap.set(fallbackKey, {
        pnl: t.pnl,
        pnl_percentage: t.pnl_percentage,
        charges: t.charges
      })
    })

    // Update trades with calculated P&L
    let updatedCount = 0
    const batchSize = 100

    for (let i = 0; i < trades.length; i += batchSize) {
      const batch = trades.slice(i, i + batchSize)
      
      const updates = batch.map(trade => {
        const key = trade.trade_id || `${trade.trade_date}_${trade.tradingsymbol}_${trade.quantity}_${trade.transaction_type}`
        const calculatedPnL = pnlMap.get(key)
        
        if (calculatedPnL) {
          return {
            id: trade.id,
            pnl: calculatedPnL.pnl,
            pnl_percentage: calculatedPnL.pnl_percentage,
            charges: calculatedPnL.charges
          }
        }
        return null
      }).filter(Boolean) as Array<{ id: string; pnl: number; pnl_percentage: number; charges: number }>

      if (updates.length > 0) {
        // Update in batches
        for (const update of updates) {
          const { error: updateError } = await supabase
            .from('trades')
            .update({
              pnl: update.pnl,
              pnl_percentage: update.pnl_percentage,
              charges: update.charges
            })
            .eq('id', update.id)

          if (!updateError) {
            updatedCount++
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Calculated P&L for ${updatedCount} trades`,
      count: updatedCount,
      totalProcessed: trades.length
    })
  } catch (error) {
    console.error('P&L calculation error:', error)
    return NextResponse.json({ 
      error: 'P&L calculation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
