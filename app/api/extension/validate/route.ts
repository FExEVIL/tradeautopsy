import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { validateTradeAgainstRules } from '@/lib/rule-engine'

/**
 * Browser Extension API - Validate Prospective Trade
 * Validates a trade against user's rules before execution
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tradeData = await request.json()

    // Validate trade against rules
    const validation = await validateTradeAgainstRules(user.id, {
      tradingsymbol: tradeData.symbol,
      transaction_type: tradeData.side || tradeData.transaction_type,
      quantity: tradeData.quantity,
      average_price: tradeData.price,
      trade_date: tradeData.timestamp || new Date().toISOString()
    })

    // Format response for extension
    const violations = validation.violations.map(v => ({
      ruleId: v.rule.id,
      ruleTitle: v.rule.title,
      message: v.message,
      severity: v.rule.severity,
      details: v.details
    }))

    const warnings = violations.filter(v => v.severity === 'warning')
    const blocking = violations.filter(v => v.severity === 'blocking')

    return NextResponse.json({
      allowed: validation.allowed,
      violations: {
        blocking,
        warnings
      },
      message: blocking.length > 0
        ? `Trade blocked: ${blocking[0].message}`
        : warnings.length > 0
        ? `Warning: ${warnings[0].message}`
        : 'Trade allowed'
    })
  } catch (error: any) {
    console.error('Extension validate error:', error)
    return NextResponse.json(
      { error: 'Failed to validate trade', details: error.message },
      { status: 500 }
    )
  }
}
