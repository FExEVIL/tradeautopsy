'use client'

import { useState } from 'react'
import { TradeLeg, InstrumentType, OptionAction } from '@/types/backtesting'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/auth/Input'
import { Plus, Trash2, X } from 'lucide-react'

interface StrategyBuilderProps {
  legs: TradeLeg[]
  onLegsChange: (legs: TradeLeg[]) => void
}

export function StrategyBuilder({ legs, onLegsChange }: StrategyBuilderProps) {
  const [showAddLeg, setShowAddLeg] = useState(false)

  const addLeg = () => {
    const newLeg: TradeLeg = {
      legNumber: legs.length + 1,
      instrumentType: 'call',
      action: 'buy',
      quantity: 1,
      entryPrice: 0,
      premium: 0,
    }
    onLegsChange([...legs, newLeg])
    setShowAddLeg(false)
  }

  const removeLeg = (index: number) => {
    const newLegs = legs.filter((_, i) => i !== index)
      .map((leg, i) => ({ ...leg, legNumber: i + 1 }))
    onLegsChange(newLegs)
  }

  const updateLeg = (index: number, updates: Partial<TradeLeg>) => {
    const newLegs = [...legs]
    newLegs[index] = { ...newLegs[index], ...updates }
    onLegsChange(newLegs)
  }

  return (
    <Card variant="darker">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-300">Strategy Legs</h3>
          {!showAddLeg && (
            <button
              onClick={() => setShowAddLeg(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Leg
            </button>
          )}
        </div>

        {/* Existing Legs */}
        <div className="space-y-3">
          {legs.map((leg, index) => (
            <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-300">
                  Leg {leg.legNumber}
                </span>
                <button
                  onClick={() => removeLeg(index)}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Instrument Type */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Instrument</label>
                  <select
                    value={leg.instrumentType}
                    onChange={(e) => updateLeg(index, { instrumentType: e.target.value as InstrumentType })}
                    className="w-full h-9 px-3 bg-[#171717] border border-[#262626] rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  >
                    <option value="call">Call</option>
                    <option value="put">Put</option>
                    <option value="stock">Stock</option>
                    <option value="future">Future</option>
                  </select>
                </div>

                {/* Action */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Action</label>
                  <select
                    value={leg.action}
                    onChange={(e) => updateLeg(index, { action: e.target.value as OptionAction })}
                    className="w-full h-9 px-3 bg-[#171717] border border-[#262626] rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>

                {/* Strike Price */}
                {(leg.instrumentType === 'call' || leg.instrumentType === 'put') && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Strike Price (₹)</label>
                    <Input
                      type="number"
                      value={leg.strikePrice || ''}
                      onChange={(e) => updateLeg(index, { strikePrice: parseFloat(e.target.value) || undefined })}
                      placeholder="0.00"
                      className="h-9"
                    />
                  </div>
                )}

                {/* Expiry Date */}
                {(leg.instrumentType === 'call' || leg.instrumentType === 'put') && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Expiry Date</label>
                    <Input
                      type="date"
                      value={leg.expiryDate ? (typeof leg.expiryDate === 'string' ? leg.expiryDate : leg.expiryDate.toISOString().split('T')[0]) : ''}
                      onChange={(e) => updateLeg(index, { expiryDate: e.target.value ? new Date(e.target.value) : undefined })}
                      className="h-9"
                    />
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Quantity</label>
                  <Input
                    type="number"
                    value={leg.quantity}
                    onChange={(e) => updateLeg(index, { quantity: parseInt(e.target.value) || 1 })}
                    min="1"
                    className="h-9"
                  />
                </div>

                {/* Entry Price */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Entry Price (₹)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={leg.entryPrice}
                    onChange={(e) => updateLeg(index, { entryPrice: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="h-9"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Leg Form */}
        {showAddLeg && (
          <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-blue-400">New Leg</span>
              <button
                onClick={() => setShowAddLeg(false)}
                className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addLeg}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                Add Leg
              </button>
              <button
                onClick={() => setShowAddLeg(false)}
                className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {legs.length === 0 && !showAddLeg && (
          <div className="text-center py-8 text-gray-400 text-sm">
            <p>No legs added yet. Click "Add Leg" to start building your strategy.</p>
          </div>
        )}
      </div>
    </Card>
  )
}
