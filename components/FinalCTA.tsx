"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";

export default function FinalCTA() {
  // Récupérez l'état de connexion avec NextAuth
  const { data: session, status } = useSession();
  
  // Déterminez l'URL de redirection
  const redirectUrl = session ? "/agents" : "/signup";
  
  return (
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
  );
}