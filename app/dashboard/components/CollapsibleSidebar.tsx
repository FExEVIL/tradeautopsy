'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

interface CollapsibleSidebarProps {
  activeSection?: string
  onSectionChange?: (section: string) => void
}

export function CollapsibleSidebar({ activeSection = 'overview', onSectionChange }: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const sections = [
    {
      title: 'IN PROGRESS',
      items: [
        { id: 'overview', label: 'Overview', status: 'Analyzing', progress: 85, href: '/dashboard' },
        { id: 'behavioral', label: 'Behavioral Analysis', status: 'Processing', progress: 60, href: '/dashboard/behavioral' },
      ]
    },
    {
      title: 'READY FOR REVIEW',
      items: [
        { id: 'performance', label: 'Performance Analytics', time: '2m', stats: '+₹644 +12%', href: '/dashboard/performance' },
        { id: 'charts', label: 'Chart Analysis', time: '5m', stats: '+3 insights', href: '/dashboard/charts' },
        { id: 'tilt', label: 'Tilt Assessment', time: '1m', stats: 'Low risk 25%', href: '/dashboard/tilt' },
        { id: 'emotional', label: 'Emotional Patterns', time: '3m', stats: '+5 -2', href: '/dashboard/emotional' },
      ]
    }
  ]

  return (
    <div className={`hidden lg:flex flex-col h-screen bg-[#1a1a1a] border-r border-gray-800 transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-80'
    }`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        {!isCollapsed && (
          <Link href="/dashboard" prefetch={true} className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">T</span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm">TradeAutopsy</h1>
              <p className="text-[10px] text-gray-600">Trading Analytics</p>
            </div>
          </Link>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mx-auto">
            <span className="text-black font-bold text-sm">T</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="lg:block hidden text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {isCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        {sections.map((section, idx) => (
          <div key={idx} className="mb-6">
            {!isCollapsed && (
              <h3 className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-3 px-2">
                {section.title} {section.items.length}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  prefetch={true}
                  className={`block w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                    pathname === item.href || (pathname === '/dashboard' && item.id === activeSection)
                      ? 'bg-gray-800/70 text-white'
                      : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-300'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${
                      'progress' in item ? 'bg-blue-500 animate-pulse' : 'bg-green-500'
                    }`} />
                    {!isCollapsed && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}
                  </div>
                  
                  {!isCollapsed && (
                    'progress' in item ? (
                      <>
                        <p className="text-xs text-gray-600 mb-2 ml-4">{item.status}</p>
                        <div className="ml-4 w-full h-1 bg-gray-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between ml-4 mt-1">
                        <span className="text-xs text-green-400 font-medium">{item.stats}</span>
                        <span className="text-xs text-gray-600">{item.time}</span>
                      </div>
                    )
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Additional Pages */}
        <div className="mb-6">
          {!isCollapsed && (
            <h3 className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-3 px-2">
              MANAGE
            </h3>
          )}
          <div className="space-y-1">
            <Link
              href="/dashboard/trades"
              prefetch={true}
              className={`block w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                pathname === '/dashboard/trades'
                  ? 'bg-gray-800/70 text-white'
                  : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                {!isCollapsed && <span className="font-medium text-sm">All Trades</span>}
              </div>
            </Link>
            <Link
              href="/dashboard/settings"
              prefetch={true}
              className={`block w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                pathname === '/dashboard/settings'
                  ? 'bg-gray-800/70 text-white'
                  : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500" />
                {!isCollapsed && <span className="font-medium text-sm">Settings</span>}
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-800">
          <Link href="/dashboard/import" prefetch={true}>
            <button className="w-full bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-lg font-medium transition-colors">
              Import New Trades
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}
