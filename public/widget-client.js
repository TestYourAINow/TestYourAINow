// 🚀 CLIENT WIDGET SCRIPT - Version avec positionnement iframe corrigé
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
    iframe.src = `https://testyourainow.com/api/widget/${this.widgetId}`;
    iframe.title = "Assistant IA";
    iframe.loading = "lazy";
    
    // 🔧 Style initial : invisible jusqu'à ce que le widget soit prêt
    iframe.style.cssText = `
      position: fixed !important;
      bottom: 24px !important;
      right: 24px !important;
      width: 0px !important;
      height: 0px !important;
      border: none !important;
      z-index: 999999 !important;
      background: transparent !important;
      opacity: 0 !important;
      pointer-events: none !important;
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
      border-radius: 20px !important;
      box-shadow: none !important;
      margin: 0 !important;
      padding: 0 !important;
      transform: none !important;
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

  // 🔘 Afficher le bouton chat (état initial) - REMIS COMME AVANT
  showButton: function() {
    if (!this.iframe) return;
    
    const isMobile = window.innerWidth <= 768;
    
    // 🎯 POSITIONNEMENT EXACT : L'iframe doit être exactement là où le bouton apparaît
    this.iframe.style.cssText = `
      position: fixed !important;
      bottom: ${isMobile ? '16px' : '24px'} !important;
      right: ${isMobile ? '16px' : '24px'} !important;
      width: 64px !important;
      height: 64px !important;
      border: none !important;
      z-index: 999999 !important;
      border-radius: 50% !important;
      background: transparent !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
      transform: scale(1) !important;
      margin: 0 !important;
      padding: 0 !important;
      top: auto !important;
      left: auto !important;
    `;
    
    // ✨ Animation d'entrée
    this.animateButtonEntrance();
  },

  // 🏠 Widget ouvert : agrandir en fenêtre de chat - REMIS COMME AVANT
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
        position: fixed !important;
        bottom: 0 !important;
        right: 0 !important;
        left: 0 !important;
        top: ${isSmallScreen ? '10px' : '20px'} !important;
        width: 100% !important;
        height: calc(100vh - ${isSmallScreen ? '10px' : '20px'}) !important;
        border: none !important;
        z-index: 999999 !important;
        border-radius: ${isSmallScreen ? '15px 15px 0 0' : '20px 20px 0 0'} !important;
        background: transparent !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.3) !important;
        margin: 0 !important;
        padding: 0 !important;
        transform: none !important;
      `;
    } else {
      // Desktop : fenêtre dimensionnée
      const finalWidth = Math.min(this.config.width, window.innerWidth - 48);
      const finalHeight = Math.min(this.config.height, maxHeight);
      
      this.iframe.style.cssText = `
        position: fixed !important;
        bottom: 24px !important;
        right: 24px !important;
        width: ${finalWidth}px !important;
        height: ${finalHeight}px !important;
        border: none !important;
        z-index: 999999 !important;
        border-radius: 20px !important;
        background: transparent !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25) !important;
        transform: scale(1) !important;
        margin: 0 !important;
        padding: 0 !important;
        top: auto !important;
        left: auto !important;
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

// 🔄 Auto-initialisation SUPPRIMÉE - Maintenant géré par le script d'intégration
(function() {
  console.log('AIChatWidget v2.0 chargé avec succès');
})();