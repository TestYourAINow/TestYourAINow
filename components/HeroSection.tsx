"use client";

import Link from "next/link";
import { ArrowRight, Zap, Wrench } from "lucide-react";
import { useSession } from "next-auth/react";

export default function HeroSection() {
  // Récupérez l'état de connexion avec NextAuth
  const { data: session, status } = useSession();
  
  // Déterminez l'URL de redirection
  const redirectUrl = session ? "/agents" : "/signup";
  
  return (
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
  );
}