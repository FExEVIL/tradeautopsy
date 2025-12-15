import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Log in to TradeAutopsy',
  description: 'Sign in to your TradeAutopsy account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <Link
            href="/signup"
            className="text-sm text-gray-400 hover:text-white transition-colors 
                     px-3 py-1.5 rounded-md border border-transparent hover:border-gray-800"
          >
            Sign up
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-[320px]">
          <h1 className="text-[32px] font-semibold text-white text-center mb-8 tracking-tight">
            Log in to TradeAutopsy
          </h1>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="pb-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-6 text-xs text-[#737373]">
          <Link href="/terms" className="hover:text-[#a3a3a3] transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-[#a3a3a3] transition-colors">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}

