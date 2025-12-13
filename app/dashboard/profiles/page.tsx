'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Star, TrendingUp, Target, BarChart3, Check } from 'lucide-react'
import { useProfile } from '@/lib/contexts/ProfileContext'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { getIcon, profileIcons } from '@/lib/icons'

interface ProfileStats {
  tradeCount: number
  netPnL: number
  winRate: number
}

export default function ProfilesPage() {
  const { profiles, activeProfile, createProfile, updateProfile, deleteProfile, refreshProfiles, setActiveProfile } = useProfile()
  const [stats, setStats] = useState<Record<string, ProfileStats>>({})
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProfile, setEditingProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    color: '#3b82f6',
    icon: 'default'
  })
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    loadStats()
    if (searchParams.get('action') === 'create') {
      setShowCreateModal(true)
    }
  }, [profiles])

  async function loadStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const statsMap: Record<string, ProfileStats> = {}

      for (const profile of profiles) {
        // Get trades for this profile
        let tradesQuery = supabase
          .from('trades')
          .select('pnl')
          .eq('user_id', user.id)
          .eq('profile_id', profile.id)
          .is('deleted_at', null)

        const { data: trades } = await tradesQuery

        if (trades) {
          const tradeCount = trades.length
          const netPnL = trades.reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0)
          const wins = trades.filter(t => parseFloat(String(t.pnl || '0')) > 0).length
          const winRate = tradeCount > 0 ? (wins / tradeCount) * 100 : 0

          statsMap[profile.id] = {
            tradeCount,
            netPnL,
            winRate
          }
        } else {
          statsMap[profile.id] = {
            tradeCount: 0,
            netPnL: 0,
            winRate: 0
          }
        }
      }

      setStats(statsMap)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    try {
      if (!formData.name.trim()) {
        alert('Please enter a profile name')
        return
      }

      await createProfile(formData)
      setShowCreateModal(false)
      setFormData({
        name: '',
        description: '',
        type: '',
        color: '#3b82f6',
        icon: 'default'
      })
      await loadStats()
    } catch (error: any) {
      console.error('Error creating profile:', error)
      const errorMessage = error?.message || error?.toString() || 'Failed to create profile'
      alert(errorMessage)
    }
  }

  async function handleUpdate() {
    if (!editingProfile) return

    try {
      await updateProfile(editingProfile.id, formData)
      setEditingProfile(null)
      setFormData({
        name: '',
        description: '',
        type: '',
        color: '#3b82f6',
        icon: 'default'
      })
      await loadStats()
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    }
  }

  async function handleDelete(profileId: string) {
    if (!confirm('Are you sure you want to delete this profile? All associated trades and data will be deleted.')) {
      return
    }

    try {
      await deleteProfile(profileId)
      await loadStats()
    } catch (error: any) {
      console.error('Error deleting profile:', error)
      alert(error.message || 'Failed to delete profile')
    }
  }

  function startEdit(profile: any) {
    setEditingProfile(profile)
    setFormData({
      name: profile.name,
      description: profile.description || '',
      type: profile.type || '',
      color: profile.color,
      icon: profile.icon || profile.type || 'default'
    })
  }

  const profileTypes = [
    { value: 'fno', label: 'F&O' },
    { value: 'equity', label: 'Equity' },
    { value: 'options', label: 'Options' },
    { value: 'mutual_funds', label: 'Mutual Funds' },
    { value: 'crypto', label: 'Crypto' },
    { value: 'custom', label: 'Custom' }
  ]

  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ]

  // Icon keys for profile selection
  const iconKeys = Object.keys(profileIcons).filter(key => key !== 'default')

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trading Profiles</h1>
          <p className="text-gray-400 mt-1">Organize your trading activity by category</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Profile
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map(profile => {
            const profileStats = stats[profile.id] || { tradeCount: 0, netPnL: 0, winRate: 0 }
            const isActive = activeProfile?.id === profile.id

            return (
              <div
                key={profile.id}
                className={`bg-gray-800 rounded-xl p-6 border-2 ${
                  isActive ? 'border-blue-500' : 'border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const ProfileIcon = getIcon('profile', profile.type || profile.icon || 'default')
                      return (
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: profile.color ? `${profile.color}20` : undefined }}
                        >
                          <ProfileIcon 
                            size={24} 
                            className="text-blue-400"
                            style={{ color: profile.color || undefined }}
                          />
                        </div>
                      )
                    })()}
                    <div>
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        {profile.name}
                        {profile.is_default && (
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        )}
                        {isActive && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                            Active
                          </span>
                        )}
                      </h3>
                      {profile.description && (
                        <p className="text-sm text-gray-400 mt-1">{profile.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(profile)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      title="Edit profile"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {!profile.is_default && (
                      <button
                        onClick={() => handleDelete(profile.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Delete profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-sm">Trades</span>
                    </div>
                    <span className="text-white font-semibold">{profileStats.tradeCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">Net P&L</span>
                    </div>
                    <span className={`font-semibold ${profileStats.netPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ₹{profileStats.netPnL.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Target className="w-4 h-4" />
                      <span className="text-sm">Win Rate</span>
                    </div>
                    <span className="text-white font-semibold">{profileStats.winRate.toFixed(1)}%</span>
                  </div>
                </div>

                {!isActive && (
                  <button
                    onClick={() => setActiveProfile(profile.id)}
                    className="w-full mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Switch to This Profile
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingProfile) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingProfile ? 'Edit Profile' : 'Create New Profile'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., F&O Trading"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Optional description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select type</option>
                  {profileTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Icon</label>
                <div className="grid grid-cols-5 gap-2">
                  {iconKeys.map(iconKey => {
                    const Icon = profileIcons[iconKey]
                    const isSelected = formData.icon === iconKey || (formData.type === iconKey && !formData.icon)
                    
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: iconKey })}
                        className={`relative w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-blue-500 ring-2 ring-blue-400'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        <Icon 
                          size={20} 
                          className={isSelected ? 'text-white' : 'text-gray-300'} 
                        />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Choose an icon that represents this trading profile
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        formData.color === color ? 'border-white scale-110' : 'border-gray-700 hover:border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={editingProfile ? handleUpdate : handleCreate}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                {editingProfile ? 'Update' : 'Create'}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingProfile(null)
                  setFormData({
                    name: '',
                    description: '',
                    type: '',
                    color: '#3b82f6',
                    icon: 'default'
                  })
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
