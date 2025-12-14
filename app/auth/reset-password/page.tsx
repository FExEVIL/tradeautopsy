'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Input } from '@/components/auth/Input'
import { Button } from '@/components/auth/Button'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset link')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout headerLink={{ text: 'Log in', href: '/login' }}>
      <div className="space-y-6">
        <div>
          <h1 className="text-[28px] font-medium text-white mb-2 tracking-[-0.02em]">
            Reset your password
          </h1>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-[5px]">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {success ? (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-[5px]">
            <p className="text-sm text-green-400">
              Check your email for reset instructions. If you don't see it, check your spam folder.
            </p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />

            <Button type="submit" loading={loading} disabled={loading || !email}>
              Send reset link
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-[#a3a3a3]">
          Remember your password?{' '}
          <Link href="/login" className="text-[#0070f3] hover:text-[#0761d1] transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
