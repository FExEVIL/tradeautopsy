'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Loader2, MessageSquare, Target } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { format } from 'date-fns'

interface AIInsight {
  id: string
  title: string
  message: string
  severity: 'critical' | 'warning' | 'info' | 'success'
  created_at: string
}

interface ActionPlan {
  id: string
  week_start: string
  focus_area: string
  goals: Record<string, number>
  progress: Record<string, number>
  completed: boolean
  created_at: string
  updated_at: string
}

interface CoachClientProps {
  initialInsights: AIInsight[]
  recentTrades: any[]
  actionPlan: ActionPlan | null
}

import { ActionPlanCard } from './components/ActionPlanCard'

export function CoachClient({ initialInsights, recentTrades, actionPlan }: CoachClientProps) {
  const [insights, setInsights] = useState<AIInsight[]>(initialInsights)
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }])
    setLoading(true)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      let response: Response
      try {
        response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            context: {
              recentTrades: recentTrades.slice(0, 10),
              insights: insights.slice(0, 5)
            }
          }),
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        // Handle network errors
        if (fetchError.name === 'AbortError' || fetchError.message?.includes('aborted')) {
          throw new Error('Request timed out. Please try again.')
        }
        if (fetchError.message?.includes('Failed to fetch') || fetchError.name === 'TypeError') {
          throw new Error('Network error. Please check your internet connection and try again.')
        }
        throw fetchError
      }

      if (!response.ok) {
        let errorMessage = 'Failed to get AI response'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.details || errorMessage
        } catch {
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response, timestamp: new Date() }])
    } catch (error) {
      console.error('Chat error:', error)
      
      let errorMessage = 'Sorry, I encountered an error. Please try again later.'
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('aborted')) {
          errorMessage = 'Request timed out. Please try again.'
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('network') || error.name === 'TypeError') {
          errorMessage = 'Network error. Please check your internet connection and try again.'
        } else {
          errorMessage = error.message
        }
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bot className="w-8 h-8 text-blue-400" />
            AI Trading Coach
          </h1>
          <p className="text-gray-400 mt-2">Get personalized insights and ask questions about your trading</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2 flex flex-col h-[600px] bg-[#0F0F0F] border border-white/5 rounded-2xl overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-2">Start a conversation with your AI coach</p>
                  <p className="text-sm text-gray-500">Ask about your trading patterns, risk management, or get advice</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-blue-400" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#0F0F0F] border border-white/5 text-gray-300'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-2">
                        {format(msg.timestamp, 'HH:mm')}
                      </p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">U</span>
                      </div>
                    )}
                  </div>
                ))
              )}
              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-4">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask your AI coach a question..."
                  className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Weekly Action Plan */}
            {actionPlan && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  This Week's Plan
                </h3>
                <ActionPlanCard plan={actionPlan} />
              </div>
            )}

            {/* Recent Insights */}
            <div className="p-4 rounded-xl bg-[#0F0F0F] border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                Recent Insights
              </h3>
              {insights.length === 0 ? (
                <p className="text-xs text-gray-500">No insights yet</p>
              ) : (
                <div className="space-y-2">
                  {insights.slice(0, 5).map(insight => (
                    <div
                      key={insight.id}
                      className="p-3 rounded-lg bg-[#0A0A0A] border border-white/5"
                    >
                      <p className="text-xs font-medium text-white mb-1">{insight.title}</p>
                      <p className="text-xs text-gray-400 line-clamp-2">{insight.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#0F0F0F] border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-3">Quick Questions</h3>
              <div className="space-y-2">
                {[
                  'How can I improve my win rate?',
                  'What patterns should I watch for?',
                  'Am I overtrading?',
                  'What\'s my biggest risk?'
                ].map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(question)}
                    className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

