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
    <main className="widget-page" style={{ 
      background: 'transparent', 
      width: '100%', 
      height: '100vh',
      position: 'relative' // Important !
    }}>
      <ChatWidget config={config} />
    </main>
  );
}