"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20 gap-10 bg-white text-black">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
          Transform an idea into an AI Agent you can deploy
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Type your idea. Test it. Optimize it. Share it. Launch your own AI agent in seconds.
        </p>
      </div>

      <div className="bg-gray-100 p-6 rounded-xl w-full max-w-md border border-gray-200 shadow-md text-center">
        <p className="text-sm uppercase text-gray-500 mb-2">Limited Offer</p>
        <div className="text-3xl font-bold text-green-700">
          <span className="line-through text-gray-400 mr-2 text-xl">$79</span>
          $19.75 <span className="text-sm text-gray-500">/mo</span>
        </div>
        <p className="mt-2 text-gray-600">
          Use code <span className="font-mono bg-green-100 px-2 py-1 rounded">AI75</span> for 75% off the first 3 months.
        </p>
        <ul className="text-left text-sm mt-4 space-y-2 text-gray-700">
          <li>✔ Unlimited AI testing</li>
          <li>✔ Bring your own OpenAI key</li>
          <li>✔ All OpenAI models included</li>
          <li>✔ Instant deploy</li>
        </ul>
        <Link
          href="/api/stripe"
          className="mt-6 inline-block w-full bg-black text-white hover:bg-gray-800 transition-colors font-semibold py-3 rounded-md"
        >
          Get Started for $19.75
        </Link>
      </div>
    </main>
  );
}
