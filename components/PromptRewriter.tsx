"use client";

import { useState } from "react";

type Props = {
  agentId: string;
  originalPrompt: string;
  finalPrompt: string;
  onAccept: (newPrompt: string, summary?: string) => void;
};

export default function PromptRewriter({
  agentId,
  originalPrompt,
  finalPrompt,
  onAccept,
}: Props) {
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!instruction.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/agents/${agentId}/ai-prompter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt, instruction }),
      });

      const data = await res.json();

      let parsed;
      try {
        parsed = typeof data.result === "string" ? JSON.parse(data.result) : data.result;
      } catch {
        parsed = null;
      }

      if (parsed && parsed.updatedPrompt) {
        onAccept(parsed.updatedPrompt, parsed.summary || "");
      } else {
        onAccept(data.result || "❌ Aucun résultat.");
      }
    } catch {
      onAccept("❌ Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (!finalPrompt) return null;

  return (
    <div className="mt-4">
      <textarea
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        placeholder="Écris ton instruction ici…"
        className="w-full p-2 text-sm rounded border border-gray-600 bg-[#0d0d0d] text-white resize-none mb-2"
        rows={3}
      />
      <div className="flex justify-end mb-4">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-1 text-sm rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? "AI en cours..." : "Réécrire"}
        </button>
      </div>
    </div>
  );
}
