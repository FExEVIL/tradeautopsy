'use client'

import { useState } from 'react'
import { TradeLeg } from '@/types/backtesting'
import { StrategyBuilder } from '@/components/backtesting/StrategyBuilder'
import { StrategyClassifier } from '@/components/backtesting/StrategyClassifier'
import { GreeksCalculator } from '@/components/backtesting/GreeksCalculator'
import { PayoffDiagram } from '@/components/backtesting/PayoffDiagram'
import { LegalDisclaimers } from '@/components/backtesting/LegalDisclaimers'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/auth/Input'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function StrategyBuilderPage() {
  const router = useRouter()
  const [legs, setLegs] = useState<TradeLeg[]>([])
  const [spotPrice, setSpotPrice] = useState<number>(50000) // Default Nifty spot
  const [volatility, setVolatility] = useState<number>(0.20) // 20% IV
  const [riskFreeRate, setRiskFreeRate] = useState<number>(0.06) // 6% risk-free rate

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Strategy Builder</h1>
            <p className="text-gray-400">
              Build and analyze multi-leg options strategies
            </p>
          </div>
        </div>

        {/* Market Parameters */}
        <Card variant="darker">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Market Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Spot Price (₹)</label>
              <Input
                type="number"
                value={spotPrice}
                onChange={(e) => setSpotPrice(parseFloat(e.target.value) || 0)}
                className="h-9"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Implied Volatility (%)</label>
              <Input
                type="number"
                step="0.01"
                value={volatility * 100}
                onChange={(e) => setVolatility((parseFloat(e.target.value) || 0) / 100)}
                className="h-9"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Risk-Free Rate (%)</label>
              <Input
                type="number"
                step="0.01"
                value={riskFreeRate * 100}
                onChange={(e) => setRiskFreeRate((parseFloat(e.target.value) || 0) / 100)}
                className="h-9"
              />
            </div>
          </div>
        </Card>

        {/* Strategy Builder */}
        <StrategyBuilder legs={legs} onLegsChange={setLegs} />

        {/* Analysis Section */}
        {legs.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strategy Classification */}
            <StrategyClassifier legs={legs} />

            {/* Greeks Calculator */}
            <GreeksCalculator
              legs={legs}
              spotPrice={spotPrice}
              riskFreeRate={riskFreeRate}
              volatility={volatility}
            />
          </div>
        )}

        {/* Payoff Diagram */}
        {legs.length > 0 && (
          <PayoffDiagram
            legs={legs}
            currentPrice={spotPrice}
          />
        )}

        {/* Legal Disclaimers */}
        <LegalDisclaimers />
      </div>
    </div>
  )
}
