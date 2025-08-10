'use client'

import { ChatbotConfig } from "@/models/ChatbotConfig";
import { connectToDatabase } from "@/lib/db";
import { ChatWidgetConfig } from "@/types/ChatWidgetConfig";
import ChatWidget from "@/components/ChatWidget";
import { notFound } from "next/navigation";

export default async function WidgetPage({ params }: { params: Promise<{ widgetId: string }> }) {
  const resolvedParams = await params;
  await connectToDatabase();
  const rawConfig = await ChatbotConfig.findById(resolvedParams.widgetId).lean<ChatWidgetConfig>();
  if (!rawConfig) return notFound();
  const config = JSON.parse(JSON.stringify(rawConfig));

  return (
    <>
      <style jsx global>{`
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: transparent !important;
          overflow: hidden;
        }
        
        /* Widget en position relative dans l'iframe */
        .chat-widget {
          position: relative !important;
          bottom: auto !important;
          right: auto !important;
          top: auto !important;
          left: auto !important;
        }
      `}</style>
      
      <main className="w-full h-full overflow-hidden">
        <ChatWidget config={config} />
      </main>
    </>
  );
}