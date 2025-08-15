// 🚀 CLIENT WIDGET SCRIPT - Version mise à jour pour le nouveau ChatWidget
// Utilisé par les clients pour intégrer le widget sur leur site

window.AIChatWidget = {
  iframe: null,
  isOpen: false,
  widgetId: null,
  config: {
    width: 380,
    height: 600
  },
  
  // 🎯 Fonction d'initialisation principale
  init: function(options = {}) {
    if (!options.widgetId) {
      console.error('AIChatWidget: widgetId requis');
      return;
    }
    
    // Éviter le double chargement
    if (document.getElementById("ai-chat-widget")) {
      console.warn('AIChatWidget: Widget déjà chargé');
      return;
    }

    this.widgetId = options.widgetId;
    this.createIframe();
    this.setupMessageListener();
  },

  // 📱 Créer l'iframe qui pointe vers la nouvelle API route
  createIframe: function() {
    const iframe = document.createElement("iframe");
    iframe.id = "ai-chat-widget";
    // 🎯 NOUVEAU : Pointe vers l'API route qui génère du HTML pur
    iframe.src = `https://testyourainow.com/api/widget/${this.widgetId}`;
    iframe.title = "Assistant IA";
    iframe.loading = "lazy";
    
    // 🔧 Style initial : invisible jusqu'à ce que le widget soit prêt
    iframe.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 0px;
      height: 0px;
      border: none;
      z-index: 999999;
      background: transparent;
      opacity: 0;
      pointer-events: none;
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      border-radius: 20px;
      box-shadow: none;
    `;

    this.iframe = iframe;
    document.body.appendChild(iframe);
    
    // 🔄 Timeout de sécurité si le widget ne charge pas
    setTimeout(() => {
      if (this.iframe && this.iframe.style.opacity === '0') {
        console.warn('AIChatWidget: Timeout de chargement, affichage forcé');
        this.showButton();
      }
    }, 10000); // 10 secondes
  },

  // 🎧 Écouter les messages de l'iframe
  setupMessageListener: function() {
    window.addEventListener('message', (event) => {
      // 🔒 Sécurité : vérifier l'origine
      const allowedOrigins = [
        'https://testyourainow.com',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
      ];
      
      if (!allowedOrigins.some(origin => event.origin.includes(origin))) {
        return;
      }
      
      const { type, data } = event.data;
      
      switch (type) {
        case 'WIDGET_READY':
          this.handleWidgetReady(data);
          break;
          
        case 'WIDGET_OPEN':
          this.handleWidgetOpen(data);
          break;
          
        case 'WIDGET_CLOSE':
          this.handleWidgetClose();
          break;
          
        case 'WIDGET_ERROR':
          this.handleWidgetError(data);
          break;
          
        case 'WIDGET_RESIZE':
          this.handleWidgetResize(data);
          break;
      }
    });
  },

  // ✅ Widget prêt : afficher le bouton
  handleWidgetReady: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Widget prêt à être affiché');
    
    // Sauvegarder la config
    if (data.width) this.config.width = data.width;
    if (data.height) this.config.height = data.height;
    
    this.isOpen = false;
    this.showButton();
  },

  // 🔘 Afficher le bouton chat (état initial)
  showButton: function() {
    if (!this.iframe) return;
    
    const isMobile = window.innerWidth <= 768;
    
    this.iframe.style.cssText = `
      position: fixed;
      bottom: ${isMobile ? '16px' : '24px'};
      right: ${isMobile ? '16px' : '24px'};
      width: 64px;
      height: 64px;
      border: none;
      z-index: 999999;
      border-radius: 50%;
      background: transparent;
      opacity: 1;
      pointer-events: auto;
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: scale(1);
    `;
    
    // ✨ Animation d'entrée
    this.animateButtonEntrance();
  },

  // 🏠 Widget ouvert : agrandir en fenêtre de chat
  handleWidgetOpen: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Ouverture du chat');
    this.isOpen = true;
    
    // 📱 Design responsive intelligent
    const isMobile = window.innerWidth <= 768;
    const isSmallScreen = window.innerHeight <= 600;
    const maxHeight = window.innerHeight - (isMobile ? 60 : 100);
    
    if (isMobile) {
      // Mobile : interface plein écran optimisée
      this.iframe.style.cssText = `
        position: fixed;
        bottom: 0;
        right: 0;
        left: 0;
        top: ${isSmallScreen ? '10px' : '20px'};
        width: 100%;
        height: calc(100vh - ${isSmallScreen ? '10px' : '20px'});
        border: none;
        z-index: 999999;
        border-radius: ${isSmallScreen ? '15px 15px 0 0' : '20px 20px 0 0'};
        background: transparent;
        opacity: 1;
        pointer-events: auto;
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.3);
      `;
    } else {
      // Desktop : fenêtre dimensionnée avec tes tailles exactes
      const finalWidth = Math.min(this.config.width, window.innerWidth - 48);
      const finalHeight = Math.min(this.config.height, maxHeight);
      
      this.iframe.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: ${finalWidth}px;
        height: ${finalHeight}px;
        border: none;
        z-index: 999999;
        border-radius: 20px;
        background: transparent;
        opacity: 1;
        pointer-events: auto;
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
        transform: scale(1);
      `;
    }
  },

  // 🔘 Widget fermé : revenir au bouton
  handleWidgetClose: function() {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Fermeture du chat');
    this.isOpen = false;
    this.showButton();
  },

  // 📏 Redimensionnement dynamique du widget
  handleWidgetResize: function(data) {
    if (!this.iframe || !this.isOpen) return;
    
    if (data.width) this.config.width = data.width;
    if (data.height) this.config.height = data.height;
    
    // Re-appliquer les dimensions
    this.handleWidgetOpen(data);
  },

  // 🚨 Gestion d'erreur
  handleWidgetError: function(data) {
    console.error('AIChatWidget Error:', data.error);
    
    // Tentative de récupération automatique
    if (this.iframe) {
      this.iframe.style.opacity = '0';
      setTimeout(() => {
        if (this.iframe) {
          this.iframe.src = this.iframe.src; // Recharger
        }
      }, 2000);
    }
  },

  // ✨ Animation d'apparition du bouton
  animateButtonEntrance: function() {
    if (!this.iframe) return;
    
    // Effet bounce d'entrée élégant
    this.iframe.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
      this.iframe.style.transform = 'scale(1.1)';
      setTimeout(() => {
        this.iframe.style.transform = 'scale(1)';
      }, 150);
    }, 100);
  },

  // 📱 Gestion des changements de taille d'écran
  handleResize: function() {
    if (!this.iframe) return;
    
    if (this.isOpen) {
      // Recalculer les dimensions pour le chat ouvert
      this.handleWidgetOpen({ 
        width: this.config.width, 
        height: this.config.height 
      });
    } else {
      // Repositionner le bouton
      this.showButton();
    }
  },

  // 🗑️ Nettoyage complet
  destroy: function() {
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
    this.isOpen = false;
    this.widgetId = null;
    window.removeEventListener('resize', this.handleResize.bind(this));
    console.log('AIChatWidget: Détruit proprement');
  },

  // 📊 API publique pour les développeurs
  getStatus: function() {
    return {
      isLoaded: !!this.iframe,
      isOpen: this.isOpen,
      widgetId: this.widgetId,
      config: this.config
    };
  },

  // 🎛️ API pour contrôler le widget
  open: function() {
    if (this.iframe) {
      this.iframe.contentWindow?.postMessage({ type: 'FORCE_OPEN' }, '*');
    }
  },

  close: function() {
    if (this.iframe) {
      this.iframe.contentWindow?.postMessage({ type: 'FORCE_CLOSE' }, '*');
    }
  },

  toggle: function() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
};

