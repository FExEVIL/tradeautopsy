'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, X } from 'lucide-react'

export default function ManualTradePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [violations, setViolations] = useState<Array<{ rule: string; message: string; severity: string }>>([])
  const [form, setForm] = useState({
    tradingsymbol: '',
    side: 'BUY',
    quantity: 1,
    entry_price: '',
    exit_price: '',
    trade_date: '',
    strategy: '',
  })

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError(null)
    setViolations([])
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setViolations([])

    try {
      const response = await fetch('/api/trades/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tradingsymbol: form.tradingsymbol,
          transaction_type: form.side,
          quantity: Number(form.quantity),
          entry_price: Number(form.entry_price),
          exit_price: form.exit_price ? Number(form.exit_price) : null,
          trade_date: form.trade_date,
          strategy: form.strategy || null,
          product: 'MIS',
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403 && data.violations) {
          // Trade blocked by rules
          setViolations(data.violations)
          setError('Trade blocked by your trading rules')
        } else {
          setError(data.error || 'Failed to create trade')
        }
        setLoading(false)
        return
      }

      // Success - show warnings if any
      if (data.warnings && data.warnings.length > 0) {
        // Show warnings but still allow navigation
        console.warn('Trade created with warnings:', data.warnings)
      }

      router.push('/dashboard/journal')
    } catch (err: any) {
      setError(err.message || 'Failed to create trade')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050608] px-8 py-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-white mb-4">Add Trade Manually</h1>
        
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-red-400 font-semibold mb-1">Error</h3>
                <p className="text-sm text-gray-300">{error}</p>
                {violations.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-gray-400 font-medium">Rule Violations:</p>
                    {violations.map((v, idx) => (
                      <div key={idx} className="text-xs text-gray-300 bg-red-500/5 p-2 rounded">
                        <span className="font-medium">{v.rule}:</span> {v.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setError(null)
                  setViolations([])
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="space-y-4 bg-[#111216] border border-[#282A30] rounded-2xl p-6"
        >
          <input
            name="tradingsymbol"
            value={form.tradingsymbol}
            onChange={onChange}
            placeholder="Symbol (e.g. NIFTY24DECFUT)"
            className="w-full bg-[#050608] border border-[#282A30] rounded-lg px-3 py-2 text-sm text-gray-100"
            required
          />
          <select
            name="side"
            value={form.side}
            onChange={onChange}
            className="w-full bg-[#050608] border border-[#282A30] rounded-lg px-3 py-2 text-sm text-gray-100"
          >
            <option value="BUY">Buy</option>
            <option value="SELL">Sell</option>
          </select>
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={onChange}
            className="w-full bg-[#050608] border border-[#282A30] rounded-lg px-3 py-2 text-sm text-gray-100"
            placeholder="Quantity"
            min={1}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              name="entry_price"
              value={form.entry_price}
              onChange={onChange}
              placeholder="Entry price"
              className="bg-[#050608] border border-[#282A30] rounded-lg px-3 py-2 text-sm text-gray-100"
              required
            />
            <input
              type="number"
              name="exit_price"
              value={form.exit_price}
              onChange={onChange}
              placeholder="Exit price (optional)"
              className="bg-[#050608] border border-[#282A30] rounded-lg px-3 py-2 text-sm text-gray-100"
            />
          </div>
          <input
            type="date"
            name="trade_date"
            value={form.trade_date}
            onChange={onChange}
            className="w-full bg-[#050608] border border-[#282A30] rounded-lg px-3 py-2 text-sm text-gray-100"
            required
          />
          <input
            name="strategy"
            value={form.strategy}
            onChange={onChange}
            placeholder="Strategy / Setup (optional)"
            className="w-full bg-[#050608] border border-[#282A30] rounded-lg px-3 py-2 text-sm text-gray-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-lg bg-[#32B8C6] text-black font-medium py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving…' : 'Save Trade'}
          </button>
          
          {violations.length > 0 && (
            <p className="text-xs text-gray-400 text-center mt-2">
              This trade violates your trading rules. Please review and adjust your rules or trade details.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
