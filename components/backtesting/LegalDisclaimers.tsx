'use client'

import { AlertTriangle, Info } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export function LegalDisclaimers() {
  return (
    <Card variant="darker" className="border-yellow-500/20 bg-yellow-500/5">
      <div className="space-y-4">
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
    </Card>
  )
}
