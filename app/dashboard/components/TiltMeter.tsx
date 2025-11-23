'use client'

interface Trade {
  id: string
  pnl: number
  discipline_score?: number
  trade_date: string | null
}

interface TiltMeterProps {
  trades: Trade[]
}

export function TiltMeter({ trades }: TiltMeterProps) {
  if (trades.length === 0) return null

  // Get recent trades (last 10)
  const recentTrades = [...trades]
    .sort((a, b) => {
      const dateA = a.trade_date ? new Date(a.trade_date).getTime() : 0
      const dateB = b.trade_date ? new Date(b.trade_date).getTime() : 0
      return dateB - dateA
    })
    .slice(0, 10)

  // Calculate tilt indicators
  const recentLosses = recentTrades.filter((t, i) => i < 5 && (t.pnl || 0) < 0).length
  const avgDisciplineScore = recentTrades
    .filter(t => t.discipline_score !== undefined)
    .reduce((sum, t) => sum + (t.discipline_score || 0), 0) / 
    Math.max(recentTrades.filter(t => t.discipline_score !== undefined).length, 1)

  // Calculate tilt risk (0-100)
  let tiltRisk = 0
  
  // Factor 1: Recent losses (max 40 points)
  tiltRisk += Math.min(recentLosses * 10, 40)
  
  // Factor 2: Low discipline score (max 30 points)
  if (!isNaN(avgDisciplineScore)) {
    tiltRisk += Math.max(0, (10 - avgDisciplineScore) * 3)
  }
  
  // Factor 3: Consecutive losses (max 30 points)
  let consecutiveLosses = 0
  for (const trade of recentTrades) {
    if ((trade.pnl || 0) < 0) {
      consecutiveLosses++
    } else {
      break
    }
  }
  tiltRisk += Math.min(consecutiveLosses * 10, 30)

  tiltRisk = Math.min(Math.round(tiltRisk), 100)

  // Determine status
  const getTiltStatus = () => {
    if (tiltRisk < 30) return { text: 'Low Risk', color: 'text-green-400', bgGradient: 'from-green-950/50 to-green-900/30', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
    if (tiltRisk < 60) return { text: 'Moderate Risk', color: 'text-yellow-400', bgGradient: 'from-yellow-950/50 to-yellow-900/30', icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' }
    return { text: 'High Risk', color: 'text-red-400', bgGradient: 'from-red-950/50 to-red-900/30', icon: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z' }
  }

  const status = getTiltStatus()

  return (
    <div className="nano app/dashboard/components/TiltMeter.tsx p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-800 border border-white/10 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Tilt-Meter</h2>
          <p className="text-sm text-gray-400">Early warning for emotional trading</p>
        </div>
      </div>

      {/* Tilt Risk Gauge */}
      <div className={`bg-gradient-to-r ${status.bgGradient} border border-white/10 rounded-xl p-6 mb-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <svg className={`w-8 h-8 ${status.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={status.icon} />
            </svg>
            <div>
              <p className="text-sm text-gray-300">Current Status</p>
              <p className={`text-2xl font-bold ${status.color}`}>{status.text}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-300">Tilt Risk</p>
            <p className={`text-4xl font-bold ${status.color}`}>{tiltRisk}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              tiltRisk < 30 ? 'bg-green-500' : tiltRisk < 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${tiltRisk}%` }}
          />
        </div>
      </div>

      {/* Warning Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recent Losses */}
        <div className="bg-black/30 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
            </svg>
            <span className="text-sm font-medium text-gray-300">Recent Losses</span>
          </div>
          <p className="text-2xl font-bold text-white">{recentLosses}/5</p>
          <p className="text-xs text-gray-500 mt-1">In last 5 trades</p>
        </div>

        {/* Consecutive Losses */}
        <div className="bg-black/30 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            <span className="text-sm font-medium text-gray-300">Streak</span>
          </div>
          <p className="text-2xl font-bold text-white">{consecutiveLosses}</p>
          <p className="text-xs text-gray-500 mt-1">Consecutive losses</p>
        </div>

        {/* Discipline Score */}
        <div className="bg-black/30 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            <span className="text-sm font-medium text-gray-300">Discipline</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {isNaN(avgDisciplineScore) ? 'N/A' : `${avgDisciplineScore.toFixed(1)}/10`}
          </p>
          <p className="text-xs text-gray-500 mt-1">Average score</p>
        </div>
      </div>

      {/* Recommendations */}
      {tiltRisk >= 60 && (
        <div className="mt-6 bg-red-950/30 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-400 mb-1">High Tilt Risk Detected</p>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Take a break from trading</li>
                <li>• Review your trading rules</li>
                <li>• Don't increase position sizes</li>
                <li>• Consider stopping after next loss</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
