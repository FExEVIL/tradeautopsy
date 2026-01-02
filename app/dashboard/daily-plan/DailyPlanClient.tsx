'use client'

import { useState, useEffect } from 'react'
import { format, isToday, parseISO } from 'date-fns'
// Using inline card styles for black theme compatibility
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  AlertCircle, 
  CheckCircle2,
  Plus,
  Edit2,
  Save,
  X,
  Calendar as CalendarIcon,
  BarChart3,
  BookOpen,
  Lightbulb,
  RefreshCw
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useProfile } from '@/lib/contexts/ProfileContext'

interface DailyPlan {
  id?: string
  plan_date: string
  market_sentiment?: string | null
  key_events?: string[] | null
  market_notes?: string | null
  support_levels?: number[] | null
  resistance_levels?: number[] | null
  key_symbols?: string[] | null
  trading_plan?: string | null
  risk_parameters?: {
    max_loss?: number
    max_trades?: number
    position_size?: number
  } | null
  focus_areas?: string[] | null
  eod_review?: string | null
  plan_execution_score?: number | null
  lessons_learned?: string | null
  tomorrow_focus?: string | null
  completed?: boolean
}

interface DailyPlanClientProps {
  initialPlan: DailyPlan | null
  recentPlans: DailyPlan[]
  profileId: string | null
}

