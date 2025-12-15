'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pendingEmail', email);
      }

      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSSOLogin = async (provider: string) => {
    setSsoLoading(provider);
    setError(null);

    console.log(`Clicked provider: ${provider}`);

    try {
      const response = await fetch('/api/auth/workos/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get authorization URL');
      }

      const { authorizationUrl } = await response.json();
      window.location.href = authorizationUrl;
    } catch (err: any) {
      setError(err.message || 'SSO login failed. Please try again.');
      setSsoLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="w-full px-3 py-2 bg-red-900/70 border border-red-700 rounded-md text-sm text-red-100 text-center">
          {error}
        </div>
      )}

      {/* Email form */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          required
          disabled={loading}
          className="w-full h-10 px-3 bg-[#171717] border border-[#262626] rounded-md
                   text-white text-sm placeholder:text-[#737373]
                   focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent
                   hover:bg-[#1d1d1d]
                   transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full h-10 bg-white text-black text-sm font-medium rounded-md
                   hover:bg-[#e5e5e5] transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed
                   focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
        >
          {loading ? 'Sending...' : 'Continue with Email'}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#262626]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-black text-[#737373]">OR</span>
        </div>
      </div>

      {/* OAuth buttons */}
      <div className="space-y-3">
        {/* Google */}
        <button
          type="button"
          onClick={() => handleSSOLogin('GoogleOAuth')}
          disabled={loading || !!ssoLoading}
          className="w-full h-10 bg-[#0a0a0a] border border-[#262626] rounded-md
                   text-white text-sm font-medium
                   hover:bg-[#171717] hover:border-[#404040] transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* GitHub */}
        <button
          type="button"
          onClick={() => handleSSOLogin('GitHubOAuth')}
          disabled={loading || !!ssoLoading}
          className="w-full h-10 bg-[#0a0a0a] border border-[#262626] rounded-md
                   text-white text-sm font-medium
                   hover:bg-[#171717] hover:border-[#404040] transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-3"
        >
          <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span>Continue with GitHub</span>
        </button>

        {/* SAML SSO */}
        <button
          type="button"
          onClick={() => handleSSOLogin('SAMLSSO')}
          disabled={loading || !!ssoLoading}
          className="w-full h-10 bg-[#0a0a0a] border border-[#262626] rounded-md
                   text-white text-sm font-medium
                   hover:bg-[#171717] hover:border-[#404040] transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="5" y="11" width="14" height="9" rx="2" ry="2" />
            <path d="M9 11V8a3 3 0 0 1 6 0v3" />
          </svg>
          <span>Continue with SAML SSO</span>
        </button>

        {/* Passkey – currently non-functional auth, just logs */}
        <button
          type="button"
          onClick={() => {
            console.log('Clicked provider: passkey');
            setError('Passkey sign-in is not enabled yet. Please use email or another provider.');
          }}
          disabled={loading || !!ssoLoading}
          className="w-full h-10 bg-[#0a0a0a] border border-[#262626] rounded-md
                   text-white text-sm font-medium
                   hover:bg-[#171717] hover:border-[#404040] transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M7 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3Z" />
            <path d="M3 20v-1a4 4 0 0 1 4-4" />
            <circle cx="16.5" cy="8" r="2.3" />
            <path d="M13 15.5L16.5 12l3 3-1.2 1.2.8.8-.8.8-.8-.8L15.5 18z" />
          </svg>
          <span>Continue with Passkey</span>
        </button>
      </div>

      {/* Sign up link */}
      <div className="text-center text-sm text-[#a3a3a3] mt-6">
        Don't have an account?{' '}
        <a href="/signup" className="text-[#3b82f6] hover:text-[#60a5fa] transition-colors">
          Sign up
        </a>
      </div>
    </div>
  );
}

