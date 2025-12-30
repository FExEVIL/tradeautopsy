'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { Logo } from '@/components/ui/Logo'

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
          <Logo size="md" showText={true} href="/" />
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
