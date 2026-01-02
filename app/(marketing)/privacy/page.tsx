'use client'

import Link from 'next/link'
import { ArrowUp, Shield, Lock, Database, Eye, UserCheck, Cookie, Clock, Users, Mail } from 'lucide-react'

export default function PrivacyPolicyPage() {
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
            <Shield className="w-8 h-8 text-emerald-400" />
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-gray-400">
            Last updated: December 31, 2024
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-12">
          <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
          <nav className="space-y-2">
            <a href="#introduction" className="block text-emerald-400 hover:text-emerald-300 transition-colors">1. Introduction</a>
            <a href="#information-we-collect" className="block text-emerald-400 hover:text-emerald-300 transition-colors">2. Information We Collect</a>
            <a href="#how-we-use" className="block text-emerald-400 hover:text-emerald-300 transition-colors">3. How We Use Information</a>
            <a href="#data-storage" className="block text-emerald-400 hover:text-emerald-300 transition-colors">4. Data Storage & Security</a>
            <a href="#third-party" className="block text-emerald-400 hover:text-emerald-300 transition-colors">5. Third-Party Services</a>
            <a href="#your-rights" className="block text-emerald-400 hover:text-emerald-300 transition-colors">6. Your Rights</a>
            <a href="#cookies" className="block text-emerald-400 hover:text-emerald-300 transition-colors">7. Cookies</a>
            <a href="#data-retention" className="block text-emerald-400 hover:text-emerald-300 transition-colors">8. Data Retention</a>
            <a href="#children" className="block text-emerald-400 hover:text-emerald-300 transition-colors">9. Children's Privacy</a>
            <a href="#changes" className="block text-emerald-400 hover:text-emerald-300 transition-colors">10. Changes to Policy</a>
            <a href="#contact" className="block text-emerald-400 hover:text-emerald-300 transition-colors">11. Contact</a>
          </nav>
        </div>

        {/* Sections */}
        <div className="prose prose-invert prose-lg max-w-none space-y-12">
          {/* Introduction */}
          <section id="introduction" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-400" />
              1. Introduction
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Welcome to TradeAutopsy ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our trading journal and analytics platform.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              By using TradeAutopsy, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our service.
            </p>
          </section>

          {/* Information We Collect */}
          <section id="information-we-collect" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-emerald-400" />
              2. Information We Collect
            </h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Account Information</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Email address</li>
              <li>Name (if provided)</li>
              <li>Authentication credentials (encrypted)</li>
              <li>Profile information</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Trading Data</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Trade history (symbols, quantities, prices, P&L)</li>
              <li>Journal entries and notes</li>
              <li>Trading strategies and setups</li>
              <li>Tags and categories</li>
              <li>Emotional state tracking</li>
              <li>Screenshots and attachments</li>
              <li>Audio recordings (if you use audio journaling)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.3 Usage Data</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Pages visited and features used</li>
              <li>Time spent on platform</li>
              <li>Device and browser information</li>
              <li>IP address (for security purposes)</li>
              <li>Error logs and crash reports</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.4 Broker Integration Data</h3>
            <p className="text-gray-300">
              If you connect your broker account (e.g., Zerodha), we may access:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Trade history (read-only)</li>
              <li>Account balance (if provided by broker API)</li>
              <li>Broker authentication tokens (stored securely)</li>
            </ul>
          </section>

          {/* How We Use */}
          <section id="how-we-use" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-emerald-400" />
              3. How We Use Information
            </h2>
            <p className="text-gray-300 mb-4">We use your information to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li><strong>Provide Services:</strong> Process and display your trading data, generate analytics, and provide AI-powered insights</li>
              <li><strong>Improve Platform:</strong> Analyze usage patterns to enhance features and fix bugs</li>
              <li><strong>Generate Insights:</strong> Use AI to analyze your trading patterns and provide personalized recommendations</li>
              <li><strong>Send Notifications:</strong> Alert you about important events, goal achievements, and platform updates</li>
              <li><strong>Prevent Fraud:</strong> Detect and prevent unauthorized access or fraudulent activity</li>
              <li><strong>Comply with Legal Obligations:</strong> Meet legal requirements and respond to legal requests</li>
            </ul>
            <p className="text-gray-300 mt-4">
              <strong>We do NOT:</strong> Sell your personal data to third parties, use your data for advertising purposes, or share your trading data with other users.
            </p>
          </section>

          {/* Data Storage & Security */}
          <section id="data-storage" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-emerald-400" />
              4. Data Storage & Security
            </h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Data Storage</h3>
            <p className="text-gray-300 mb-4">
              Your data is stored securely on Supabase (PostgreSQL database) with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Encryption at rest</li>
              <li>Encryption in transit (HTTPS/TLS)</li>
              <li>Regular security audits</li>
              <li>Automated backups</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Security Measures</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Row-level security (RLS) policies to ensure data isolation</li>
              <li>Secure authentication (Supabase Auth + WorkOS)</li>
              <li>API rate limiting to prevent abuse</li>
              <li>Regular security updates</li>
              <li>Access controls and audit logs</li>
            </ul>

            <p className="text-gray-300 mt-4">
              While we implement industry-standard security measures, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          {/* Third-Party Services */}
          <section id="third-party" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-400" />
              5. Third-Party Services
            </h2>
            <p className="text-gray-300 mb-4">We use the following third-party services:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li><strong>Supabase:</strong> Database, authentication, and storage (privacy policy: supabase.com/privacy)</li>
              <li><strong>WorkOS:</strong> Enterprise authentication and SSO (privacy policy: workos.com/privacy)</li>
              <li><strong>OpenAI:</strong> AI-powered insights and coaching (privacy policy: openai.com/privacy)</li>
              <li><strong>Vercel:</strong> Hosting and deployment (privacy policy: vercel.com/privacy)</li>
              <li><strong>Zerodha API:</strong> Broker integration (privacy policy: kite.trade/privacy)</li>
            </ul>
            <p className="text-gray-300 mt-4">
              These services have their own privacy policies. We recommend reviewing them to understand how they handle your data.
            </p>
          </section>

          {/* Your Rights */}
          <section id="your-rights" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-emerald-400" />
              6. Your Rights
            </h2>
            <p className="text-gray-300 mb-4">You have the following rights regarding your data:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Export your trading data in CSV, JSON, or PDF format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing emails (transactional emails may still be sent)</li>
              <li><strong>Objection:</strong> Object to certain processing activities</li>
            </ul>
            <p className="text-gray-300 mt-4">
              To exercise these rights, contact us at <a href="mailto:privacy@tradeautopsy.in" className="text-emerald-400 hover:text-emerald-300">privacy@tradeautopsy.in</a> or use the settings page in your account.
            </p>
          </section>

          {/* Cookies */}
          <section id="cookies" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Cookie className="w-6 h-6 text-emerald-400" />
              7. Cookies
            </h2>
            <p className="text-gray-300 mb-4">We use cookies and similar technologies:</p>
            <h3 className="text-xl font-semibold mt-6 mb-3">7.1 Essential Cookies</h3>
            <p className="text-gray-300">Required for authentication and security. Cannot be disabled.</p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">7.2 Analytics Cookies</h3>
            <p className="text-gray-300">Help us understand how you use the platform (optional).</p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">7.3 Preference Cookies</h3>
            <p className="text-gray-300">Store your preferences (theme, sidebar state, etc.).</p>
            
            <p className="text-gray-300 mt-4">
              You can manage cookie preferences in your browser settings or through our cookie consent banner.
            </p>
          </section>

          {/* Data Retention */}
          <section id="data-retention" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-emerald-400" />
              8. Data Retention
            </h2>
            <p className="text-gray-300 mb-4">
              We retain your data for as long as your account is active or as needed to provide services. You can choose your data retention period in settings:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li><strong>30 Days:</strong> Data deleted after 30 days of inactivity</li>
              <li><strong>1 Year:</strong> Data retained for 1 year</li>
              <li><strong>Forever:</strong> Data retained indefinitely (default)</li>
            </ul>
            <p className="text-gray-300 mt-4">
              When you delete your account, all data is permanently deleted within 30 days, except where we are required to retain it for legal purposes.
            </p>
          </section>

          {/* Children's Privacy */}
          <section id="children" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
            <p className="text-gray-300">
              TradeAutopsy is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          {/* Changes to Policy */}
          <section id="changes" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of any changes by:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mt-4">
              <li>Posting the new policy on this page</li>
              <li>Updating the "Last updated" date</li>
              <li>Sending an email notification (for significant changes)</li>
              <li>Showing a banner in the app (for major changes)</li>
            </ul>
            <p className="text-gray-300 mt-4">
              Your continued use of TradeAutopsy after changes become effective constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section id="contact" className="scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-emerald-400" />
              11. Contact Us
            </h2>
            <p className="text-gray-300 mb-4">
              If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
            </p>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <p className="text-gray-300">
                <strong>Email:</strong> <a href="mailto:privacy@tradeautopsy.in" className="text-emerald-400 hover:text-emerald-300">privacy@tradeautopsy.in</a>
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

