'use client'

import Link from 'next/link'
import { useState, useMemo, useTransition, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  BrainCircuit,
  TrendingUp,
  LineChart,
  AlertTriangle,
  HeartPulse,
  Calendar,
  BookOpen,
  List,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  LucideIcon,
  Bot,
  Target,
  Shield,
  FileText,
  BarChart3,
  Users,
  UserCircle,
  Activity,
  TestTube,
  Lightbulb,
  GraduationCap,
  CheckSquare,
  LogOut,
  Loader2,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { useLogout } from '@/lib/hooks/useLogout'

type BaseItem = {
  id: string
  label: string
  icon: LucideIcon
  href: string
  isLink: true
}

type LinkItemWithStats = BaseItem & {
  stats?: string
  time?: string
}

type LinkItemWithProgress = BaseItem & {
  status: string
  progress: number
}

type SidebarItem = LinkItemWithStats | LinkItemWithProgress

interface Section {
  title: string
  items: SidebarItem[]
}

interface CollapsibleSidebarProps {
  activeSection?: string
  onSectionChange?: (section: string) => void
}

export function CollapsibleSidebar({ activeSection, onSectionChange }: CollapsibleSidebarProps) {
  // Initialize with true to hide sidebar by default (full-width layout)
  const [isHidden, setIsHidden] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [showToggle, setShowToggle] = useState(false)
  
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { logout, isLoading: isLoggingOut } = useLogout()

  // Load from localStorage after component mounts (client-side only)
  useEffect(() => {
    setIsMounted(true)
    // Check if user has explicitly shown sidebar before, otherwise default to hidden
    const saved = localStorage.getItem('sidebar_hidden')
    if (saved !== null) {
      setIsHidden(saved === 'true')
    } else {
      // First time - default to hidden for full-width layout
      setIsHidden(true)
      localStorage.setItem('sidebar_hidden', 'true')
    }
  }, [])

  const handleToggleHide = () => {
    const newState = !isHidden
    setIsHidden(newState)
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar_hidden', String(newState))
    }
  }

  // Memoize sections to prevent re-creation on every render
  const sections: Section[] = useMemo(() => [
    {
      title: 'IN PROGRESS',
      items: [
        { id: 'overview', label: 'Overview', status: 'Analyzing', progress: 85, href: '/dashboard', icon: LayoutDashboard, isLink: true },
      ],
    },
    {
      title: 'AI ANALYSIS',
      items: [
        { id: 'tai', label: 'TAI', time: '1m', stats: 'AI Powered', href: '/tai/insights', icon: Lightbulb, isLink: true },
        { id: 'behavioral-analysis', label: 'Behavioral Analysis', status: 'Processing', progress: 60, href: '/behavioral-analysis', icon: BrainCircuit, isLink: true },
      ],
    },
    {
      title: 'READY FOR REVIEW',
      items: [
        { id: 'performance', label: 'Performance Analytics', time: '2m', stats: '+₹644 +12%', href: '/dashboard/performance', icon: TrendingUp, isLink: true },
        { id: 'strategy-analysis', label: 'Strategy Analysis', time: '1m', stats: '4 strategies', href: '/dashboard/strategy-analysis', icon: BarChart3, isLink: true },
        { id: 'comparisons', label: 'Comparisons', time: '2m', stats: 'Top 75%', href: '/dashboard/comparisons', icon: Users, isLink: true },
        { id: 'risk', label: 'Risk Management', time: '3m', stats: 'Sharpe 1.2', href: '/risk-management', icon: Shield, isLink: true },
        { id: 'goals', label: 'Goals & Milestones', time: '1m', stats: '2 active', href: '/goals', icon: Target, isLink: true },
        { id: 'tilt', label: 'Tilt Assessment', time: '1m', stats: 'Low risk 25%', href: '/tilt-assessment', icon: AlertTriangle, isLink: true },
        { id: 'emotional', label: 'Emotional Patterns', time: '3m', stats: '+5 -2', href: '/emotional-patterns', icon: HeartPulse, isLink: true },
      ],
    },
    {
      title: 'MANAGE',
      items: [
        { id: 'checklist', label: 'Pre-Market Checklist', href: '/dashboard/pre-market-checklist', isLink: true, icon: CheckSquare },
        { id: 'daily-plan', label: 'Daily Trade Plan', href: '/dashboard/daily-plan', isLink: true, icon: Target },
        { id: 'calendar', label: 'Calendar', href: '/dashboard/calendar', isLink: true, icon: Calendar },
        { id: 'journal', label: 'Journal', href: '/dashboard/journal', isLink: true, icon: BookOpen },
        { id: 'trades', label: 'All Trades', href: '/dashboard/trades', isLink: true, icon: List },
        { id: 'reports', label: 'Custom Reports', href: '/dashboard/reports', isLink: true, icon: FileText },
        { id: 'rules', label: 'Trading Rules', href: '/dashboard/rules', isLink: true, icon: Shield },
        { id: 'profiles', label: 'Profiles', href: '/dashboard/profiles', isLink: true, icon: UserCircle },
        { id: 'settings', label: 'Settings', href: '/dashboard/settings', isLink: true, icon: Settings },
        { id: 'economic-calendar', label: 'Economic Calendar', href: '/dashboard/economic-calendar', isLink: true, icon: Calendar },
        { id: 'morning-brief', label: 'Morning Brief', href: '/dashboard/morning-brief', isLink: true, icon: Target },
        { id: 'brokers', label: 'Brokers', href: '/dashboard/brokers', isLink: true, icon: Settings },
        { id: 'backtesting', label: 'Backtesting', href: '/backtesting', isLink: true, icon: TestTube },
      ],
    },
  ], [])

  return (
    <>
      {/* Main Sidebar - Completely hidden when isHidden is true */}
      <div
        className={`
          h-screen flex-shrink-0
          bg-bg-card border-r border-border-subtle
          transition-all duration-300 ease-out
          flex flex-col overflow-hidden
          ${isHidden ? 'w-0 border-r-0' : 'w-80'}
        `}
        style={{
          transform: 'translateZ(0)', // Force GPU acceleration
        }}
      >
        {/* Inner container with fixed width */}
        <div className={`w-80 h-full flex flex-col ${isHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-200`}>
          {/* Header */}
          <div className="p-6 pt-8 flex items-center justify-center">
            <Logo 
              size="md" 
              showText={true} 
              showSubtitle={true}
              href="/dashboard" 
            />
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
            {sections.map((section, idx) => (
              <div key={idx} className={`${idx > 0 ? 'mt-6' : ''}`}>
                <h3 className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-3 px-2">
                  {section.title} {section.items.length}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    // Check if pathname matches exactly or is a child route
                    const isActive = pathname === item.href || (pathname && pathname.startsWith(item.href + '/'))

                    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                      if (item.href !== pathname) {
                        e.preventDefault()
                        startTransition(() => {
                          router.push(item.href)
                        })
                      }
                    }

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={handleClick}
                        className={`
                          flex items-center rounded-lg transition-all group relative
                          px-3 py-2.5
                          ${
                            isActive
                              ? 'bg-border-subtle text-text-primary'
                              : 'text-text-tertiary hover:bg-border-subtle hover:text-text-primary'
                          }
                          ${isPending ? 'opacity-70' : ''}
                        `}
                      >
                        {/* Icon */}
                        <Icon
                          className={`w-5 h-5 flex-shrink-0 ${
                            isActive 
                              ? 'text-green-primary' 
                              : 'text-text-tertiary group-hover:text-purple-primary'
                          } transition-colors`}
                        />

                        {/* Content */}
                        <div className="flex-1 ml-3 min-w-0 transition-opacity duration-200 ease-out">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-medium text-sm truncate">{item.label}</span>
                            {'time' in item && item.time && (
                              <span className="text-[10px] text-text-muted ml-2">{item.time}</span>
                            )}
                          </div>

                          {'progress' in item ? (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-text-tertiary">{item.status}</span>
                                <span className="text-text-muted">{item.progress}%</span>
                              </div>
                              <div className="w-full h-1 bg-border-subtle rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-primary transition-all duration-500 rounded-full"
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            'stats' in item &&
                            item.stats && (
                              <div className="text-[11px] text-green-text font-medium">{item.stats}</div>
                            )
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="p-3 border-t border-[#1f1f1f] space-y-2">
            {/* Hide Button - Same style as Import button */}
            <button
              onClick={handleToggleHide}
              className="w-full flex items-center gap-3 px-3 py-2.5 bg-[#111111] hover:bg-[#1a1a1a] text-gray-300 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
              <span className="text-sm">Hide</span>
            </button>

            {/* Import New Trades Button */}
            <Link
              href="/dashboard/import"
              className="w-full flex items-center gap-3 px-3 py-2.5 bg-[#111111] hover:bg-[#1a1a1a] text-gray-300 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm">Import New Trades</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={logout}
              disabled={isLoggingOut}
              className="flex items-center gap-3 px-3 py-2.5 text-text-tertiary hover:text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 w-full"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Show Sidebar Button - Only visible when sidebar is hidden */}
      {isHidden && (
        <button
          onClick={handleToggleHide}
          onMouseEnter={() => setShowToggle(true)}
          onMouseLeave={() => setShowToggle(false)}
          className={`
            fixed left-0 top-1/2 -translate-y-1/2 z-50
            h-16 px-1
            bg-[#111111] hover:bg-[#1a1a1a]
            border border-[#2a2a2a] border-l-0 hover:border-emerald-500/50
            rounded-r-lg
            flex items-center justify-center
            transition-all duration-200
            ${showToggle ? 'opacity-100' : 'opacity-30'}
          `}
          title="Show Sidebar"
          aria-label="Show Sidebar"
        >
          <ChevronRight className="w-4 h-4 text-gray-400 hover:text-emerald-400 transition-colors" />
        </button>
      )}
    </>
  )
}
