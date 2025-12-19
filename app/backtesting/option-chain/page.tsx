'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/auth/Input'
import { LegalDisclaimers } from '@/components/backtesting/LegalDisclaimers'
import { ArrowLeft, Search } from 'lucide-react'

export default function OptionChainPage() {
  const router = useRouter()
  const [symbol, setSymbol] = useState('NIFTY')
  const [expiryDate, setExpiryDate] = useState('')

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Option Chain</h1>
            <p className="text-gray-400">
              View real-time and historical option chain data
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card variant="darker">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Symbol</label>
              <Input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="NIFTY"
                className="h-9"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Expiry Date</label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
          <button className="mt-4 w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors">
            <Search className="w-4 h-4" />
            Load Option Chain
          </button>
        </Card>

        {/* Option Chain Table */}
        <Card variant="darker">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Option Chain Data</h3>
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">Option chain data will be displayed here</p>
            <p className="text-xs mt-2">Select symbol and expiry date to load data</p>
          </div>
        </Card>

        {/* Legal Disclaimers */}
        <LegalDisclaimers />
      </div>
    </div>
  )
}
