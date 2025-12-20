/**
 * Optimized Performance Chart Component
 * Example of React.memo and useMemo optimization patterns
 */

'use client'

import { memo, useMemo, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface PerformanceChartProps {
  data: Array<{ date: string; value: number }>
  height?: number
  showGrid?: boolean
}

// Memoize component to prevent unnecessary re-renders
const PerformanceChart = memo(function PerformanceChart({ 
  data, 
  height = 300,
  showGrid = true 
}: PerformanceChartProps) {
  // Memoize expensive calculations
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    return data.map(item => ({
      ...item,
      formattedDate: new Date(item.date).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      }),
      // Ensure value is a valid number
      value: typeof item.value === 'number' && !isNaN(item.value) ? item.value : 0,
    }))
  }, [data])

  // Memoize tooltip handler
  const handleTooltip = useCallback((props: any) => {
    if (!props.active || !props.payload || !props.payload[0]) return null
    
    const { value, payload } = props.payload[0]
    const date = payload?.formattedDate || payload?.date
    
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="text-xs text-gray-400 mb-1">{date}</p>
        <p className="text-lg font-semibold text-white">
          ₹{typeof value === 'number' ? value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '0'}
        </p>
      </div>
    )
  }, [])

  // Early return if no data
  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex items-center justify-center h-[300px]">
        <p className="text-gray-400">No data available</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />}
          <XAxis 
            dataKey="formattedDate" 
            stroke="#666" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#666" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip 
            content={handleTooltip}
            cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#22c55e" 
            strokeWidth={2}
            dot={false} // Disable dots for better performance
            isAnimationActive={false} // Disable animations for better performance
            activeDot={{ r: 4, fill: '#22c55e' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
})

// Set display name for debugging
PerformanceChart.displayName = 'PerformanceChart'

export default PerformanceChart

/**
 * Usage Example:
 * 
 * import PerformanceChart from '@/components/optimized/PerformanceChart'
 * 
 * <PerformanceChart 
 *   data={chartData} 
 *   height={300}
 *   showGrid={true}
 * />
 * 
 * Optimization Benefits:
 * 1. React.memo prevents re-renders when props haven't changed
 * 2. useMemo caches expensive data transformations
 * 3. useCallback prevents tooltip handler recreation
 * 4. Disabled animations reduce paint work
 * 5. Disabled dots reduce render complexity
 */

