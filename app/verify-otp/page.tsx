import { Metadata } from 'next';
import { Suspense } from 'react';
import OTPVerification from '@/components/auth/OTPVerification';

export const metadata: Metadata = {
  title: 'Verification - TradeAutopsy',
  description: 'Verify your email address',
};

export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <OTPVerification />
    </Suspense>
  );
}

