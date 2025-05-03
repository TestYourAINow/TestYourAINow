"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-20 flex flex-col items-center justify-center gap-10">
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl md:text-5xl font-bold">
          Get <span className="text-green-400">75% off</span> with code:{" "}
          <span className="bg-green-600/20 px-2 py-1 rounded text-green-300 font-mono">
            AI75
          </span>
        </h1>
        <p className="text-gray-400 mt-4">
          For the first 3 months, using the code above.
        </p>
      </div>

      <div className="bg-gray-900 p-6 rounded-xl w-full max-w-md border border-gray-700 shadow-md text-center">
        <p className="text-sm uppercase text-gray-400 mb-2">Monthly</p>
        <div className="text-4xl font-bold text-green-300">
          <span className="line-through text-gray-500 mr-2 text-2xl">$79</span>
          $19.75
          <span className="text-sm text-gray-400"> USD</span>
        </div>
        <ul className="text-left text-sm mt-4 space-y-2 text-gray-300">
          <li>✔ Monthly Subscription</li>
          <li>✔ Unlimited Testing</li>
          <li>✔ Use Your Own API Keys</li>
          <li>✔ All OpenAI Models</li>
        </ul>
        <Link
          href="/api/stripe"
          className="mt-6 inline-block w-full bg-green-500 hover:bg-green-600 transition-colors text-black font-semibold py-3 rounded-md"
        >
          Get 75% Off
        </Link>
      </div>
    </main>
  );
}
