"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function PricingPlans() {
  const { data: session } = useSession();
  const isSubscribed = session?.user?.isSubscribed;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
  );
}
