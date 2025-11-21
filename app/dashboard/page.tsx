'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push('/login')
          return
        }

        setUser(session.user)
      } catch (error) {
        console.error('Error getting user:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Set up listener for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No user session found. Redirecting to login...</p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-6">Welcome, {user?.email}!</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-lg mb-2">Account Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <strong>Email:</strong> {user?.email}
                </p>
                <p>
                  <strong>User ID:</strong> {user?.id}
                </p>
                <p>
                  <strong>Created:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-200">
              <h3 className="font-semibold text-lg mb-2 text-emerald-900">Connect Zerodha Account</h3>
              <p className="text-sm text-emerald-700 mb-4">Connect your Zerodha trading account to start analyzing your trades.</p>
              <button className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition">
                Connect Zerodha
              </button>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-lg mb-2 text-blue-900">Getting Started</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-blue-700">
              <li>Connect your Zerodha account to import your trades</li>
              <li>Our AI will analyze your trading patterns</li>
              <li>Get insights into why you lose money and how to improve</li>
              <li>Access detailed trade analysis and recommendations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
