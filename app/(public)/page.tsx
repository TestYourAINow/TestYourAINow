"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap, Wrench, Handshake, BarChart3, FlaskConical, Clock, Rocket, TrendingUp, CheckCircle, Sparkles, ChevronRight, Target } from 'lucide-react';
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

// Feature interface definitions
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



export default function Home() {
  const { data: session, status } = useSession();
  const isSubscribed = session?.user?.isSubscribed;
  const redirectUrl = session ? "/dashboard" : "/signup";

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            entry.target.classList.remove('observe');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observer toutes les sections
    const observeElements = document.querySelectorAll('.observe');
    observeElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // State for pricing section
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Smooth scroll fade effect
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

  // Subscription handler
  const handleSubscribe = async () => {
    // Verify session with email exists
    if (!session?.user?.email) {
      setError("You must be logged in to subscribe.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Include user email in request body
        body: JSON.stringify({ email: session.user.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Unable to redirect to Stripe.");
      }
    } catch (err: any) {
      setError(err.message || "Unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };


  // CTA text configuration
  const ctaText = !session
    ? "Get 50% off"
    : isSubscribed
      ? "Go to Dashboard"
      : "Activate your access";

  const showLink = !session || isSubscribed;

  const ctaLink = !session
    ? "/signup?"
    : isSubscribed
      ? "/dashboard"
      : "#";

  return (
    <main
      className="bg-premium-gradient bg-grid text-white scroll-smooth relative overflow-hidden"
      style={{
        background: `
      linear-gradient(
        to bottom,
        rgba(15, 23, 42, 0.9),
        rgba(17, 24, 39, 0.95),
        rgba(15, 23, 42, 0.9)
      ),
      radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 40% 70%, rgba(168, 85, 247, 0.05) 0%, transparent 50%),
      linear-gradient(135deg, #0a0a0b 0%, #111827 25%, #1f2937 50%, #111827 75%, #0a0a0b 100%)
    `,
        backgroundSize: '100% 100%, 800px 800px, 600px 600px, 400px 400px, 100% 100%',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Premium background with animated orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-600/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-emerald-600/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }} />
        <div className="absolute bottom-1/3 left-1/6 w-72 h-72 bg-pink-600/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '8s' }} />
      </div>

      {/* Hero section - mobile optimized */}
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
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float-slow"></div>
        </div>
        <div className="text-center max-w-5xl mx-auto">
          {/* Premium badge - responsive */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 backdrop-blur-xl">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 animate-pulse" />
            <span className="text-blue-400 text-xs sm:text-sm font-semibold">Build AI Agents in Minutes</span>
          </div>

          {/* Main title - responsive */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold mb-6 sm:mb-8 leading-tight">
            Build{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent animate-pulse">
              AI Agents
            </span>
          </h1>

          {/* Description - responsive */}
          <p className="text-gray-300 text-lg sm:text-xl md:text-2xl mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            Build and share your AI agents with a single link.{" "}
            <span className="text-blue-400 font-semibold">No coding.</span>{" "}
            <span className="text-cyan-400 font-semibold">No hassle.</span>{" "}
            <span className="text-white font-semibold">Just results.</span>
          </p>

          {/* CTA buttons - stack on mobile, side by side on desktop */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4">
            {/* Primary CTA */}
            <Link
              href={redirectUrl}
              className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

              <Wrench size={20} className="relative z-10 group-hover:rotate-12 transition-transform duration-300 sm:w-6 sm:h-6" />
              <span className="relative z-10">{session ? "Go to Dashboard" : "Start Building"}</span>
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

          {/* Trust indicators - responsive with stacking on mobile */}
          <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-gray-400 text-sm px-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
              <span>Build Powerful AI Agents</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
              <span>Launch in 15 Minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
              <span>50% Off for Early Users</span>
            </div>
          </div>
        </div>
      </section>

      {/* 🆕 AJOUTE ICI 👇 - SOCIAL PROOF MINI */}
      <section className="relative py-12 sm:py-16 px-4 border-y border-gray-800/50 bg-gray-900/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 items-center">

            {/* Stat 1 */}
            <div className="text-center group">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                15 min
              </div>
              <p className="text-xs sm:text-sm text-gray-400 font-medium">Average Setup Time</p>
            </div>

            {/* Stat 2 */}
            <div className="text-center group">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                50%
              </div>
              <p className="text-xs sm:text-sm text-gray-400 font-medium">Early Bird Discount</p>
            </div>

            {/* Stat 3 */}
            <div className="text-center group">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                0
              </div>
              <p className="text-xs sm:text-sm text-gray-400 font-medium">Code Required</p>
            </div>

            {/* Stat 4 */}
            <div className="text-center group">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                24/7
              </div>
              <p className="text-xs sm:text-sm text-gray-400 font-medium">Agent Availability</p>
            </div>

          </div>
        </div>
      </section>

      {/* 🅱️ STAGGERED GRID - DYNAMIC & EYE-CATCHING */}
      <section
        id="features"
        className="observe relative text-white py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-20"
        style={{
          backgroundImage: `
      linear-gradient(to right, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
    `,
          backgroundSize: '40px 40px'
        }}
      >
        <div className="max-w-7xl mx-auto">

          {/* Section header */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 backdrop-blur-xl">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 animate-pulse" />
              <span className="text-blue-400 text-xs sm:text-sm font-semibold">Complete Workflow</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              From idea to{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                deployment
              </span>
            </h2>

            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Everything you need to build, test, and launch AI agents
            </p>
          </div>

          {/* Staggered Grid - Desktop only, Stack on mobile */}
          <div className="space-y-6 lg:space-y-0">

            {/* Row 1: Two cards side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

              {/* Feature 1: AI Prompt Builder - LARGE */}
              <div className="group relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl sm:rounded-3xl overflow-hidden hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 lg:row-span-2">

                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500"></div>

                {/* Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xl">
                    <Sparkles className="w-3 h-3" />
                    AI BUILDER
                  </div>
                </div>

                {/* Image Container - PLUS HAUTE */}
                <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
                  <Image
                    src="/prompt-builder.jpg"
                    alt="AI Prompt Builder Preview"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="relative p-6 lg:p-8 space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    No Prompt Expertise Required
                  </h3>
                  <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
                    Just write what your agent should do. Our AI turns it into a ready-to-run prompt — no guesswork, just clarity.
                  </p>
                </div>

                {/* Hover indicator */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <ChevronRight className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Right column - 2 cards stacked */}
              <div className="space-y-6 lg:space-y-8">

                {/* Feature 2: Demo to Client */}
                <div className="group relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl sm:rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20">

                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-500"></div>

                  {/* Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xl">
                      <Handshake className="w-3 h-3" />
                      DEMO
                    </div>
                  </div>

                  {/* Image Container */}
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <Image
                      src="/demo-client.jpg"
                      alt="Demo to Client Preview"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
                  </div>

                  {/* Content */}
                  <div className="relative p-5 lg:p-6 space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Turn a Demo into a Client
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      In seconds, you show exactly what your AI agent can do.
                    </p>
                  </div>

                  {/* Hover indicator */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ChevronRight className="w-4 h-4 text-blue-400" />
                  </div>
                </div>

                {/* Feature 3: Agent Lab */}
                <div className="group relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl sm:rounded-3xl overflow-hidden hover:border-emerald-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/20">

                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-green-500/0 group-hover:from-emerald-500/10 group-hover:to-green-500/10 transition-all duration-500"></div>

                  {/* Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xl">
                      <FlaskConical className="w-3 h-3" />
                      LAB
                    </div>
                  </div>

                  {/* Image Container */}
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <Image
                      src="/agent-lab.jpg"
                      alt="Agent Lab Preview"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
                  </div>

                  {/* Content */}
                  <div className="relative p-5 lg:p-6 space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Agent Lab
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Refine it, train it, connect integrations — ready to close deals.
                    </p>
                  </div>

                  {/* Hover indicator */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ChevronRight className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>

              </div>
            </div>

            {/* Row 2: Feature 4 centered and wider */}
            <div className="flex justify-center mt-6 lg:mt-8">
              <div className="w-full lg:w-2/3 group relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl sm:rounded-3xl overflow-hidden hover:border-orange-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20">

                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-red-500/0 group-hover:from-orange-500/10 group-hover:to-red-500/10 transition-all duration-500"></div>

                {/* Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xl">
                    <Rocket className="w-3 h-3" />
                    DEPLOY
                  </div>
                </div>

                {/* Image Container */}
                <div className="relative h-48 sm:h-64 lg:h-72 overflow-hidden">
                  <Image
                    src="/live-agent.jpg"
                    alt="Live Agent Preview"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="relative p-6 lg:p-8 space-y-3">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                    Your AI Agent, Live in Minutes
                  </h3>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-400 leading-relaxed">
                    No code. No delays. You create it, improve it, deploy it — all on one platform.
                  </p>
                </div>

                {/* Hover indicator */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <ChevronRight className="w-5 h-5 text-orange-400" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 💰 NOUVELLE SECTION - Usage Limits & Custom Plans */}
      <section
        className="observe relative text-white py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-20"
        style={{
          backgroundImage: `
      linear-gradient(to right, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
    `,
          backgroundSize: '40px 40px'
        }}
      >
        <div className="max-w-7xl mx-auto">

          {/* Section badge */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600/20 to-green-600/20 border border-emerald-500/30 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 backdrop-blur-xl">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs sm:text-sm font-semibold">Perfect for Agencies</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Create{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 bg-clip-text text-transparent">
                custom plans
              </span>{' '}
              for your clients
            </h2>

            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Keep full control over each chatbot's usage
            </p>
          </div>

          {/* Content Grid - Image + Text */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* 🖼️ IMAGE SIDE - ORDER 2 ON MOBILE, ORDER 1 ON DESKTOP (À GAUCHE) */}
            <div className="relative order-2 lg:order-1">
              {/* Glow effect background */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-2xl sm:rounded-3xl blur-3xl"></div>

              {/* Main image container */}
              <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 group">

                {/* L'IMAGE ICI 👇 */}
                <Image
                  src="/usage-limits-dashboard.png"
                  alt="Usage Limits & Analytics Dashboard showing message limits, billing periods, and usage tracking"
                  width={1200}
                  height={900}
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.02]"
                  priority={false}
                />

                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </div>

              {/* Ring effect */}
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl ring-1 ring-white/5 group-hover:ring-emerald-400/20 transition-all duration-700 pointer-events-none"></div>
            </div>

            {/* 📝 TEXT SIDE - ORDER 1 ON MOBILE, ORDER 2 ON DESKTOP (À DROITE) */}
            <div className="order-1 lg:order-2 space-y-6 sm:space-y-8">

              {/* Main Description */}
              <div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  Offer flexible plans to your clients
                </h3>
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                  Set response limits for each chatbot. Create monthly, quarterly, or yearly plans, customized to each client's usage volume.
                </p>
              </div>

              {/* Feature Pills - Liste des avantages */}
              <div className="space-y-3 sm:space-y-4">
                {[
                  {
                    icon: <BarChart3 className="w-5 h-5" />,
                    text: "Set custom response limits per chatbot"
                  },
                  {
                    icon: <Clock className="w-5 h-5" />,
                    text: "Monthly, quarterly, or yearly billing cycles"
                  },
                  {
                    icon: <TrendingUp className="w-5 h-5" />,
                    text: "Real-time usage tracking and analytics"
                  },
                  {
                    icon: <CheckCircle className="w-5 h-5" />,
                    text: "Automatic period resets"
                  }
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl hover:bg-gray-800/60 hover:border-emerald-500/30 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-lg flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      {feature.icon}
                    </div>
                    <span className="text-sm sm:text-base text-gray-200 font-medium">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Info Box finale */}
              <div className="bg-gradient-to-r from-emerald-600/10 to-green-600/10 border border-emerald-500/30 rounded-xl p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-400 mb-2">Perfect for agencies</h4>
                    <p className="text-sm text-gray-300">
                      Create different tiers for your clients. From starter plans to enterprise packages, you control every chatbot's capacity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing section - mobile optimized */}
      <section
        id="pricing"
        className="observe relative text-white py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Section badge */}
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

          {/* Pricing card - responsive */}
          <div className="relative inline-block w-full max-w-lg mx-auto px-4">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl sm:rounded-3xl blur-2xl"></div>

            <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-2xl transition-all duration-300 hover:shadow-blue-500/25 group">
              {/* Inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10">
                {/* Header badge */}
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

                {/* Features list - GROUPED VERSION */}
                <div className="space-y-6 mb-8 sm:mb-10">

                  {/* Core Features */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                      <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Core Features</h4>
                    </div>
                    <div className="space-y-3 pl-3">
                      {[
                        "Unlimited AI Builds",
                        "Advanced Prompt Testing",
                        "AI Agent Templates",
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 sm:gap-4 group">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                          <span className="text-gray-300 text-base sm:text-lg group-hover:text-white transition-colors">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Collaboration */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full"></div>
                      <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Collaboration</h4>
                    </div>
                    <div className="space-y-3 pl-3">
                      {[
                        "Demo Sharing",
                        "Custom Branding",
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 sm:gap-4 group">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                          <span className="text-gray-300 text-base sm:text-lg group-hover:text-white transition-colors">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deployment */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                      <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Deployment</h4>
                    </div>
                    <div className="space-y-3 pl-3">
                      {[
                        "Widget Embeds",
                        "Multi-Platform Deployment",
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 sm:gap-4 group">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                          <span className="text-gray-300 text-base sm:text-lg group-hover:text-white transition-colors">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* CTA Button - responsive */}
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

      {/* Final CTA section - IMPROVED VERSION */}
      <section
        className="observe relative text-white py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-20 text-center"
        style={{
          backgroundImage: `
      linear-gradient(to right, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
    `,
          backgroundSize: '40px 40px'
        }}
      >
        <div className="max-w-4xl mx-auto">

          {/* 🆕 Urgency Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/40 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6 backdrop-blur-xl animate-pulse">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
            <span className="text-red-400 text-xs sm:text-sm font-semibold">
              Limited Time: 50% Off Ending Soon
            </span>
          </div>

          {/* Section badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 backdrop-blur-xl">
            <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            <span className="text-blue-400 text-xs sm:text-sm font-semibold">Ready to Launch?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 px-4">
            Start building agents{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              today
            </span>
          </h2>

          {/* 🆕 Mini feature list */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-8 sm:mb-12 px-4">
            <div className="flex items-center gap-2 bg-gray-800/30 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700/30">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-sm text-gray-300">Powerful AI Agents</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/30 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700/30">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-sm text-gray-300">15 min setup</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/30 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700/30">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-sm text-gray-300">Cancel anytime</span>
            </div>
          </div>

          <Link
            href={redirectUrl}
            className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold px-8 sm:px-12 py-5 sm:py-6 rounded-xl sm:rounded-2xl text-lg sm:text-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

            <span className="relative z-10">{session ? "Go to Dashboard" : "Get Started Free"}</span>
            <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300 sm:w-6 sm:h-6" />
          </Link>

          {/* 🆕 Trust signals */}
          <p className="text-xs sm:text-sm text-gray-500 mt-6 sm:mt-8">
            Join hundreds of agencies already building with TestYourAI Now
          </p>
        </div>
      </section>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
            opacity: 1;
          }
          33% { 
            transform: translate(30px, -30px) scale(1.1); 
            opacity: 0.8;
          }
          66% { 
            transform: translate(-20px, 20px) scale(0.9); 
            opacity: 0.9;
          }
        }
        
        @keyframes float-delayed {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
            opacity: 1;
          }
          33% { 
            transform: translate(-30px, 30px) scale(0.9); 
            opacity: 0.7;
          }
          66% { 
            transform: translate(20px, -20px) scale(1.1); 
            opacity: 0.9;
          }
        }
        
        @keyframes float-slow {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
            opacity: 1;
          }
          50% { 
            transform: translate(15px, 15px) scale(1.05); 
            opacity: 0.8;
          }
        }
        
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 30s ease-in-out infinite;
        }

        @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .observe {
    opacity: 0;
  }

  .fade-in-up {
    animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
      `}</style>
    </main>
  );
}