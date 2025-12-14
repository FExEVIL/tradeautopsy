'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/auth/Button'
import { SSOButton } from '@/components/auth/SSOButton'

export default function SignupPage() {
  const router = useRouter()
  const [ssoLoading, setSsoLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleSSOSignup = async (provider: string) => {
    setSsoLoading(provider)
    setError('')

    try {
      const response = await fetch('/api/auth/workos/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get authorization URL')
      }

      const { authorizationUrl } = await response.json()
      window.location.href = authorizationUrl
    } catch (err: any) {
      console.error('SSO signup error:', err)
      setError(err.message || 'SSO signup failed. Please try again.')
      setSsoLoading(null)
    }
  }

  return (
    <AuthLayout headerLink={{ text: 'Log in', href: '/login' }}>
      <div className="space-y-6">
        <div>
          <h1 className="text-[28px] font-medium text-white mb-2 tracking-[-0.02em]">
            Let's create your account
          </h1>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-[5px]">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <SSOButton
            provider="google"
            onClick={() => handleSSOSignup('GoogleOAuth')}
            loading={ssoLoading === 'GoogleOAuth'}
            disabled={!!ssoLoading}
          />
          <SSOButton
            provider="apple"
            onClick={() => handleSSOSignup('AppleOAuth')}
            loading={ssoLoading === 'AppleOAuth'}
            disabled={!!ssoLoading}
          />
        </div>

        <div className="text-center my-6">
          <span className="text-sm text-[#a3a3a3]">OR</span>
        </div>

        <Link
          href="/signup/email"
          className="block w-full text-center text-sm text-[#0070f3] hover:text-[#0761d1] transition-colors"
        >
          Continue with Email →
        </Link>

        <p className="text-center text-sm text-[#a3a3a3]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#0070f3] hover:text-[#0761d1] transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
