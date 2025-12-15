'use client'

import { useState } from 'react'
import { Shield, Plus, X, AlertTriangle, Ban, Clock, Target, TrendingDown, Brain, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { format } from 'date-fns'
import { ErrorState } from '../components/ErrorState'
import { StatCard } from '@/components/ui/StatCard'

interface TradingRule {
  id: string
  rule_type: 'time_restriction' | 'trade_limit' | 'loss_limit' | 'behavioral' | 'strategy'
  title: string
  description: string | null
  rule_config: Record<string, any>
  enabled: boolean
  severity: 'warning' | 'blocking'
  created_at: string
}

interface AdherenceStats {
  currentStreak: number
  longestStreak: number
  totalViolations: number
  totalTrades: number
  adherenceScore: number
  badges: string[]
}

interface RulesClientProps {
  initialRules: TradingRule[]
  adherenceStats: AdherenceStats | null
}

const RULE_TYPE_CONFIG = {
  time_restriction: {
    label: 'Time Restriction',
    icon: Clock,
    color: 'blue',
    description: 'Restrict trading during specific hours'
  },
  trade_limit: {
    label: 'Trade Limit',
    icon: Target,
    color: 'purple',
    description: 'Limit number of trades per day'
  },
  loss_limit: {
    label: 'Loss Limit',
    icon: TrendingDown,
    color: 'red',
    description: 'Stop trading after reaching daily loss limit'
  },
  behavioral: {
    label: 'Behavioral Rule',
    icon: Brain,
    color: 'yellow',
    description: 'Prevent specific behavioral patterns'
  },
  strategy: {
    label: 'Strategy Rule',
    icon: Shield,
    color: 'green',
    description: 'Restrict to specific strategies'
  }
}

export default function RulesClient({ initialRules, adherenceStats }: RulesClientProps) {
  const [rules, setRules] = useState<TradingRule[]>(initialRules)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newRule, setNewRule] = useState({
    rule_type: 'time_restriction' as TradingRule['rule_type'],
    title: '',
    description: '',
    rule_config: {} as Record<string, any>,
    severity: 'warning' as 'warning' | 'blocking'
  })

  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddRule = async () => {
    if (!newRule.title.trim()) {
      setError('Rule title is required')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Please log in to create rules')
        setSaving(false)
        return
      }

      // Validate rule config based on type
      let ruleConfig: Record<string, any> = {}
      const validationErrors: string[] = []

      switch (newRule.rule_type) {
        case 'time_restriction': {
          const afterHour = newRule.rule_config.after_hour
          const beforeHour = newRule.rule_config.before_hour
          
          if (afterHour !== null && afterHour !== undefined) {
            if (afterHour < 0 || afterHour > 23) {
              validationErrors.push('After hour must be between 0 and 23')
            }
          }
          if (beforeHour !== null && beforeHour !== undefined) {
            if (beforeHour < 0 || beforeHour > 23) {
              validationErrors.push('Before hour must be between 0 and 23')
            }
          }
          if (afterHour !== null && beforeHour !== null && afterHour <= beforeHour) {
            validationErrors.push('After hour must be greater than before hour')
          }
          
          ruleConfig = {
            after_hour: afterHour !== null && afterHour !== undefined ? afterHour : null,
            before_hour: beforeHour !== null && beforeHour !== undefined ? beforeHour : null
          }
          break
        }
        case 'trade_limit': {
          const maxTrades = newRule.rule_config.max_trades_per_day
          if (!maxTrades || maxTrades < 1) {
            validationErrors.push('Max trades per day must be at least 1')
          } else if (maxTrades > 100) {
            validationErrors.push('Max trades per day cannot exceed 100')
          }
          ruleConfig = {
            max_trades_per_day: maxTrades || 5
          }
          break
        }
        case 'loss_limit': {
          const maxLoss = newRule.rule_config.max_daily_loss
          if (!maxLoss || maxLoss <= 0) {
            validationErrors.push('Max daily loss must be greater than 0')
          } else if (maxLoss > 1000000) {
            validationErrors.push('Max daily loss cannot exceed ₹10,00,000')
          }
          ruleConfig = {
            max_daily_loss: maxLoss || 5000
          }
          break
        }
        case 'behavioral': {
          ruleConfig = {
            prevent_revenge_trading: newRule.rule_config.prevent_revenge_trading || false
          }
          break
        }
        case 'strategy': {
          const allowedStrategies = newRule.rule_config.allowed_strategies || []
          if (!Array.isArray(allowedStrategies)) {
            validationErrors.push('Allowed strategies must be an array')
          }
          ruleConfig = {
            allowed_strategies: Array.isArray(allowedStrategies) ? allowedStrategies : []
          }
          break
        }
      }

      if (validationErrors.length > 0) {
        setError(validationErrors.join('. '))
        setSaving(false)
        return
      }

      const { data, error: insertError } = await supabase
        .from('trading_rules')
        .insert({
          user_id: user.id,
          rule_type: newRule.rule_type,
          title: newRule.title,
          description: newRule.description || null,
          rule_config: ruleConfig,
          severity: newRule.severity,
          enabled: true
        })
        .select()
        .single()

      if (insertError) {
        if (insertError.code === 'PGRST205' || insertError.code === 'PGRST116' || insertError.message?.includes('does not exist')) {
          setError('Trading rules table does not exist. Please run the database migration first.')
        } else {
          setError(insertError.message || 'Failed to create rule')
        }
        return
      }

      if (data) {
        setRules([...rules, data])
        setShowAddModal(false)
        setNewRule({
          rule_type: 'time_restriction',
          title: '',
          description: '',
          rule_config: {},
          severity: 'warning'
        })
      }
    } catch (err) {
      console.error('Error creating rule:', err)
      setError(err instanceof Error ? err.message : 'Failed to create rule')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleRule = async (rule: TradingRule) => {
    await supabase
      .from('trading_rules')
      .update({ enabled: !rule.enabled })
      .eq('id', rule.id)

    setRules(rules.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r))
  }

  const handleDeleteRule = async (id: string) => {
    await supabase.from('trading_rules').delete().eq('id', id)
    setRules(rules.filter(r => r.id !== id))
  }

  const stats = adherenceStats || {
    currentStreak: 0,
    longestStreak: 0,
    totalViolations: 0,
    totalTrades: 0,
    adherenceScore: 100,
    badges: []
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-400" />
              Trading Rules Engine
            </h1>
            <p className="text-gray-400 text-sm mt-1">Create rules to enforce discipline and track adherence</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            New Rule
          </button>
        </div>

        {/* Adherence Stats */}
        <div className="grid-4">
          <StatCard
            label="CURRENT STREAK"
            value={stats.currentStreak}
            subtitle="days without violations"
            icon="trophy"
            iconColor="orange"
            valueColor="white"
            variant="darker"
            className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/20"
          />
          <StatCard
            label="LONGEST STREAK"
            value={stats.longestStreak}
            subtitle="best streak"
            icon="award"
            iconColor="purple"
            valueColor="white"
            variant="darker"
          />
          <StatCard
            label="ADHERENCE SCORE"
            value={`${stats.adherenceScore.toFixed(0)}%`}
            subtitle="rule compliance"
            icon="shield"
            iconColor={stats.adherenceScore >= 90 ? 'green' : stats.adherenceScore >= 70 ? 'orange' : 'red'}
            valueColor={stats.adherenceScore >= 90 ? 'green' : stats.adherenceScore >= 70 ? 'orange' : 'red'}
            variant="darker"
          />
          <StatCard
            label="TOTAL VIOLATIONS"
            value={stats.totalViolations}
            subtitle={`out of ${stats.totalTrades} trades`}
            icon="alertTriangle"
            iconColor="red"
            valueColor="white"
            variant="darker"
          />
        </div>

        {/* Badges */}
        {stats.badges.length > 0 && (
          <div className="p-6 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Earned Badges
            </h3>
            <div className="flex flex-wrap gap-3">
              {stats.badges.map((badge, idx) => (
                <div key={idx} className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-sm font-medium">
                  {badge}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rules List */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">Your Rules</h2>
          {rules.length === 0 ? (
            <div className="text-center py-12 bg-[#0A0A0A] border border-white/5 rounded-xl">
              <Shield className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 mb-2">No rules created yet</p>
              <p className="text-sm text-gray-500 mb-4">Create your first rule to start enforcing discipline</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Create Your First Rule
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule) => {
                const config = RULE_TYPE_CONFIG[rule.rule_type as keyof typeof RULE_TYPE_CONFIG] || RULE_TYPE_CONFIG.time_restriction
                const Icon = config.icon || Shield
                const color = config.color || 'blue'

                return (
                  <div
                    key={rule.id}
                    className={`p-6 rounded-xl border ${
                      rule.enabled
                        ? 'bg-[#0F0F0F] border-white/5'
                        : 'bg-[#0F0F0F] border-white/5 opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${
                          color === 'blue' ? 'bg-blue-500/10' :
                          color === 'purple' ? 'bg-purple-500/10' :
                          color === 'red' ? 'bg-red-500/10' :
                          color === 'yellow' ? 'bg-yellow-500/10' :
                          color === 'green' ? 'bg-green-500/10' :
                          'bg-blue-500/10'
                        }`}>
                          <Icon className={`w-6 h-6 ${
                            color === 'blue' ? 'text-blue-400' :
                            color === 'purple' ? 'text-purple-400' :
                            color === 'red' ? 'text-red-400' :
                            color === 'yellow' ? 'text-yellow-400' :
                            color === 'green' ? 'text-green-400' :
                            'text-blue-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-white">{rule.title}</h3>
                            {rule.severity === 'blocking' && (
                              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Blocking</span>
                            )}
                            {rule.severity === 'warning' && (
                              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">Warning</span>
                            )}
                            {!rule.enabled && (
                              <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded">Disabled</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mb-3">{rule.description || config?.description || 'Trading rule'}</p>
                          <div className="text-xs text-gray-500">
                            {rule.rule_type === 'time_restriction' && (
                              <div>
                                {rule.rule_config.after_hour && `No trading after ${rule.rule_config.after_hour}:00`}
                                {rule.rule_config.before_hour && `No trading before ${rule.rule_config.before_hour}:00`}
                              </div>
                            )}
                            {rule.rule_type === 'trade_limit' && (
                              <div>Max {rule.rule_config.max_trades_per_day} trades per day</div>
                            )}
                            {rule.rule_type === 'loss_limit' && (
                              <div>Stop trading after ₹{rule.rule_config.max_daily_loss} daily loss</div>
                            )}
                            {rule.rule_type === 'behavioral' && (
                              <div>Prevent revenge trading patterns</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rule.enabled}
                            onChange={() => handleToggleRule(rule)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Add Rule Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Create New Rule</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rule Type</label>
                  <select
                    value={newRule.rule_type}
                    onChange={(e) => setNewRule({ ...newRule, rule_type: e.target.value as TradingRule['rule_type'], rule_config: {} })}
                    className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="time_restriction">Time Restriction</option>
                    <option value="trade_limit">Trade Limit</option>
                    <option value="loss_limit">Loss Limit</option>
                    <option value="behavioral">Behavioral Rule</option>
                    <option value="strategy">Strategy Rule</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={newRule.title}
                    onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
                    placeholder="e.g., No trading after 2 PM"
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                  <textarea
                    value={newRule.description}
                    onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                    placeholder="Describe why this rule is important"
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500"
                    rows={3}
                  />
                </div>

                {/* Rule-specific config */}
                {newRule.rule_type === 'time_restriction' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">No Trading After (Hour)</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={newRule.rule_config.after_hour !== null && newRule.rule_config.after_hour !== undefined ? newRule.rule_config.after_hour : ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : parseInt(e.target.value)
                          if (val === null || (val >= 0 && val <= 23)) {
                            setNewRule({
                              ...newRule,
                              rule_config: { ...newRule.rule_config, after_hour: val }
                            })
                          }
                        }}
                        className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3 py-2 text-white"
                        placeholder="14 (0-23)"
                      />
                      {newRule.rule_config.after_hour !== null && newRule.rule_config.after_hour !== undefined && (newRule.rule_config.after_hour < 0 || newRule.rule_config.after_hour > 23) && (
                        <p className="text-xs text-red-400 mt-1">Hour must be between 0 and 23</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">No Trading Before (Hour)</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={newRule.rule_config.before_hour !== null && newRule.rule_config.before_hour !== undefined ? newRule.rule_config.before_hour : ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : parseInt(e.target.value)
                          if (val === null || (val >= 0 && val <= 23)) {
                            setNewRule({
                              ...newRule,
                              rule_config: { ...newRule.rule_config, before_hour: val }
                            })
                          }
                        }}
                        className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3 py-2 text-white"
                        placeholder="9 (0-23)"
                      />
                      {newRule.rule_config.before_hour !== null && newRule.rule_config.before_hour !== undefined && (newRule.rule_config.before_hour < 0 || newRule.rule_config.before_hour > 23) && (
                        <p className="text-xs text-red-400 mt-1">Hour must be between 0 and 23</p>
                      )}
                    </div>
                  </div>
                )}

                {newRule.rule_type === 'trade_limit' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Max Trades Per Day</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newRule.rule_config.max_trades_per_day || 5}
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        if (!isNaN(val) && val >= 1 && val <= 100) {
                          setNewRule({
                            ...newRule,
                            rule_config: { ...newRule.rule_config, max_trades_per_day: val }
                          })
                        }
                      }}
                      className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3 py-2 text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Between 1 and 100 trades per day</p>
                  </div>
                )}

                {newRule.rule_type === 'loss_limit' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Max Daily Loss (₹)</label>
                    <input
                      type="number"
                      min="1"
                      max="1000000"
                      step="100"
                      value={newRule.rule_config.max_daily_loss || 5000}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        if (!isNaN(val) && val > 0 && val <= 1000000) {
                          setNewRule({
                            ...newRule,
                            rule_config: { ...newRule.rule_config, max_daily_loss: val }
                          })
                        }
                      }}
                      className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3 py-2 text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Between ₹1 and ₹10,00,000</p>
                  </div>
                )}

                {newRule.rule_type === 'behavioral' && (
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRule.rule_config.prevent_revenge_trading || false}
                        onChange={(e) => setNewRule({
                          ...newRule,
                          rule_config: { ...newRule.rule_config, prevent_revenge_trading: e.target.checked }
                        })}
                        className="w-4 h-4 rounded border-white/10 bg-[#0F0F0F] text-blue-600"
                      />
                      <span className="text-sm text-gray-300">Prevent revenge trading (no trades within 30 mins of a loss)</span>
                    </label>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Severity</label>
                  <select
                    value={newRule.severity}
                    onChange={(e) => setNewRule({ ...newRule, severity: e.target.value as 'warning' | 'blocking' })}
                    className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="warning">Warning (Allow override)</option>
                    <option value="blocking">Blocking (Prevent trade)</option>
                  </select>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddRule}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Rule'
                    )}
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

