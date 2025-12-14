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
} from 'lucide-react'

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
        { id: 'behavioral', label: 'Behavioral Analysis', status: 'Processing', progress: 60, href: '/dashboard/behavioral', icon: BrainCircuit, isLink: true },
      ],
    },
    {
      title: 'READY FOR REVIEW',
      items: [
        { id: 'performance', label: 'Performance Analytics', time: '2m', stats: '+₹644 +12%', href: '/dashboard/performance', icon: TrendingUp, isLink: true },
        { id: 'strategy-analysis', label: 'Strategy Analysis', time: '1m', stats: '4 strategies', href: '/dashboard/strategy-analysis', icon: BarChart3, isLink: true },
        { id: 'comparisons', label: 'Comparisons', time: '2m', stats: 'Top 75%', href: '/dashboard/comparisons', icon: Users, isLink: true },
        // Pattern Library moved to Behavioral Analysis tab
        { id: 'coach', label: 'AI Coach', time: '5m', stats: '2 insights', href: '/dashboard/coach', icon: Bot, isLink: true },
        { id: 'risk', label: 'Risk Management', time: '3m', stats: 'Sharpe 1.2', href: '/dashboard/risk', icon: Shield, isLink: true },
        { id: 'goals', label: 'Goals & Milestones', time: '1m', stats: '2 active', href: '/dashboard/goals', icon: Target, isLink: true },
        // Chart Analysis moved to Journal tab
        { id: 'tilt', label: 'Tilt Assessment', time: '1m', stats: 'Low risk 25%', href: '/dashboard/tilt', icon: AlertTriangle, isLink: true },
        { id: 'emotional', label: 'Emotional Patterns', time: '3m', stats: '+5 -2', href: '/dashboard/emotional', icon: HeartPulse, isLink: true },
      ],
    },
    {
      title: 'MANAGE',
      items: [
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
        { id: 'ml-insights', label: 'ML Insights', href: '/dashboard/settings/ml-insights', isLink: true, icon: BrainCircuit },
      ],
    },
  ], [])

  // Don't render hidden state until after mount to prevent hydration mismatch
  if (isMounted && isHidden) {
    return (
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50">
        <button
          onClick={handleToggleHide}
          className="w-10 h-16 bg-gray-800 hover:bg-gray-700 rounded-r-lg flex items-center justify-center transition-colors"
          title="Show Sidebar"
        >
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    )
  }

  return (
    <div
      className="w-80 h-screen bg-[#1b1912] flex flex-col relative overflow-hidden"
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
        {!isCollapsed ? (
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-black font-bold text-base">T</span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm">TradeAutopsy</h1>
              <p className="text-[10px] text-gray-500">Trading Analytics</p>
            </div>
          </Link>
        ) : (
          <Link href="/dashboard" className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <span className="text-black font-bold text-base">T</span>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
        {sections.map((section, idx) => (
          <div key={idx} className={`${idx > 0 ? 'mt-6' : ''}`}>
            {!isCollapsed && (
              <h3 className="text-[9px] font-semibold text-gray-600 uppercase tracking-wider mb-3 px-2">
                {section.title} {section.items.length}
              </h3>
            )}
            <div className="space-y-2">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

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
                      flex items-center rounded-xl transition-all group relative
                      ${isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'}
                      ${
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
                      }
                      ${isPending ? 'opacity-70' : ''}
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {/* Icon */}
                    <Icon
                      className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0 ${
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                      }`}
                    />

                    {/* Content (only when expanded) */}
                    {!isCollapsed && (
                      <div className="flex-1 ml-3 min-w-0 transition-opacity duration-200 ease-out">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-medium text-sm truncate">{item.label}</span>
                          {'time' in item && item.time && (
                            <span className="text-[10px] text-gray-500 ml-2">{item.time}</span>
                          )}
                        </div>

                        {'progress' in item ? (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-gray-500">{item.status}</span>
                              <span className="text-gray-600">{item.progress}%</span>
                            </div>
                            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all duration-500 rounded-full"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          'stats' in item &&
                          item.stats && (
                            <div className="text-[11px] text-green-500/80 font-medium">{item.stats}</div>
                          )
                        )}
                      </div>
                    )}

                    {/* Active indicator dot (collapsed mode) */}
                    {isCollapsed && isActive && (
                      <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full" />
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
              flex items-center rounded-xl transition-all group relative w-full
              ${isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'}
              text-gray-400 hover:bg-white/5 hover:text-gray-300
            `}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-6 h-6 flex-shrink-0 text-gray-400 group-hover:text-gray-300" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-gray-300" />
                <div className="flex-1 ml-3 min-w-0">
                  <span className="font-medium text-sm">Collapse</span>
                </div>
              </>
            )}
          </button>
          {!isCollapsed && (
            <button
              onClick={handleToggleHide}
              className="flex items-center px-3 py-2.5 rounded-xl transition-all group relative w-full text-gray-400 hover:bg-white/5 hover:text-gray-300"
              title="Hide Sidebar"
            >
              <X className="w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-gray-300" />
              <div className="flex-1 ml-3 min-w-0">
                <span className="font-medium text-sm">Hide</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Import New Trades Button */}
      <div className={`${isCollapsed ? 'px-3 pb-4' : 'p-4'} transition-opacity duration-200`}>
        <Link
          href="/dashboard/import"
          className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-800/70 hover:bg-gray-700/70 text-gray-300 rounded-lg text-sm font-medium transition-colors ${isCollapsed ? 'px-3' : ''}`}
        >
          <Plus className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
          {!isCollapsed && <span>Import New Trades</span>}
        </Link>
      </div>
      </div>
    </div>
  )
}
