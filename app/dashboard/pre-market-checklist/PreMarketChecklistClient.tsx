'use client'

import { useState, useEffect } from 'react'
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  Edit2, 
  Save,
  X,
  Flame,
  Calendar,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Coffee,
  Target,
  Brain,
  Newspaper,
  BarChart3,
  CheckCircle
} from 'lucide-react'

interface ChecklistItem {
  id: string
  text: string
  checked: boolean
  category: string
  order: number
}

interface ChecklistCompletion {
  date: string
  completed_items: string[]
  total_items: number
  completed_at: string | null
}

const DEFAULT_CHECKLIST_ITEMS: Omit<ChecklistItem, 'id'>[] = [
  // Mental Preparation
  { text: 'Got adequate sleep (7+ hours)', checked: false, category: 'mental', order: 1 },
  { text: 'Feeling mentally focused and alert', checked: false, category: 'mental', order: 2 },
  { text: 'No emotional baggage from yesterday', checked: false, category: 'mental', order: 3 },
  { text: 'Reviewed trading rules', checked: false, category: 'mental', order: 4 },
  
  // Market Analysis
  { text: 'Checked global market cues (SGX Nifty, US markets)', checked: false, category: 'market', order: 5 },
  { text: 'Reviewed economic calendar for today', checked: false, category: 'market', order: 6 },
  { text: 'Identified key support/resistance levels', checked: false, category: 'market', order: 7 },
  { text: 'Checked FII/DII data', checked: false, category: 'market', order: 8 },
  { text: 'Reviewed sector performance', checked: false, category: 'market', order: 9 },
  
  // Trading Plan
  { text: 'Set daily profit target', checked: false, category: 'plan', order: 10 },
  { text: 'Set maximum loss limit', checked: false, category: 'plan', order: 11 },
  { text: 'Identified potential trade setups', checked: false, category: 'plan', order: 12 },
  { text: 'Defined entry/exit criteria', checked: false, category: 'plan', order: 13 },
  { text: 'Set position sizing for today', checked: false, category: 'plan', order: 14 },
  
  // Technical Setup
  { text: 'Trading platform loaded and working', checked: false, category: 'technical', order: 15 },
  { text: 'Charts set up with indicators', checked: false, category: 'technical', order: 16 },
  { text: 'Watchlist updated', checked: false, category: 'technical', order: 17 },
  { text: 'Alerts set for key levels', checked: false, category: 'technical', order: 18 },
]

const CATEGORIES = [
  { id: 'mental', name: 'Mental Preparation', icon: Brain, color: 'purple' },
  { id: 'market', name: 'Market Analysis', icon: BarChart3, color: 'blue' },
  { id: 'plan', name: 'Trading Plan', icon: Target, color: 'emerald' },
  { id: 'technical', name: 'Technical Setup', icon: TrendingUp, color: 'orange' },
]

