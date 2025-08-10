window.AIChatWidget = {
  init: function ({ widgetId }) {
    // Évite le double chargement
    if (document.getElementById("ai-chat-widget")) return;

    // D'abord récupérer la config pour avoir les bonnes dimensions
    fetch(`https://testyourainow.com/api/widget/${widgetId}/embed`)
      .then(response => response.json())
      .then(data => {
        if (data.config) {
          this.createIframe(widgetId, data.config);
        }
      })
      .catch(error => {
        console.error("Error loading widget config:", error);
        // Fallback avec dimensions par défaut
        this.createIframe(widgetId, { width: 400, height: 600 });
      });
  },

  createIframe: function(widgetId, config) {
    const iframe = document.createElement("iframe");
    iframe.id = "ai-chat-widget";
    iframe.src = `https://testyourainow.com/widget/${widgetId}`;
    iframe.style.position = "fixed";
    iframe.style.bottom = "10px";  // Plus près du bord
    iframe.style.right = "10px";   // Plus près du bord
    
    // 🎯 DIMENSIONS BASÉES SUR LA CONFIG + MARGE POUR LE BOUTON
    const widgetWidth = config.width || 400;
    const widgetHeight = config.height || 600;
    const buttonSize = 64;
    const margins = 30; // Marge autour
    
    iframe.style.width = `${widgetWidth + margins}px`;
    iframe.style.height = `${widgetHeight + buttonSize + margins}px`;
    
    iframe.style.border = "none";
    iframe.style.zIndex = "999999";
    iframe.style.borderRadius = "0"; // Pas de border radius sur l'iframe
    iframe.style.transition = "all 0.3s ease";
    
    // 🎯 BACKGROUND INVISIBLE MAIS QUI BLOQUE PAS
    iframe.style.backgroundColor = "rgba(0,0,0,0)"; // Complètement invisible
    iframe.style.pointerEvents = "none"; // Les clics passent à travers
    
    // 🎯 PERMETTRE LES CLICS SEULEMENT SUR LE WIDGET
    iframe.addEventListener('load', () => {
      // Une fois chargé, permettre les clics sur le contenu
      iframe.style.pointerEvents = "auto";
      
      // Rendre le body de l'iframe transparent
      try {
        iframe.contentDocument.body.style.background = "transparent";
        iframe.contentDocument.documentElement.style.background = "transparent";
      } catch(e) {
        console.log("Cross-origin iframe, cannot modify styles");
      }
    });

    const mediaQuery = window.matchMedia("(max-width: 600px)");
    function adaptSize() {
      if (mediaQuery.matches) {
        iframe.style.width = "100vw";
        iframe.style.height = "100vh";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
      } else {
        iframe.style.width = `${widgetWidth + margins}px`;
        iframe.style.height = `${widgetHeight + buttonSize + margins}px`;
        iframe.style.bottom = "10px";
        iframe.style.right = "10px";
      }
    }

    mediaQuery.addListener(adaptSize);
    adaptSize();

    document.body.appendChild(iframe);
  }
};