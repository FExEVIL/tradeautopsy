'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function ManualTradePage() {
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase.from('trades').insert({
      user_id: user.id,
      tradingsymbol: form.tradingsymbol,
      transaction_type: form.side,
      quantity: Number(form.quantity),
      entry_price: Number(form.entry_price),
      exit_price: form.exit_price ? Number(form.exit_price) : null,
      trade_date: form.trade_date,
      strategy: form.strategy || null,
      pnl: null,
      product: 'MIS',
    })

    setLoading(false)

    if (!error) {
      router.push('/dashboard/journal')
    } else {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-[#050608] px-8 py-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-white mb-4">Add Trade Manually</h1>
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
            className="w-full mt-2 rounded-lg bg-[#32B8C6] text-black font-medium py-2 text-sm disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Save Trade'}
          </button>
        </form>
      </div>
    </div>
  )
}
