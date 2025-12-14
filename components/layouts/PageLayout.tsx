'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  Settings,
  Target,
  TrendingUp,
  Activity,
  Shield,
  type LucideIcon
} from 'lucide-react'

// Icon mapping for string-based icon selection
const iconMap: Record<string, LucideIcon> = {
  barChart3: BarChart3,
  bookOpen: BookOpen,
  brain: Brain,
  calendar: Calendar,
  settings: Settings,
  target: Target,
  trendingUp: TrendingUp,
  activity: Activity,
  shield: Shield,
  // Aliases
  barchart3: BarChart3,
  bookopen: BookOpen,
  trendingup: TrendingUp,
}

interface PageLayoutProps {
  title: string
  subtitle?: string
  icon?: string // Icon name as string (e.g., 'barChart3', 'bookOpen')
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function PageLayout({
  title,
  subtitle,
  icon: iconName,
  action,
  children,
  className,
}: PageLayoutProps) {
  // Resolve icon from string name
  const Icon = iconName ? iconMap[iconName] : undefined

  return (
    <div className={cn('w-full max-w-7xl mx-auto px-6 py-8 space-y-8', className)}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-8 h-8 text-blue-400" />}
            <h1 className="text-3xl font-bold text-white">{title}</h1>
          </div>
          {subtitle && (
            <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      {/* Content */}
      {children}
    </div>
  )
}
