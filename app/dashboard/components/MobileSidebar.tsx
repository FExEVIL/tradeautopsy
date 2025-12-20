'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface MobileSidebarProps {
  activeSection?: string
  onSectionChange?: (section: string) => void
}

export function MobileSidebar({ activeSection = 'overview', onSectionChange }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Close sidebar when section changes
  useEffect(() => {
    setIsOpen(false)
  }, [activeSection])

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const sections = [
    {
      title: 'IN PROGRESS',
      items: [
        { id: 'overview', label: 'Overview', status: 'Analyzing', progress: 85 },
      ]
    },
    {
      title: 'READY FOR REVIEW',
      items: [
        { id: 'analytics', label: 'Performance Analytics', time: '2m', stats: '+₹644 +12%' },
        { id: 'charts', label: 'Chart Analysis', time: '5m', stats: '+3 insights' },
        { id: 'tilt', label: 'Tilt Assessment', time: '1m', stats: 'Low risk 25%' },
        { id: 'emotional', label: 'Emotional Patterns', time: '3m', stats: '+5 -2' },
      ]
    }
  ]

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#1a1a1a] border-b border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 flex items-center justify-center text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">T</span>
            </div>
            <span className="text-white font-semibold text-sm">TradeAutopsy</span>
          </Link>

          <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center border border-white/10">
            <span className="text-sm font-semibold text-white">U</span>
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Drawer */}
      <div
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-80 bg-[#1a1a1a] border-r border-gray-800 z-50 transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          willChange: 'transform',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-sm">T</span>
                </div>
                <div>
                  <h1 className="text-white font-semibold text-sm">TradeAutopsy</h1>
                  <p className="text-[10px] text-gray-600">Trading Analytics</p>
                </div>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            {sections.map((section, idx) => (
              <div key={idx} className="mb-6">
                <h3 className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-3 px-2">
                  {section.title} {section.items.length}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSectionChange?.(item.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                        activeSection === item.id
                          ? 'bg-gray-800/70 text-white'
                          : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${
                          'progress' in item ? 'bg-blue-500 animate-pulse' : 'bg-green-500'
                        }`} />
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                      
                      {'progress' in item ? (
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
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            <button className="w-full px-4 py-3 bg-gray-800/70 hover:bg-gray-700/70 text-gray-300 rounded-lg text-sm font-medium transition-colors">
              Import New Trades
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
