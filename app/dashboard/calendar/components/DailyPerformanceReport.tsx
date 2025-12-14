'use client'

import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react'
import { formatINR } from '@/lib/formatters'
import { PnLIndicator } from '@/components/PnLIndicator'

interface DailyPerformanceReportProps {
  stats: {
    date: string
    totalPnL: number
    tradeCount: number
    winCount: number
    lossCount: number
    winRate: number
    avgWin: number
    avgLoss: number
  }
  trades: any[]
}

export function DailyPerformanceReport({ stats, trades }: DailyPerformanceReportProps) {
  return (
    <>
      <div className="space-y-6 print:bg-black print:text-white">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 print:border-white/20">
            <Activity className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-sm text-gray-400">Total Trades</p>
            <p className="text-3xl font-bold text-white">{stats.tradeCount}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 print:border-white/20">
            <Target className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-sm text-gray-400">Win Rate</p>
            <p className="text-3xl font-bold text-white">{stats.winRate.toFixed(1)}%</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 print:border-white/20">
            <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-sm text-gray-400">Total P&L</p>
            <p className={`text-3xl font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.totalPnL >= 0 ? '+' : ''}{formatINR(stats.totalPnL)}
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 print:border-white/20">
            <TrendingDown className="w-8 h-8 text-orange-400 mb-2" />
            <p className="text-sm text-gray-400">Avg Win / Loss</p>
            <p className="text-lg font-bold">
              <span className="text-green-400">+{formatINR(stats.avgWin)}</span>
              {' / '}
              <span className="text-red-400">{formatINR(stats.avgLoss)}</span>
            </p>
          </div>
        </div>

        {/* Trades Table */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden print:border-white/20">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-semibold text-white">Trade Details</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Symbol</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Type</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">Qty</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">Price</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">P&L</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Strategy</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-b border-white/5">
                    <td className="px-4 py-3 font-semibold text-white">
                      {trade.tradingsymbol || trade.symbol || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded ${
                        trade.transaction_type === 'BUY' 
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trade.transaction_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-white">{trade.quantity}</td>
                    <td className="px-4 py-3 text-right text-white">
                      {formatINR(parseFloat(String(trade.average_price || trade.entry_price || 0)))}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${
                      (parseFloat(String(trade.pnl || 0))) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {(parseFloat(String(trade.pnl || 0))) >= 0 ? '+' : ''}
                      {formatINR(parseFloat(String(trade.pnl || 0)))}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {trade.strategy || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </>
  )
}
