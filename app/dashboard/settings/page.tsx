'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'


export default function SettingsPage() {
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    trading_style: 'Day Trading',
    risk_per_trade: '2',
  })
  const [saving, setSaving] = useState(false)
const supabase = createClient()


  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setProfile(prev => ({
        ...prev,
        email: user.email || '',
      }))
    }
  }

  async function handleSave() {
    setSaving(true)
    // Add your save logic here
    setTimeout(() => setSaving(false), 1000)
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      <div className="bg-[#1a1a1a] rounded-lg p-6 space-y-6">
        {/* Profile Section */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Profile Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                className="w-full bg-[#0d0d0d] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full bg-[#0d0d0d] border border-gray-700 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Trading Preferences */}
        <div className="border-t border-gray-800 pt-6">
          <h2 className="text-lg font-semibold text-white mb-4">Trading Preferences</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Trading Style</label>
              <select
                value={profile.trading_style}
                onChange={(e) => setProfile({...profile, trading_style: e.target.value})}
                className="w-full bg-[#0d0d0d] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option>Day Trading</option>
                <option>Swing Trading</option>
                <option>Position Trading</option>
                <option>Scalping</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Risk Per Trade (%)</label>
              <input
                type="number"
                value={profile.risk_per_trade}
                onChange={(e) => setProfile({...profile, risk_per_trade: e.target.value})}
                className="w-full bg-[#0d0d0d] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                placeholder="2"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="border-t border-gray-800 pt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
