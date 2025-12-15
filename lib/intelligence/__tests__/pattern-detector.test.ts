import { PatternDetector } from '../detection/pattern-detector'
import { Trade, UnifiedContext, UserPreferences, Metrics, AdvancedMetrics, FeatureMatrix, CoachPersonality, EmotionalState } from '../core/types'

function makeTrade(overrides: Partial<Trade>): Trade {
  return {
    id: overrides.id || Math.random().toString(),
    user_id: overrides.user_id || 'u1',
    profile_id: overrides.profile_id || 'p1',
    symbol: overrides.symbol || 'NIFTY',
    side: overrides.side || 'long',
    entry_price: overrides.entry_price ?? 100,
    exit_price: overrides.exit_price ?? 90,
    quantity: overrides.quantity ?? 1,
    pnl: overrides.pnl ?? -10,
    pnl_percentage: overrides.pnl_percentage ?? -0.1,
    gross_pnl: overrides.gross_pnl ?? -10,
    commission: overrides.commission ?? 0,
    entry_time: overrides.entry_time || new Date().toISOString(),
    exit_time: overrides.exit_time || new Date().toISOString(),
    duration_minutes: overrides.duration_minutes ?? 5,
    strategy: overrides.strategy,
    setup: overrides.setup,
    timeframe: overrides.timeframe,
    stop_loss: overrides.stop_loss,
    target: overrides.target,
    initial_risk: overrides.initial_risk ?? 5,
    risk_reward_ratio: overrides.risk_reward_ratio ?? 1,
    slippage: overrides.slippage ?? 0,
    entry_type: overrides.entry_type || 'market',
    exit_type: overrides.exit_type || 'manual',
    emotion_before: overrides.emotion_before,
    emotion_after: overrides.emotion_after,
    rule_followed: overrides.rule_followed ?? false,
    notes: overrides.notes,
    tags: overrides.tags,
    grade: overrides.grade,
    entry_screenshot: overrides.entry_screenshot,
    exit_screenshot: overrides.exit_screenshot,
    created_at: overrides.created_at || new Date().toISOString(),
    updated_at: overrides.updated_at || new Date().toISOString(),
  }
}

describe('PatternDetector', () => {
  it('detects Friday carelessness when Friday afternoon trades are much worse', () => {
    const detector = new PatternDetector()
    const baseDate = new Date()

    const window: Trade[] = []

    for (let i = 0; i < 40; i++) {
      const d = new Date(baseDate)
      d.setDate(d.getDate() - (i + 1))
      while ([0, 6, 5].includes(d.getDay())) {
        d.setDate(d.getDate() - 1)
      }
      window.push(makeTrade({ id: `o${i}`, pnl: 50, entry_time: d.toISOString() }))
    }

    for (let i = 0; i < 15; i++) {
      const d = new Date(baseDate)
      const daysToFriday = (5 + 7 - d.getDay()) % 7
      d.setDate(d.getDate() + daysToFriday)
      d.setHours(15, 0, 0, 0)
      window.push(makeTrade({ id: `f${i}`, pnl: -100, entry_time: d.toISOString() }))
    }

    const latest = window[window.length - 1]
    const patterns = detector.detectAll(window)

    const fridayPattern = patterns.find((p) => p.type === 'friday_carelessness')
    expect(fridayPattern).toBeDefined()
  })
})
