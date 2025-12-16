import { Trade } from '@/lib/intelligence/core/types'

export interface Mistake {
  id: string
  user_id: string
  trade_id: string
  category: 'risk' | 'emotional' | 'technical' | 'discipline'
  type: string
  description: string
  severity: 'low' | 'medium' | 'high'
  detected_at: string
  auto_detected: boolean
  acknowledged: boolean
}

export class MistakeDetector {
  static async detectMistakes(
    trade: Trade,
    previousTrades: Trade[] = []
  ): Promise<Mistake[]> {
    const mistakes: Mistake[] = []

    // 1. No Stop Loss
    if (!trade.stop_loss || trade.stop_loss === 0) {
      mistakes.push({
        id: `mistake_${trade.id}_nostop_${Date.now()}`,
        user_id: trade.user_id,
        trade_id: trade.id,
        category: 'risk',
        type: 'no_stop_loss',
        description: 'Trade entered without a stop loss',
        severity: 'high',
        detected_at: new Date().toISOString(),
        auto_detected: true,
        acknowledged: false,
      })
    }

    // 2. Revenge Trading
    const lastTrade = previousTrades[0]
    if (lastTrade && lastTrade.pnl < 0) {
      const timeDiff = trade.entry_time && lastTrade.exit_time
        ? (new Date(trade.entry_time).getTime() - new Date(lastTrade.exit_time).getTime()) / 60000
        : Infinity

      if (timeDiff < 30) {
        mistakes.push({
          id: `mistake_${trade.id}_revenge_${Date.now()}`,
          user_id: trade.user_id,
          trade_id: trade.id,
          category: 'emotional',
          type: 'revenge_trading',
          description: 'Trade entered within 30 minutes of a loss',
          severity: 'high',
          detected_at: new Date().toISOString(),
          auto_detected: true,
          acknowledged: false,
        })
      }
    }

    // 3. Overtrading (too many trades in one day)
    const today = new Date().toISOString().split('T')[0]
    const todaysTrades = previousTrades.filter(t => {
      const tradeDate = new Date(t.entry_time || t.created_at).toISOString().split('T')[0]
      return tradeDate === today
    })

    if (todaysTrades.length >= 5) {
      mistakes.push({
        id: `mistake_${trade.id}_overtrading_${Date.now()}`,
        user_id: trade.user_id,
        trade_id: trade.id,
        category: 'emotional',
        type: 'overtrading',
        description: `Exceeded daily trade limit (${todaysTrades.length + 1} trades today)`,
        severity: 'medium',
        detected_at: new Date().toISOString(),
        auto_detected: true,
        acknowledged: false,
      })
    }

    // 4. Poor Risk-Reward
    if (trade.stop_loss && trade.target && trade.entry_price) {
      const risk = Math.abs(trade.entry_price - trade.stop_loss)
      const reward = Math.abs(trade.target - trade.entry_price)
      const rr = reward / risk

      if (rr < 1) {
        mistakes.push({
          id: `mistake_${trade.id}_rr_${Date.now()}`,
          user_id: trade.user_id,
          trade_id: trade.id,
          category: 'risk',
          type: 'poor_risk_reward',
          description: `Risk-Reward ratio ${rr.toFixed(2)} is below 1:1`,
          severity: 'medium',
          detected_at: new Date().toISOString(),
          auto_detected: true,
          acknowledged: false,
        })
      }
    }

    // 5. Cut Winners Early
    if (trade.pnl > 0 && trade.target && trade.exit_price && trade.entry_price) {
      const potentialProfit = Math.abs(trade.target - trade.entry_price)
      const actualProfit = Math.abs(trade.exit_price - trade.entry_price)

      if (actualProfit < potentialProfit * 0.5) {
        mistakes.push({
          id: `mistake_${trade.id}_early_${Date.now()}`,
          user_id: trade.user_id,
          trade_id: trade.id,
          category: 'discipline',
          type: 'cut_winner_early',
          description: 'Exited before reaching 50% of profit target',
          severity: 'low',
          detected_at: new Date().toISOString(),
          auto_detected: true,
          acknowledged: false,
        })
      }
    }

    // 6. Let Loser Run
    if (trade.pnl < 0 && trade.stop_loss && trade.exit_price && trade.entry_price) {
      const plannedLoss = Math.abs(trade.entry_price - trade.stop_loss)
      const actualLoss = Math.abs(trade.exit_price - trade.entry_price)

      if (actualLoss > plannedLoss * 1.5) {
        mistakes.push({
          id: `mistake_${trade.id}_runner_${Date.now()}`,
          user_id: trade.user_id,
          trade_id: trade.id,
          category: 'discipline',
          type: 'let_loser_run',
          description: 'Loss exceeded planned stop loss by 50%',
          severity: 'high',
          detected_at: new Date().toISOString(),
          auto_detected: true,
          acknowledged: false,
        })
      }
    }

    // 7. Position Size Too Large (if we have account balance context)
    // This would require account balance from context, so skipping for now
    // Can be added later when account balance tracking is available

    return mistakes
  }
}
