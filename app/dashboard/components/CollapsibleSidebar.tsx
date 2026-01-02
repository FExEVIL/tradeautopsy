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
  // Initialize with false to match server-side rendering (prevents hydration mismatch)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { logout, isLoading: isLoggingOut } = useLogout()

  // Load from localStorage after component mounts (client-side only)
  useEffect(() => {
    setIsMounted(true)
    const collapsed = localStorage.getItem('sidebar_collapsed') === 'true'
    const hidden = localStorage.getItem('taskbar_hidden') === 'true'
    setIsCollapsed(collapsed)
    setIsHidden(hidden)
  }, [])

  const handleToggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar_collapsed', String(newState))
    }
  }

  const handleToggleHide = () => {
    const newState = !isHidden
    setIsHidden(newState)
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskbar_hidden', String(newState))
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
        { id: 'checklist', label: 'Pre-Market Checklist', href: '/dashboard/checklist', isLink: true, icon: CheckSquare },
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

  // Don't render hidden state until after mount to prevent hydration mismatch
  if (isMounted && isHidden) {
    return (
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50">
        <button
          onClick={handleToggleHide}
          className="w-10 h-16 bg-border-subtle hover:bg-border-default rounded-r-lg flex items-center justify-center transition-colors border-r border-border-default"
          title="Show Sidebar"
        >
          <ChevronRight className="w-5 h-5 text-text-tertiary" />
        </button>
      </div>
    )
  }

  return (
    <div
      className="w-80 h-screen bg-bg-card flex flex-col relative overflow-hidden border-r border-border-subtle"
      style={{
        transform: 'translateZ(0)', // Force GPU acceleration
      }}
    >
      {/* Inner container that slides */}
      <div
        className="flex flex-col h-full transition-transform duration-200 ease-out"
        style={{
          transform: isCollapsed ? 'translateX(calc(-100% + 72px))' : 'translateX(0)',
          willChange: 'transform',
        }}
      >
      {/* Header */}
      <div className={`${isCollapsed ? 'p-4 pt-6' : 'p-6 pt-8'} flex items-center justify-center transition-all duration-200`}>
        <Logo 
          size="md" 
          showText={!isCollapsed} 
          showSubtitle={!isCollapsed}
          href="/dashboard" 
        />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
        {sections.map((section, idx) => (
          <div key={idx} className={`${idx > 0 ? 'mt-6' : ''}`}>
            {!isCollapsed && (
              <h3 className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-3 px-2">
                {section.title} {section.items.length}
              </h3>
            )}
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
                      ${isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'}
                      ${
                        isActive
                          ? 'bg-border-subtle text-text-primary'
                          : 'text-text-tertiary hover:bg-border-subtle hover:text-text-primary'
                      }
                      ${isPending ? 'opacity-70' : ''}
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {/* Icon */}
                    <Icon
                      className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0 ${
                        isActive 
                          ? 'text-green-primary' 
                          : 'text-text-tertiary group-hover:text-purple-primary'
                      } transition-colors`}
                    />

                    {/* Content (only when expanded) */}
                    {!isCollapsed && (
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
                    )}

                    {/* Badge indicator when collapsed (for AI Powered items) */}
                    {isCollapsed && 'stats' in item && item.stats === 'AI Powered' && (
                      <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-purple-primary rounded-full border border-bg-card" />
                    )}

                    {/* Active indicator dot (collapsed mode) */}
                    {isCollapsed && isActive && (
                      <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-green-primary rounded-l-full" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {/* Toggle Buttons */}
        <div className="mt-6 space-y-2">
          <button
            onClick={handleToggleCollapse}
            className={`
              flex items-center rounded-lg transition-all group relative w-full
              ${isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'}
              text-text-tertiary hover:bg-border-subtle hover:text-text-primary
            `}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-6 h-6 flex-shrink-0 text-text-tertiary group-hover:text-text-primary" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 flex-shrink-0 text-text-tertiary group-hover:text-text-primary" />
                <div className="flex-1 ml-3 min-w-0">
                  <span className="font-medium text-sm">Collapse</span>
                </div>
              </>
            )}
          </button>
          {!isCollapsed && (
            <button
              onClick={handleToggleHide}
              className="flex items-center px-3 py-2.5 rounded-lg transition-all group relative w-full text-text-tertiary hover:bg-border-subtle hover:text-text-primary"
              title="Hide Sidebar"
            >
              <X className="w-5 h-5 flex-shrink-0 text-text-tertiary group-hover:text-text-primary" />
              <div className="flex-1 ml-3 min-w-0">
                <span className="font-medium text-sm">Hide</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Import New Trades Button */}
      <div className={`${isCollapsed ? 'px-3 pb-2' : 'px-4 pb-2'} transition-opacity duration-200`}>
        <Link
          href="/dashboard/import"
          className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-border-subtle hover:bg-border-default text-text-secondary rounded-lg text-sm font-medium transition-colors border border-border-default ${isCollapsed ? 'px-3' : ''}`}
        >
          <Plus className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
          {!isCollapsed && <span>Import New Trades</span>}
        </Link>
      </div>

      {/* Logout Button */}
      <div className={`${isCollapsed ? 'px-3 pb-4' : 'px-4 pb-4'} transition-opacity duration-200`}>
        <button
          onClick={logout}
          disabled={isLoggingOut}
          className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 text-text-tertiary hover:text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors ${isCollapsed ? 'px-3' : ''} disabled:opacity-50`}
          title={isCollapsed ? 'Log out' : undefined}
        >
          {isLoggingOut ? (
            <Loader2 className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} animate-spin`} />
          ) : (
            <LogOut className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
          )}
          {!isCollapsed && <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>}
        </button>
      </div>
      </div>
    </div>
  )
}
