"use client";

import Image from "next/image";
import { Handshake, FlaskConical, Rocket } from 'lucide-react';

export default function FeatureBlocks() {
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

  return (
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
  );
}