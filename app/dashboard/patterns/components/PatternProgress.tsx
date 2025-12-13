'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format } from 'date-fns'
import { formatINR } from '@/lib/formatters'

interface PatternProgressProps {
  patterns: any[]
}

export function PatternProgress({ patterns }: PatternProgressProps) {
  // Calculate total cost and pattern count
  const totalCost = patterns.reduce((sum, p) => sum + Math.abs(p.totalCost || 0), 0)
  const totalOccurrences = patterns.reduce((sum, p) => sum + (p.occurrences || 0), 0)

  // Group patterns by severity (cost-based)
  const criticalPatterns = patterns.filter(p => Math.abs(p.totalCost || 0) > 10000)
  const moderatePatterns = patterns.filter(p => Math.abs(p.totalCost || 0) > 5000 && Math.abs(p.totalCost || 0) <= 10000)
  const minorPatterns = patterns.filter(p => Math.abs(p.totalCost || 0) <= 5000)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Patterns</div>
        <div className="text-3xl font-bold text-white">{patterns.length}</div>
        <div className="text-xs text-gray-400 mt-1">Unique types detected</div>
      </div>

      <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Occurrences</div>
        <div className="text-3xl font-bold text-white">{totalOccurrences}</div>
        <div className="text-xs text-gray-400 mt-1">Times patterns triggered</div>
      </div>

      <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Cost</div>
        <div className="text-3xl font-bold text-red-400">{formatINR(totalCost)}</div>
        <div className="text-xs text-gray-400 mt-1">₹ lost to patterns</div>
      </div>

      <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Severity Breakdown</div>
        <div className="space-y-2 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Critical</span>
            <span className="text-sm font-bold text-red-400">{criticalPatterns.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Moderate</span>
            <span className="text-sm font-bold text-yellow-400">{moderatePatterns.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Minor</span>
            <span className="text-sm font-bold text-blue-400">{minorPatterns.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

