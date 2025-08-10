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
          background: transparent !important;
          margin: 0;
          padding: 0;
        }
        .chat-widget {
          position: absolute !important;
        }
      `}</style>
      
      <main className="w-full h-full overflow-hidden">
        <ChatWidget config={config} />
      </main>
    </>
  );
}