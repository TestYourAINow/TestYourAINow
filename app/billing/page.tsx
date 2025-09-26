// app/(public)/billing/page.tsx
"use client"

import { useEffect } from "react"
import { Loader2, CreditCard } from "lucide-react"

export default function BillingPage() {
  useEffect(() => {
    const goToPortal = async () => {
      const res = await fetch("/api/stripe/portal", { method: "POST" })
      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        alert("Error redirecting to billing portal")
      }
    }

    goToPortal()
  }, [])

  return (
    <div 
      className="min-h-screen text-white flex items-center justify-center px-4 py-8 pt-32 relative overflow-hidden"
      style={{
        background: `
          linear-gradient(to right, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
          radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 40% 70%, rgba(168, 85, 247, 0.05) 0%, transparent 50%),
          linear-gradient(135deg, #0a0a0b 0%, #111827 25%, #1f2937 50%, #111827 75%, #0a0a0b 100%)
        `,
        backgroundSize: '40px 40px, 40px 40px, 800px 800px, 600px 600px, 400px 400px, 100% 100%',
        animation: 'premiumFloat 25s ease-in-out infinite'
      }}
    >
      {/* Animated orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-600/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-emerald-600/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }} />
        <div className="absolute bottom-1/3 left-1/6 w-72 h-72 bg-pink-600/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '8s' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg">

        {/* Loading Card */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="text-center space-y-6">
            {/* Loading Message */}
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 rounded-full border border-blue-500/30">
                <CreditCard size={40} className="text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Redirecting to Stripe</h2>
                <p className="text-gray-300">You're being redirected to our secure billing portal to manage your subscription.</p>
              </div>
            </div>

            {/* Loading Section */}
            <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/30">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Loader2 size={24} className="animate-spin text-blue-400" />
                <span className="text-white font-medium">Connecting to billing portal...</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Information */}
            <div className="text-left space-y-3">
              <h3 className="text-white font-semibold mb-3">In the billing portal you can:</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>View and download invoices</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Update payment methods</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Manage subscription settings</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>View billing history</span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-blue-300 text-sm font-medium text-center">
                Your payment information is securely managed by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}