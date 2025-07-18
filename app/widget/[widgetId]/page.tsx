import { ChatbotConfig } from "@/models/ChatbotConfig";
import { connectToDatabase } from "@/lib/db";
import { ChatWidgetConfig } from "@/types/ChatWidgetConfig";
import ChatWidget from "@/components/ChatWidget";
import { notFound } from "next/navigation";

export default async function WidgetPage({ params }: { params: { widgetId: string } }) {
  await connectToDatabase();
  const rawConfig = await ChatbotConfig.findById(params.widgetId).lean<ChatWidgetConfig>();
  if (!rawConfig) return notFound();
  const config = JSON.parse(JSON.stringify(rawConfig));

  return (
    <main className="w-full h-full overflow-hidden">
      {/* Ici on ne met QUE la fenêtre, PAS le bouton */}
      <ChatWidget config={config} />
    </main>
  );
}
