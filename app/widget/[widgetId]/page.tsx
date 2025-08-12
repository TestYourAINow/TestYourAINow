// app/widget/[widgetId]/page.tsx - 
import { ChatbotConfig } from "@/models/ChatbotConfig";
import { connectToDatabase } from "@/lib/db";
import { ChatWidgetConfig } from "@/types/ChatWidgetConfig";
import { notFound } from "next/navigation";
import ChatWidget from "@/components/ChatWidget";

// 🆕 Composant client inline
function WidgetContainer({ config }: { config: ChatWidgetConfig }) {
  return (
    <>
      {/* Import du CSS global + overrides pour iframe */}
      <link rel="stylesheet" href="/globals.css" />
      <style>{`
        body {
          margin: 0;
          padding: 0;
          background: transparent !important;
          overflow: hidden;
        }
        :root {
          --background: transparent;
        }
      `}</style>

      {/* Script de communication */}
      <script dangerouslySetInnerHTML={{
        __html: `
          // Communication avec le parent iframe
          let isWidgetOpen = false;
          
          window.addEventListener('DOMContentLoaded', function() {
            parent.postMessage({
              type: 'WIDGET_READY',
              data: { width: 380, height: 600 }
            }, '*');
            
            const observer = new MutationObserver(function() {
              const chatButton = document.querySelector('.chat-button');
              const chatWindow = document.querySelector('.chat-window');
              
              const isNowOpen = !chatButton && chatWindow;
              const isNowClosed = chatButton && !chatWindow;
              
              if (isNowOpen && !isWidgetOpen) {
                isWidgetOpen = true;
                parent.postMessage({
                  type: 'WIDGET_OPEN',
                  data: { width: 380, height: 600 }
                }, '*');
              } else if (isNowClosed && isWidgetOpen) {
                isWidgetOpen = false;
                parent.postMessage({
                  type: 'WIDGET_CLOSE',
                  data: {}
                }, '*');
              }
            });
            
            observer.observe(document.body, {
              childList: true,
              subtree: true
            });
          });
        `
      }} />

      {/* Le widget */}
      <ChatWidget config={config} />
    </>
  );
}

export default async function WidgetPage({ params }: { params: Promise<{ widgetId: string }> }) {
  const resolvedParams = await params;
  await connectToDatabase();
  
  const rawConfig = await ChatbotConfig.findById(resolvedParams.widgetId).lean<ChatWidgetConfig>();
  if (!rawConfig) return notFound();
  
  const config = JSON.parse(JSON.stringify(rawConfig));

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <WidgetContainer config={config} />
      </body>
    </html>
  );
}