'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatedProgressBar } from './AnimatedProgressBar'

interface SidebarProps {
  activeSection?: string
  onSectionChange?: (section: string) => void
}

export function Sidebar({ activeSection = 'overview', onSectionChange }: SidebarProps) {
  const pathname = usePathname()

  const sections = [
    {
      title: 'IN PROGRESS',
      items: [
        { id: 'overview', label: 'Overview', status: 'Analyzing', progress: 85 },
        { id: 'behavioral', label: 'Behavioral Analysis', status: 'Processing', progress: 60 },
      ],
    },
    {
      title: 'READY FOR REVIEW',
      items: [
        { id: 'analytics', label: 'Performance Analytics', time: '2m', stats: '+₹644 +12%' },
        { id: 'charts', label: 'Chart Analysis', time: '5m', stats: '+3 insights' },
        { id: 'tilt', label: 'Tilt Assessment', time: '1m', stats: 'Low risk 25%' },
        { id: 'emotional', label: 'Emotional Patterns', time: '3m', stats: '+5 -2' },
      ],
    },
    {
      title: 'MANAGE',
      items: [
        {
          id: 'calendar',
          label: 'Calendar',
          href: '/dashboard/calendar',
          isLink: true,
          stats: '',
          time: '',
        },
        {
          id: 'journal',
          label: 'Journal',
          href: '/dashboard/journal',
          isLink: true,
          stats: '',
          time: '',
        },
        {
          id: 'trades',
          label: 'All Trades',
          href: '/dashboard/trades',
          isLink: true,
          stats: '',
          time: '',
        },
        {
          id: 'settings',
          label: 'Settings',
          href: '/dashboard/settings',
          isLink: true,
          stats: '',
          time: '',
        },
      ],
    },
  ]

  return (
    <div className="w-80 h-screen bg-[#1a1a1a] border-r border-gray-800 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">T</span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm">TradeAutopsy</h1>
            <p className="text-[10px] text-gray-600">Trading Analytics</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        {sections.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-3 px-2">
              {section.title} {section.items.length}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                // If it's a link item (Calendar, Journal, Trades, Settings)
                if ('isLink' in item && item.isLink) {
                  // Highlight if pathname matches the link href
                  const isActive = pathname === item.href || activeSection === item.id
                  
                  return (
                    <Link
                      key={item.id}
                      href={item.href!}
                      className={`block w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                        isActive
                          ? 'bg-gray-800/70 text-white'
                          : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-500' : 'bg-gray-500'}`} />
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                    </Link>
                  )
                }

                // Regular button items (Overview, Behavioral, etc.)
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange?.(item.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gray-800/70 text-white'
                        : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          'progress' in item ? 'bg-blue-500 animate-pulse' : 'bg-green-500'
                        }`}
                      />
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>

                    {'progress' in item ? (
                      <>
                        <p className="text-xs text-gray-600 mb-2 ml-4">{item.status}</p>
                        <div className="ml-4">
                          <AnimatedProgressBar
                            value={item.progress}
                            barClassName="bg-blue-500"
                            className="h-1"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between ml-4 mt-1">
                        <span className="text-xs text-green-400 font-medium">{item.stats}</span>
                        <span className="text-xs text-gray-600">{item.time}</span>ls -l app/dashboard/components/Sidebar.tsx
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button className="w-full px-4 py-2 bg-gray-800/70 hover:bg-gray-700/70 text-gray-300 rounded-lg text-sm font-medium transition-colors">
          Import New Trades
        </button>
      </div>
    </div>
  )
}
