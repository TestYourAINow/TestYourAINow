import { ChatbotConfig } from "@/models/ChatbotConfig";
import { connectToDatabase } from "@/lib/db";
import { notFound } from "next/navigation";
import ChatWidget from "@/components/ChatWidget";

// 🎯 COMPOSANT STANDALONE SIMPLE - CSS EXTERNE
export default async function WidgetStandalonePage({ 
  params 
}: { 
  params: Promise<{ widgetId: string }> 
}) {
  const resolvedParams = await params;
  
  try {
    await connectToDatabase();
    
    // Récupérer la config depuis la DB
    const rawConfig = await ChatbotConfig.findById(resolvedParams.widgetId).lean();
    
    if (!rawConfig) {
      return notFound();
    }

    // Sérialiser pour éviter les erreurs Next.js
    const config = JSON.parse(JSON.stringify(rawConfig));

    return (
      <html lang="fr">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{config.name || 'Chat Widget'}</title>
          
          {/* ✅ CSS EXTERNE - Plus propre ! */}
          <link rel="stylesheet" href="/widget-styles.css" />
        </head>
        
        <body>
          {/* 🎯 LE WIDGET - Mode production */}
          <ChatWidget config={config} isPreview={false} />
          
          {/* 📡 Script de communication parent/iframe */}
          <script dangerouslySetInnerHTML={{
            __html: `
              // Variables de communication
              let isWidgetOpen = false;
              let widgetConfig = {
                width: ${config.width || 380},
                height: ${config.height || 600}
              };
              
              // Fonction d'initialisation
              function initWidget() {
                // Signaler que le widget est prêt
                parent.postMessage({
                  type: 'WIDGET_READY',
                  data: { 
                    width: widgetConfig.width, 
                    height: widgetConfig.height 
                  }
                }, '*');
                
                // Observer les changements DOM pour détecter ouverture/fermeture
                const observer = new MutationObserver(function(mutations) {
                  const chatButton = document.querySelector('.chat-button');
                  const chatWindow = document.querySelector('.chat-window');
                  
                  const isNowOpen = !chatButton && chatWindow;
                  const isNowClosed = chatButton && !chatWindow;
                  
                  if (isNowOpen && !isWidgetOpen) {
                    isWidgetOpen = true;
                    parent.postMessage({
                      type: 'WIDGET_OPEN',
                      data: { 
                        width: widgetConfig.width, 
                        height: widgetConfig.height 
                      }
                    }, '*');
                  } else if (isNowClosed && isWidgetOpen) {
                    isWidgetOpen = false;
                    parent.postMessage({
                      type: 'WIDGET_CLOSE',
                      data: {}
                    }, '*');
                  }
                });
                
                // Observer tout le body
                observer.observe(document.body, {
                  childList: true,
                  subtree: true,
                  attributes: true,
                  attributeFilter: ['class', 'style']
                });
              }
              
              // Lancer l'init quand le DOM est prêt
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initWidget);
              } else {
                initWidget();
              }
              
              // Gestion des erreurs
              window.addEventListener('error', function(e) {
                parent.postMessage({
                  type: 'WIDGET_ERROR',
                  data: { error: e.message }
                }, '*');
              });
            `
          }} />
        </body>
      </html>
    );
    
  } catch (error) {
    console.error('Erreur chargement widget:', error);
    return notFound();
  }
}