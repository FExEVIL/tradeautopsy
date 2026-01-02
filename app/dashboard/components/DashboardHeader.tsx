'use client'

import { Logo } from '@/components/ui/Logo'
import { ProfileSwitcher } from './ProfileSwitcher'
import { MarketStatus } from './MarketStatus'
import { NotificationBell } from './NotificationBell'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ChangelogBadge } from '@/components/changelog/ChangelogBadge'
import { UserDropdown } from './UserDropdown'

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-bg-header border-b border-border-subtle backdrop-blur-sm">
      <Logo size="md" showText={true} showSubtitle={true} href="/dashboard" />
      <div className="flex items-center gap-3">
        <ChangelogBadge />
        <ProfileSwitcher />
        <MarketStatus />
        <NotificationBell />
        <ThemeToggle />
        <UserDropdown />
      </div>
    </header>
  )
}
