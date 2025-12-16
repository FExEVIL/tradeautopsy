'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from './Input'
import { Button } from './Button'
import { SSOButton } from './SSOButton'
import { Divider } from './Divider'
import { ExpandableOptions } from './ExpandableOptions'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [ssoLoading, setSsoLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

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
    } finally {
      setLoading(false)
    }
  }

  const handleSSOLogin = async (provider: string) => {
    setSsoLoading(provider)
    setError(null)

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
      setError(err.message || 'SSO login failed. Please try again.')
      setSsoLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="w-full px-3 py-2 bg-red-900/70 border border-red-700 rounded-md text-sm text-red-100 text-center">
          {error}
        </div>
      )}

      {/* Email form */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          required
          disabled={loading}
        />

        <Button type="submit" variant="primary" loading={loading} disabled={!email}>
          Continue with Email
        </Button>
      </form>

      {/* Divider - text only, no gradient line */}
      <Divider />

      {/* Primary SSO Options: Google and Apple */}
      <div className="space-y-3">
        <SSOButton
          provider="google"
          loading={ssoLoading === 'GoogleOAuth'}
          disabled={loading || !!ssoLoading}
          onClick={() => handleSSOLogin('GoogleOAuth')}
        />

        <SSOButton
          provider="apple"
          loading={ssoLoading === 'AppleOAuth'}
          disabled={loading || !!ssoLoading}
          onClick={() => handleSSOLogin('AppleOAuth')}
        />
      </div>

      {/* Expandable Options: GitHub, SAML SSO, Passkey */}
      <ExpandableOptions>
        <SSOButton
          provider="github"
          loading={ssoLoading === 'GitHubOAuth'}
          disabled={loading || !!ssoLoading}
          onClick={() => handleSSOLogin('GitHubOAuth')}
        />

        <SSOButton
          provider="saml"
          loading={ssoLoading === 'SAMLSSO'}
          disabled={loading || !!ssoLoading}
          onClick={() => handleSSOLogin('SAMLSSO')}
        />

        <SSOButton
          provider="passkey"
          loading={ssoLoading === 'Passkey'}
          disabled={loading || !!ssoLoading}
          onClick={() => {
            setError('Passkey sign-in is not enabled yet. Please use email or another provider.')
          }}
        />
      </ExpandableOptions>

      {/* Sign up link */}
      <div className="text-center text-sm text-[#737373] mt-6">
        Don't have an account?{' '}
        <a
          href="/signup"
          className="text-white hover:text-[#a3a3a3] transition-colors underline"
        >
          Sign up
        </a>
      </div>
    </div>
  )
}
