'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  showHeader?: boolean
  headerLink?: {
    text: string
    href: string
  }
}

export function AuthLayout({ children, showHeader = true, headerLink }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      {showHeader && (
        <header className="w-full px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">T</span>
            </div>
            <span className="text-lg font-semibold">TradeAutopsy</span>
          </Link>
          {headerLink && (
            <Link
              href={headerLink.href}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {headerLink.text}
            </Link>
          )}
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[360px]">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4">
        <div className="max-w-[360px] mx-auto flex items-center justify-center gap-6 text-xs text-[#666666]">
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  )
}
