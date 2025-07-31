"use client";

import { ArrowLeft, Shield, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <main 
      className="min-h-screen text-white pt-20"
      style={{
        background: `
          linear-gradient(to right, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
          radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 70% 50%, rgba(6, 182, 212, 0.06) 0%, transparent 50%),
          linear-gradient(135deg, #0a0a0b 0%, #111827 50%, #0a0a0b 100%)
        `,
        backgroundSize: '40px 40px, 40px 40px, 600px 600px, 600px 600px, 100% 100%'
      }}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 sm:px-12 lg:px-20 py-12">
        {/* Back Button */}
        <button 
          onClick={() => window.history.back()}
          className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 mb-8"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-full px-6 py-3 mb-6 backdrop-blur-xl">
            <FileText className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 text-sm font-semibold">Legal Documents</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          
          <p className="text-gray-300 text-lg">
            Last Updated: January 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="prose prose-lg prose-invert max-w-none">
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              By accessing and using <strong className="text-white">https://testyourainow.com</strong> ("the Site"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Site.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                  Acceptance of Terms
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  By using the Site, you agree to comply with these Terms of Service and any updates we may make.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                  Description of Service
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  TestYourAI Now provides a platform to test and optimize AI agents using third-party AI models such as OpenAI. You may use our services only for lawful purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
                  Use of Third-Party Services
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  TestYourAI Now connects to third-party services including OpenAI, Stripe, Twilio, and Google Calendar. You are responsible for managing your usage and costs related to those services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center text-sm font-bold">4</span>
                  Payment & Subscriptions
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  All purchases and subscriptions are processed through Stripe. You may cancel your subscription at any time. We do not offer refunds unless otherwise specified.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  We reserve the right to change pricing at any time. Existing subscribers will be notified in advance and may cancel if they do not agree to the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center text-sm font-bold">5</span>
                  Account Responsibility
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account and for all activities that occur under it. Use strong passwords and secure your API keys.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center text-sm font-bold">6</span>
                  Intellectual Property
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  All content on the Site, including code, branding, and documentation, is the intellectual property of TestYourAI Now. You may not reproduce or distribute it without written permission.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center text-sm font-bold">7</span>
                  Termination
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  We reserve the right to suspend or terminate your account at our discretion if you violate these Terms or misuse the platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center text-sm font-bold">8</span>
                  Data Security
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  We take reasonable steps to protect your data, but we are not responsible for any data loss, unauthorized access, or misuse caused by factors beyond our control.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center text-sm font-bold">9</span>
                  Limitation of Liability
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  TestYourAI Now is provided "AS IS" without warranties. We are not responsible for damages resulting from:
                </p>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li>• Use of third-party AI outputs</li>
                  <li>• Loss of data or revenue</li>
                  <li>• API costs or misconfiguration</li>
                  <li>• Platform downtime</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center text-sm font-bold">10</span>
                  Governing Law
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  These Terms are governed by the laws of Quebec, Canada.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center text-sm font-bold">11</span>
                  Dispute Resolution
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Any disputes shall be resolved through binding arbitration, except where prohibited by law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center text-sm font-bold">12</span>
                  Contact
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  For questions regarding these Terms, contact us at: <strong className="text-white">support@testyourainow.com</strong>
                </p>
              </section>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">Questions about our Terms of Service?</p>
          <a 
            href="mailto:support@testyourainow.com"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
          >
            <Shield className="w-5 h-5" />
            Contact Support
          </a>
        </div>
      </div>
    </main>
  );
}