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
    <div className={cn('w-full', className)}>
      <div className="w-full px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
          {subtitle && (
            <p className="text-gray-400">{subtitle}</p>
          )}
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  )
}
