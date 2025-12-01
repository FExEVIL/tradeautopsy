'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
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
  LucideIcon,
} from 'lucide-react'

// Define types for different kinds of sidebar items
type BaseItem = {
  id: string
  label: string
  icon: LucideIcon
  href: string
}

type LinkItem = BaseItem & {
  isLink: true
  stats?: string
  time?: string
  // Add these optional fields so TypeScript is happy:
  status?: string 
  progress?: number
}

type StatusItem = BaseItem & {
  isLink?: false
  status: string
  progress: number
}

type MetricItem = BaseItem & {
  isLink?: false
  time: string
  stats: string
}

type SidebarItem = LinkItem | StatusItem | MetricItem

interface Section {
  title: string
  items: SidebarItem[]
}

interface CollapsibleSidebarProps {
  activeSection?: string
  onSectionChange?: (section: string) => void
}

export function CollapsibleSidebar({ activeSection = 'overview', onSectionChange }: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const sections: Section[] = [
    {
      title: 'IN PROGRESS',
      items: [
        // Added isLink: true to make them clickable
        { id: 'overview', label: 'Overview', status: 'Analyzing', progress: 85, href: '/dashboard', icon: LayoutDashboard, isLink: true },
        { id: 'behavioral', label: 'Behavioral Analysis', status: 'Processing', progress: 60, href: '/dashboard/behavioral', icon: BrainCircuit, isLink: true },
      ],
    },
    {
      title: 'READY FOR REVIEW',
      items: [
        // Added isLink: true to make them clickable
        { id: 'performance', label: 'Performance Analytics', time: '2m', stats: '+₹644 +12%', href: '/dashboard/performance', icon: TrendingUp, isLink: true },
        { id: 'charts', label: 'Chart Analysis', time: '5m', stats: '+3 insights', href: '/dashboard/charts', icon: LineChart, isLink: true },
        { id: 'tilt', label: 'Tilt Assessment', time: '1m', stats: 'Low risk 25%', href: '/dashboard/tilt', icon: AlertTriangle, isLink: true },
        { id: 'emotional', label: 'Emotional Patterns', time: '3m', stats: '+5 -2', href: '/dashboard/emotional', icon: HeartPulse, isLink: true },
      ],
    },
    {
      title: 'MANAGE',
      items: [
        // These were already links
        { id: 'calendar', label: 'Calendar', href: '/dashboard/calendar', isLink: true, icon: Calendar },
        { id: 'journal', label: 'Journal', href: '/dashboard/journal', isLink: true, icon: BookOpen },
        { id: 'trades', label: 'All Trades', href: '/dashboard/trades', isLink: true, icon: List },
        { id: 'settings', label: 'Settings', href: '/dashboard/settings', isLink: true, icon: Settings },
      ],
    },
  ]


  return (
    <div
      className={`${
        isCollapsed ? 'w-20' : 'w-80'
      } h-screen bg-[#1a1a1a] border-r border-gray-800 flex flex-col transition-all duration-300 relative`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">T</span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm">TradeAutopsy</h1>
              <p className="text-[10px] text-gray-600">Trading Analytics</p>
            </div>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors absolute -right-3 top-8 bg-[#1a1a1a] border border-gray-800"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {sections.map((section, idx) => (
          <div key={idx} className="mb-6">
            {!isCollapsed && (
              <h3 className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-3 px-2">
                {section.title} {section.items.length}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                // Determine content based on item type
                let content = null

                if ('isLink' in item && item.isLink) {
                  // Link items (Manage section)
                  content = (
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                        isActive
                          ? 'bg-gray-800/70 text-white'
                          : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-400'}`} />
                      {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                    </Link>
                  )
                } else {
                  // Button items (Overview, Analytics, etc.)
                  content = (
                    <button
                      onClick={() => onSectionChange?.(item.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all group ${
                        isActive
                          ? 'bg-gray-800/70 text-white'
                          : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-400'}`} />
                        {!isCollapsed && (
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm truncate">{item.label}</span>
                              {'time' in item && <span className="text-[10px] text-gray-600 ml-2">{item.time}</span>}
                            </div>
                            
                            {'progress' in item ? (
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-gray-500">{item.status}</span>
                                  <span className="text-gray-600">{item.progress}%</span>
                                </div>
                                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-500 transition-all duration-500"
                                    style={{ width: `${item.progress}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              'stats' in item && (
                                <div className="text-xs text-green-500/80 font-medium">
                                  {item.stats}
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                }

                return (
                  <div key={item.id} title={isCollapsed ? item.label : undefined}>
                    {content}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button className={`flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-800/70 hover:bg-gray-700/70 text-gray-300 rounded-lg text-sm font-medium transition-colors ${isCollapsed ? 'px-2' : ''}`}>
          {!isCollapsed ? 'Import New Trades' : '+'}
        </button>
      </div>
    </div>
  )
}
