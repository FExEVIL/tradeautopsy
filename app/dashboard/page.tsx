'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  useEffect(() => {
    async function fetchUser() {
      try {
        console.log('[Dashboard] Fetching user...')
        
        const res = await fetch('/api/user/me', {
          credentials: 'include',
          cache: 'no-store',
        })

        console.log('[Dashboard] Response:', res.status)

        if (!res.ok) {
          if (res.status === 401) {
            console.log('[Dashboard] Not authenticated, redirecting...')
            router.push('/login')
            return
          }
          // Don't throw - just log and set loading to false
          console.error('[Dashboard] Failed to fetch user:', res.status)
          setLoading(false)
          return
        }

        const data = await res.json()
        if (data?.user) {
          console.log('[Dashboard] User loaded:', data.user.email)
          setUser(data.user)
        }
      } catch (error) {
        console.error('[Dashboard] Error fetching user:', error)
        // Don't throw error - gracefully handle it
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }
  
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">
          Welcome, {user.name || user.email}!
        </h1>
        <p className="text-gray-400 mb-8">
          You're successfully logged in to TradeAutopsy
        </p>
        
        <div className="grid gap-4">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-2">Profile</h2>
            <p className="text-gray-400">Email: {user.email}</p>
            <p className="text-gray-400">ID: {user.id}</p>
            <p className="text-gray-400">Verified: {user.email_verified ? 'Yes' : 'No'}</p>
          </div>
          
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' })
              router.push('/login')
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>
      </div>
  )
}
