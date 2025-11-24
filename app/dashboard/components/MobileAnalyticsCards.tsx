interface Trade {
  transaction_type: string
  pnl: number
  quantity: number
  price: number
}

interface MobileAnalyticsCardsProps {
  trades: Trade[]
}

export function MobileAnalyticsCards({ trades }: MobileAnalyticsCardsProps) {
  const totalTrades = trades.length
  const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
  const profitableTrades = trades.filter(t => (t.pnl || 0) > 0).length
  const winRate = totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0
  const totalVolume = trades.reduce((sum, trade) => sum + (trade.quantity * trade.price), 0)
  const avgTradeSize = totalTrades > 0 ? totalVolume / totalTrades : 0

  return (
    <>
      {/* Hero Card - P&L */}
      <div className="bg-gradient-to-br from-green-900/30 to-emerald-800/20 border-2 border-green-500/30 rounded-2xl p-6 mb-6">
        <p className="text-sm text-green-400 mb-2">Total P&L</p>
        <p className={`text-5xl font-bold mb-3 ${
          totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          ₹{totalPnL.toFixed(2)}
        </p>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${
            totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {totalPnL >= 0 ? '+' : ''}12% today
          </span>
          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22" />
          </svg>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-2">Trades</p>
          <p className="text-2xl font-bold text-white">{totalTrades}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-2">Win Rate</p>
          <p className={`text-2xl font-bold ${
            winRate >= 50 ? 'text-green-400' : 'text-red-400'
          }`}>
            {winRate.toFixed(0)}%
          </p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-2">Avg Size</p>
          <p className="text-xl font-bold text-white">₹{(avgTradeSize / 1000).toFixed(0)}K</p>
        </div>
      </div>
    </>
  )
}
