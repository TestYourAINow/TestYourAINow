"use client";

import React from "react";

export default function Features() {
  return (
    <section className="bg-[#09090b] text-white py-24 px-6 sm:px-12 lg:px-20" id="features">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-bold mb-6">
          Build & Deploy AI Automations Effortlessly
        </h2>
        <p className="text-gray-400 text-lg mb-16">
          Our system helps you create, test, and launch AI automations in record time — no code required.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {[
          {
            title: "Quick Setup",
            desc: "Launch your first AI agent in minutes with a guided flow and prompt suggestions.",
          },
          {
            title: "Integrate Fast",
            desc: "Connect APIs or databases easily and test them directly inside the platform.",
          },
          {
            title: "Built-in Tooling",
            desc: "Edit and test prompts live with streaming feedback and version control.",
          },
          {
            title: "Scale Easily",
            desc: "Turn your agent into a link, widget, or API endpoint — share anywhere.",
          },
        ].map((feature, i) => (
          <div
            key={i}
            className="bg-[#131316] border border-white/10 rounded-xl p-6 shadow-sm hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
