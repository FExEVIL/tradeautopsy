'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Input } from '@/components/auth/Input'
import { Button } from '@/components/auth/Button'
import { SSOButton } from '@/components/auth/SSOButton'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [ssoLoading, setSsoLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/workos/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send magic link')
      }

      // Redirect to magic link sent page
      router.push(`/auth/magic-link-sent?email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link. Please try again.')
      setLoading(false)
    }
  }

  const handleSSOLogin = async (provider: string) => {
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
      console.error('SSO login error:', err)
      setError(err.message || 'SSO login failed. Please try again.')
      setSsoLoading(null)
    }
  }

  return (
    <AuthLayout headerLink={{ text: 'Sign up', href: '/signup' }}>
      <div className="space-y-6">
        <div>
          <h1 className="text-[28px] font-medium text-white mb-2 tracking-[-0.02em]">
            Log in to TradeAutopsy
          </h1>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-[5px]">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
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
            Continue with Email
          </Button>
        </form>

        <div className="text-center my-6">
          <span className="text-sm text-[#a3a3a3]">OR</span>
        </div>

        <div className="space-y-3">
          <SSOButton
            provider="google"
            onClick={() => handleSSOLogin('GoogleOAuth')}
            loading={ssoLoading === 'GoogleOAuth'}
            disabled={loading || !!ssoLoading}
          />
          <SSOButton
            provider="apple"
            onClick={() => handleSSOLogin('AppleOAuth')}
            loading={ssoLoading === 'AppleOAuth'}
            disabled={loading || !!ssoLoading}
          />
        </div>

        <div className="space-y-3 pt-3">
          <SSOButton
            provider="github"
            onClick={() => handleSSOLogin('GitHubOAuth')}
            loading={ssoLoading === 'GitHubOAuth'}
            disabled={loading || !!ssoLoading}
          />
          <SSOButton
            provider="saml"
            onClick={() => handleSSOLogin('SAMLSSO')}
            loading={ssoLoading === 'SAMLSSO'}
            disabled={loading || !!ssoLoading}
          />
          <SSOButton
            provider="passkey"
            onClick={() => router.push('/auth/passkey/create')}
            disabled={loading || !!ssoLoading}
          />
        </div>

        <p className="text-center text-sm text-[#a3a3a3]">
          Don't have an account?{' '}
          <Link href="/signup" className="text-[#0070f3] hover:text-[#0761d1] transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <AuthLayout headerLink={{ text: 'Sign up', href: '/signup' }}>
        <div className="space-y-6">
          <div>
            <h1 className="text-[28px] font-medium text-white mb-2 tracking-[-0.02em]">
              Log in to TradeAutopsy
            </h1>
          </div>
          <div className="text-center text-[#a3a3a3]">Loading...</div>
        </div>
      </AuthLayout>
    }>
      <LoginForm />
    </Suspense>
  )
}
