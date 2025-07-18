"use client";

export default function Highlights() {
  return (
    <section className=" text-white py-24 px-6 sm:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold">
          Why <span className="text-white">TestYour</span><span className="text-blue-500">AI</span>Now is{" "}
          <span className="text-blue-500">Different</span>
        </h2>
        <p className="text-gray-400 text-lg mt-4">
          Our system helps you build, test, and launch AI automations in record time — even if you're not technical.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {[
          {
            title: "Fast to launch",
            desc: "Go from prompt to interactive demo in minutes. No delays, no setup.",
          },
          {
            title: "No coding needed",
            desc: "Everything works out of the box. Build powerful experiences — no dev team required.",
          },
          {
            title: "Share instantly",
            desc: "Send a link, embed on your site, or use the auto-generated API endpoint.",
          },
          {
            title: "Live testing & versioning",
            desc: "Edit prompts live with instant feedback, built-in version history, and better control.",
          },
          {
            title: "Easy integration",
            desc: "Connect to APIs, spreadsheets, or vector DBs in seconds. Test and deploy faster.",
          },
          {
            title: "Designed for creators",
            desc: "Made for indie builders, marketers, and startups who want to move fast and impress.",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-[radial-gradient(ellipse_at_top_left,_#141414,_#0a0a0a)]
 p-6 rounded-xl border border-blue-500/30 shadow-sm hover:shadow-blue-500/30 hover:scale-[1.03] transition-all duration-300 ease-in-out"
          >
            <h3 className="text-lg font-semibold mb-2 text-blue-400">{item.title}</h3>
            <p className="text-sm text-gray-400">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
