'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/login')
        } else {
          setSession(session)
        }
      } catch (err) {
        console.error('Error fetching session:', err)
        setError('Failed to load session')
      } finally {
        setLoading(false)
      }
    }

    getSession()
  }, [router, supabase])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (err) {
      console.error('Error logging out:', err)
      setError('Failed to logout')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">Welcome back, {session?.user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Welcome Section */}
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 mb-8">
          <h2 className="text-3xl font-bold mb-4">Welcome to TradeAutopsy Dashboard</h2>
          <p className="text-gray-300 mb-6">
            You're successfully logged in! Start analyzing your trades to discover patterns and insights that will improve your trading performance.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <div className="text-3xl font-bold text-emerald-400 mb-2">0</div>
              <div className="text-gray-400">Trades Uploaded</div>
              <p className="text-sm text-gray-500 mt-2">Connect your broker to import trades</p>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <div className="text-3xl font-bold text-blue-400 mb-2">0%</div>
              <div className="text-gray-400">Win Rate</div>
              <p className="text-sm text-gray-500 mt-2">Based on your uploaded trades</p>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <div className="text-3xl font-bold text-yellow-400 mb-2">₹0</div>
              <div className="text-gray-400">Total P&L</div>
              <p className="text-sm text-gray-500 mt-2">Your net profit/loss</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gray-800 rounded-xl p-8 border border-emerald-600/30 mb-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-sm">1</span>
            Getting Started
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-4 pb-4 border-b border-gray-700">
              <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-1">✓</div>
              <div>
                <h4 className="font-semibold mb-1">Email Verified</h4>
                <p className="text-gray-400">Your email account is verified</p>
              </div>
            </div>

            <div className="flex items-start gap-4 pb-4 border-b border-gray-700">
              <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-1">2</div>
              <div>
                <h4 className="font-semibold mb-1">Connect Your Broker</h4>
                <p className="text-gray-400">Link Zerodha, Upstox, or Angel account to import trades</p>
                <Link
                  href="/settings"
                  className="inline-block mt-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                >
                  Go to Settings →
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-1">3</div>
              <div>
                <h4 className="font-semibold mb-1">Get Trade Insights</h4>
                <p className="text-gray-400">Analyze your trading patterns and discover what works for you</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">About TradeAutopsy</h3>
          <p className="text-gray-300 mb-4">
            TradeAutopsy automatically analyzes your trades to help you discover:
          </p>
          <ul className="space-y-2 text-gray-400">
            <li>✓ Which strategies are actually profitable</li>
            <li>✓ What time of day you lose the most money</li>
            <li>✓ Behavioral patterns costing you thousands</li>
            <li>✓ How you compare to other traders</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
