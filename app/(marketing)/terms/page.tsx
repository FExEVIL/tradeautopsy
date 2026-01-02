import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUp, FileText, AlertTriangle, Shield, CreditCard, XCircle, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | TradeAutopsy',
  description: 'TradeAutopsy Terms of Service - Read our terms and conditions for using the platform.',
}

export default function TermsOfServicePage() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-emerald-400" />
            <h1 className="text-4xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-gray-400">
            Last updated: December 31, 2024
          </p>
        </div>

        {/* Important Disclaimer */}
        <div className="bg-red-500/10 border-2 border-red-500/50 rounded-xl p-6 mb-12">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-red-400 mb-2">Important Disclaimer</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                TradeAutopsy does NOT provide financial advice. All analytics, insights, and recommendations are for educational purposes only. Trading involves substantial risk of loss. Past performance does not guarantee future results. Consult a qualified financial advisor before making trading decisions. We are not responsible for any trading losses.
              </p>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-12">
          <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
          <nav className="space-y-2">
            <a href="#agreement" className="block text-emerald-400 hover:text-emerald-300 transition-colors">1. Agreement to Terms</a>
            <a href="#description" className="block text-emerald-400 hover:text-emerald-300 transition-colors">2. Description of Service</a>
            <a href="#accounts" className="block text-emerald-400 hover:text-emerald-300 transition-colors">3. User Accounts</a>
            <a href="#acceptable-use" className="block text-emerald-400 hover:text-emerald-300 transition-colors">4. Acceptable Use</a>
            <a href="#disclaimer" className="block text-emerald-400 hover:text-emerald-300 transition-colors">5. Trading Disclaimer</a>
            <a href="#intellectual-property" className="block text-emerald-400 hover:text-emerald-300 transition-colors">6. Intellectual Property</a>
            <a href="#user-content" className="block text-emerald-400 hover:text-emerald-300 transition-colors">7. User Content</a>
            <a href="#payment" className="block text-emerald-400 hover:text-emerald-300 transition-colors">8. Payment Terms</a>
            <a href="#liability" className="block text-emerald-400 hover:text-emerald-300 transition-colors">9. Limitation of Liability</a>
            <a href="#termination" className="block text-emerald-400 hover:text-emerald-300 transition-colors">10. Termination</a>
            <a href="#disputes" className="block text-emerald-400 hover:text-emerald-300 transition-colors">11. Dispute Resolution</a>
            <a href="#changes" className="block text-emerald-400 hover:text-emerald-300 transition-colors">12. Changes to Terms</a>
            <a href="#contact" className="block text-emerald-400 hover:text-emerald-300 transition-colors">13. Contact Information</a>
          </nav>
        </div>

        {/* Sections */}
        <div className="prose prose-invert prose-lg max-w-none space-y-12">
          {/* Agreement to Terms */}
          <section id="agreement" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing or using TradeAutopsy ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              These Terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          {/* Description of Service */}
          <section id="description" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              TradeAutopsy is a trading journal and analytics platform that provides:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Trading journal functionality for recording and analyzing trades</li>
              <li>Performance analytics and reporting</li>
              <li>AI-powered insights and coaching</li>
              <li>Behavioral pattern detection</li>
              <li>Risk management tools</li>
              <li>Goal tracking and progress monitoring</li>
            </ul>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4">
              <p className="text-yellow-400 text-sm font-medium mb-2">⚠️ Not Financial Advice</p>
              <p className="text-gray-300 text-sm">
                TradeAutopsy does NOT provide financial, investment, or trading advice. All analytics, insights, and recommendations are educational and informational only.
              </p>
            </div>
          </section>

          {/* User Accounts */}
          <section id="accounts" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-400" />
              3. User Accounts
            </h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Registration</h3>
            <p className="text-gray-300 mb-4">To use TradeAutopsy, you must:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Be at least 18 years old</li>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Maintain only one account per person</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Account Security</h3>
            <p className="text-gray-300">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. We are not liable for any loss or damage arising from your failure to protect your account.
            </p>
          </section>

          {/* Acceptable Use */}
          <section id="acceptable-use" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <p className="text-gray-300 mb-4">You agree NOT to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Use the Service for any unlawful purpose</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon intellectual property rights</li>
              <li>Transmit viruses, malware, or harmful code</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Use automated systems to scrape or extract data</li>
              <li>Share your account credentials with others</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Impersonate any person or entity</li>
              <li>Collect or store personal data of other users</li>
            </ul>
            <p className="text-gray-300 mt-4">
              Violation of these terms may result in immediate termination of your account.
            </p>
          </section>

          {/* Trading Disclaimer */}
          <section id="disclaimer" className="scroll-mt-20">
            <div className="bg-red-500/10 border-2 border-red-500/50 rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-6 h-6" />
                5. Trading Disclaimer (IMPORTANT)
              </h2>
              <div className="space-y-4 text-gray-300">
                <p className="font-semibold text-red-400">TradeAutopsy does NOT provide financial advice.</p>
                <p>All analytics, insights, AI recommendations, and data visualizations are:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>For educational and informational purposes only</li>
                  <li>Not a substitute for professional financial advice</li>
                  <li>Not a recommendation to buy, sell, or hold any security</li>
                  <li>Not guaranteed to be accurate or complete</li>
                </ul>
                <p className="font-semibold mt-4">Trading Risks:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Trading involves substantial risk of loss</li>
                  <li>You may lose more than your initial investment</li>
                  <li>Past performance does not guarantee future results</li>
                  <li>Market conditions can change rapidly</li>
                </ul>
                <p className="font-semibold mt-4">Your Responsibility:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Consult a qualified financial advisor before making trading decisions</li>
                  <li>Conduct your own research and analysis</li>
                  <li>Understand the risks involved in trading</li>
                  <li>Never trade with money you cannot afford to lose</li>
                </ul>
                <p className="font-semibold text-red-400 mt-4">
                  We are NOT responsible for any trading losses, financial losses, or damages resulting from your use of TradeAutopsy or any trading decisions you make.
                </p>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section id="intellectual-property" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="text-gray-300 mb-4">
              The Service and its original content, features, and functionality are owned by TradeAutopsy and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="text-gray-300">
              You may not copy, modify, distribute, sell, or lease any part of the Service without our written permission.
            </p>
          </section>

          {/* User Content */}
          <section id="user-content" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4">7. User Content</h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">7.1 Ownership</h3>
            <p className="text-gray-300">
              You retain ownership of all trading data, journal entries, and content you upload to TradeAutopsy ("User Content").
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.2 License</h3>
            <p className="text-gray-300 mb-4">
              By uploading User Content, you grant us a non-exclusive, worldwide, royalty-free license to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Store and process your data to provide the Service</li>
              <li>Generate analytics and insights</li>
              <li>Use anonymized, aggregated data for platform improvement</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.3 Responsibility</h3>
            <p className="text-gray-300">
              You are responsible for the accuracy of your User Content. You represent that you have the right to upload all User Content and that it does not violate any third-party rights.
            </p>
          </section>

          {/* Payment Terms */}
          <section id="payment" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-emerald-400" />
              8. Payment Terms
            </h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">8.1 Subscription Plans</h3>
            <p className="text-gray-300 mb-4">
              TradeAutopsy may offer paid subscription plans. If you subscribe:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>You agree to pay the subscription fee</li>
              <li>Fees are billed in advance on a recurring basis</li>
              <li>All fees are non-refundable unless required by law</li>
              <li>We may change pricing with 30 days notice</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">8.2 Cancellation</h3>
            <p className="text-gray-300">
              You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. You will continue to have access until the period ends.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">8.3 Refunds</h3>
            <p className="text-gray-300">
              Refunds are provided at our discretion or as required by law. Contact support for refund requests.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section id="liability" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-emerald-400" />
              9. Limitation of Liability
            </h2>
            <p className="text-gray-300 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>The Service is provided "AS IS" and "AS AVAILABLE" without warranties</li>
              <li>We do not guarantee accuracy, completeness, or reliability of any data or insights</li>
              <li>We are not liable for any trading losses or financial damages</li>
              <li>We are not liable for any indirect, incidental, or consequential damages</li>
              <li>Our total liability shall not exceed the amount you paid us in the past 12 months</li>
            </ul>
            <p className="text-gray-300 mt-4">
              Some jurisdictions do not allow the exclusion of certain warranties or limitations of liability, so some of the above may not apply to you.
            </p>
          </section>

          {/* Termination */}
          <section id="termination" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">10.1 By You</h3>
            <p className="text-gray-300">
              You may terminate your account at any time by deleting it through the settings page or contacting support.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">10.2 By Us</h3>
            <p className="text-gray-300 mb-4">
              We may terminate or suspend your account immediately if you:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Violate these Terms</li>
              <li>Engage in fraudulent or illegal activity</li>
              <li>Fail to pay subscription fees (for paid plans)</li>
              <li>Abuse the Service or other users</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">10.3 Effect of Termination</h3>
            <p className="text-gray-300">
              Upon termination, your right to use the Service ceases immediately. We may delete your account and data in accordance with our Privacy Policy.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section id="disputes" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4">11. Dispute Resolution</h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">11.1 Governing Law</h3>
            <p className="text-gray-300">
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">11.2 Jurisdiction</h3>
            <p className="text-gray-300">
              Any disputes arising from these Terms or the Service shall be subject to the exclusive jurisdiction of the courts in India.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">11.3 Informal Resolution</h3>
            <p className="text-gray-300">
              Before filing a formal claim, please contact us to attempt to resolve the dispute informally. We will try to resolve disputes within 30 days.
            </p>
          </section>

          {/* Changes to Terms */}
          <section id="changes" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
            <p className="text-gray-300 mb-4">
              We reserve the right to modify these Terms at any time. We will notify you of changes by:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Posting the updated Terms on this page</li>
              <li>Updating the "Last updated" date</li>
              <li>Sending an email notification (for significant changes)</li>
              <li>Showing a banner in the app</li>
            </ul>
            <p className="text-gray-300 mt-4">
              Your continued use of the Service after changes become effective constitutes acceptance of the updated Terms.
            </p>
          </section>

          {/* Contact */}
          <section id="contact" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-emerald-400" />
              13. Contact Information
            </h2>
            <p className="text-gray-300 mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <p className="text-gray-300">
                <strong>Email:</strong> <a href="mailto:legal@tradeautopsy.in" className="text-emerald-400 hover:text-emerald-300">legal@tradeautopsy.in</a>
              </p>
              <p className="text-gray-300 mt-2">
                <strong>Website:</strong> <a href="https://www.tradeautopsy.in" className="text-emerald-400 hover:text-emerald-300">www.tradeautopsy.in</a>
              </p>
            </div>
          </section>
        </div>

        {/* Back to Top */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex justify-center">
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg text-gray-300 transition-colors"
          >
            <ArrowUp size={18} />
            Back to Top
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center text-gray-400 text-sm">
          <p>© 2024 TradeAutopsy. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link href="/help" className="hover:text-emerald-400 transition-colors">Help</Link>
            <span>•</span>
            <Link href="/changelog" className="hover:text-emerald-400 transition-colors">Changelog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

