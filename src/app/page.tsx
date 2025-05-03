"use client";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black font-sans">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-6 py-24 gap-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight max-w-3xl">
          Transform an idea into an AI Agent you can deploy
        </h1>
        <p className="text-lg text-gray-600 max-w-xl">
          Type your idea. Test it. Optimize it. Share it. Launch your own AI agent in seconds.
        </p>

        {/* Call to actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <a
            href="https://buy.stripe.com/test_6oE5lndzn6dZdMQ4gg" // 👈 mets ton lien Stripe réel ici
            className="bg-[#3B82F6] text-white font-semibold py-3 px-6 rounded-full hover:bg-[#2563EB] transition"
          >
            Get Started – 75% OFF
          </a>
          <a
            href="#how-it-works"
            className="border border-black py-3 px-6 rounded-full text-black hover:bg-gray-100 transition"
          >
            See How It Works ↓
          </a>
        </div>

        {/* Promo code */}
        <div className="mt-4 text-sm text-gray-500">
          Use promo code <span className="font-mono bg-gray-100 px-2 py-1 rounded">AI75</span> at checkout
        </div>
      </section>

      {/* How it Works Section */}
      <section
        id="how-it-works"
        className="bg-gray-50 px-6 py-20 border-t border-gray-200 text-center"
      >
        <h2 className="text-3xl font-bold mb-8">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-[#3B82F6]">1. Describe</h3>
            <p className="text-gray-700">
              Type your agent&apos;s role and behavior using natural language.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-[#3B82F6]">2. Test</h3>
            <p className="text-gray-700">
              Try different prompts, see how your AI responds in real time.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-[#3B82F6]">3. Deploy</h3>
            <p className="text-gray-700">
              Once it&apos;s ready, share your AI assistant via link or embed it anywhere.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
