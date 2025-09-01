"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap, Wrench, Handshake, FlaskConical, Rocket, CheckCircle, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

// Types pour les features
interface Feature {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imageAlt: string;
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
  reverse: boolean;
}

interface FeatureCarouselProps {
  features: Feature[];
}

// Composant Carousel Premium Ultra-Moderne
function PremiumFeatureCarousel({ features }: FeatureCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, features.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div 
      className="relative max-w-7xl mx-auto"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Premium Backdrop avec glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-[2rem] blur-3xl"></div>
      
      {/* Carousel Container Ultra-Premium */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-2xl border border-gray-700/30 shadow-[0_32px_64px_rgba(0,0,0,0.4)]">
        
        {/* Slides Container - Hauteur auto pour éviter les coupures */}
        <div className="relative">
          {features.map((feature: Feature, index: number) => (
            <div
              key={index}
              className={`${
                index === currentSlide ? 'block' : 'hidden'
              } transition-all duration-1000 ease-in-out`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] lg:min-h-[600px]">
                
                {/* Content Side - Espacement généreux */}
                <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12 xl:p-16 order-2 lg:order-1">
                  {/* Header avec badge et icon */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className={`inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r ${feature.badgeColor} rounded-xl sm:rounded-2xl text-white font-bold text-xs sm:text-sm shadow-xl`}>
                      {feature.badge}
                    </div>
                    
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-600/30 shadow-lg">
                      <div className="text-blue-400">
                        {feature.icon}
                      </div>
                    </div>
                  </div>
                  
                  {/* Title avec taille responsive */}
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
                    <span className="bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent">
                      {feature.title}
                    </span>
                  </h3>
                  
                  {/* Subtitle */}
                  <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {feature.subtitle}
                  </p>
                  
                  {/* Description */}
                  <p className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Image Side - Container flexible */}
                <div className="relative order-1 lg:order-2 p-6 sm:p-8 lg:p-12 flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
                  <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg group">
                    {/* Container principal avec aspect ratio flexible */}
                    <div className="relative w-full aspect-[4/3] rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/80 backdrop-blur-xl border border-gray-600/30 shadow-2xl transition-all duration-700 group-hover:shadow-blue-500/20 group-hover:border-blue-500/30">
                      
                      {/* Image avec padding pour être visible entièrement */}
                      <Image
                        src={feature.image}
                        alt={feature.imageAlt}
                        fill
                        className="object-contain p-4 sm:p-6 transition-transform duration-700 group-hover:scale-[1.02]"
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 35vw"
                      />
                      
                      {/* Glow très subtil */}
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/3 via-transparent to-purple-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-xl sm:rounded-2xl lg:rounded-3xl"></div>
                    </div>

                    {/* Ring effet */}
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl lg:rounded-3xl ring-1 ring-white/5 group-hover:ring-blue-400/20 transition-all duration-700"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows - Plus petites et proches des bords */}
        <button
          onClick={prevSlide}
          className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-2xl border border-gray-600/30 rounded-lg sm:rounded-xl text-white hover:from-gray-700/90 hover:to-gray-800/90 hover:border-blue-500/30 transition-all duration-300 z-30 group shadow-xl hover:shadow-blue-500/20"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:text-blue-400 transition-colors duration-300" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-2xl border border-gray-600/30 rounded-lg sm:rounded-xl text-white hover:from-gray-700/90 hover:to-gray-800/90 hover:border-blue-500/30 transition-all duration-300 z-30 group shadow-xl hover:shadow-blue-500/20"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:text-blue-400 transition-colors duration-300" />
        </button>
      </div>

      {/* Dots Navigation - Seulement les dots, plus clean */}
      <div className="flex justify-center mt-8 sm:mt-12 gap-3 sm:gap-4">
        {features.map((_: Feature, index: number) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`relative transition-all duration-500 ${
              index === currentSlide
                ? 'w-8 sm:w-12 h-2 sm:h-3'
                : 'w-2 sm:w-3 h-2 sm:h-3'
            }`}
          >
            <div className={`w-full h-full rounded-full transition-all duration-500 ${
              index === currentSlide
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/40'
                : 'bg-gray-600 hover:bg-gray-500'
            }`} />
          </button>
        ))}
      </div>
    </div>
  );
}

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
      const fadeStart = windowHeight * 0.5;
      const fadeEnd = windowHeight * 1.2;
      
      let fadeValue = 0;
      
      if (scrollY >= fadeStart && scrollY <= fadeEnd) {
        fadeValue = (scrollY - fadeStart) / (fadeEnd - fadeStart);
        fadeValue = Math.min(fadeValue, 1);
      } else if (scrollY > fadeEnd) {
        fadeValue = 1;
      }
      
      const main = document.querySelector('main');
      if (main) {
        main.style.setProperty('--fade-opacity', fadeValue.toString());
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
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

  // Data pour toutes les features (y compris Prompt Builder)
  const allFeatures = [
    {
      title: "You don't need to be a prompt expert",
      subtitle: "🧠 AI-Powered Prompt Builder",
      description: "Just write what you want your agent to do. Our AI builds a clean, structured, ready-to-run prompt for you. Whether you're a coach, freelancer or agency — save time, get clarity, and launch fast.",
      image: "/prompt-builder.png",
      imageAlt: "AI Prompt Builder Preview",
      icon: <Sparkles className="w-6 h-6" />,
      badge: "AI BUILDER",
      badgeColor: "from-purple-600 to-pink-600",
      reverse: false
    },
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

      {/* HERO SECTION - Optimisé Mobile */}
      <section 
        className="relative text-white min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-20 pt-16 sm:pt-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      >
        <div className="text-center max-w-5xl mx-auto">
          {/* Premium Badge - Responsive */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 backdrop-blur-xl">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 animate-pulse" />
            <span className="text-blue-400 text-xs sm:text-sm font-semibold">Build AI Agents in Minutes</span>
          </div>

          {/* Titre Principal - Responsive */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold mb-6 sm:mb-8 leading-tight">
            Build{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent animate-pulse">
              AI Agents
            </span>
          </h1>

          {/* Description - Responsive */}
          <p className="text-gray-300 text-lg sm:text-xl md:text-2xl mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            Build and share your AI agents with a single link.{" "}
            <span className="text-blue-400 font-semibold">No coding.</span>{" "}
            <span className="text-cyan-400 font-semibold">No setup.</span>{" "}
            <span className="text-white font-semibold">Just results.</span>
          </p>

          {/* Boutons CTA - Stack sur mobile, côte à côte sur desktop */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4">
            {/* Primary CTA */}
            <Link
              href={redirectUrl}
              className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              <Wrench size={20} className="relative z-10 group-hover:rotate-12 transition-transform duration-300 sm:w-6 sm:h-6" /> 
              <span className="relative z-10">{session ? "Go to Agents" : "Start Building"}</span>
              <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300 sm:w-6 sm:h-6" />
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
              className="group relative inline-flex items-center justify-center gap-3 bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 hover:border-blue-500/50 text-white font-bold px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl text-base sm:text-lg transition-all duration-300 hover:bg-gray-800/60 overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-300"></div>
              
              <span className="relative z-10">How it works</span>
              <Zap size={18} className="relative z-10 text-blue-400 group-hover:text-cyan-400 transition-colors duration-300 sm:w-6 sm:h-6" />
            </a>
          </div>

          {/* Trust Indicators - Responsive avec stack sur mobile */}
          <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-gray-400 text-sm px-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
              <span>Everything You Need</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
              <span>Ready in 15 Minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
              <span>50% Off First 3 Months</span>
            </div>
          </div>
        </div>
      </section>

      {/* AI PROMPT BUILDER SECTION - Maintenant dans le carousel */}

      {/* PREMIUM FEATURE CAROUSEL SECTION */}
      <section 
        id="features" 
        className="relative text-white py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">

            
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              From idea to{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                deployment
              </span>
            </h2>
            
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Build, refine, and deploy your AI agents with our complete toolkit
            </p>
          </div>

          {/* Premium Carousel */}
          <PremiumFeatureCarousel features={allFeatures} />
        </div>
      </section>

      {/* PRICING SECTION - Optimisé Mobile */}
      <section 
        className="relative text-white py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-20"
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
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600/20 to-green-600/20 border border-emerald-500/30 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 backdrop-blur-xl">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs sm:text-sm font-semibold">Limited Time Offer</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-4">
            Get{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 bg-clip-text text-transparent">
              50% off
            </span>{" "}
            for the first 3 months!
          </h1>
          
          <p className="text-gray-300 text-lg sm:text-xl mb-12 sm:mb-16 px-4">
            Use code{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent font-bold text-xl sm:text-2xl">
              3MONTHS50
            </span>{" "}
            at checkout
          </p>

          {/* Pricing Card - Responsive */}
          <div className="relative inline-block w-full max-w-lg mx-auto px-4">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl sm:rounded-3xl blur-2xl"></div>

            <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-2xl transition-all duration-300 hover:shadow-blue-500/25 group">
              {/* Inner Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                {/* Header Badge */}
                <div className="text-center mb-6 sm:mb-8">
                  <span className="inline-block bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 text-blue-400 text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-full backdrop-blur-xl">
                    Full Access to TestYourAI Now
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-center bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Monthly</h3>
                <p className="text-gray-400 text-center mb-8 sm:mb-10 text-base sm:text-lg">Subscription</p>

                {/* Pricing */}
                <div className="text-center mb-8 sm:mb-10">
                  <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <span className="text-gray-500 line-through text-xl sm:text-2xl">$39</span>
                    <span className="bg-gradient-to-r from-red-500 to-red-400 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full">50% OFF</span>
                  </div>
                  <div className="flex items-baseline justify-center gap-1 sm:gap-2">
                    <span className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      $19.50
                    </span>
                    <span className="text-gray-400 text-base sm:text-lg">USD</span>
                  </div>
                </div>

                {/* Features List - Responsive */}
                <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                  {[
                    "Unlimited AI Builds",
                    "Advanced Prompt Testings",
                    "Demo Sharing",
                    "Custom Branding",
                    "AI Agent Templates",
                    "Widget Embeds",
                    "Multi-Platform Deployment",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 sm:gap-4">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <span className="text-gray-300 text-base sm:text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button - Responsive */}
                {showLink ? (
                  <a
                    href={ctaLink}
                    className="group relative w-full block text-center bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold px-6 sm:px-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <span className="relative z-10 text-base sm:text-lg">{ctaText}</span>
                  </a>
                ) : (
                  <button
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="group relative w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold px-6 sm:px-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <span className="relative z-10 text-base sm:text-lg">{loading ? "Redirecting..." : ctaText}</span>
                  </button>
                )}

                {error && (
                  <p className="text-red-400 mt-4 text-center bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3 text-sm">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION - Optimisé Mobile */}
      <section 
        className="relative text-white py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-20 text-center"
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
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 backdrop-blur-xl">
            <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            <span className="text-blue-400 text-xs sm:text-sm font-semibold">Ready to Launch?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 px-4">
            Build agents with{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              confidence
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
            No setup. No code. Just results.
          </p>
          
          <Link
            href={redirectUrl}
            className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold px-8 sm:px-12 py-5 sm:py-6 rounded-xl sm:rounded-2xl text-lg sm:text-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            
            <span className="relative z-10">{session ? "Go to Agents" : "Get Started"}</span>
            <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300 sm:w-6 sm:h-6" />
          </Link>
        </div>
      </section>
    </main>
  );
}