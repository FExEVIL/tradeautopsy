'use client'

import { useState } from 'react'
import { Calculator, AlertTriangle, TrendingUp } from 'lucide-react'
import { calculateRiskOfRuin, calculatePositionSize, calculateCalmarRatio } from '@/lib/risk-calculations'
import { formatINR } from '@/lib/formatters'

interface RiskCalculatorsProps {
  winRate: number
  avgWin: number
  avgLoss: number
  trades: any[]
}

export function RiskCalculators({ winRate, avgWin, avgLoss, trades }: RiskCalculatorsProps) {
  const [accountSize, setAccountSize] = useState(100000)
  const [riskPerTrade, setRiskPerTrade] = useState(2)
  const [entryPrice, setEntryPrice] = useState(100)
  const [stopLoss, setStopLoss] = useState(98)

  const riskOfRuin = calculateRiskOfRuin(winRate, avgWin, avgLoss, accountSize, riskPerTrade)
  const positionSize = calculatePositionSize(accountSize, riskPerTrade, entryPrice, stopLoss)
  const calmarRatio = calculateCalmarRatio(trades)

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Calculator className="w-5 h-5 text-blue-400" />
        Risk Calculators
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk of Ruin Calculator */}
        <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h4 className="font-semibold text-white">Risk of Ruin</h4>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Probability of losing your entire account with current trading parameters
          </p>

          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Account Size (₹)</label>
              <input
                type="number"
                value={accountSize}
                onChange={(e) => setAccountSize(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Risk Per Trade (%)</label>
              <input
                type="number"
                value={riskPerTrade}
                onChange={(e) => setRiskPerTrade(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-white"
                step="0.1"
                min="0.1"
                max="10"
              />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${
            riskOfRuin < 10 ? 'bg-green-500/10 border border-green-500/20' :
            riskOfRuin < 25 ? 'bg-yellow-500/10 border border-yellow-500/20' :
            'bg-red-500/10 border border-red-500/20'
          }`}>
            <div className="text-xs text-gray-400 mb-1">Risk of Ruin</div>
            <div className={`text-3xl font-bold ${
              riskOfRuin < 10 ? 'text-green-400' :
              riskOfRuin < 25 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {riskOfRuin.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {riskOfRuin < 10 ? 'Low risk - Safe trading parameters' :
               riskOfRuin < 25 ? 'Moderate risk - Consider reducing position size' :
               'High risk - Reduce risk per trade immediately'}
            </div>
          </div>
        </div>

        {/* Position Sizing Calculator */}
        <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h4 className="font-semibold text-white">Position Size Calculator</h4>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Calculate optimal position size based on your risk parameters
          </p>

          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Account Size (₹)</label>
              <input
                type="number"
                value={accountSize}
                onChange={(e) => setAccountSize(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Risk Per Trade (%)</label>
              <input
                type="number"
                value={riskPerTrade}
                onChange={(e) => setRiskPerTrade(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-white"
                step="0.1"
                min="0.1"
                max="10"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Entry Price (₹)</label>
              <input
                type="number"
                value={entryPrice}
                onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-white"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Stop Loss (₹)</label>
              <input
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-white"
                step="0.01"
              />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="text-xs text-gray-400 mb-1">Recommended Position Size</div>
            <div className="text-3xl font-bold text-blue-400">
              {positionSize.toLocaleString()} units
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Risk amount: {formatINR(accountSize * (riskPerTrade / 100))}
            </div>
          </div>
        </div>
      </div>

      {/* Calmar Ratio */}
      {calmarRatio > 0 && (
        <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
          <h4 className="font-semibold text-white mb-2">Calmar Ratio</h4>
          <p className="text-sm text-gray-400 mb-4">
            Annual return divided by maximum drawdown (higher is better)
          </p>
          <div className={`text-3xl font-bold ${
            calmarRatio > 3 ? 'text-green-400' :
            calmarRatio > 1 ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {calmarRatio > 10 ? '10+' : calmarRatio.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  )
}

