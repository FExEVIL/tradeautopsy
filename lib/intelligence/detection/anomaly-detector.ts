import { Trade, Metrics, Insight } from '../core/types'

export class AnomalyDetector {
  detect(trades: Trade[], metrics: Metrics): Insight[] {
    if (trades.length === 0) return []

    const pnlValues = trades.map((t) => t.pnl)
    const mean = pnlValues.reduce((s, v) => s + v, 0) / pnlValues.length
    const variance = pnlValues.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / pnlValues.length
    const std = Math.sqrt(variance) || 1

    const anomalies: Insight[] = []

    pnlValues.forEach((pnl, index) => {
      const z = (pnl - mean) / std
      if (Math.abs(z) >= 3) {
        const trade = trades[index]
        anomalies.push({
          id: crypto.randomUUID(),
          type: 'anomaly',
          category: 'risk',
          severity: pnl < 0 ? 'critical' : 'info',
          priority: pnl < 0 ? 9 : 5,
          title: pnl < 0 ? 'Unusual Large Loss Detected' : 'Unusual Large Gain Detected',
          message:
            pnl < 0
              ? `Trade on ${trade.symbol} shows an unusually large loss (₹${Math.round(pnl)}).`
              : `Trade on ${trade.symbol} shows an unusually large gain (₹${Math.round(pnl)}).`,
          explanation:
            'This trade P&L is a statistical outlier compared to your typical trade outcomes. Review whether risk management and execution followed your plan.',
          confidence: 0.8,
          impactScore: Math.abs(pnl),
          data: { pnl, zScore: z, mean, std },
          actions: [],
          relatedPatterns: [],
          relatedTrades: [trade.id],
          acknowledged: false,
          createdAt: new Date(),
        })
      }
    })

    return anomalies
  }
}
