'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type UserPreferences = {
  base_currency: string
  timezone: string
  risk_per_trade: number | null
  default_tags: string[]
}

const DEFAULT_PREFS: UserPreferences = {
  base_currency: 'INR',
  timezone: 'Asia/Kolkata',
  risk_per_trade: 0,
  default_tags: ['FOMO', 'Plan follow', 'Revenge', 'News'],
}

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP']
const TIMEZONES = [
  'Asia/Kolkata',
  'UTC',
  'America/New_York',
  'Europe/London',
  'Asia/Singapore',
]

export default function SettingsPage() {
const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS)
  const [tagInput, setTagInput] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadPrefs = async () => {
      setLoading(true)
      setMessage(null)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        setMessage('Failed to load preferences.')
        setLoading(false)
        return
      }

      if (data) {
        setPrefs({
          base_currency: data.base_currency ?? DEFAULT_PREFS.base_currency,
          timezone: data.timezone ?? DEFAULT_PREFS.timezone,
          risk_per_trade: data.risk_per_trade,
          default_tags: data.default_tags ?? DEFAULT_PREFS.default_tags,
        })
      } else {
        // no row yet – use defaults
        setPrefs(DEFAULT_PREFS)
      }

      setLoading(false)
    }

    loadPrefs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setSaving(false)
      setMessage('User not found.')
      return
    }

    const payload = {
      user_id: user.id,
      base_currency: prefs.base_currency,
      timezone: prefs.timezone,
      risk_per_trade: prefs.risk_per_trade,
      default_tags: prefs.default_tags,
    }

    const { error } = await supabase
      .from('user_preferences')
      .upsert(payload, { onConflict: 'user_id' })

    if (error) {
      setMessage('Failed to save preferences.')
    } else {
      setMessage('Preferences saved.')
    }

    setSaving(false)
  }

  const handleAddTag = () => {
    const value = tagInput.trim()
    if (!value) return
    if (prefs.default_tags.includes(value)) {
      setTagInput('')
      return
    }
    setPrefs((prev) => ({
      ...prev,
      default_tags: [...prev.default_tags, value],
    }))
    setTagInput('')
  }

  const handleRemoveTag = (tag: string) => {
    setPrefs((prev) => ({
      ...prev,
      default_tags: prev.default_tags.filter((t) => t !== tag),
    }))
  }

  if (loading) {
    return (
      <div className="px-8 py-10 text-gray-400">
        Loading settings...
      </div>
    )
  }

  return (
    <div className="px-8 py-10 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Settings</h1>
          <p className="text-sm text-gray-500">
            Configure your trading preferences and journal defaults.
          </p>
        </div>
      </header>

      {message && (
        <div className="rounded-md border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-gray-200">
          {message}
        </div>
      )}

      {/* Trading preferences */}
      <section className="rounded-xl border border-gray-800 bg-[#111111] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-200">
          Trading Preferences
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400">
              Base currency
            </label>
            <select
              value={prefs.base_currency}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, base_currency: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-gray-100 focus:border-gray-600 focus:outline-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400">
              Timezone
            </label>
            <select
              value={prefs.timezone}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, timezone: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-gray-100 focus:border-gray-600 focus:outline-none"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400">
              Default risk per trade ({prefs.base_currency})
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={prefs.risk_per_trade ?? ''}
              onChange={(e) =>
                setPrefs((p) => ({
                  ...p,
                  risk_per_trade:
                    e.target.value === '' ? null : Number(e.target.value),
                }))
              }
              className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-gray-100 focus:border-gray-600 focus:outline-none"
              placeholder="e.g. 500"
            />
          </div>
        </div>
      </section>

      {/* Journal defaults */}
      <section className="rounded-xl border border-gray-800 bg-[#111111] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-200">
          Journal Defaults
        </h2>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400">
            Default tags
          </label>
          <div className="flex flex-wrap gap-2">
            {prefs.default_tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1 text-xs text-gray-100 border border-gray-700 hover:border-red-500 hover:text-red-400"
              >
                {tag}
                <span className="text-[10px]">×</span>
              </button>
            ))}
            {prefs.default_tags.length === 0 && (
              <span className="text-xs text-gray-500">
                No default tags yet. Add a few below.
              </span>
            )}
          </div>

          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag()
                }
              }}
              className="flex-1 rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-gray-100 focus:border-gray-600 focus:outline-none"
              placeholder="Type a tag and press Enter (e.g., FOMO, Plan follow)"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-100 hover:bg-gray-700"
            >
              Add
            </button>
          </div>

          <p className="text-xs text-gray-500">
            These tags will be suggested in your journal drawer and filters.
          </p>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Preferences'}
        </button>
      </div>
    </div>
  )
}
