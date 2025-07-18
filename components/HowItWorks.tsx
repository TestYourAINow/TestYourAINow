"use client";

import React from "react";

export default function HowItWorks() {
  return (
    <section className=" text-white py-32 px-6 sm:px-12 lg:px-20" id="how-it-works">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">How It Works</h2>
        <p className="text-gray-400 text-lg mb-20">
          Go from idea to deploy in minutes — here’s how we make it possible.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-12 max-w-6xl mx-auto">
        {/* Step 1 */}
        <div className="text-center">
          <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent mb-4">1</div>
          <h3 className="text-xl font-semibold mb-2">Prompt Agent</h3>
          <p className="text-sm text-gray-400">
            Create detailed instructions with the AI Prompter in minutes.
          </p>
        </div>

        {/* Step 2 */}
        <div className="text-center">
          <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent mb-4">2</div>
          <h3 className="text-xl font-semibold mb-2">Demo Agent</h3>
          <p className="text-sm text-gray-400">
            Easily share your Agent with clients in a demo.
          </p>
        </div>

        {/* Step 3 */}
        <div className="text-center">
          <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent mb-4">3</div>
          <h3 className="text-xl font-semibold mb-2">Connect Agent</h3>
          <p className="text-sm text-gray-400">
            Add integrations to your agent, opening up a world of possibilities.
          </p>
        </div>

        {/* Step 4 */}
        <div className="text-center">
          <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent mb-4">✓</div>
          <h3 className="text-xl font-semibold mb-2">Deploy Agent</h3>
          <p className="text-sm text-gray-400">
            Deploy your AI to the real world and track all conversations in one place.
          </p>
        </div>
      </div>
    </section>
  );
}
