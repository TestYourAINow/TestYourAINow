"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap, Wrench, Handshake, FlaskConical, Rocket, CheckCircle, Sparkles } from 'lucide-react';
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const isSubscribed = session?.user?.isSubscribed;
  const redirectUrl = session ? "/agents" : "/signup";
  
  // State pour la section pricing
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✨ EFFET DE SCROLL FADE - SIMPLE ET FLUIDE
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const fadeStart = windowHeight * 0.5; // Commence à fade à 50% du hero
      const fadeEnd = windowHeight * 1.2; // Fini de fade après le hero
      
      let fadeValue = 0;
      
      if (scrollY >= fadeStart && scrollY <= fadeEnd) {
        // Calcul du fade progressif
        fadeValue = (scrollY - fadeStart) / (fadeEnd - fadeStart);
        fadeValue = Math.min(fadeValue, 1); // Max 1
      } else if (scrollY > fadeEnd) {
        fadeValue = 1; // Complètement fadé
      }
      // Si scrollY < fadeStart, fadeValue reste 0 (pas de fade)
      
      // Applique l'effet sur le main
      const main = document.querySelector('main');
      if (main) {
        main.style.setProperty('--fade-opacity', fadeValue.toString());
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handler pour subscription
  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Impossible de rediriger vers Stripe.");
      }
    } catch (err: any) {
      setError(err.message || "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  };

  // Data pour les features
  const mainFeatures = [
    {
      title: "Turn a Demo into a Client",
      subtitle: "Create. Send. Close.",
      description: "In seconds, you show exactly what your AI agent can do. Your client sees results — not promises.",
      image: "/demo-client.png",
      imageAlt: "Demo to Client Preview",
      icon: <Handshake className="w-6 h-6" />,
      badge: "DEMO",
      badgeColor: "from-blue-600 to-cyan-600",
      reverse: false
    },
    {
      title: "Agent Lab",
      subtitle: "Where your agent becomes a pro",
      description: "You refine it, train it, connect integrations — and it comes back ready to close deals.",
      image: "/agent-lab.png",
      imageAlt: "Agent Lab Preview", 
      icon: <FlaskConical className="w-6 h-6" />,
      badge: "LAB",
      badgeColor: "from-emerald-600 to-green-600",
      reverse: true
    },
    {
      title: "Your AI Agent, Live in Minutes",
      subtitle: "From idea to action in under 15 minutes",
      description: "No code. No delays. You create it, improve it, deploy it — all on one platform.",
      image: "/live-agent.png",
      imageAlt: "Live Agent Preview",
      icon: <Rocket className="w-6 h-6" />,
      badge: "DEPLOY",
      badgeColor: "from-orange-600 to-red-600",
      reverse: false
    }
  ];

  // Variables pour pricing
  const ctaText = !session
    ? "Get 50% off"
    : isSubscribed
    ? "Go to Agents"
    : "Activate your access";

  const showLink = !session || isSubscribed;

  const ctaLink = !session
    ? "/signup?"
    : isSubscribed
    ? "/agents"
    : "#";

  return (
    <main 
      className="bg-premium-gradient bg-grid text-white scroll-smooth relative overflow-hidden"
      style={{
        background: `
          linear-gradient(
            to bottom,
            rgba(15, 23, 42, calc(var(--fade-opacity, 0) * 0.9)),
            rgba(17, 24, 39, calc(var(--fade-opacity, 0) * 0.95)),
            rgba(15, 23, 42, calc(var(--fade-opacity, 0) * 0.9))
          ),
          radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 40% 70%, rgba(168, 85, 247, 0.05) 0%, transparent 50%),
          linear-gradient(135deg, #0a0a0b 0%, #111827 25%, #1f2937 50%, #111827 75%, #0a0a0b 100%)
        `,
        backgroundSize: '100% 100%, 800px 800px, 600px 600px, 400px 400px, 100% 100%'
      }}
    >
      {/* Premium Background with Animated Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-600/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-emerald-600/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }} />
        <div className="absolute bottom-1/3 left-1/6 w-72 h-72 bg-pink-600/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '8s' }} />
      </div>

      {/* HERO SECTION */}
      <section 
        className="relative text-white min-h-screen flex flex-col items-center justify-center px-6 sm:px-12 lg:px-20 pt-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      >
        <div className="text-center max-w-5xl mx-auto">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-full px-6 py-3 mb-8 backdrop-blur-xl">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
            <span className="text-blue-400 text-sm font-semibold">Build AI Agents in Minutes</span>
          </div>

          <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold mb-8 leading-tight">
            Build{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent animate-pulse">
              AI Agents
            </span>
          </h1>

          <p className="text-gray-300 text-xl sm:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed">
            Build and share your AI agents with a single link.{" "}
            <span className="text-blue-400 font-semibold">No coding.</span>{" "}
            <span className="text-cyan-400 font-semibold">No setup.</span>{" "}
            <span className="text-white font-semibold">Just results.</span>
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            {/* Primary CTA */}
            <Link
              href={redirectUrl}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold px-10 py-5 rounded-2xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 overflow-hidden"
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              <Wrench size={24} className="relative z-10 group-hover:rotate-12 transition-transform duration-300" /> 
              <span className="relative z-10">{session ? "Go to Agents" : "Start Building"}</span>
              <ArrowRight size={24} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>

            {/* Secondary CTA */}
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
              className="group relative inline-flex items-center gap-3 bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 hover:border-blue-500/50 text-white font-bold px-10 py-5 rounded-2xl text-lg transition-all duration-300 hover:bg-gray-800/60 overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-300"></div>
              
              <span className="relative z-10">How it works</span>
              <Zap size={22} className="relative z-10 text-blue-400 group-hover:text-cyan-400 transition-colors duration-300" />
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex items-center justify-center gap-8 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>Ready in 15 Minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>50% Off First 3 Months</span>
            </div>
          </div>
        </div>
      </section>

      {/* AI PROMPT BUILDER SECTION */}
      <section 
        id="features" 
        className="relative text-white py-32 px-6 sm:px-12 lg:px-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          {/* Section Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-full px-6 py-3 mb-8 backdrop-blur-xl">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="text-purple-400 text-sm font-semibold">🧠 AI-Powered Prompt Builder</span>
          </div>
          
          <h2 className="text-5xl sm:text-6xl font-bold mb-8">
            You don't need to be a{' '}
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              prompt expert
            </span>
          </h2>
          
          <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Just write what you want your agent to do. Our AI builds a clean, structured, ready-to-run prompt for you. 
            Whether you're a <span className="text-blue-400 font-semibold">coach</span>, <span className="text-cyan-400 font-semibold">freelancer</span> or <span className="text-purple-400 font-semibold">agency</span> — save time, get clarity, and launch fast.
          </p>

          {/* Premium Image Container */}
          <div className="relative w-full max-w-5xl mx-auto">
            <div className="relative aspect-[16/10] rounded-3xl overflow-hidden border border-gray-700/50 bg-gray-900/50 backdrop-blur-xl shadow-2xl group transition-all duration-500 hover:scale-[1.02] hover:shadow-purple-500/25 hover:border-purple-500/50">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
              
              <Image
                src="/prompt-builder.png"
                alt="AI Prompt Builder Preview"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE BLOCKS SECTION */}
      <section 
        className="relative text-white py-32 px-6 sm:px-12 lg:px-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      >
        <div className="max-w-7xl mx-auto space-y-40">
          {mainFeatures.map((feature, index) => (
            <div
              key={index}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-20 items-center ${
                feature.reverse ? 'lg:grid-flow-col-dense' : ''
              }`}
            >
              {/* Content */}
              <div className={feature.reverse ? 'lg:col-start-2' : ''}>
                <div className="flex items-center gap-4 mb-8">
                  {/* Premium Badge */}
                  <div className={`inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r ${feature.badgeColor} rounded-full text-white font-bold text-sm shadow-lg`}>
                    {feature.badge}
                  </div>
                  
                  {/* Icon Container */}
                  <div className="p-4 bg-gray-900/60 backdrop-blur-xl rounded-2xl text-blue-400 border border-gray-700/50 shadow-lg">
                    {feature.icon}
                  </div>
                </div>
                
                <h3 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  {feature.title}
                </h3>
                
                <p className="text-xl sm:text-2xl text-blue-400 mb-8 font-semibold">
                  {feature.subtitle}
                </p>
                
                <p className="text-gray-300 text-lg sm:text-xl leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Premium Image */}
              <div className={feature.reverse ? 'lg:col-start-1' : ''}>
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-gray-700/50 bg-gray-900/50 backdrop-blur-xl shadow-2xl group transition-all duration-500 hover:scale-[1.02] hover:shadow-blue-500/25 hover:border-blue-500/50">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                  
                  <Image
                    src={feature.image}
                    alt={feature.imageAlt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING SECTION */}
      <section 
        className="relative text-white py-32 px-6 sm:px-12 lg:px-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Section Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600/20 to-green-600/20 border border-emerald-500/30 rounded-full px-6 py-3 mb-8 backdrop-blur-xl">
            <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-sm font-semibold">Limited Time Offer</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            Get{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 bg-clip-text text-transparent">
              50% off
            </span>{" "}
            for the first 3 months!
          </h1>
          
          <p className="text-gray-300 text-xl mb-16">
            Use code{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent font-bold text-2xl">
              3MONTHS50
            </span>{" "}
            at checkout
          </p>

          {/* Premium Pricing Card */}
          <div className="relative inline-block">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-2xl"></div>

            <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 hover:border-blue-500/50 rounded-3xl p-10 max-w-lg mx-auto shadow-2xl transition-all duration-300 hover:shadow-blue-500/25 group">
              {/* Inner Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                {/* Header Badge */}
                <div className="text-center mb-8">
                  <span className="inline-block bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 text-blue-400 text-sm font-semibold px-6 py-3 rounded-full backdrop-blur-xl">
                    Full Access to TestYourAI Now
                  </span>
                </div>

                <h3 className="text-3xl font-bold mb-3 text-center bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Monthly</h3>
                <p className="text-gray-400 text-center mb-10 text-lg">Subscription</p>

                {/* Pricing */}
                <div className="text-center mb-10">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <span className="text-gray-500 line-through text-2xl">$39</span>
                    <span className="bg-gradient-to-r from-red-500 to-red-400 text-white text-xs font-bold px-3 py-1 rounded-full">50% OFF</span>
                  </div>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      $19.50
                    </span>
                    <span className="text-gray-400 text-lg">USD</span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-10">
                  {[
                    "Everything in Starter",
                    "5 AI agents",
                    "API access (up to 3 per agent)",
                    "Custom branding",
                    "Watermark free",
                    "AI Agent Templates",
                    "Analytics & Insights",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-4">
                      <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-300 text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {showLink ? (
                  <a
                    href={ctaLink}
                    className="group relative w-full block text-center bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold px-8 py-5 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <span className="relative z-10 text-lg">{ctaText}</span>
                  </a>
                ) : (
                  <button
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="group relative w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold px-8 py-5 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <span className="relative z-10 text-lg">{loading ? "Redirecting..." : ctaText}</span>
                  </button>
                )}

                {error && (
                  <p className="text-red-400 mt-4 text-center bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section 
        className="relative text-white py-32 px-6 sm:px-12 lg:px-20 text-center"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Section Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-full px-6 py-3 mb-8 backdrop-blur-xl">
            <Rocket className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 text-sm font-semibold">Ready to Launch?</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold mb-8">
            Build agents with{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              confidence
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            No setup. No code. Just results.
          </p>
          
          <Link
            href={redirectUrl}
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold px-12 py-6 rounded-2xl text-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            
            <span className="relative z-10">{session ? "Go to Agents" : "Get Started"}</span>
            <ArrowRight size={24} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </section>
    </main>
  );
}