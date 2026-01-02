import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Validate extension token and get user
async function validateExtensionToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid authorization header', status: 401 }
  }
  
  const token = authHeader.replace('Bearer ', '').trim()
  
  if (!token || !token.startsWith('ta_')) {
    return { error: 'Invalid token format', status: 401 }
  }
  
  const supabase = await createClient()
  
  // Find user by extension token
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, user_id')
    .eq('extension_token', token)
    .maybeSingle()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error validating token:', error)
    return { error: 'Token validation failed', status: 500 }
  }
  
  if (!profile) {
    return { error: 'Invalid or expired token', status: 401 }
  }
  
  // Use profile id or user_id
  const userId = profile.user_id || profile.id
  
  return { userId, supabase }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await validateExtensionToken(request)
    
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      )
    }
    
    const { userId, supabase } = authResult
    
    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    // Fetch today's trades
    const { data: trades, error: tradesError } = await supabase
      .from('trades')
      .select('pnl, outcome')
      .eq('user_id', userId)
      .gte('trade_date', today.toISOString().split('T')[0])
      .lt('trade_date', tomorrow.toISOString().split('T')[0])
      .is('deleted_at', null)
    
    if (tradesError) {
      console.error('Error fetching trades:', tradesError)
    }
    
    // Calculate stats
    const tradesArray = trades || []
    const totalPnl = tradesArray.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0)
    const tradesCount = tradesArray.length
    const wins = tradesArray.filter(t => t.outcome === 'win' || (t.pnl && Number(t.pnl) > 0)).length
    const winRate = tradesCount > 0 ? Math.round((wins / tradesCount) * 100) : 0
    
    // Fetch user's rules to determine max trades
    const { data: rules } = await supabase
      .from('trading_rules')
      .select('rule_type, rule_value')
      .eq('user_id', userId)
      .eq('enabled', true)
      .is('deleted_at', null)
    
    // Get max trades and max loss from rules
    const maxTradesRule = rules?.find(r => r.rule_type === 'max_trades_per_day' || r.rule_type === 'max_trades')
    const maxLossRule = rules?.find(r => r.rule_type === 'max_loss_per_day' || r.rule_type === 'max_loss')
    
    const maxTrades = maxTradesRule ? Number(maxTradesRule.rule_value) : 5
    const maxLoss = maxLossRule ? Number(maxLossRule.rule_value) : 5000
    
    // Calculate consecutive losses
    const recentTrades = tradesArray.slice(-5).reverse()
    let consecutiveLosses = 0
    for (let i = 0; i < recentTrades.length; i++) {
      if (Number(recentTrades[i].pnl) < 0) {
        consecutiveLosses++
      } else {
        break
      }
    }
    
    const currentLoss = Math.abs(Math.min(0, totalPnl))
    const dailyLossPercent = maxLoss > 0 ? Math.min((currentLoss / maxLoss) * 100, 100) : 0
    
    // Determine status
    let status = 'green'
    if (tradesCount >= maxTrades || currentLoss >= maxLoss) {
      status = 'red'
    } else if (tradesCount >= maxTrades - 1 || currentLoss >= maxLoss * 0.8 || consecutiveLosses >= 2) {
      status = 'yellow'
    }
    
    return NextResponse.json({
      success: true,
      totalPnL: totalPnl,
      pnl: totalPnl,
      trades_count: tradesCount,
      totalTrades: tradesCount,
      max_trades: maxTrades,
      maxTrades: maxTrades,
      win_rate: winRate,
      winRate: winRate,
      consecutive_losses: consecutiveLosses,
      daily_loss_percent: dailyLossPercent,
      currentLoss: currentLoss,
      maxLoss: maxLoss,
      status: status,
      shouldStopTrading: status === 'red',
      rulesViolated: status === 'red' ? 1 : 0,
      warnings: [],
    })
    
  } catch (error: any) {
    console.error('GET /api/extension/stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
