"use client";

import { ArrowLeft, Shield, Lock, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();

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
        {/* Back Button - FIXED */}
        <button 
          onClick={() => router.push('/')}
          className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 mb-8"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          <span>Back to Home</span>
        </button>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600/20 to-green-600/20 border border-emerald-500/30 rounded-full px-6 py-3 mb-6 backdrop-blur-xl">
            <Eye className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-semibold">Privacy Protection</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          
          <p className="text-gray-300 text-lg">
            Last Updated: January 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="prose prose-lg prose-invert max-w-none">
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              This Privacy Policy explains how TestYourAI Now ("we", "our", or "us") collects, uses, and protects your data when you use <strong className="text-white">https://testyourainow.com</strong> ("the Site").
            </p>
            
            <p className="text-gray-300 leading-relaxed mb-8">
              By accessing the Site, you agree to this Privacy Policy. If you do not agree, please do not use the Site.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                  Data We Collect
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">1.1 Non-Personal Data</h3>
                    <p className="text-gray-300 leading-relaxed">
                      We collect anonymous data through cookies and analytics tools (e.g., IP address, browser type, usage data) to improve the platform.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">1.2 Payment Data</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Payments are securely processed by Stripe. We do not store full payment information.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">1.3 API Usage</h3>
                    <p className="text-gray-300 leading-relaxed">
                      When using third-party APIs (e.g., OpenAI), your API key may be temporarily stored during your session but is never permanently retained.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">1.4 Calendar Data</h3>
                    <p className="text-gray-300 leading-relaxed">
                      If you connect Google Calendar, we use it to schedule sessions and check availability. We do not store your calendar content permanently and access it in real time.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">1.5 Twilio Data</h3>
                    <p className="text-gray-300 leading-relaxed">
                      When using SMS features, your Twilio credentials and contact data are used only for message delivery. You are responsible for ensuring you have consent to message those contacts.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                  How We Use Data
                </h2>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li>• Provide services and process orders</li>
                  <li>• Analyze and improve performance</li>
                  <li>• Detect abuse and ensure security</li>
                  <li>• Enable AI agent functionality</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
                  Data Sharing
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We may share limited data with third parties such as:
                </p>
                <ul className="text-gray-300 space-y-2 ml-6 mb-4">
                  <li>• Stripe (for payments)</li>
                  <li>• Twilio (for SMS delivery)</li>
                  <li>• OpenAI (for AI processing)</li>
                  <li>• Google APIs (for calendar functionality)</li>
                </ul>
                <p className="text-gray-300 leading-relaxed">
                  <strong className="text-white">We do not sell your personal data.</strong>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg flex items-center justify-center text-sm font-bold">4</span>
                  Cookies
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  We use cookies for essential functions and analytics. You may disable cookies in your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg flex items-center justify-center text-sm font-bold">5</span>
                  Your Rights (GDPR/CCPA)
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  If you are in the EU or California, you may:
                </p>
                <ul className="text-gray-300 space-y-2 ml-6 mb-4">
                  <li>• Request access or deletion of your data</li>
                  <li>• Opt-out of data processing</li>
                  <li>• Withdraw consent at any time</li>
                </ul>
                <p className="text-gray-300 leading-relaxed">
                  Contact us at <strong className="text-white">support@testyourainow.com</strong> to exercise your rights.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg flex items-center justify-center text-sm font-bold">6</span>
                  Children's Privacy
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  The Site is not intended for children under 13. We do not knowingly collect data from minors.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg flex items-center justify-center text-sm font-bold">7</span>
                  Data Security
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  We implement encryption, firewall protections, and secure storage methods. If a data breach occurs, we will notify affected users as required by law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg flex items-center justify-center text-sm font-bold">8</span>
                  Updates
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  We may update this Privacy Policy. Any major changes will be announced via email or platform notification.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg flex items-center justify-center text-sm font-bold">9</span>
                  Contact
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Questions? Reach out to: <strong className="text-white">support@testyourainow.com</strong>
                </p>
              </section>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">Questions about your privacy?</p>
          <a 
            href="mailto:support@testyourainow.com"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25"
          >
            <Lock className="w-5 h-5" />
            Contact Support
          </a>
        </div>
      </div>
    </main>
  );
}