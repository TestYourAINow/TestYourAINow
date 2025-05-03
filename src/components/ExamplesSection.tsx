"use client";

export default function ExamplesSection() {
  return (
    <section className="bg-white py-20 px-6 border-t border-gray-200">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-10">See what you can build</h2>

        <div className="grid sm:grid-cols-3 gap-6">
          {/* Example 1 */}
          <div className="border p-6 rounded-lg text-left shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2 text-[#3B82F6]">Startup Advisor</h3>
            <p className="text-gray-700 mb-4">
              Gives instant feedback on your pitch, idea or business model.
            </p>
            <button className="text-[#3B82F6] font-medium hover:underline">Try it →</button>
          </div>

          {/* Example 2 */}
          <div className="border p-6 rounded-lg text-left shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2 text-[#3B82F6]">Fitness Coach</h3>
            <p className="text-gray-700 mb-4">
              Personalized daily workout & meal plan suggestions.
            </p>
            <button className="text-[#3B82F6] font-medium hover:underline">Try it →</button>
          </div>

          {/* Example 3 */}
          <div className="border p-6 rounded-lg text-left shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2 text-[#3B82F6]">AI Therapist</h3>
            <p className="text-gray-700 mb-4">
              Talks with empathy and helps navigate difficult emotions.
            </p>
            <button className="text-[#3B82F6] font-medium hover:underline">Try it →</button>
          </div>
        </div>
      </div>
    </section>
  );
}
