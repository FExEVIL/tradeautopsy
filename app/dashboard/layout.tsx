'use client'

import { CollapsibleSidebar } from './components/CollapsibleSidebar'
import { ProfileProvider } from '@/lib/contexts/ProfileContext'
import { ProfileDashboardProvider } from '@/lib/contexts/ProfileDashboardContext'
import { Suspense, Component, ReactNode } from 'react'

// Fallback header component
function FallbackHeader() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">T</span>
        </div>
        <div>
          <h1 className="text-white font-semibold text-base">TradeAutopsy</h1>
          <p className="text-gray-400 text-xs">Trading Analytics</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
          <span className="text-xs text-white">U</span>
        </div>
      </div>
    </header>
  )
}

// Error boundary for header component
class HeaderErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[Dashboard Header Error]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <FallbackHeader />
    }

    return this.props.children
  }
}

// Import DashboardHeader with error handling
let DashboardHeader: any = FallbackHeader

try {
  const headerModule = require('./components/DashboardHeader')
  DashboardHeader = headerModule.DashboardHeader || headerModule.default || FallbackHeader
} catch (error) {
  console.error('[Dashboard Header Import Error]', error)
  DashboardHeader = FallbackHeader
}

// Safe DashboardHeader wrapper with error boundary
function SafeDashboardHeader() {
  return (
    <HeaderErrorBoundary>
      <DashboardHeader />
    </HeaderErrorBoundary>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProfileProvider>
      <ProfileDashboardProvider>
        <div className="flex h-screen bg-black overflow-hidden">
          <CollapsibleSidebar />
          <div className="flex-1 flex flex-col overflow-hidden transition-all duration-200" style={{ transform: 'translateZ(0)' }}>
            <HeaderErrorBoundary>
              <SafeDashboardHeader />
            </HeaderErrorBoundary>
            <main className="flex-1 overflow-y-auto bg-black scrollbar-hide">
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-800 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400 text-sm">Loading...</p>
                  </div>
                </div>
              }>
                {children}
              </Suspense>
            </main>
          </div>
        </div>
      </ProfileDashboardProvider>
    </ProfileProvider>
  )
}
