import { Trade, Metrics, MarketRegime } from '../core/types'

export class RegimeDetector {
  detect(trades: Trade[], metrics: Metrics): MarketRegime {
    if (trades.length === 0) return 'ranging'

    const sorted = [...trades].sort((a, b) => (a.exit_time > b.exit_time ? 1 : -1))
    const recent = sorted.slice(-100)

    const dailyByDate: Record<string, number> = {}
    for (const t of recent) {
      const d = new Date(t.exit_time)
      d.setHours(0, 0, 0, 0)
      const key = d.toISOString()
      dailyByDate[key] = (dailyByDate[key] || 0) + t.pnl
    }

    const days = Object.values(dailyByDate)
    if (days.length === 0) return 'ranging'

    const mean = days.reduce((s, v) => s + v, 0) / days.length
    const variance = days.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / days.length
    const vol = Math.sqrt(variance)

    const max = Math.max(...days)
    const min = Math.min(...days)

    const maxAbs = Math.max(Math.abs(max), Math.abs(min)) || 1
    const trendScore = mean / maxAbs

    const volScore = vol / maxAbs

    if (volScore > 0.7) {
      return 'high_volatility'
    }
    if (volScore < 0.2) {
      return 'low_volatility'
    }

    if (trendScore > 0.3) {
      return metrics.totalPnL > 0 ? 'strong_uptrend' : 'weak_uptrend'
    }
    if (trendScore < -0.3) {
      return metrics.totalPnL < 0 ? 'strong_downtrend' : 'weak_downtrend'
    }

    return 'ranging'
  }
}
