"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap, Wrench, Handshake, FlaskConical, Rocket } from 'lucide-react';
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const isSubscribed = session?.user?.isSubscribed;
  const redirectUrl = session ? "/agents" : "/signup";
  
  // State pour la section pricing
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      badgeColor: "from-blue-500 to-cyan-500",
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
      badgeColor: "from-green-500 to-emerald-500",
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
      badgeColor: "from-orange-500 to-red-500",
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
    <main className="bg-grid bg-[#09090b] text-white scroll-smooth">
      {/* HERO SECTION */}
      <section className="text-white min-h-screen flex flex-col items-center justify-center px-6 sm:px-12 lg:px-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-8xl font-bold mb-6 leading-tight whitespace-nowrap">
            Build <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">AI Agents</span>
          </h1>

          <p className="text-gray-400 text-lg mb-10">
            Build and share your AI agents with a single link. No coding. No setup. Just results.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href={redirectUrl}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-400 hover:to-cyan-300 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
            >
              <Wrench size={20} /> 
              {session ? "Go to Agents" : "Start Building"} 
              <ArrowRight size={20} />
            </Link>
            <a
              href="#featureblocks"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
              className="inline-flex items-center gap-2 border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all duration-300 hover:bg-white/10 hover:border-white/40 cursor-pointer"
            >
              How it works <Zap size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* FEATURE BLOCKS SECTION */}
      <section id="featureblocks" className="text-white py-20 px-6 sm:px-12 lg:px-20">
        {/* Section spéciale pour "You don't need to be a prompt expert" */}
        <div className="max-w-4xl mx-auto text-center mb-32">
          <div className="inline-block bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6">
            <span className="text-purple-400 text-sm font-medium">🧠 AI-Powered</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            You don't need to be a{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              prompt expert
            </span>
          </h2>
          
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
            Just write what you want your agent to do. Our AI builds a clean, structured, ready-to-run prompt for you. 
            Whether you're a coach, freelancer or agency — save time, get clarity, and launch fast.
          </p>

          {/* Image de démonstration pour le prompt builder */}
          <div className="relative w-full max-w-4xl mx-auto aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 bg-[#121212] shadow-2xl group transition-all duration-500 hover:scale-[1.02] hover:shadow-purple-500/25 hover:border-purple-500/50">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
            <Image
              src="/prompt-builder.png"
              alt="AI Prompt Builder Preview"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"></div>
          </div>
        </div>

        {/* Les 3 autres features en blocs alternés */}
        <div className="max-w-7xl mx-auto space-y-32">
          {mainFeatures.map((feature, index) => (
            <div
              key={index}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${
                feature.reverse ? 'lg:grid-flow-col-dense' : ''
              }`}
            >
              {/* Texte */}
              <div className={feature.reverse ? 'lg:col-start-2' : ''}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`inline-flex items-center justify-center px-3 py-1 bg-gradient-to-r ${feature.badgeColor} rounded-full text-white font-bold text-sm`}>
                    {feature.badge}
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-lg text-blue-400">
                    {feature.icon}
                  </div>
                </div>
                
                <h3 className="text-3xl sm:text-4xl font-bold mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-xl text-blue-400 mb-6 font-medium">
                  {feature.subtitle}
                </p>
                
                <p className="text-gray-400 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Image plus grosse */}
              <div className={feature.reverse ? 'lg:col-start-1' : ''}>
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-[#121212] shadow-2xl group transition-all duration-500 hover:scale-[1.02] hover:shadow-blue-500/25 hover:border-blue-500/50">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                  <Image
                    src={feature.image}
                    alt={feature.imageAlt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING PLANS SECTION */}
      <section className="text-white py-32 px-6 sm:px-12 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Get{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              50% off
            </span>{" "}
            for the first 3 months!
          </h1>
          <p className="text-gray-400 text-lg mb-16">
            Use code{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-bold">
              3MONTHS50
            </span>{" "}
            at checkout
          </p>

          {/* Pricing Card */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl"></div>

            <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-blue-500/50 rounded-3xl p-8 max-w-md mx-auto shadow-2xl">
              <div className="text-center mb-6">
                <span className="inline-block bg-blue-500/20 text-blue-400 text-sm font-medium px-4 py-2 rounded-full border border-blue-500/30">
                  Full Access to TestYourAI Now
                </span>
              </div>

              <h3 className="text-2xl font-bold mb-2 text-center">Monthly</h3>
              <p className="text-gray-400 text-center mb-8">Subscription</p>

              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-gray-500 line-through text-lg">
                    $39
                  </span>
                </div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    $19.50
                  </span>
                  <span className="text-gray-400 text-sm ml-1">USD</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Starter",
                  "5 AI agents",
                  "API access (up to 3 per agent)",
                  "Custom branding",
                  "Watermark free",
                  "AI Agent Templates",
                  "Analytics & Insights",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {showLink ? (
                <a
                  href={ctaLink}
                  className="w-full block text-center bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-400 hover:to-cyan-300 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  {ctaText}
                </a>
              ) : (
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full block text-center bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-400 hover:to-cyan-300 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  {loading ? "Redirecting..." : ctaText}
                </button>
              )}

              {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="text-white py-32 px-6 sm:px-12 lg:px-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Build agents with <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">confidence</span>
          </h2>
          <p className="text-lg text-gray-400 mb-10">
            No setup. No code. Just results.
          </p>
          <Link
            href={redirectUrl}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-400 hover:to-cyan-300 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
          >
            {session ? "Go to Agents" : "Get Started"} <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </main>
  );
}