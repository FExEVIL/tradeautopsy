import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | TradeAutopsy',
  description: 'Terms of Service for TradeAutopsy trading journal and analytics platform',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-8 transition-colors"
        >
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Terms of Service
        </h1>
        
        <p className="text-gray-400 mb-12">
          Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using TradeAutopsy (&quot;the Service&quot;), you accept and agree to be bound by 
              these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p className="leading-relaxed">
              TradeAutopsy provides trading journal and analytics tools designed to help traders analyze 
              their trading performance, identify patterns, and improve their trading strategies. The 
              Service includes features such as trade logging, performance analytics, AI-powered insights, 
              and behavioral analysis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
            <ul className="list-disc list-inside space-y-2 leading-relaxed">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must notify us immediately of any unauthorized access to your account</li>
              <li>You may not share your account with others or allow others to access your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Acceptable Use</h2>
            <p className="leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 leading-relaxed">
              <li>Use the Service for any illegal purpose or in violation of any laws</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service or servers connected to the Service</li>
              <li>Upload or transmit viruses or any other malicious code</li>
              <li>Collect or harvest any information from the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Intellectual Property</h2>
            <p className="leading-relaxed">
              The Service and its original content, features, and functionality are owned by TradeAutopsy 
              and are protected by international copyright, trademark, patent, trade secret, and other 
              intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Disclaimer</h2>
            <p className="leading-relaxed">
              TradeAutopsy is a trading journal and analytics tool. It does not provide financial advice, 
              investment recommendations, or trading signals. All trading decisions are made at your own 
              risk. Past performance is not indicative of future results. You should consult with a 
              qualified financial advisor before making any investment decisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
            <p className="leading-relaxed">
              To the maximum extent permitted by law, TradeAutopsy shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages, including without limitation, loss 
              of profits, data, use, goodwill, or other intangible losses, resulting from your access to 
              or use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Changes to Terms</h2>
            <p className="leading-relaxed">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, 
              we will provide at least 30 days&apos; notice prior to any new terms taking effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about these Terms, please contact us at{' '}
              <a href="mailto:support@tradeautopsy.in" className="text-blue-400 hover:text-blue-300 underline">
                support@tradeautopsy.in
              </a>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-800">
          <Link 
            href="/privacy" 
            className="text-blue-400 hover:text-blue-300 underline"
          >
            View Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  )
}

