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
    
    // Fetch active trading rules
    const { data: rules, error } = await supabase
      .from('trading_rules')
      .select('id, name, rule_type, rule_value, enabled')
      .eq('user_id', userId)
      .eq('enabled', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching rules:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch rules' },
        { status: 500 }
      )
    }
    
    // Get today's stats to determine rule status
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const { data: trades } = await supabase
      .from('trades')
      .select('pnl')
      .eq('user_id', userId)
      .gte('trade_date', today.toISOString().split('T')[0])
      .lt('trade_date', tomorrow.toISOString().split('T')[0])
      .is('deleted_at', null)
    
    const tradesCount = trades?.length || 0
    const totalPnl = trades?.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0) || 0
    const currentLoss = Math.abs(Math.min(0, totalPnl))
    
    // Map rules with current status
    const rulesWithStatus = (rules || []).map(rule => {
      let current = 0
      let limit = Number(rule.rule_value) || 0
      let status = 'ok'
      let statusText = 'OK'
      
      if (rule.rule_type === 'max_trades_per_day' || rule.rule_type === 'max_trades') {
        current = tradesCount
        limit = Number(rule.rule_value) || 5
        if (current >= limit) {
          status = 'violated'
          statusText = `Limit reached (${current}/${limit})`
        } else if (current >= limit - 1) {
          status = 'warning'
          statusText = `Approaching limit (${current}/${limit})`
        } else {
          statusText = `${current}/${limit}`
        }
      } else if (rule.rule_type === 'max_loss_per_day' || rule.rule_type === 'max_loss') {
        current = currentLoss
        limit = Number(rule.rule_value) || 5000
        if (current >= limit) {
          status = 'violated'
          statusText = `Limit exceeded (₹${current}/${limit})`
        } else if (current >= limit * 0.8) {
          status = 'warning'
          statusText = `Approaching limit (₹${current}/${limit})`
        } else {
          statusText = `₹${current}/${limit}`
        }
      }
      
      return {
        id: rule.id,
        name: rule.name || rule.rule_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        type: rule.rule_type,
        current,
        limit,
        status,
        statusText,
      }
    })
    
    return NextResponse.json({
      success: true,
      rules: rulesWithStatus,
    })
    
  } catch (error: any) {
    console.error('GET /api/extension/rules error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
