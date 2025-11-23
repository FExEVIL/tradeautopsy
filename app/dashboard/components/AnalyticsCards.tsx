interface Trade {
  transaction_type: string
  pnl: number
  quantity: number
  price: number
  product: string
  tradingsymbol: string
  trade_date: string | null
}

interface AnalyticsCardsProps {
  trades: Trade[]
}

export function AnalyticsCards({ trades }: AnalyticsCardsProps) {
  const totalTrades = trades.length
  
  const buyTrades = trades.filter(t => t.transaction_type === 'BUY').length
  const sellTrades = trades.filter(t => t.transaction_type === 'SELL').length
  
  const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
  
  const profitableTrades = trades.filter(t => (t.pnl || 0) > 0).length
  const losingTrades = trades.filter(t => (t.pnl || 0) < 0).length
  const winRate = totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0
  
  const totalVolume = trades.reduce((sum, trade) => 
    sum + (trade.quantity * trade.price), 0
  )
  
  const avgTradeSize = totalTrades > 0 ? totalVolume / totalTrades : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Total Trades */}
<div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400">Total Trades</p>
<div className="w-10 h-10 bg-gray-800/50 border border-gray-700 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold text-white mb-2">{totalTrades}</p>
        <p className="text-sm text-gray-500">
          {buyTrades} BUY • {sellTrades} SELL
        </p>
      </div>

      {/* Total P&L */}
<div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400">Total P&L</p>
<div className="w-10 h-10 bg-gray-800/50 border border-gray-700 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p className={`text-3xl font-bold mb-2 ${
          totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          ₹{totalPnL.toFixed(2)}
        </p>
        <p className="text-sm text-gray-500">
          {profitableTrades} wins • {losingTrades} losses
        </p>
      </div>

      {/* Win Rate */}
<div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400">Win Rate</p>
          <div className="w-10 h-10 bg-gray-800 border border-white/10 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          </div>
        </div>
        <p className={`text-3xl font-bold mb-2 ${
          winRate >= 50 ? 'text-green-400' : 'text-red-400'
        }`}>
          {winRate.toFixed(1)}%
        </p>
        <p className="text-sm text-gray-500">
          {profitableTrades} of {totalTrades} trades
        </p>
      </div>

      {/* Avg Trade Size */}
<div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400">Avg Trade Size</p>
<div className="w-10 h-10 bg-gray-800/50 border border-gray-700 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold text-white mb-2">
          ₹{avgTradeSize.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </p>
        <p className="text-sm text-gray-500">
          Volume: ₹{totalVolume.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </p>
      </div>
    </div>
  )
}