// 📱 Écouter les changements de taille d'écran
window.addEventListener('resize', function() {
  if (window.AIChatWidget && window.AIChatWidget.handleResize) {
    // Debounce pour éviter trop d'appels
    clearTimeout(window.AIChatWidget.resizeTimeout);
    window.AIChatWidget.resizeTimeout = setTimeout(() => {
      window.AIChatWidget.handleResize();
    }, 150);
  }
});

// 🔄 Auto-initialisation si un widgetId est fourni dans l'URL du script
(function() {
  // Chercher le script avec widgetId
  const scripts = document.querySelectorAll('script[src*="widget-client.js"]');
  const lastScript = scripts[scripts.length - 1];
  
  if (lastScript && lastScript.src) {
    try {
      const url = new URL(lastScript.src);
      const widgetId = url.searchParams.get('widgetId') || url.searchParams.get('id');
      
      if (widgetId) {
        console.log('AIChatWidget: Auto-initialisation avec widgetId:', widgetId);
        
        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', function() {
            window.AIChatWidget.init({ widgetId: widgetId });
          });
        } else {
          // DOM déjà prêt
          window.AIChatWidget.init({ widgetId: widgetId });
        }
      } else {
        console.warn('AIChatWidget: Aucun widgetId trouvé dans l\'URL du script');
      }
    } catch (error) {
      console.error('AIChatWidget: Erreur lors de l\'auto-initialisation:', error);
    }
  }
})();

// 🛡️ Protection contre les erreurs globales
window.addEventListener('error', function(event) {
  if (event.filename && event.filename.includes('widget-client.js')) {
    console.error('AIChatWidget: Erreur interceptée:', event.error);
    // Optionnel : Envoyer l'erreur à ton service de monitoring
  }
});

console.log('AIChatWidget v2.0 chargé avec succès');