'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Plus, Trash2, GripVertical, Flame, Trophy, Calendar, Save, RotateCcw } from 'lucide-react'
import { defaultChecklistItems, checklistCategories, type ChecklistItem } from '@/lib/checklist-defaults'
import { format } from 'date-fns'

interface ChecklistClientProps {
  initialChecklist: any
  defaultTemplate: any
  initialStreak: any
  recentChecklists: any[]
}

export function ChecklistClient({
  initialChecklist,
  defaultTemplate,
  initialStreak,
  recentChecklists,
}: ChecklistClientProps) {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [streak, setStreak] = useState(initialStreak || { current_streak: 0, longest_streak: 0 })
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Load items from template or use defaults
    if (defaultTemplate?.items && defaultTemplate.items.length > 0) {
      setItems(defaultTemplate.items)
    } else {
      setItems(defaultChecklistItems)
    }

    // Load today's checklist if exists
    if (initialChecklist) {
      const completed = new Set<string>()
      initialChecklist.items.forEach((item: any) => {
        if (item.completed) {
          completed.add(item.id)
        }
        if (item.customValue) {
          setCustomInputs(prev => ({ ...prev, [item.id]: item.customValue }))
        }
      })
      setCompletedItems(completed)
      // Update items with saved state
      if (initialChecklist.items.length > 0) {
        setItems(initialChecklist.items)
      }
    }
  }, [initialChecklist, defaultTemplate])

  const toggleItem = (id: string) => {
    setCompletedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const addCustomItem = () => {
    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      text: '',
      category: 'custom',
      required: false,
      order: items.length + 1,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
    setCompletedItems(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const updateItemText = (id: string, text: string) => {
    setItems(items.map(item => item.id === id ? { ...item, text } : item))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const checklistData = items.map(item => ({
        id: item.id,
        text: item.text,
        category: item.category,
        completed: completedItems.has(item.id),
        customValue: customInputs[item.id] || null,
      }))

      const response = await fetch('/api/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checklistData,
          completed: completedItems.size === items.length,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.streak) {
          setStreak(data.streak)
        }
      }
    } catch (error) {
      console.error('Failed to save checklist:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Reset today\'s checklist? This cannot be undone.')) {
      setCompletedItems(new Set())
      setCustomInputs({})
      // Reset to template/defaults
      if (defaultTemplate?.items) {
        setItems(defaultTemplate.items)
      } else {
        setItems(defaultChecklistItems)
      }
    }
  }

  const completionPercentage = items.length > 0 
    ? Math.round((completedItems.size / items.length) * 100)
    : 0

  const requiredItems = items.filter(item => item.required)
  const completedRequired = requiredItems.filter(item => completedItems.has(item.id)).length
  const allRequiredCompleted = requiredItems.length > 0 && completedRequired === requiredItems.length

  return (
    <div className="space-y-6">
      {/* Streak Card */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-emerald-400" />
              <span className="text-gray-400 text-sm">Current Streak</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {streak.current_streak} {streak.current_streak === 1 ? 'day' : 'days'}
            </div>
            <div className="text-sm text-gray-400">
              Best: {streak.longest_streak} days
            </div>
          </div>
          {streak.current_streak >= 7 && (
            <div className="text-right">
              <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
              <p className="text-xs text-yellow-400 font-medium">🔥 On Fire!</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Today's Checklist</h3>
          <span className="text-emerald-400 font-semibold">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            className="bg-emerald-500 h-3 rounded-full transition-all"
          />
        </div>
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{completedItems.size} of {items.length} completed</span>
          {allRequiredCompleted && (
            <span className="text-emerald-400">✓ All required items done!</span>
          )}
        </div>
      </div>

      {/* Checklist Items */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Checklist Items</h3>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors flex items-center gap-2"
            >
              <RotateCcw size={14} />
              Reset
            </button>
            <button
              onClick={addCustomItem}
              className="px-3 py-1.5 text-sm bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus size={14} />
              Add Item
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => {
            const isCompleted = completedItems.has(item.id)
            const category = checklistCategories[item.category as keyof typeof checklistCategories]
            const isCustom = item.category === 'custom'

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 bg-gray-800/50 border rounded-lg transition-all ${
                  isCompleted
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="flex-shrink-0 mt-0.5"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-500" />
                    )}
                  </button>

                  <div className="flex-1">
                    {isCustom ? (
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => updateItemText(item.id, e.target.value)}
                        placeholder="Enter checklist item..."
                        className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
                        onBlur={handleSave}
                      />
                    ) : (
                      <label
                        onClick={() => toggleItem(item.id)}
                        className={`cursor-pointer ${isCompleted ? 'line-through text-gray-500' : 'text-white'}`}
                      >
                        {item.text}
                      </label>
                    )}

                    {/* Custom input fields for specific items */}
                    {item.id === 'profit-target' && (
                      <input
                        type="number"
                        value={customInputs[item.id] || ''}
                        onChange={(e) => {
                          setCustomInputs(prev => ({ ...prev, [item.id]: e.target.value }))
                        }}
                        placeholder="₹ Amount"
                        className="mt-2 w-32 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-emerald-500"
                        onBlur={handleSave}
                      />
                    )}

                    {item.id === 'loss-limit' && (
                      <input
                        type="number"
                        value={customInputs[item.id] || ''}
                        onChange={(e) => {
                          setCustomInputs(prev => ({ ...prev, [item.id]: e.target.value }))
                        }}
                        placeholder="₹ Amount"
                        className="mt-2 w-32 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-emerald-500"
                        onBlur={handleSave}
                      />
                    )}

                    {item.id === 'max-trades' && (
                      <input
                        type="number"
                        value={customInputs[item.id] || ''}
                        onChange={(e) => {
                          setCustomInputs(prev => ({ ...prev, [item.id]: e.target.value }))
                        }}
                        placeholder="Number"
                        className="mt-2 w-32 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-emerald-500"
                        onBlur={handleSave}
                      />
                    )}

                    {item.id === 'mental-state' && (
                      <div className="mt-2 flex gap-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => {
                              setCustomInputs(prev => ({ ...prev, [item.id]: String(num) }))
                              handleSave()
                            }}
                            className={`w-10 h-10 rounded-lg transition-colors ${
                              customInputs[item.id] === String(num)
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        category.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                        category.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                        category.color === 'red' ? 'bg-red-500/20 text-red-400' :
                        category.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {category.label}
                      </span>
                      {item.required && (
                        <span className="text-xs text-red-400">Required</span>
                      )}
                    </div>
                  </div>

                  {isCustom && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex-shrink-0 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Save Button */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Checklist
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recent Completions */}
      {recentChecklists.length > 0 && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar size={18} />
            Recent Completions
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => {
              const date = new Date()
              date.setDate(date.getDate() - (6 - i))
              const dateStr = date.toISOString().split('T')[0]
              const completed = recentChecklists.some(c => c.date === dateStr && c.completed_at)
              
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs ${
                    completed
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                  title={format(date, 'MMM dd')}
                >
                  {completed ? '✓' : format(date, 'd')}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