export default function DailyPlanClient({ initialPlan, recentPlans, profileId }: DailyPlanClientProps) {
  const [plan, setPlan] = useState<DailyPlan>(initialPlan || {
    plan_date: new Date().toISOString().split('T')[0],
    market_sentiment: null,
    key_events: [],
    market_notes: '',
    support_levels: [],
    resistance_levels: [],
    key_symbols: [],
    trading_plan: '',
    risk_parameters: { max_loss: 0, max_trades: 0, position_size: 0 },
    focus_areas: [],
    eod_review: '',
    plan_execution_score: null,
    lessons_learned: '',
    tomorrow_focus: '',
    completed: false,
  })
  const [isEditing, setIsEditing] = useState(!initialPlan)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'levels' | 'plan' | 'review'>('overview')
  const [newEvent, setNewEvent] = useState('')
  const [newSymbol, setNewSymbol] = useState('')
  const [newSupport, setNewSupport] = useState('')
  const [newResistance, setNewResistance] = useState('')
  const [newFocusArea, setNewFocusArea] = useState('')
  const supabase = createClient()

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const planData = {
        ...plan,
        user_id: user.id,
        profile_id: profileId,
        plan_date: plan.plan_date,
      }

      if (initialPlan?.id) {
        // Update existing plan
        const { error } = await supabase
          .from('daily_trade_plans')
          .update(planData)
          .eq('id', initialPlan.id)
        
        if (error) throw error
      } else {
        // Create new plan
        const { error } = await supabase
          .from('daily_trade_plans')
          .insert(planData)
        
        if (error) throw error
      }

      setIsEditing(false)
      window.location.reload() // Refresh to get updated data
    } catch (error) {
      console.error('Error saving plan:', error)
      alert('Failed to save plan. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const addEvent = () => {
    if (newEvent.trim()) {
      setPlan({
        ...plan,
        key_events: [...(plan.key_events || []), newEvent.trim()],
      })
      setNewEvent('')
    }
  }

  const removeEvent = (index: number) => {
    setPlan({
      ...plan,
      key_events: plan.key_events?.filter((_, i) => i !== index) || [],
    })
  }

  const addSymbol = () => {
    if (newSymbol.trim()) {
      setPlan({
        ...plan,
        key_symbols: [...(plan.key_symbols || []), newSymbol.trim().toUpperCase()],
      })
      setNewSymbol('')
    }
  }

  const removeSymbol = (index: number) => {
    setPlan({
      ...plan,
      key_symbols: plan.key_symbols?.filter((_, i) => i !== index) || [],
    })
  }

  const addSupport = () => {
    const value = parseFloat(newSupport)
    if (!isNaN(value)) {
      setPlan({
        ...plan,
        support_levels: [...(plan.support_levels || []), value],
      })
      setNewSupport('')
    }
  }

  const removeSupport = (index: number) => {
    setPlan({
      ...plan,
      support_levels: plan.support_levels?.filter((_, i) => i !== index) || [],
    })
  }

  const addResistance = () => {
    const value = parseFloat(newResistance)
    if (!isNaN(value)) {
      setPlan({
        ...plan,
        resistance_levels: [...(plan.resistance_levels || []), value],
      })
      setNewResistance('')
    }
  }

  const removeResistance = (index: number) => {
    setPlan({
      ...plan,
      resistance_levels: plan.resistance_levels?.filter((_, i) => i !== index) || [],
    })
  }

  const addFocusArea = () => {
    if (newFocusArea.trim()) {
      setPlan({
        ...plan,
        focus_areas: [...(plan.focus_areas || []), newFocusArea.trim()],
      })
      setNewFocusArea('')
    }
  }

  const removeFocusArea = (index: number) => {
    setPlan({
      ...plan,
      focus_areas: plan.focus_areas?.filter((_, i) => i !== index) || [],
    })
  }

  const getSentimentIcon = (sentiment?: string | null) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="w-5 h-5 text-green-500" />
      case 'bearish':
        return <TrendingDown className="w-5 h-5 text-red-500" />
      case 'volatile':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <Minus className="w-5 h-5 text-gray-500" />
    }
  }

  const planDate = plan.plan_date ? parseISO(plan.plan_date) : new Date()
  const isPlanToday = isToday(planDate)

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Daily Trade Plan</h1>
            <p className="text-gray-400">Plan your trades before market opens.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-[#111111] border border-[#1f1f1f] rounded-lg flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-gray-400" />
              <span className="text-white font-medium">
                {format(planDate, 'EEE, d MMM')}
              </span>
              {isPlanToday && (
                <span className="ml-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-xs">
                  Today
                </span>
              )}
            </div>
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setPlan(initialPlan || plan)
                  }}
                  className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Plan'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Plan
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Market Sentiment */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 relative">
            <div className="absolute top-4 right-4 w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">MARKET BIAS</p>
            <p className={`text-2xl font-bold capitalize ${
              plan.market_sentiment === 'bullish' ? 'text-emerald-400' :
              plan.market_sentiment === 'bearish' ? 'text-red-400' :
              plan.market_sentiment === 'volatile' ? 'text-yellow-400' :
              'text-gray-400'
            }`}>
              {plan.market_sentiment || 'Not Set'}
            </p>
            <p className="text-gray-500 text-sm mt-1">Today's outlook</p>
          </div>

          {/* Profit Target */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 relative">
            <div className="absolute top-4 right-4 w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">PROFIT TARGET</p>
            <p className="text-2xl font-bold text-emerald-400">
              +₹{(plan.risk_parameters?.max_loss ? 0 : 0).toLocaleString('en-IN')}
            </p>
            <p className="text-gray-500 text-sm mt-1">Daily goal</p>
          </div>

          {/* Max Loss */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 relative">
            <div className="absolute top-4 right-4 w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">MAX LOSS</p>
            <p className="text-2xl font-bold text-red-400">
              -₹{(plan.risk_parameters?.max_loss || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-gray-500 text-sm mt-1">Stop limit</p>
          </div>

          {/* Max Trades */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 relative">
            <div className="absolute top-4 right-4 w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">MAX TRADES</p>
            <p className="text-2xl font-bold text-purple-400">{plan.risk_parameters?.max_trades || 5}</p>
            <p className="text-gray-500 text-sm mt-1">Trade limit</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[#1f1f1f] mb-6">
          {[
            { id: 'overview', label: 'Market Overview', icon: BarChart3 },
            { id: 'levels', label: 'Key Levels', icon: Target },
            { id: 'plan', label: 'Trading Plan', icon: BookOpen },
            { id: 'review', label: 'EOD Review', icon: CheckCircle2 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Market Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Market Sentiment
              </h2>
              {isEditing ? (
                <div className="space-y-4">
                  <select
                    value={plan.market_sentiment || ''}
                    onChange={(e) => setPlan({ ...plan, market_sentiment: e.target.value || null })}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="">Select sentiment</option>
                    <option value="bullish">Bullish</option>
                    <option value="bearish">Bearish</option>
                    <option value="neutral">Neutral</option>
                    <option value="volatile">Volatile</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {getSentimentIcon(plan.market_sentiment)}
                  <span className="text-lg capitalize">{plan.market_sentiment || 'Not set'}</span>
                </div>
              )}
            </div>

            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Key Events & News</h2>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newEvent}
                      onChange={(e) => setNewEvent(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addEvent()}
                      placeholder="Add event or news..."
                      className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <button
                      onClick={addEvent}
                      className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {plan.key_events?.map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg">
                        <span className="text-gray-200">{event}</span>
                        <button
                          onClick={() => removeEvent(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {plan.key_events && plan.key_events.length > 0 ? (
                    plan.key_events.map((event, index) => (
                      <div key={index} className="p-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-gray-200">
                        {event}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No events added</p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Market Notes</h2>
              {isEditing ? (
                <textarea
                  value={plan.market_notes || ''}
                  onChange={(e) => setPlan({ ...plan, market_notes: e.target.value })}
                  placeholder="Add your market observations, analysis, and insights..."
                  rows={6}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none transition-colors"
                />
              ) : (
                <p className="text-gray-300 whitespace-pre-wrap">
                  {plan.market_notes || 'No notes added'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Key Levels Tab */}
        {activeTab === 'levels' && (
          <div className="space-y-4">
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500" />
                Support Levels
              </h2>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newSupport}
                      onChange={(e) => setNewSupport(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSupport()}
                      placeholder="Enter support level..."
                      className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-emerald-400 font-medium focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <button
                      onClick={addSupport}
                      className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {plan.support_levels
                      ?.sort((a, b) => b - a)
                      .map((level, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg">
                          <span className="text-emerald-400 font-mono">{level.toLocaleString()}</span>
                          <button
                            onClick={() => removeSupport(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {plan.support_levels && plan.support_levels.length > 0 ? (
                    plan.support_levels
                      .sort((a, b) => b - a)
                      .map((level, index) => (
                        <div key={index} className="p-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg">
                          <span className="text-emerald-400 font-mono">{level.toLocaleString()}</span>
                        </div>
                      ))
                  ) : (
                    <p className="text-gray-500">No support levels added</p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Resistance Levels</h2>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newResistance}
                      onChange={(e) => setNewResistance(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addResistance()}
                      placeholder="Enter resistance level..."
                      className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-red-400 font-medium focus:outline-none focus:border-red-500 transition-colors"
                    />
                    <button
                      onClick={addResistance}
                      className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {plan.resistance_levels
                      ?.sort((a, b) => a - b)
                      .map((level, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg">
                          <span className="text-red-400 font-mono">{level.toLocaleString()}</span>
                          <button
                            onClick={() => removeResistance(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {plan.resistance_levels && plan.resistance_levels.length > 0 ? (
                    plan.resistance_levels
                      .sort((a, b) => a - b)
                      .map((level, index) => (
                        <div key={index} className="p-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg">
                          <span className="text-red-400 font-mono">{level.toLocaleString()}</span>
                        </div>
                      ))
                  ) : (
                    <p className="text-gray-500">No resistance levels added</p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Key Symbols to Watch</h2>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSymbol}
                      onChange={(e) => setNewSymbol(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSymbol()}
                      placeholder="Enter symbol (e.g., NIFTY, BANKNIFTY)..."
                      className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 uppercase focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <button
                      onClick={addSymbol}
                      className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {plan.key_symbols?.map((symbol, index) => (
                      <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg">
                        <span>{symbol}</span>
                        <button
                          onClick={() => removeSymbol(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {plan.key_symbols && plan.key_symbols.length > 0 ? (
                    plan.key_symbols.map((symbol, index) => (
                      <div key={index} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg">
                        {symbol}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No symbols added</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trading Plan Tab */}
        {activeTab === 'plan' && (
          <div className="space-y-4">
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                Trading Plan
              </h2>
              {isEditing ? (
                <textarea
                  value={plan.trading_plan || ''}
                  onChange={(e) => setPlan({ ...plan, trading_plan: e.target.value })}
                  placeholder="Detail your trading plan for the day: entry strategies, exit strategies, position sizing, risk management rules..."
                  rows={10}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none transition-colors"
                />
              ) : (
                <p className="text-gray-300 whitespace-pre-wrap">
                  {plan.trading_plan || 'No trading plan added'}
                </p>
              )}
            </div>

            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Risk Parameters</h2>
              {isEditing ? (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Profit Target (₹)</label>
                    <input
                      type="number"
                      value={plan.risk_parameters?.max_loss ? 0 : 0}
                      onChange={(e) =>
                        setPlan({
                          ...plan,
                          risk_parameters: {
                            ...plan.risk_parameters,
                            max_loss: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-emerald-400 font-medium focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Max Loss (₹)</label>
                    <input
                      type="number"
                      value={plan.risk_parameters?.max_loss || 0}
                      onChange={(e) =>
                        setPlan({
                          ...plan,
                          risk_parameters: {
                            ...plan.risk_parameters,
                            max_loss: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-red-400 font-medium focus:outline-none focus:border-red-500 transition-colors"
                      placeholder="3000"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Max Trades</label>
                    <input
                      type="number"
                      value={plan.risk_parameters?.max_trades || 0}
                      onChange={(e) =>
                        setPlan({
                          ...plan,
                          risk_parameters: {
                            ...plan.risk_parameters,
                            max_trades: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-purple-400 font-medium focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="5"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between p-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg">
                    <span className="text-gray-400">Max Loss</span>
                    <span className="text-red-400 font-mono">₹{plan.risk_parameters?.max_loss?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg">
                    <span className="text-gray-400">Max Trades</span>
                    <span className="text-white">{plan.risk_parameters?.max_trades || 0}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg">
                    <span className="text-gray-400">Position Size</span>
                    <span className="text-emerald-400 font-mono">₹{plan.risk_parameters?.position_size?.toLocaleString() || 0}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-500" />
                Focus Areas
              </h2>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFocusArea}
                      onChange={(e) => setNewFocusArea(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addFocusArea()}
                      placeholder="Add focus area..."
                      className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <button
                      onClick={addFocusArea}
                      className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {plan.focus_areas?.map((area, index) => (
                      <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg">
                        <span>{area}</span>
                        <button
                          onClick={() => removeFocusArea(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {plan.focus_areas && plan.focus_areas.length > 0 ? (
                    plan.focus_areas.map((area, index) => (
                      <div key={index} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg">
                        {area}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No focus areas added</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* EOD Review Tab */}
        {activeTab === 'review' && (
          <div className="space-y-4">
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                End of Day Review
              </h2>
              {isEditing ? (
                <textarea
                  value={plan.eod_review || ''}
                  onChange={(e) => setPlan({ ...plan, eod_review: e.target.value })}
                  placeholder="Review your trading day: what went well, what didn't, key observations..."
                  rows={8}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none transition-colors"
                />
              ) : (
                <p className="text-gray-300 whitespace-pre-wrap">
                  {plan.eod_review || 'No review added'}
                </p>
              )}
            </div>

            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Plan Execution Score</h2>
              {isEditing ? (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => setPlan({ ...plan, plan_execution_score: score })}
                      className={`flex-1 py-3 rounded-lg transition-colors ${
                        plan.plan_execution_score === score
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 hover:bg-[#252525]'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {plan.plan_execution_score ? (
                    <>
                      <div className="text-3xl font-bold text-emerald-400">{plan.plan_execution_score}</div>
                      <span className="text-gray-400">out of 5</span>
                    </>
                  ) : (
                    <span className="text-gray-500">Not rated</span>
                  )}
                </div>
              )}
            </div>

            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Lessons Learned</h2>
              {isEditing ? (
                <textarea
                  value={plan.lessons_learned || ''}
                  onChange={(e) => setPlan({ ...plan, lessons_learned: e.target.value })}
                  placeholder="What did you learn today? What patterns did you notice?"
                  rows={6}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none transition-colors"
                />
              ) : (
                <p className="text-gray-300 whitespace-pre-wrap">
                  {plan.lessons_learned || 'No lessons added'}
                </p>
              )}
            </div>

            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Tomorrow's Focus</h2>
              {isEditing ? (
                <textarea
                  value={plan.tomorrow_focus || ''}
                  onChange={(e) => setPlan({ ...plan, tomorrow_focus: e.target.value })}
                  placeholder="What should you focus on tomorrow? What adjustments will you make?"
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none transition-colors"
                />
              ) : (
                <p className="text-gray-300 whitespace-pre-wrap">
                  {plan.tomorrow_focus || 'No focus set'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Recent Plans */}
        {recentPlans.length > 0 && (
          <div className="mt-6 bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Plans</h2>
            <div className="space-y-2">
              {recentPlans.map((recentPlan) => (
                <button
                  key={recentPlan.id}
                  onClick={() => {
                    setPlan(recentPlan)
                    setIsEditing(false)
                  }}
                  className="w-full text-left p-3 bg-[#0a0a0a] border border-[#1f1f1f] hover:border-emerald-500/30 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">
                      {format(parseISO(recentPlan.plan_date), 'MMM d, yyyy')}
                    </span>
                    {recentPlan.completed && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

