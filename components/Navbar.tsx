'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import type { Session } from '@supabase/supabase-js'

export function Navbar() {
  const [session, setSession] = useState<Session | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <h1 className="text-xl font-bold text-slate-900">TradeAutopsy</h1>
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">{session.user.email}</span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Logout
              </button>
            </div>
          ) : (
            <a href="/login" className="text-sm text-slate-600 hover:text-slate-900">
              Login
            </a>
          )}
        </div>
      </div>
    </nav>
  )
}