'use client'

import { useMemo } from 'react'
import {
  AlertTriangle,
  Shield,
  TrendingDown,
  DollarSign,
  Percent,
  Target,
  Activity,
  ArrowDown,
  ArrowUp,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { formatINR } from '@/lib/formatters'

interface RiskMetric {
  label: string
  value: string | number
  status: 'good' | 'warning' | 'critical'
  threshold: string
  icon: any
}

interface RiskAlert {
  id: string
  severity: 'high' | 'medium' | 'low'
  title: string
  description: string
  recommendation: string
  timestamp: Date
}

interface RiskManagementClientProps {
  trades: any[]
  riskMetrics: {
    maxDrawdown: number
    sharpeRatio: number
    sortinoRatio: number
    winRate: number
    avgWin: number
    avgLoss: number
    totalTrades: number
    totalPnL: number
    currentDrawdown: number
  }
  accountSize: number
  dailyPnL: number
}

export function RiskManagementClient({
  trades,
  riskMetrics,
  accountSize,
  dailyPnL,
}: RiskManagementClientProps) {
  // Calculate risk metrics for display
  const metrics: RiskMetric[] = useMemo(() => {
    const riskPerTrade = riskMetrics.totalTrades > 0 && accountSize > 0
      ? ((riskMetrics.avgLoss / accountSize) * 100).toFixed(1) + '%'
      : '0%'
    
    const riskPerTradeStatus = parseFloat(riskPerTrade) > 2 ? 'warning' : 'good'
    
    const dailyLossLimit = 2000 // Default limit
    const dailyLossStatus = dailyPnL < -dailyLossLimit 
      ? 'critical' 
      : dailyPnL < -dailyLossLimit * 0.8 
      ? 'warning' 
      : 'good'

    const openRisk = riskMetrics.totalTrades > 0
      ? riskMetrics.avgLoss * 3 // Estimate 3x average loss as open risk
      : 0
    const maxOpenRisk = accountSize * 0.06 // 6% of account
    const openRiskStatus = openRisk > maxOpenRisk ? 'warning' : 'good'

    const sharpeStatus = riskMetrics.sharpeRatio >= 1.5 
      ? 'good' 
      : riskMetrics.sharpeRatio >= 1 
      ? 'warning' 
      : 'critical'

    const winRateStatus = riskMetrics.winRate >= 60 
      ? 'good' 
      : riskMetrics.winRate >= 50 
      ? 'warning' 
      : 'critical'

    // Calculate position sizing consistency (coefficient of variation)
    const positionSizes = trades
      .map(t => typeof t.quantity === 'string' ? parseFloat(t.quantity) : (t.quantity || 0))
      .filter(q => q > 0)
    
    let positionConsistency = 'Inconsistent'
    let positionStatus: 'good' | 'warning' | 'critical' = 'warning'
    
    if (positionSizes.length > 1) {
      const mean = positionSizes.reduce((a, b) => a + b, 0) / positionSizes.length
      const variance = positionSizes.reduce((sum, size) => sum + Math.pow(size - mean, 2), 0) / positionSizes.length
      const stdDev = Math.sqrt(variance)
      const cv = mean > 0 ? stdDev / mean : 1
      
      if (cv < 0.3) {
        positionConsistency = 'Consistent'
        positionStatus = 'good'
      } else if (cv < 0.5) {
        positionConsistency = 'Moderate'
        positionStatus = 'warning'
      } else {
        positionConsistency = 'Inconsistent'
        positionStatus = 'critical'
      }
    }

    return [
      {
        label: 'Risk per Trade',
        value: riskPerTrade,
        status: riskPerTradeStatus,
        threshold: 'Max: 2%',
        icon: Percent,
      },
      {
        label: 'Daily Loss Limit',
        value: `₹${Math.abs(dailyPnL).toLocaleString('en-IN')} / ₹${dailyLossLimit.toLocaleString('en-IN')}`,
        status: dailyLossStatus,
        threshold: 'Stop at ₹2,000',
        icon: DollarSign,
      },
      {
        label: 'Open Risk',
        value: `₹${openRisk.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
        status: openRiskStatus,
        threshold: `Max: ₹${maxOpenRisk.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
        icon: Activity,
      },
      {
        label: 'Sharpe Ratio',
        value: riskMetrics.sharpeRatio.toFixed(2),
        status: sharpeStatus,
        threshold: 'Target: >1.5',
        icon: TrendingDown,
      },
      {
        label: 'Win Rate',
        value: `${riskMetrics.winRate.toFixed(1)}%`,
        status: winRateStatus,
        threshold: 'Target: >60%',
        icon: Target,
      },
      {
        label: 'Position Sizing',
        value: positionConsistency,
        status: positionStatus,
        threshold: 'CV < 0.3',
        icon: Shield,
      },
    ]
  }, [riskMetrics, accountSize, dailyPnL, trades])

  // Generate risk alerts based on actual data
  const alerts: RiskAlert[] = useMemo(() => {
    const alertList: RiskAlert[] = []

    // Daily loss limit alert
    if (dailyPnL < -1800) {
      alertList.push({
        id: 'daily-loss',
        severity: dailyPnL < -2000 ? 'high' : 'medium',
        title: 'Daily Loss Limit Approaching',
        description: `You have lost ₹${Math.abs(dailyPnL).toLocaleString('en-IN')} today. Daily loss limit is ₹2,000.`,
        recommendation: dailyPnL < -2000 
          ? 'Stop trading immediately for today.'
          : 'Stop trading for today if you lose another ₹' + (2000 + dailyPnL).toLocaleString('en-IN') + '.',
        timestamp: new Date(),
      })
    }

    // Risk per trade alert
    const avgRiskPercent = riskMetrics.totalTrades > 0 && accountSize > 0
      ? (riskMetrics.avgLoss / accountSize) * 100
      : 0
    
    if (avgRiskPercent > 2.5) {
      alertList.push({
        id: 'position-size',
        severity: avgRiskPercent > 3 ? 'high' : 'medium',
        title: 'Position Size Exceeded',
        description: `Average risk per trade is ${avgRiskPercent.toFixed(1)}%, above your 2% limit.`,
        recommendation: 'Reduce position size to stay within risk parameters.',
        timestamp: new Date(),
      })
    }

    // Drawdown alert
    const drawdownPercent = (riskMetrics.currentDrawdown / accountSize) * 100
    if (drawdownPercent > 7) {
      alertList.push({
        id: 'drawdown',
        severity: drawdownPercent > 8 ? 'high' : 'medium',
        title: 'High Drawdown Detected',
        description: `Current drawdown is ${drawdownPercent.toFixed(1)}% of account (₹${riskMetrics.currentDrawdown.toLocaleString('en-IN')}).`,
        recommendation: drawdownPercent > 8
          ? 'Stop trading and review your strategy.'
          : 'Consider reducing position sizes until drawdown recovers.',
        timestamp: new Date(),
      })
    }

    // Low win rate alert
    if (riskMetrics.winRate < 45 && riskMetrics.totalTrades > 10) {
      alertList.push({
        id: 'win-rate',
        severity: 'medium',
        title: 'Low Win Rate',
        description: `Your win rate is ${riskMetrics.winRate.toFixed(1)}%, below the recommended 50%+.`,
        recommendation: 'Review your entry criteria and consider tightening stop losses.',
        timestamp: new Date(),
      })
    }

    return alertList
  }, [dailyPnL, riskMetrics, accountSize])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-400 bg-green-500/10 border-green-500/30'
      case 'warning':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
      case 'critical':
        return 'text-red-400 bg-red-500/10 border-red-500/30'
      default:
        return 'text-gray-400 bg-gray-800/50 border-gray-700'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/10 border-red-500/30'
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500/30'
      case 'low':
        return 'bg-blue-500/10 border-blue-500/30'
      default:
        return 'bg-gray-800/50 border-gray-700'
    }
  }

  const drawdownPercentage = accountSize > 0 
    ? (riskMetrics.currentDrawdown / accountSize) * 100 
    : 0
  const maxDrawdownPercentage = accountSize > 0 
    ? (riskMetrics.maxDrawdown / accountSize) * 100 
    : 0
  const drawdownUsed = riskMetrics.maxDrawdown > 0
    ? (Math.abs(riskMetrics.currentDrawdown) / Math.abs(riskMetrics.maxDrawdown)) * 100
    : 0

  // Calculate monthly return percentage
  const monthlyReturnPercent = accountSize > 0
    ? ((riskMetrics.totalPnL / accountSize) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Risk Management</h1>
          </div>
          <p className="text-gray-400">
            Monitor and control your trading risk in real-time
          </p>
        </div>

        {/* Account Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card variant="darker">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <DollarSign className="w-4 h-4" />
              <span>Account Size</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              ₹{accountSize.toLocaleString('en-IN')}
            </p>
            <p className={`text-sm ${riskMetrics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {riskMetrics.totalPnL >= 0 ? '+' : ''}{monthlyReturnPercent}% this period
            </p>
          </Card>

          <Card variant="darker">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <TrendingDown className="w-4 h-4" />
              <span>Current Drawdown</span>
            </div>
            <p className="text-3xl font-bold text-red-400 mb-1">
              ₹{riskMetrics.currentDrawdown.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-sm text-gray-400">
              {drawdownPercentage.toFixed(2)}% of account
            </p>
          </Card>

          <Card variant="darker">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Max Drawdown (All-Time)</span>
            </div>
            <p className="text-3xl font-bold text-yellow-400 mb-1">
              ₹{riskMetrics.maxDrawdown.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-sm text-gray-400">
              {maxDrawdownPercentage.toFixed(2)}% of account
            </p>
          </Card>
        </div>

        {/* Drawdown Visualization */}
        <Card variant="darker">
          <h2 className="text-lg font-semibold text-white mb-4">
            Drawdown Status
          </h2>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Current vs Max Drawdown</span>
              <span className="text-sm font-semibold text-white">
                {drawdownUsed.toFixed(1)}% used
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  drawdownUsed > 80
                    ? 'bg-red-500'
                    : drawdownUsed > 50
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(drawdownUsed, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>₹0</span>
              <span>₹{riskMetrics.maxDrawdown.toLocaleString('en-IN', { maximumFractionDigits: 0 })} (Max)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDown className="w-4 h-4 text-red-400" />
                <span className="text-sm text-gray-400">If Max Hit</span>
              </div>
              <p className="text-xl font-bold text-red-400">
                Stop Trading Immediately
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Take a break and review your strategy
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">Recovery Needed</span>
              </div>
              <p className="text-xl font-bold text-green-400">
                {accountSize > riskMetrics.currentDrawdown
                  ? ((riskMetrics.currentDrawdown / (accountSize - riskMetrics.currentDrawdown)) * 100).toFixed(2)
                  : '0.00'
                }%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                To recover from current drawdown
              </p>
            </div>
          </div>
        </Card>

        {/* Risk Metrics */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Risk Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric, index) => {
              const Icon = metric.icon
              return (
                <Card
                  key={index}
                  variant="darker"
                  className={`border ${getStatusColor(metric.status)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="w-5 h-5" />
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${
                        metric.status === 'good'
                          ? 'bg-green-500/20 text-green-400'
                          : metric.status === 'warning'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {metric.status}
                    </span>
                  </div>
                  <h3 className="text-sm text-gray-400 mb-1">{metric.label}</h3>
                  <p className="text-2xl font-bold mb-2">{metric.value}</p>
                  <p className="text-xs text-gray-500">{metric.threshold}</p>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Risk Alerts */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Active Risk Alerts
            </h2>
            {alerts.length > 0 && (
              <span className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-red-400 text-sm font-semibold">
                {alerts.length} Active
              </span>
            )}
          </div>

          {alerts.length === 0 ? (
            <Card variant="darker" className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Active Alerts</h3>
              <p className="text-gray-400">Your risk is under control</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card
                  key={alert.id}
                  variant="darker"
                  className={`border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start gap-4">
                    <AlertTriangle
                      className={`w-6 h-6 mt-1 ${
                        alert.severity === 'high'
                          ? 'text-red-400'
                          : alert.severity === 'medium'
                          ? 'text-yellow-400'
                          : 'text-blue-400'
                      }`}
                    />

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mb-2 ${
                              alert.severity === 'high'
                                ? 'bg-red-500/20 text-red-400'
                                : alert.severity === 'medium'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}
                          >
                            {alert.severity.toUpperCase()} PRIORITY
                          </span>
                          <h3 className="text-lg font-semibold text-white">
                            {alert.title}
                          </h3>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <p className="text-gray-300 mb-3">{alert.description}</p>

                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-4 h-4 text-green-400" />
                          <span className="text-sm font-semibold text-green-400">
                            Recommended Action
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{alert.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Risk Rules */}
        <Card variant="darker">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Your Risk Rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Position Sizing</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Max risk per trade: 2% of account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Max total open risk: 6% of account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Max position size: ₹10,000</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Daily Limits</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Max daily loss: ₹2,000</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Max trades per day: 5</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Stop trading after 3 consecutive losses</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Drawdown Protection</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Max drawdown: 8.5% of account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Stop trading if max hit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Reduce size at 5% drawdown</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Stop Loss Rules</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Always use stop loss</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Never move stop loss away from entry</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Use trailing stops on winners</span>
                </li>
              </ul>
            </div>
          </div>

          <button className="mt-6 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            Edit Risk Rules
          </button>
        </Card>
      </div>
    </div>
  )
}

