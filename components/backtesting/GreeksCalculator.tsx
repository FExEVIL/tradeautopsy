'use client'

import { useState, useEffect } from 'react'
import { TradeLeg, OptionGreeks, PortfolioGreeks } from '@/types/backtesting'
import { calculateGreeks, calculatePortfolioGreeks } from '@/lib/backtesting/greeks'
import { Card } from '@/components/ui/Card'
import { TrendingUp, TrendingDown, Clock, Zap, DollarSign } from 'lucide-react'

interface GreeksCalculatorProps {
  legs: TradeLeg[]
  spotPrice: number
  riskFreeRate?: number
  volatility?: number
}

export function GreeksCalculator({ 
  legs, 
  spotPrice, 
  riskFreeRate = 0.06, 
  volatility = 0.20 
}: GreeksCalculatorProps) {
  const [portfolioGreeks, setPortfolioGreeks] = useState<PortfolioGreeks | null>(null)
  const [legGreeks, setLegGreeks] = useState<Map<number, OptionGreeks>>(new Map())

  useEffect(() => {
    if (legs.length === 0 || spotPrice <= 0) {
      setPortfolioGreeks(null)
      setLegGreeks(new Map())
      return
    }

    const newLegGreeks = new Map<number, OptionGreeks>()
    const portfolioLegs: Array<{
      greeks: OptionGreeks
      quantity: number
      action: 'buy' | 'sell'
    }> = []

    legs.forEach((leg) => {
      if (leg.instrumentType === 'call' || leg.instrumentType === 'put') {
        if (leg.strikePrice && leg.expiryDate) {
          const expiryDate = typeof leg.expiryDate === 'string' 
            ? new Date(leg.expiryDate) 
            : leg.expiryDate
          const now = new Date()
          const daysToExpiry = Math.max(0, (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          const timeToExpiry = daysToExpiry / 365

          const greeks = calculateGreeks(
            spotPrice,
            leg.strikePrice,
            timeToExpiry,
            riskFreeRate,
            volatility,
            leg.instrumentType
          )

          newLegGreeks.set(leg.legNumber, greeks)
          portfolioLegs.push({
            greeks,
            quantity: leg.quantity,
            action: leg.action,
          })
        }
      }
    })

    setLegGreeks(newLegGreeks)

    if (portfolioLegs.length > 0) {
      const portfolio = calculatePortfolioGreeks(portfolioLegs)
      setPortfolioGreeks(portfolio)
    } else {
      setPortfolioGreeks(null)
    }
  }, [legs, spotPrice, riskFreeRate, volatility])

  if (!portfolioGreeks && legGreeks.size === 0) {
    return (
      <Card variant="darker" className="text-center py-8">
        <p className="text-gray-400">Add option legs to calculate Greeks</p>
      </Card>
    )
  }

  const greekCards = [
    {
      label: 'Delta',
      value: portfolioGreeks?.totalDelta ?? 0,
      icon: TrendingUp,
      description: 'Price sensitivity',
      color: portfolioGreeks && portfolioGreeks.totalDelta > 0 ? 'text-green-400' : 'text-red-400',
    },
    {
      label: 'Gamma',
      value: portfolioGreeks?.totalGamma ?? 0,
      icon: Zap,
      description: 'Delta sensitivity',
      color: 'text-blue-400',
    },
    {
      label: 'Theta',
      value: portfolioGreeks?.totalTheta ?? 0,
      icon: Clock,
      description: 'Time decay (daily)',
      color: 'text-orange-400',
    },
    {
      label: 'Vega',
      value: portfolioGreeks?.totalVega ?? 0,
      icon: DollarSign,
      description: 'Volatility sensitivity',
      color: 'text-purple-400',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Portfolio Greeks */}
      {portfolioGreeks && (
        <Card variant="darker">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Portfolio Greeks</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {greekCards.map((greek) => {
              const Icon = greek.icon
              return (
                <div key={greek.label} className="p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <p className="text-xs text-gray-400">{greek.label}</p>
                  </div>
                  <p className={`text-lg font-bold ${greek.color}`}>
                    {greek.value > 0 ? '+' : ''}{greek.value.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{greek.description}</p>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Individual Leg Greeks */}
      {legGreeks.size > 0 && (
        <Card variant="darker">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Leg Greeks</h3>
          <div className="space-y-3">
            {legs.map((leg) => {
              const greeks = legGreeks.get(leg.legNumber)
              if (!greeks) return null

              return (
                <div key={leg.legNumber} className="p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-300">
                      Leg {leg.legNumber}: {leg.action.toUpperCase()} {leg.instrumentType.toUpperCase()}
                    </p>
                    {leg.strikePrice && (
                      <p className="text-xs text-gray-400">Strike: ₹{leg.strikePrice}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <p className="text-gray-400">Delta</p>
                      <p className="font-mono text-gray-300">{greeks.delta.toFixed(3)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Gamma</p>
                      <p className="font-mono text-gray-300">{greeks.gamma.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Theta</p>
                      <p className="font-mono text-gray-300">{greeks.theta.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Vega</p>
                      <p className="font-mono text-gray-300">{greeks.vega.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
