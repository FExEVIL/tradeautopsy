import { StatCard } from '@/components/ui/StatCard'
import { formatINR } from '@/lib/formatters'

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
    <div className="grid-4">
      {/* Total Trades */}
      <StatCard
        label="TOTAL TRADES"
        value={totalTrades}
        subtitle={`${buyTrades} BUY • ${sellTrades} SELL`}
        icon="barChart3"
        iconColor="blue"
        valueColor="white"
        variant="darker"
      />

      {/* Total P&L */}
      <StatCard
        label="TOTAL P&L"
        value={formatINR(totalPnL)}
        subtitle={`${profitableTrades} wins • ${losingTrades} losses`}
        icon="dollarSign"
        iconColor={totalPnL >= 0 ? 'green' : 'red'}
        valueColor="auto"
        variant="darker"
      />

      {/* Win Rate */}
      <StatCard
        label="WIN RATE"
        value={`${winRate.toFixed(1)}%`}
        subtitle={`${profitableTrades} of ${totalTrades} trades`}
        icon="target"
        iconColor={winRate >= 50 ? 'green' : 'red'}
        valueColor={winRate >= 50 ? 'green' : 'red'}
        variant="darker"
      />

      {/* Avg Trade Size */}
      <StatCard
        label="AVG TRADE SIZE"
        value={formatINR(avgTradeSize)}
        subtitle={`Volume: ${formatINR(totalVolume)}`}
        icon="trendingUp"
        iconColor="blue"
        valueColor="white"
        variant="darker"
      />
    </div>
  )
}
