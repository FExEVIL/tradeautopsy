'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/auth/Button'
import { Mail, Check } from 'lucide-react'

function MagicLinkSentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendSuccess, setResendSuccess] = useState(false)

  const handleResend = async () => {
    if (!email) return

    setLoading(true)
    setError('')
    setResendSuccess(false)

    try {
      const response = await fetch('/api/auth/workos/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend email')
      }

      setResendSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to resend email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout headerLink={{ text: 'Log in', href: '/login' }}>
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-[28px] font-medium text-white mb-2 tracking-[-0.02em]">
            Check your email
          </h1>
          <p className="text-sm text-[#a3a3a3]">
            We sent a magic link to <span className="text-white font-medium">{email}</span>. Click the link to sign in.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-[5px]">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {resendSuccess && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-[5px]">
            <p className="text-sm text-green-400">Email resent successfully!</p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            variant="secondary"
            onClick={handleResend}
            loading={loading}
            disabled={loading || !email}
          >
            Resend email
          </Button>
          <Link
            href={`/login?email=${encodeURIComponent(email)}`}
            className="block w-full text-center text-sm text-[#0070f3] hover:text-[#0761d1] transition-colors"
          >
            Use a different email
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}

export default function MagicLinkSentPage() {
  return (
    <Suspense fallback={
      <AuthLayout headerLink={{ text: 'Log in', href: '/login' }}>
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-[28px] font-medium text-white mb-2 tracking-[-0.02em]">
              Check your email
            </h1>
            <div className="text-center text-[#a3a3a3]">Loading...</div>
          </div>
        </div>
      </AuthLayout>
    }>
      <MagicLinkSentContent />
    </Suspense>
  )
}