export function PreMarketChecklistClient() {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [streak, setStreak] = useState(0)
  const [lastCompleted, setLastCompleted] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [newItemText, setNewItemText] = useState('')
  const [newItemCategory, setNewItemCategory] = useState('mental')
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['mental', 'market', 'plan', 'technical'])
  const [todayCompletion, setTodayCompletion] = useState<ChecklistCompletion | null>(null)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetchChecklist()
    fetchStreak()
  }, [])

  const fetchChecklist = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/pre-market-checklist?date=${today}`)
      const data = await response.json()

      if (data.success) {
        if (data.items && data.items.length > 0) {
          setItems(data.items)
        } else {
          // Initialize with default items
          const defaultItems = DEFAULT_CHECKLIST_ITEMS.map((item, index) => ({
            ...item,
            id: `default-${index}`,
          }))
          setItems(defaultItems)
        }
        
        if (data.completion) {
          setTodayCompletion(data.completion)
          // Apply completion status to items
          if (data.completion.completed_items) {
            setItems(prev => prev.map(item => ({
              ...item,
              checked: data.completion.completed_items.includes(item.id)
            })))
          }
        }
      }
    } catch (err) {
      console.error('Error fetching checklist:', err)
      // Use defaults on error
      const defaultItems = DEFAULT_CHECKLIST_ITEMS.map((item, index) => ({
        ...item,
        id: `default-${index}`,
      }))
      setItems(defaultItems)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStreak = async () => {
    try {
      const response = await fetch('/api/pre-market-checklist/streak')
      const data = await response.json()
      if (data.success) {
        setStreak(data.streak || 0)
        setLastCompleted(data.last_completed || null)
      }
    } catch (err) {
      console.error('Error fetching streak:', err)
    }
  }

  const toggleItem = async (id: string) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    )
    setItems(updatedItems)

    // Save to backend
    try {
      await fetch('/api/pre-market-checklist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: id,
          checked: updatedItems.find(i => i.id === id)?.checked,
          date: today,
        }),
      })

      // Check if all items are now completed
      const allChecked = updatedItems.every(item => item.checked)
      if (allChecked) {
        // Mark day as complete
        await fetch('/api/pre-market-checklist/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: today }),
        })
        fetchStreak()
      }
    } catch (err) {
      console.error('Error saving toggle:', err)
    }
  }

  const addItem = async () => {
    if (!newItemText.trim()) return

    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      text: newItemText.trim(),
      checked: false,
      category: newItemCategory,
      order: items.length + 1,
    }

    setItems([...items, newItem])
    setNewItemText('')
    setShowAddForm(false)

    try {
      await fetch('/api/pre-market-checklist/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      })
      fetchChecklist() // Refresh to get saved item with proper ID
    } catch (err) {
      console.error('Error adding item:', err)
    }
  }

  const deleteItem = async (id: string) => {
    setItems(items.filter(item => item.id !== id))

    try {
      await fetch(`/api/pre-market-checklist/items/${id}`, {
        method: 'DELETE',
      })
    } catch (err) {
      console.error('Error deleting item:', err)
    }
  }

  const startEditing = (item: ChecklistItem) => {
    setEditingId(item.id)
    setEditText(item.text)
  }

  const saveEdit = async (id: string) => {
    if (!editText.trim()) return

    setItems(items.map(item =>
      item.id === id ? { ...item, text: editText.trim() } : item
    ))
    setEditingId(null)

    try {
      await fetch(`/api/pre-market-checklist/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editText.trim() }),
      })
    } catch (err) {
      console.error('Error updating item:', err)
    }
  }

  const resetChecklist = async () => {
    if (!confirm('Reset all items to unchecked? This will clear today\'s progress.')) return

    setItems(items.map(item => ({ ...item, checked: false })))

    try {
      await fetch('/api/pre-market-checklist/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today }),
      })
    } catch (err) {
      console.error('Error resetting checklist:', err)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    )
  }

  const completedCount = items.filter(item => item.checked).length
  const totalCount = items.length
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  const isComplete = completedCount === totalCount && totalCount > 0

  const getItemsByCategory = (categoryId: string) => {
    return items.filter(item => item.category === categoryId)
  }

  const getCategoryProgress = (categoryId: string) => {
    const categoryItems = getItemsByCategory(categoryId)
    const checked = categoryItems.filter(i => i.checked).length
    return { checked, total: categoryItems.length }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Pre-Market Checklist</h1>
          <p className="text-gray-400">Complete your daily routine before market opens.</p>
        </div>

        {/* Stats Cards Row - Like Performance Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Progress Card */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 relative">
            <div className="absolute top-4 right-4 w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">PROGRESS</p>
            <p className={`text-3xl font-bold ${isComplete ? 'text-emerald-400' : 'text-white'}`}>
              {Math.round(progressPercent)}%
            </p>
            <p className="text-gray-500 text-sm mt-1">{completedCount}/{totalCount} items</p>
          </div>

          {/* Streak Card */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 relative">
            <div className="absolute top-4 right-4 w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">STREAK</p>
            <p className="text-3xl font-bold text-orange-400">{streak}</p>
            <p className="text-gray-500 text-sm mt-1">Consecutive days</p>
          </div>

          {/* Categories Done */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 relative">
            <div className="absolute top-4 right-4 w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">CATEGORIES</p>
            <p className="text-3xl font-bold text-purple-400">
              {CATEGORIES.filter(c => {
                const p = getCategoryProgress(c.id)
                return p.checked === p.total && p.total > 0
              }).length}/{CATEGORIES.length}
            </p>
            <p className="text-gray-500 text-sm mt-1">Completed</p>
          </div>

          {/* Time Card */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 relative">
            <div className="absolute top-4 right-4 w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">DATE</p>
            <p className="text-xl font-bold text-white">
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long' })}
            </p>
          </div>
        </div>

        {/* Progress Bar Card */}
        <div className={`mb-6 p-6 rounded-xl border ${
          isComplete 
            ? 'bg-emerald-500/5 border-emerald-500/30' 
            : 'bg-[#111111] border-[#1f1f1f]'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {isComplete ? (
                <Sparkles className="w-6 h-6 text-emerald-400" />
              ) : (
                <Clock className="w-6 h-6 text-gray-400" />
              )}
              <div>
                <p className={`font-semibold ${isComplete ? 'text-emerald-400' : 'text-white'}`}>
                  {isComplete ? '✓ Ready to Trade' : 'Complete your checklist'}
                </p>
                <p className="text-gray-500 text-sm">
                  {isComplete ? 'All items completed. Good luck trading!' : 'Finish before market opens'}
                </p>
              </div>
            </div>
            <button
              onClick={resetChecklist}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#1f1f1f] rounded-lg transition-colors"
              title="Reset checklist"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-[#1f1f1f] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isComplete 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Warning Alert */}
        {!isComplete && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-medium">Checklist Incomplete</p>
              <p className="text-yellow-400/70 text-sm mt-1">
                Complete all items before trading to maintain discipline and consistency.
              </p>
            </div>
          </div>
        )}

        {/* Checklist Categories */}
        <div className="space-y-4 mb-6">
          {CATEGORIES.map(category => {
            const progress = getCategoryProgress(category.id)
            const isExpanded = expandedCategories.includes(category.id)
            const categoryItems = getItemsByCategory(category.id)
            const isCategoryComplete = progress.checked === progress.total && progress.total > 0

            const colorClasses = {
              purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
              blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
              emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
              orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
            }
            const colors = colorClasses[category.color as keyof typeof colorClasses]

            return (
              <div
                key={category.id}
                className={`bg-[#111111] border rounded-xl overflow-hidden transition-colors ${
                  isCategoryComplete ? 'border-emerald-500/30' : 'border-[#1f1f1f]'
                }`}
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 ${colors.bg} rounded-lg`}>
                      <category.icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-white">{category.name}</p>
                      <p className="text-gray-500 text-sm">
                        {progress.checked}/{progress.total} completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isCategoryComplete && (
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-lg flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Done
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Category Items */}
                {isExpanded && (
                  <div className="border-t border-[#1f1f1f]">
                    {categoryItems.map((item, index) => (
                      <div
                        key={item.id}
                        className={`group flex items-center gap-3 p-4 border-b border-[#1f1f1f]/50 last:border-b-0 hover:bg-[#0f0f0f] transition-colors ${
                          item.checked ? 'bg-[#0a0a0a]' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleItem(item.id)}
                          className="flex-shrink-0 transition-transform hover:scale-110"
                        >
                          {item.checked ? (
                            <CheckSquare className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-500 hover:text-gray-300" />
                          )}
                        </button>

                        {/* Item Text */}
                        {editingId === item.id ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="flex-1 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(item.id)
                                if (e.key === 'Escape') setEditingId(null)
                              }}
                            />
                            <button
                              onClick={() => saveEdit(item.id)}
                              className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-2 text-gray-400 hover:bg-[#1f1f1f] rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className={`flex-1 text-sm transition-colors ${
                              item.checked ? 'text-gray-500 line-through' : 'text-gray-200'
                            }`}>
                              {item.text}
                            </span>

                            {/* Actions - Show on hover */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => startEditing(item)}
                                className="p-1.5 text-gray-500 hover:text-white hover:bg-[#1f1f1f] rounded-lg"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteItem(item.id)}
                                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Add New Item */}
        {showAddForm ? (
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
            <p className="text-white font-medium mb-4">Add Custom Item</p>
            <div className="space-y-4">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Enter checklist item..."
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addItem()
                  if (e.key === 'Escape') setShowAddForm(false)
                }}
              />
              <div className="flex items-center justify-between">
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addItem}
                    disabled={!newItemText.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-[#1f1f1f] disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full p-4 border-2 border-dashed border-[#2a2a2a] hover:border-emerald-500/50 rounded-xl text-gray-400 hover:text-emerald-400 transition-all flex items-center justify-center gap-2 group"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Add Custom Item
          </button>
        )}
      </div>
    </div>
  )
}

