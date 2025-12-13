// app/dashboard/components/CumulativePnLChart.tsx
'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { formatINR } from '@/lib/formatters'
import { TimeGranularity } from '@/lib/calculations'

type Point = {
  date: string
  value: number
  dailyPnL?: number
}

interface CumulativePnLChartProps {
  data: Point[]
  granularity?: TimeGranularity
}

export function CumulativePnLChart({ data, granularity = 'day' }: CumulativePnLChartProps) {
  const formatDateLabel = (dateStr: string) => {
    try {
      // Handle different date formats based on granularity
      if (granularity === 'year') {
        return dateStr // Already just year
      } else if (granularity === 'month') {
        return format(parseISO(`${dateStr}-01`), 'MMM yyyy')
      } else {
        return format(parseISO(dateStr), 'dd MMM')
      }
    } catch {
      return dateStr
    }
  }

  const formatTooltipDate = (dateStr: string) => {
    try {
      if (granularity === 'year') {
        return dateStr
      } else if (granularity === 'month') {
        return format(parseISO(`${dateStr}-01`), 'MMMM yyyy')
      } else {
        return format(parseISO(dateStr), 'dd MMM yyyy')
      }
    } catch {
      return dateStr
    }
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
        <XAxis
          dataKey="date"
          stroke="#666"
          tickLine={false}
          axisLine={false}
          tickFormatter={formatDateLabel}
        />
        <YAxis
          stroke="#666"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatINR(value, { compact: true })}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0F0F0F',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
          }}
          labelFormatter={formatTooltipDate}
          formatter={(value: number) => formatINR(value)}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
