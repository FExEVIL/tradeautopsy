'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Input } from '@/components/auth/Input'
import { Button } from '@/components/auth/Button'

export default function OnboardingPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [planType, setPlanType] = useState<'hobby' | 'pro'>('hobby')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, planType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save preferences')
      }

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences. Please try again.')
      setLoading(false)
    }
  }

  return (
    <AuthLayout showHeader={false}>
      <div className="space-y-6">
        <div>
          <h1 className="text-[28px] font-medium text-white mb-2 tracking-[-0.02em]">
            Your first trade journal is just a sign-up away.
          </h1>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-[5px]">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleContinue} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Plan Type
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-[#333333] rounded-[5px] cursor-pointer hover:bg-[#1a1a1a] transition-colors">
                <input
                  type="radio"
                  name="planType"
                  value="pro"
                  checked={planType === 'pro'}
                  onChange={(e) => setPlanType(e.target.value as 'pro')}
                  className="w-4 h-4 text-[#0070f3] focus:ring-[#0070f3]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">I'm working on commercial projects</span>
                    <span className="px-2 py-0.5 bg-[#0070f3] text-white text-xs font-medium rounded">
                      Pro
                    </span>
                  </div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 border border-[#333333] rounded-[5px] cursor-pointer hover:bg-[#1a1a1a] transition-colors">
                <input
                  type="radio"
                  name="planType"
                  value="hobby"
                  checked={planType === 'hobby'}
                  onChange={(e) => setPlanType(e.target.value as 'hobby')}
                  className="w-4 h-4 text-[#0070f3] focus:ring-[#0070f3]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">I'm working on personal projects</span>
                    <span className="px-2 py-0.5 bg-[#666666] text-white text-xs font-medium rounded">
                      Hobby
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <Input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            autoComplete="name"
          />

          <Button type="submit" loading={loading} disabled={loading || !name}>
            Continue
          </Button>
        </form>

        <p className="text-xs text-[#666666] text-center">
          By joining, you agree to our{' '}
          <a href="/terms" className="text-[#0070f3] hover:text-[#0761d1] transition-colors">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-[#0070f3] hover:text-[#0761d1] transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}
