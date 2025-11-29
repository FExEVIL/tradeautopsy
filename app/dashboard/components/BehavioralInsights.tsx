interface Trade {
  trade_id: string
  tradingsymbol: string
  pnl: number
  trade_date: string | null
}

interface BehavioralInsightsProps {
  trades: Trade[]
}

export function BehavioralInsights({ trades }: BehavioralInsightsProps) {
  if (trades.length === 0) return null

  const sortedTrades = [...trades].sort((a, b) => {
    const dateA = a.trade_date ? new Date(a.trade_date).getTime() : 0
    const dateB = b.trade_date ? new Date(b.trade_date).getTime() : 0
    return dateA - dateB
  })

  // Revenge trading detection
  let revengeTrades = 0
  for (let i = 1; i < sortedTrades.length; i++) {
    const prevTrade = sortedTrades[i - 1]
    const currentTrade = sortedTrades[i]
    
    if ((prevTrade.pnl || 0) < 0) {
      const prevDate = prevTrade.trade_date ? new Date(prevTrade.trade_date) : null
      const currDate = currentTrade.trade_date ? new Date(currentTrade.trade_date) : null
      
      if (prevDate && currDate) {
        const timeDiff = Math.abs(currDate.getTime() - prevDate.getTime())
        const hoursDiff = timeDiff / (1000 * 60 * 60)
        
        if (hoursDiff < 2) {
          revengeTrades++
        }
      }
    }
  }

  // Over-trading detection
  const tradesPerDay: Record<string, number> = {}
  sortedTrades.forEach(trade => {
    if (trade.trade_date) {
      const dateKey = trade.trade_date.split('T')[0]
      tradesPerDay[dateKey] = (tradesPerDay[dateKey] || 0) + 1
    }
  })
  
  const avgTradesPerDay = Object.keys(tradesPerDay).length > 0
    ? Object.values(tradesPerDay).reduce((a, b) => a + b, 0) / Object.keys(tradesPerDay).length
    : 0

  const isOverTrading = avgTradesPerDay > 5

  // Loss streak
  let currentStreak = 0
  let maxStreak = 0
  
  for (const trade of sortedTrades) {
    if ((trade.pnl || 0) < 0) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }

  // Best and worst performing symbols
  const symbolStats: Record<string, { pnl: number; count: number }> = {}
  
  sortedTrades.forEach(trade => {
    if (!symbolStats[trade.tradingsymbol]) {
      symbolStats[trade.tradingsymbol] = { pnl: 0, count: 0 }
    }
    symbolStats[trade.tradingsymbol].pnl += trade.pnl || 0
    symbolStats[trade.tradingsymbol].count += 1
  })

  const sortedSymbols = Object.entries(symbolStats)
    .map(([symbol, stats]) => ({ symbol, ...stats }))
    .sort((a, b) => b.pnl - a.pnl)

  const bestSymbol = sortedSymbols[0]
  const worstSymbol = sortedSymbols[sortedSymbols.length - 1]

  return (
    <div className="space-y-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Revenge Trading Alert */}
        {revengeTrades > 0 && (
          <div className="bg-gradient-to-r from-red-900/20 to-red-800/10 border border-red-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-900/50 border border-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-red-400">Revenge Trading</h3>
            </div>
            <p className="text-3xl font-bold text-white mb-2">{revengeTrades}</p>
            <p className="text-sm text-gray-400">
              Trades taken within 2 hours of a loss. Take a break after losses.
            </p>
          </div>
        )}

        {/* Over-Trading Alert */}
        {isOverTrading && (
          <div className="bg-gradient-to-r from-yellow-950/50 to-yellow-900/30 border border-yellow-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-900/50 border border-yellow-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-yellow-400">Over-Trading</h3>
            </div>
            <p className="text-3xl font-bold text-white mb-2">{avgTradesPerDay.toFixed(1)}</p>
            <p className="text-sm text-gray-400">
              Average trades per day. Consider reducing frequency.
            </p>
          </div>
        )}

        {/* Loss Streak */}
        {maxStreak > 2 && (
          <div className="bg-gradient-to-r from-red-900/20 to-red-800/10 border border-red-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-900/50 border border-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-red-400">Loss Streak</h3>
            </div>
            <p className="text-3xl font-bold text-white mb-2">{maxStreak}</p>
            <p className="text-sm text-gray-400">
              Consecutive losses. Review your strategy.
            </p>
          </div>
        )}
      </div>

      {/* Best & Worst Symbols */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Best Symbol */}
        {bestSymbol && bestSymbol.pnl > 0 && (
          <div className="bg-gradient-to-r from-green-950/50 to-green-900/30 border border-green-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-900/50 border border-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-green-400">Best Performing</h3>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{bestSymbol.symbol}</p>
            <p className="text-xl font-bold text-green-400 mb-2">₹{bestSymbol.pnl.toFixed(2)}</p>
            <p className="text-sm text-gray-400">{bestSymbol.count} trades</p>
          </div>
        )}

        {/* Worst Symbol */}
        {worstSymbol && worstSymbol.pnl < 0 && (
          <div className="bg-gradient-to-r from-red-900/20 to-red-800/10 border border-red-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-900/50 border border-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-red-400">Worst Performing</h3>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{worstSymbol.symbol}</p>
            <p className="text-xl font-bold text-red-400 mb-2">₹{worstSymbol.pnl.toFixed(2)}</p>
            <p className="text-sm text-gray-400">{worstSymbol.count} trades - avoid this symbol</p>
          </div>
        )}
      </div>
    </div>
  )
}
