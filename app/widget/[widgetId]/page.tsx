import { ChatbotConfig } from "@/models/ChatbotConfig";
import { connectToDatabase } from "@/lib/db";
import { notFound } from "next/navigation";
import ChatWidget from "@/components/ChatWidget";

// 🎯 COMPOSANT STANDALONE - UTILISÉ DANS L'IFRAME
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
          
          {/* ✅ CSS INLINE au lieu de link externe */}
          <style>{`
            body {
              margin: 0;
              padding: 0;
              background: transparent !important;
              overflow: hidden;
              font-family: Inter, system-ui, sans-serif;
              height: 100vh;
              width: 100vw;
            }
            
            html, body, #__next {
              height: 100%;
              width: 100%;
            }
            
            :root {
              --background: transparent;
              --foreground: #ffffff;
            }
            
            /* Reset pour éviter les conflits */
            * {
              box-sizing: border-box;
            }
          `}</style>
        </head>
        
        <body>
          {/* 🎯 LE WIDGET - Mode production (isPreview=false) */}
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
                try {
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
                    try {
                      const chatButton = document.querySelector('[class*="chatButton"]');
                      const chatWindow = document.querySelector('[class*="chatWindow"]');
                      
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
                    } catch (error) {
                      console.error('Observer error:', error);
                    }
                  });
                  
                  // Observer tout le body
                  observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['class', 'style']
                  });
                  
                } catch (error) {
                  console.error('Widget init error:', error);
                  parent.postMessage({
                    type: 'WIDGET_ERROR',
                    data: { error: error.message }
                  }, '*');
                }
              }
              
              // Lancer l'init quand le DOM est prêt
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initWidget);
              } else {
                setTimeout(initWidget, 100);
              }
              
              // Gestion des erreurs globales
              window.addEventListener('error', function(e) {
                parent.postMessage({
                  type: 'WIDGET_ERROR',
                  data: { error: e.message }
                }, '*');
              });
              
              window.addEventListener('unhandledrejection', function(e) {
                parent.postMessage({
                  type: 'WIDGET_ERROR',
                  data: { error: e.reason.toString() }
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