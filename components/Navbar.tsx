'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Session } from '@supabase/supabase-js'

export function Navbar() {
  const [session, setSession] = useState<Session | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
  }, [supabase])

  return (
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold text-emerald-400">TradeAutopsy</Link>
      <div className="space-x-4">
        {session ? (
          <>
            <Link href="/dashboard" className="px-4 py-2 text-gray-300 hover:text-white">
              Dashboard
            </Link>
            <Link href="/settings" className="px-4 py-2 text-gray-300 hover:text-white">
              Settings
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className="px-4 py-2 text-gray-300 hover:text-white">
              Login
            </Link>
            <Link 
              href="/signup" 
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
