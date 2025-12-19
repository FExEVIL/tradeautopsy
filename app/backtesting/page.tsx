'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { LegalDisclaimers } from '@/components/backtesting/LegalDisclaimers'
import { 
  BarChart3, 
  TrendingUp, 
  History, 
  Layers, 
  Calculator,
  Play,
  FileText
} from 'lucide-react'

export default function BacktestingPage() {
  const router = useRouter()

  const features = [
    {
      title: 'Strategy Builder',
      description: 'Build multi-leg options strategies with visual interface',
      icon: Layers,
      href: '/backtesting/strategy-builder',
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Historical Backtesting',
      description: 'Test strategies against historical market data',
      icon: History,
      href: '/backtesting/historical',
      color: 'text-green-400 bg-green-500/10 border-green-500/20',
    },
    {
      title: 'Option Chain',
      description: 'View real-time and historical option chain data',
      icon: BarChart3,
      href: '/backtesting/option-chain',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Greeks Calculator',
      description: 'Calculate Delta, Gamma, Theta, Vega for your positions',
      icon: Calculator,
      href: '/backtesting/strategy-builder',
      color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    },
  ]

  const quickActions = [
    {
      title: 'Quick Backtest',
      description: 'Run a quick backtest with default settings',
      icon: Play,
      action: () => router.push('/backtesting/historical'),
    },
    {
      title: 'View Results',
      description: 'Browse your previous backtest results',
      icon: FileText,
      action: () => router.push('/backtesting/results'),
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Backtesting Module</h1>
          <p className="text-gray-400">
            Test and analyze options strategies with historical data and advanced analytics
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon
            return (
              <Card
                key={idx}
                variant="darker"
                onClick={action.action}
                className="cursor-pointer hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-white/5">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white mb-1">{action.title}</h3>
                    <p className="text-xs text-gray-400">{action.description}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Features Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <Card
                  key={idx}
                  variant="darker"
                  onClick={() => router.push(feature.href)}
                  className="cursor-pointer hover:border-white/20 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg border ${feature.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
                      <p className="text-xs text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Legal Disclaimers */}
        <LegalDisclaimers />
      </div>
    </div>
  )
}
