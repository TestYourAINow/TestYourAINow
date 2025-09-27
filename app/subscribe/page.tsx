// app/(public)/subscribe/page.tsx
"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { CreditCard, RotateCcw, ArrowLeft, Loader2, CheckCircle, Zap, Shield, Users, Globe, Palette, Bot, Settings } from "lucide-react"

export default function SubscribePage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!session?.user?.email) return
    
    setIsLoading(true)
    
    try {
      const checkoutRes = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      })

      if (!checkoutRes.ok) {
        const errorData = await checkoutRes.json()
        console.error("Checkout error:", errorData)
        alert(`Checkout error: ${errorData.error || 'Unknown error'}`)
        setIsLoading(false)
        return
      }

      const checkoutData = await checkoutRes.json()
      const { url } = checkoutData

      if (url) {
        window.location.href = url
      } else {
        alert("Unable to start checkout - no URL received.")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("General error:", error)
      alert("Server error. Please try again later.")
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Unlimited AI Builds",
      description: "Create as many AI agents as you need"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Advanced Prompt Testing",
      description: "Professional-grade testing suite"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Priority Support",
      description: "Dedicated team assistance"
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Demo Sharing",
      description: "Share your AI agents with the world"
    },
    {
      icon: <Palette className="w-5 h-5" />,
      title: "Custom Branding",
      description: "White-label your AI solutions"
    },
    {
      icon: <Bot className="w-5 h-5" />,
      title: "AI Agent Templates",
      description: "Pre-built templates for rapid deployment"
    },
    {
      icon: <Settings className="w-5 h-5" />,
      title: "Widget Embeds",
      description: "Seamless website integration"
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Multi-Platform Deployment",
      description: "Deploy across multiple channels"
    }
  ]

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
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-600/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-emerald-600/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }} />
        <div className="absolute bottom-1/3 left-1/6 w-72 h-72 bg-pink-600/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '8s' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg">

        {/* Subscribe Card */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="text-center space-y-6">
            {/* Main Message */}
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 rounded-full border border-blue-500/30">
                <CreditCard size={40} className="text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Complete Your Subscription</h2>
                <p className="text-gray-300">You need an active subscription to get Full Access to TestYourAI Now.</p>
              </div>
            </div>

            {/* Features Section */}
            <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/30">
              <div className="text-left space-y-3">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-cyan-400" />
                  What you get with Full Access:
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 text-gray-300">
                      <div className="text-cyan-400 mt-0.5">
                        {feature.icon}
                      </div>
                      <div>
                        <div className="font-medium text-white">{feature.title}</div>
                        <div className="text-sm text-gray-400">{feature.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {session ? (
                <button
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="w-full group relative px-4 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed overflow-hidden"
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        <span>Starting Checkout...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={20} />
                        <span>Subscribe Now</span>
                      </>
                    )}
                  </div>
                </button>
              ) : (
                <Link
                  href="/signup"
                  className="w-full group relative px-4 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:scale-105 overflow-hidden flex items-center justify-center gap-2"
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="relative flex items-center gap-2">
                    <CreditCard size={20} />
                    <span>Get Started</span>
                  </div>
                </Link>
              )}

              <Link
                href="/"
                className="w-full px-4 py-3.5 bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white rounded-xl font-medium transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50 flex items-center justify-center gap-2"
              >
                <ArrowLeft size={20} />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}