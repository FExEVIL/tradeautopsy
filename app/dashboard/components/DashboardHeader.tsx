'use client'

import { ProfileSwitcher } from './ProfileSwitcher'
import { MarketStatus } from './MarketStatus'
import { NotificationBell } from './NotificationBell'
import { ThemeToggle } from '@/components/ThemeToggle'

export function DashboardHeader() {
  return (
    <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Left side - can add page title or breadcrumbs here */}
        </div>
        <div className="flex items-center gap-3">
          {/* Profile Switcher - Prominently displayed with other controls */}
          <ProfileSwitcher />
          <MarketStatus />
          <NotificationBell />
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
