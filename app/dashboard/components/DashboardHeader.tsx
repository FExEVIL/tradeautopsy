'use client'

import { ProfileSwitcher } from './ProfileSwitcher'
import { MarketStatus } from './MarketStatus'
import { NotificationBell } from './NotificationBell'
import { ThemeToggle } from '@/components/ThemeToggle'

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-bg-header border-b border-border-subtle">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
          <span className="text-black font-bold text-lg">T</span>
        </div>
        <div>
          <h1 className="text-text-primary font-semibold text-base">TradeAutopsy</h1>
          <p className="text-text-muted text-xs">Trading Analytics</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ProfileSwitcher />
        <MarketStatus />
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  )
}
