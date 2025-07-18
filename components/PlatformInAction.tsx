"use client";

import Image from "next/image";

export default function PlatformInAction() {
  return (
    <section className=" text-white py-32 px-6 sm:px-12 lg:px-20" id="platform">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Texte */}
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Your AI is ready in seconds
          </h2>
          <p className="text-gray-400 text-lg mb-6">
            Deploy your prompt as a usable, interactive tool—without the need for a dev team or infrastructure.
          </p>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>• No code required</li>
            <li>• Use your own OpenAI key</li>
            <li>• Embed on your website or send a live demo link</li>
            <li>• API endpoint available instantly</li>
          </ul>
        </div>

        {/* Image Démo */}
        <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden border border-white/10 bg-[#121212] shadow-xl">
          <Image
            src="/demo-preview.png" // Remplace quand prêt
            alt="AI Platform Preview"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
