import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { widgetId: string } }
) {
    const widgetId = params.widgetId;
    const baseUrl = req.nextUrl.origin;

    const script = `
    // Widget avec vérification du statut actif
    (function() {
      if (window.AIChatWidget) return;

      // Fonction pour vérifier si la connexion est active
      function checkConnectionStatus() {
        fetch("${baseUrl}/api/connections/check-status/${widgetId}")
          .then(response => response.json())
          .then(data => {
            if (data.isActive) {
              // La connexion est active, charge le widget
              loadWidget();
            } else {
              console.log('Widget désactivé pour cette connexion');
              // Optionnel: supprimer le widget s'il était déjà chargé
              if (window.AIChatWidget && window.AIChatWidget.destroy) {
                window.AIChatWidget.destroy();
              }
            }
          })
          .catch(error => {
            console.error('Erreur lors de la vérification du statut:', error);
            // En cas d'erreur, ne pas charger le widget par sécurité
          });
      }

      // Fonction pour charger le widget
      function loadWidget() {
        if (document.getElementById('ai-chat-widget-script')) return;
        
        var script = document.createElement('script');
        script.id = 'ai-chat-widget-script';
        script.src = "${baseUrl}/widget-client.js";
        script.async = true;
        script.onload = function() {
          if (window.AIChatWidget && window.AIChatWidget.init) {
            window.AIChatWidget.init({ widgetId: "${widgetId}" });
          }
        };
        script.onerror = function() {
          console.error('Erreur lors du chargement du widget');
        };
        document.body.appendChild(script);
      }

      // Vérifier le statut au chargement
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkConnectionStatus);
      } else {
        checkConnectionStatus();
      }

      // Optionnel: Vérifier périodiquement le statut (toutes les 30 secondes)
      setInterval(checkConnectionStatus, 30000);
    })();
  `;

    return new NextResponse(script, {
        status: 200,
        headers: {
            "Content-Type": "application/javascript",
            "Cache-Control": "public, max-age=300", // Cache plus court pour permettre les mises à jour
        },
    });
}