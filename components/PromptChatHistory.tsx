"use client";
import { useEffect, useRef } from "react";

type Entry = {
  user: string;
  ai: string;
};

interface PromptChatHistoryProps {
  history: Entry[];
}

export default function PromptChatHistory({ history }: PromptChatHistoryProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  return (
    <div className="flex flex-col gap-3 p-4 h-full overflow-y-auto text-sm">
      {history.map((entry, idx) => (
        <div key={idx} className="space-y-2">
          <div className="bg-[#222] p-3 rounded text-white">
            <p className="text-xs text-gray-400">You:</p>
            <p>{entry.user}</p>
          </div>
          <div className="bg-[#0d0d0d] border border-gray-700 p-3 rounded text-white">
            <p className="text-xs text-gray-400">AI:</p>
            <p className="whitespace-pre-wrap">{entry.ai}</p>
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
