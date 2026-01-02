'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, TrendingDown, CheckCircle, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { formatINR } from '@/lib/formatters'

export function MistakesDashboard() {
  const [mistakes, setMistakes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchMistakes()
  }, [])

  const fetchMistakes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get current profile
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('current_profile_id')
        .eq('user_id', user.id)
        .single()

      let query = supabase
        .from('mistakes')
        .select('*')
        .eq('user_id', user.id)
        .order('detected_at', { ascending: false })

      if (prefs?.current_profile_id) {
        query = query.eq('profile_id', prefs.current_profile_id)
      }

      const { data, error } = await query

      if (error) {
        // Table might not exist yet
        if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
          console.warn('Mistakes table does not exist yet. Please run the database migration.')
          setMistakes([])
        } else {
          console.error('Error fetching mistakes:', error)
        }
      } else {
        setMistakes(data || [])
      }
    } catch (error) {
      console.error('Failed to fetch mistakes:', error)
    } finally {
      setLoading(false)
    }
  }

  const markResolved = async (mistakeId: string) => {
    try {
      const { error } = await supabase
        .from('mistakes')
        .update({ 
          is_resolved: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', mistakeId)

      if (error) throw error
      fetchMistakes()
    } catch (error) {
      console.error('Failed to resolve mistake:', error)
      alert('Failed to mark mistake as resolved. Please try again.')
    }
  }

  // Group by type
  const mistakesByType = mistakes.reduce((acc, mistake) => {
    if (!acc[mistake.mistake_type]) {
      acc[mistake.mistake_type] = []
    }
    acc[mistake.mistake_type].push(mistake)
    return acc
  }, {} as Record<string, any[]>)

  // Calculate total impact
  const totalImpact = mistakes.reduce((sum, m) => sum + (parseFloat(m.financial_impact) || 0), 0)
  const unresolvedCount = mistakes.filter(m => !m.is_resolved).length

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-400 animate-pulse">Loading mistakes...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
          <p className="text-sm text-gray-400">Active Mistakes</p>
          <p className="text-3xl font-bold text-red-400">{unresolvedCount}</p>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6">
          <TrendingDown className="w-8 h-8 text-orange-400 mb-2" />
          <p className="text-sm text-gray-400">Total Impact</p>
          <p className="text-3xl font-bold text-orange-400">
            -{formatINR(Math.abs(totalImpact))}
          </p>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
          <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
          <p className="text-sm text-gray-400">Resolved</p>
          <p className="text-3xl font-bold text-green-400">
            {mistakes.filter(m => m.is_resolved).length}
          </p>
        </div>
      </div>

      {/* What NOT to Repeat */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <X className="w-5 h-5 text-red-400" />
          What NOT to Repeat
        </h3>

        {Object.keys(mistakesByType).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-2">No mistakes detected yet</p>
            <p className="text-sm text-gray-500">
              Mistakes will be automatically detected from your audio journal entries and trade analysis.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(mistakesByType).map(([type, mistakeList]) => (
              <div key={type} className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold mb-2 text-white">
                  {type} <span className="text-sm text-gray-400">({mistakeList.length}x)</span>
                </h4>

                <div className="space-y-2">
                  {mistakeList.slice(0, 3).map((mistake) => (
                    <div
                      key={mistake.id}
                      className="flex items-start justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm text-white">{mistake.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span
                            className={`px-2 py-0.5 rounded ${
                              mistake.severity === 'critical'
                                ? 'bg-red-500/20 text-red-400'
                                : mistake.severity === 'high'
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {mistake.severity}
                          </span>
                          <span>Impact: -{formatINR(Math.abs(parseFloat(mistake.financial_impact) || 0))}</span>
                          <span>{new Date(mistake.detected_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {!mistake.is_resolved && (
                        <button
                          onClick={() => markResolved(mistake.id)}
                          className="ml-4 px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded transition text-white"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
