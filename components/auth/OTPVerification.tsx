'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OTPVerification() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const router = useRouter();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const urlEmail = searchParams?.get('email');
    if (urlEmail) {
      setEmail(urlEmail);
    } else if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('pendingEmail');
      if (stored) setEmail(stored);
    }

    inputRefs.current[0]?.focus();
  }, [searchParams]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit) && index === 5) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');

    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (code: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('pendingEmail');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
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
        throw new Error(data.error || 'Failed to resend code');
      }

      // optional: show toast, for now just silent success
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">T</span>
            </div>
            <span className="text-lg font-semibold">TradeAutopsy</span>
          </Link>
          <Link
            href="/signup"
            className="text-sm text-gray-400 hover:text-white transition px-3 py-1.5 
                     border border-gray-800 rounded-md hover:border-gray-700"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold text-white mb-4">Verification</h1>
            <p className="text-gray-400 text-sm mb-1">
              If you have an account, we have sent a code to
            </p>
            <p className="text-white font-medium text-sm mb-1">{email}</p>
            <p className="text-gray-400 text-sm">Enter it below.</p>
          </div>

          {/* OTP Input */}
          <div className="mb-8">
            <div className="flex gap-3 justify-center" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading}
                  className="w-12 h-14 text-center text-xl font-medium
                           bg-transparent border-2 border-gray-800 rounded-md
                           text-white focus:border-white focus:outline-none
                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                           caret-white"
                />
              ))}
            </div>

            {error && (
              <div className="mt-4 text-center text-red-500 text-sm">{error}</div>
            )}
          </div>

          {/* Back Link */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-gray-400 hover:text-white transition 
                       flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back
            </button>
          </div>

          {/* Resend Code */}
          <div className="mt-4 text-center">
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-sm text-gray-500 hover:text-gray-400 transition disabled:opacity-50"
            >
              Didn't receive code? Resend
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

