import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { validateTradeAgainstRules, logRuleViolation, updateAdherenceStats } from '@/lib/rule-engine'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tradeData = await request.json()

    // Validate trade against rules
    const validation = await validateTradeAgainstRules(user.id, tradeData)

    if (!validation.allowed) {
      // Trade blocked by rules - log violations
      for (const violation of validation.violations) {
        await logRuleViolation(
          user.id,
          violation.rule.id,
          null,
          violation.details
        )
      }

      return NextResponse.json({
        error: 'Trade blocked by trading rules',
        violations: validation.violations.map(v => ({
          rule: v.rule.title,
          message: v.message,
          severity: v.rule.severity
        }))
      }, { status: 403 })
    }

    // Log warnings if any (non-blocking violations)
    if (validation.violations.length > 0) {
      for (const violation of validation.violations) {
        if (violation.rule.severity === 'warning') {
          await logRuleViolation(
            user.id,
            violation.rule.id,
            null,
            violation.details
          )
        }
      }
    }

    // Get current profile ID
    const { getCurrentProfileId } = await import('@/lib/profile-utils')
    const profileId = await getCurrentProfileId(user.id)

    // Insert trade
    const { data: trade, error } = await supabase
      .from('trades')
      .insert({
        user_id: user.id,
        tradingsymbol: tradeData.tradingsymbol,
        transaction_type: tradeData.transaction_type || tradeData.side,
        quantity: Number(tradeData.quantity),
        entry_price: Number(tradeData.entry_price),
        exit_price: tradeData.exit_price ? Number(tradeData.exit_price) : null,
        trade_date: tradeData.trade_date,
        strategy: tradeData.strategy || null,
        pnl: tradeData.pnl || null,
        product: tradeData.product || 'MIS',
        profile_id: tradeData.profile_id || profileId, // Use provided profile_id or current profile
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating trade:', error)
      return NextResponse.json({ error: 'Failed to create trade', details: error.message }, { status: 500 })
    }

    // Update adherence stats for successful trade
    if (trade) {
      // Log violations with actual trade ID
      for (const violation of validation.violations) {
        await logRuleViolation(
          user.id,
          violation.rule.id,
          trade.id,
          violation.details
        )
      }
      
      await updateAdherenceStats(user.id, true)
    }

    return NextResponse.json({ 
      success: true, 
      trade,
      warnings: validation.violations.filter(v => v.rule.severity === 'warning').map(v => v.message)
    })
  } catch (error: any) {
    console.error('Manual trade creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create trade', details: error.message },
      { status: 500 }
    )
  }
}
