'use client'

import { useState, useEffect } from 'react'
import {
  Lightbulb,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Zap,
  Target,
  Clock,
  GraduationCap,
  Send,
  Sparkles,
  MessageCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { LegalDisclaimers } from '@/components/backtesting/LegalDisclaimers'

interface TAIInsight {
  id: string
  type: 'opportunity' | 'warning' | 'success' | 'info'
  category: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
  recommendation: string
  confidence: number
  relatedTrades: number
  createdAt: Date
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
}

export default function TAIPage() {
  const [activeTab, setActiveTab] = useState<'insights' | 'coach'>('insights')
  const [insights, setInsights] = useState<TAIInsight[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDisclaimer, setShowDisclaimer] = useState(true)

  useEffect(() => {
    if (activeTab === 'insights') {
      fetchInsights()
    } else {
      initializeCoach()
    }
  }, [activeTab])

  const fetchInsights = async () => {
    setLoading(true)
    setError(null)
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockInsights: TAIInsight[] = [
        {
          id: '1',
          type: 'opportunity',
          category: 'Strategy Optimization',
          title: 'Iron Condor Performance Improvement',
          description: 'Your Iron Condor strategy has 68% win rate in low volatility environments (IV < 15%). Consider increasing position size during these conditions.',
          impact: 'high',
          actionable: true,
          recommendation: 'Increase position size by 25% when IV < 15%',
          confidence: 87,
          relatedTrades: 45,
          createdAt: new Date(),
        },
        {
          id: '2',
          type: 'warning',
          category: 'Risk Management',
          title: 'Overtrading Pattern Detected',
          description: 'You took 16 trades in a single day on 3 occasions last month. Your win rate drops to 42% when taking more than 5 trades per day.',
          impact: 'high',
          actionable: true,
          recommendation: 'Limit yourself to 3-5 quality trades per day',
          confidence: 92,
          relatedTrades: 48,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: '3',
          type: 'success',
          category: 'Timing Analysis',
          title: 'Optimal Trading Window Identified',
          description: 'Your win rate is 24% higher during 0:00-1:00 market hours compared to your overall average.',
          impact: 'medium',
          actionable: true,
          recommendation: 'Focus more trades during 0:00-1:00 window',
          confidence: 76,
          relatedTrades: 128,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
      ]

      setInsights(mockInsights)
    } catch (error: any) {
      console.error('Error fetching insights:', error)
      setError(error.message || 'Failed to load insights')
    } finally {
      setLoading(false)
    }
  }

  const initializeCoach = () => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: "👋 Hi! I'm your Trade Autopsy Intelligence coach. I've analyzed your last 1,000 trades and I'm here to help you improve. What would you like to work on today?",
          timestamp: new Date(),
          suggestions: [
            'Help me reduce revenge trading',
            'Improve my win rate',
            'Optimize my strategy selection',
            'Manage my emotions better',
          ],
        },
      ])
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    const userInput = input
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // TODO: Replace with actual AI API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Based on your trading history, here's my analysis of "${userInput}":\n\nI've noticed some patterns in your behavior that we can work on together. Let me provide some specific recommendations...`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    } catch (error: any) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  const getInsightIcon = (type: TAIInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return TrendingUp
      case 'warning':
        return AlertCircle
      case 'success':
        return CheckCircle
      default:
        return Lightbulb
    }
  }

  const getInsightColor = (type: TAIInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return 'border-green-500/30 bg-green-500/10'
      case 'warning':
        return 'border-red-500/30 bg-red-500/10'
      case 'success':
        return 'border-blue-500/30 bg-blue-500/10'
      default:
        return 'border-yellow-500/30 bg-yellow-500/10'
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold">Trade Autopsy Intelligence</h1>
            <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-sm font-medium">
              TAI Powered
            </span>
          </div>
          <p className="text-gray-400">
            Intelligent insights and personalized analysis based on your trading history
          </p>
        </div>

        {/* SEBI Disclaimer - Always Visible */}
        {showDisclaimer && (
          <div className="mb-6">
            <LegalDisclaimers type="ai_insights" />
          </div>
        )}

        {/* Tab Navigation - MATCHES PERFORMANCE ANALYTICS STYLING */}
        <div className="flex items-center gap-2 mb-8 bg-bg-card border border-border-subtle rounded-lg p-1">
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex-1 px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === 'insights'
                ? 'bg-green-primary text-text-primary shadow-lg'
                : 'text-text-tertiary hover:text-text-primary hover:bg-border-subtle'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Lightbulb className="w-5 h-5" />
              <span>TAI Insights</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('coach')}
            className={`flex-1 px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === 'coach'
                ? 'bg-green-primary text-text-primary shadow-lg'
                : 'text-text-tertiary hover:text-text-primary hover:bg-border-subtle'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <GraduationCap className="w-5 h-5" />
              <span>Autopsy Intelligence</span>
            </div>
          </button>
        </div>

        {/* Insights Tab Content */}
        {activeTab === 'insights' && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card variant="darker">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Total Insights</span>
                  <Zap className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white">{insights.length}</p>
              </Card>

              <Card variant="darker" className="border-green-500/30 bg-green-500/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Opportunities</span>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-green-400">
                  {insights.filter((i) => i.type === 'opportunity').length}
                </p>
              </Card>

              <Card variant="darker" className="border-red-500/30 bg-red-500/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Warnings</span>
                  <AlertCircle className="w-4 h-4 text-red-400" />
                </div>
                <p className="text-2xl font-bold text-red-400">
                  {insights.filter((i) => i.type === 'warning').length}
                </p>
              </Card>

              <Card variant="darker" className="border-blue-500/30 bg-blue-500/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Actionable</span>
                  <Target className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-blue-400">
                  {insights.filter((i) => i.actionable).length}
                </p>
              </Card>
            </div>

            {/* Insights List */}
            {loading ? (
              <Card variant="darker" className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin mb-4" />
                <p className="text-gray-400">Analyzing your trading patterns...</p>
              </Card>
            ) : error ? (
              <Card variant="darker" className="border-red-500/30 bg-red-500/10 text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Insights</h3>
                <p className="text-gray-400 mb-4">{error}</p>
                <button
                  onClick={fetchInsights}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Retry
                </button>
              </Card>
            ) : insights.length === 0 ? (
              <Card variant="darker" className="text-center py-12">
                <Lightbulb className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Insights Available</h3>
                <p className="text-gray-400">
                        Trade more to generate TAI-powered insights about your trading patterns
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => {
                  const Icon = getInsightIcon(insight.type)
                  return (
                    <Card
                      key={insight.id}
                      variant="darker"
                      className={`border ${getInsightColor(insight.type)}`}
                    >
                      <div className="flex items-start gap-4">
                        <Icon className="w-6 h-6 flex-shrink-0 mt-1" />

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">
                                {insight.category}
                              </span>
                              <h3 className="text-lg font-semibold text-white mt-1">
                                {insight.title}
                              </h3>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-400 mb-1">Confidence</div>
                              <div className="text-xl font-bold text-purple-400">
                                {insight.confidence}%
                              </div>
                            </div>
                          </div>

                          <p className="text-gray-300 mb-4">{insight.description}</p>

                          {insight.actionable && (
                            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-green-400" />
                                <span className="font-semibold text-green-400">
                                  Recommended Action
                                </span>
                              </div>
                              <p className="text-gray-300">{insight.recommendation}</p>
                            </div>
                          )}

                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Based on {insight.relatedTrades} trades
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {new Date(insight.createdAt).toLocaleDateString()}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded ${
                                insight.impact === 'high'
                                  ? 'bg-red-500/20 text-red-400'
                                  : insight.impact === 'medium'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}
                            >
                              {insight.impact} impact
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Coach Tab Content */}
        {activeTab === 'coach' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <Card variant="darker">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Trades Analyzed</span>
                </div>
                <p className="text-2xl font-bold text-white">1,000</p>
              </Card>

              <Card variant="darker">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Insights Generated</span>
                </div>
                <p className="text-2xl font-bold text-purple-400">47</p>
              </Card>

              <Card variant="darker">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                  <Clock className="w-4 h-4" />
                  <span>Last Updated</span>
                </div>
                <p className="text-lg font-semibold text-white">Just now</p>
              </Card>

              {/* Quick Topics */}
              <Card variant="darker">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-purple-400" />
                  Quick Topics
                </h3>
                <div className="space-y-2">
                  {[
                    'Reduce revenge trading',
                    'Improve discipline',
                    'Better risk management',
                    'Strategy optimization',
                  ].map((topic, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(topic)}
                      className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                  <h3 className="font-semibold text-white">Trade Autopsy Intelligence</h3>
                  <p className="text-xs text-gray-400">Personalized analysis based on your data</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-800 border border-gray-700 text-gray-100'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2 text-purple-400">
                          <GraduationCap className="w-4 h-4" />
                          <span className="text-xs font-semibold">Autopsy Intelligence</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{message.content}</p>

                      {message.suggestions && (
                        <div className="mt-4 space-y-2">
                          {message.suggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}

                      <span className="text-xs opacity-60 mt-2 block">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        />
                        <div
                          className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.4s' }}
                        />
                        <span className="text-sm text-gray-400 ml-2">TAI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask your Trade Autopsy Intelligence coach anything..."
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || loading}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
