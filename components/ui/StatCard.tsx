'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  BarChart3,
  Activity,
  Calendar,
  FileText,
  Mic,
  Shield,
  AlertTriangle,
  Trophy,
  Award,
  Clock,
  Brain,
  Library,
  BookOpen,
  Settings,
  type LucideIcon
} from 'lucide-react'

// Icon mapping for string-based icon selection
const iconMap: Record<string, LucideIcon> = {
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
  target: Target,
  dollarSign: DollarSign,
  barChart3: BarChart3,
  activity: Activity,
  calendar: Calendar,
  fileText: FileText,
  mic: Mic,
  shield: Shield,
  alertTriangle: AlertTriangle,
  trophy: Trophy,
  award: Award,
  clock: Clock,
  brain: Brain,
  library: Library,
  bookOpen: BookOpen,
  settings: Settings,
  // Aliases for common variations
  trendingup: TrendingUp,
  trendingdown: TrendingDown,
  dollarsign: DollarSign,
  barchart3: BarChart3,
  filetext: FileText,
  alerttriangle: AlertTriangle,
  bookopen: BookOpen,
}

interface StatCardProps {
  label: string
  value: string | number | ReactNode
  subtitle?: string
  icon?: string // Icon name as string (e.g., 'target', 'dollarSign')
  iconColor?: 'green' | 'red' | 'blue' | 'purple' | 'orange' | 'neutral'
  valueColor?: 'green' | 'red' | 'white' | 'auto' // auto determines based on value
  variant?: 'base' | 'dark' | 'darker'
  className?: string
}

export function StatCard({
  label,
  value,
  subtitle,
  icon: iconName,
  iconColor = 'blue',
  valueColor = 'auto',
  variant = 'darker',
  className,
}: StatCardProps) {
  // Resolve icon from string name
  const Icon = iconName ? iconMap[iconName] : undefined
  const iconColors = {
    green: 'text-green-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    neutral: 'text-gray-400',
  }

  const iconBgs = {
    green: 'bg-green-500/20',
    red: 'bg-red-500/20',
    blue: 'bg-blue-500/20',
    purple: 'bg-purple-500/20',
    orange: 'bg-orange-500/20',
    neutral: 'bg-gray-500/20',
  }

  const valueColorsMap = {
    green: 'text-green-400',
    red: 'text-red-400',
    white: 'text-white',
    auto: 'text-white', // Will be overridden if value is number
  }

  // Determine value color if auto
  let finalValueColor = valueColor
  if (valueColor === 'auto' && typeof value === 'number') {
    finalValueColor = value >= 0 ? 'green' : 'red'
  }

  const cardVariants = {
    base: 'bg-white/5',
    dark: 'bg-[#0F0F0F]',
    darker: 'bg-[#0A0A0A]',
  }

  return (
    <div
      className={cn(
        cardVariants[variant],
        'border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all min-h-[120px]',
        className
      )}
    >
      {/* Label with icon */}
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
          {label}
        </span>
        {Icon && (
          <div className={cn('p-2 rounded-lg', iconBgs[iconColor])}>
            <Icon className={cn('w-4 h-4', iconColors[iconColor])} />
          </div>
        )}
      </div>

      {/* Value */}
      <div
        className={cn(
          'text-2xl font-bold mb-1',
          valueColorsMap[finalValueColor as keyof typeof valueColorsMap]
        )}
      >
        {value}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div className="text-[10px] text-gray-500">{subtitle}</div>
      )}
    </div>
  )
}
