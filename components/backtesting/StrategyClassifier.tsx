'use client'

import { classifyStrategy } from '@/lib/backtesting/strategy-classifier'
import { TradeLeg, StrategyClassification } from '@/types/backtesting'
import { Card } from '@/components/ui/Card'
import { TrendingUp, TrendingDown, Minus, Zap, Shield, AlertTriangle } from 'lucide-react'

interface StrategyClassifierProps {
  legs: TradeLeg[]
}

export function StrategyClassifier({ legs }: StrategyClassifierProps) {
  if (legs.length === 0) {
    return (
      <Card variant="darker" className="text-center py-8">
        <p className="text-gray-400">Add strategy legs to auto-detect strategy type</p>
      </Card>
    )
  }

  const classification: StrategyClassification = classifyStrategy(legs)

  const categoryIcons = {
    bullish: TrendingUp,
    bearish: TrendingDown,
    neutral: Minus,
    volatile: Zap,
  }

  const categoryColors = {
    bullish: 'text-green-500 bg-green-500/10 border-green-500/20',
    bearish: 'text-red-500 bg-red-500/10 border-red-500/20',
    neutral: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
    volatile: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  }

  const riskColors = {
    defined: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    undefined: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  }

  const Icon = categoryIcons[classification.category]
  const confidenceColor = classification.confidence >= 80 
    ? 'text-green-400' 
    : classification.confidence >= 60 
    ? 'text-yellow-400' 
    : 'text-gray-400'

  return (
    <Card variant="darker">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-300">Strategy Classification</h3>
          <span className={`text-xs px-2 py-1 rounded ${confidenceColor} bg-white/5`}>
            {classification.confidence}% confidence
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Strategy Name */}
          <div className="col-span-2">
            <div className={`p-3 rounded-lg border ${categoryColors[classification.category]}`}>
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <div>
                  <p className="text-sm font-semibold">{classification.strategyName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {classification.strategyType === 'options' ? 'Recognized Strategy' : 'Custom Strategy'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className={`p-3 rounded-lg border ${categoryColors[classification.category]}`}>
            <p className="text-xs text-gray-400 mb-1">Category</p>
            <p className="text-sm font-semibold capitalize">{classification.category}</p>
          </div>

          {/* Risk Profile */}
          <div className={`p-3 rounded-lg border ${riskColors[classification.riskProfile]}`}>
            <p className="text-xs text-gray-400 mb-1">Risk Profile</p>
            <div className="flex items-center gap-1.5">
              {classification.riskProfile === 'defined' ? (
                <Shield className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              <p className="text-sm font-semibold capitalize">{classification.riskProfile} Risk</p>
            </div>
          </div>
        </div>

        {/* Legs Summary */}
        <div className="pt-3 border-t border-white/5">
          <p className="text-xs text-gray-400 mb-2">Strategy Legs ({legs.length})</p>
          <div className="space-y-1.5">
            {legs.map((leg, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-gray-400">
                  Leg {leg.legNumber}: {leg.action.toUpperCase()} {leg.instrumentType.toUpperCase()}
                </span>
                {leg.strikePrice && (
                  <span className="text-gray-300 font-mono">
                    Strike: ₹{leg.strikePrice}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
