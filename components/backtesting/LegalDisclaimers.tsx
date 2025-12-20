'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Info, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface LegalDisclaimersProps {
  type?: 'backtesting' | 'ai_insights'
}

export function LegalDisclaimers({ type = 'backtesting' }: LegalDisclaimersProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [isPermanentlyDismissed, setIsPermanentlyDismissed] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem(`disclaimer_${type}_dismissed`) === 'true'
      setIsPermanentlyDismissed(dismissed)
    }
  }, [type])

  const handleDismiss = () => {
    setIsDismissed(true)
  }

  const handlePermanentDismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`disclaimer_${type}_dismissed`, 'true')
      setIsPermanentlyDismissed(true)
      setIsDismissed(true)
    }
  }

  if (isDismissed || isPermanentlyDismissed) {
    return null
  }

  if (type === 'ai_insights') {
    return (
      <Card variant="darker" className="border-yellow-500/20 bg-yellow-500/5 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 hover:bg-yellow-500/20 rounded transition-colors z-10"
          aria-label="Dismiss disclaimer"
        >
          <X className="w-5 h-5 text-yellow-400" />
        </button>

        <div className="space-y-4 pr-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-500 mb-2">
                ⚠️ CRITICAL: TAI INSIGHTS ARE NOT INVESTMENT ADVICE
              </h3>
              <div className="text-xs text-gray-400 space-y-2">
                <p>
                  <strong className="text-gray-300">AI Analysis Only:</strong> Trade Autopsy Intelligence (TAI) analyzes YOUR historical trading patterns. It does NOT provide investment advice or predict future market movements.
                </p>
                <p>
                  <strong className="text-gray-300">Not Investment Advice:</strong> TradeAutopsy is NOT a SEBI-registered Investment Advisor. All insights are backward-looking educational observations and do NOT predict future market movements.
                </p>
                <p>
                  <strong className="text-gray-300">Your Responsibility:</strong> You are solely responsible for all trading decisions. Always consult a SEBI-registered advisor for investment decisions. Past performance does NOT indicate future results.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-yellow-500/30">
          <button
            onClick={handlePermanentDismiss}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors text-sm"
          >
            I Understand - Don't Show Again
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm"
          >
            Dismiss for Now
          </button>
        </div>
      </Card>
    )
  }

  return (
    <Card variant="darker" className="border-yellow-500/20 bg-yellow-500/5 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 hover:bg-yellow-500/20 rounded transition-colors z-10"
        aria-label="Dismiss disclaimer"
      >
        <X className="w-5 h-5 text-yellow-400" />
      </button>

      <div className="space-y-4 pr-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-yellow-500 mb-2">
              SEBI Compliance & Risk Disclaimer
            </h3>
            <div className="text-xs text-gray-400 space-y-2">
              <p>
                <strong className="text-gray-300">Investment Risk:</strong> Trading in derivatives involves substantial risk of loss. 
                Past performance is not indicative of future results. You may lose more than your initial investment.
              </p>
              <p>
                <strong className="text-gray-300">No Guarantee:</strong> Backtesting results are based on historical data and do not 
                guarantee future performance. Market conditions, volatility, and other factors may differ significantly.
              </p>
              <p>
                <strong className="text-gray-300">Educational Purpose:</strong> This tool is for educational and analytical purposes only. 
                It should not be considered as investment advice or a recommendation to trade.
              </p>
              <p>
                <strong className="text-gray-300">Model Limitations:</strong> Greeks calculations use Black-Scholes model which has 
                assumptions that may not hold in real markets. Actual option prices may differ from theoretical values.
              </p>
              <p>
                <strong className="text-gray-300">Data Accuracy:</strong> Historical data and option chain information may contain 
                errors or gaps. Always verify data independently before making trading decisions.
              </p>
              <p>
                <strong className="text-gray-300">Regulatory Compliance:</strong> Ensure compliance with SEBI regulations, margin 
                requirements, and position limits before executing any trades.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-3 pt-3 border-t border-white/5">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-500 mb-2">
              Important Notes
            </h3>
            <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
              <li>Commission, slippage, and liquidity costs are estimates and may vary in actual trading</li>
              <li>Backtesting assumes perfect execution which may not be achievable in real markets</li>
              <li>Greeks values change continuously with market movements</li>
              <li>Always use stop-loss and position sizing appropriate for your risk tolerance</li>
              <li>Consult a qualified financial advisor before making investment decisions</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-yellow-500/30">
        <button
          onClick={handlePermanentDismiss}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors text-sm"
        >
          I Understand - Don't Show Again
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm"
        >
          Dismiss for Now
        </button>
      </div>
    </Card>
  )
}
