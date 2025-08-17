// 🚀 CLIENT WIDGET SCRIPT - Version corrigée pour dimensions exactes
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
    `;

    this.iframe = iframe;
    document.body.appendChild(iframe);
    
    // 🔄 Timeout de sécurité
    setTimeout(() => {
      if (this.iframe && this.iframe.style.opacity === '0') {
        console.warn('AIChatWidget: Timeout de chargement, affichage forcé');
        this.showButton();
      }
    }, 10000);
  },

  // 🎧 Écouter les messages de l'iframe
  setupMessageListener: function() {
    window.addEventListener('message', (event) => {
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
          this.handleWidgetClose(data);
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

  // ✅ Widget prêt : afficher le bouton avec les bonnes dimensions
  handleWidgetReady: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Widget prêt à être affiché');
    
    // Sauvegarder la config
    if (data.width) this.config.width = data.width;
    if (data.height) this.config.height = data.height;
    
    this.isOpen = false;
    this.showButton();
  },

  // 🔘 Afficher le bouton chat - 🎯 CORRIGÉ: Utilise les dimensions reçues
  showButton: function() {
    if (!this.iframe) return;
    
    const isMobile = window.innerWidth <= 768;
    
    // 🎯 NOUVEAU: Utilise les dimensions exactes du widget (104x104 avec padding)
    this.iframe.style.cssText = `
      position: fixed;
      bottom: ${isMobile ? '16px' : '24px'};
      right: ${isMobile ? '16px' : '24px'};
      width: 104px;
      height: 104px;
      border: none;
      z-index: 999999;
      background: transparent;
      opacity: 1;
      pointer-events: auto;
      display: block;
    `;
  },

  // 🏠 Widget ouvert - 🎯 CORRIGÉ: Dimensions exactes avec padding
  handleWidgetOpen: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Ouverture du chat');
    this.isOpen = true;
    
    const isMobile = window.innerWidth <= 768;
    const isSmallScreen = window.innerHeight <= 600;
    
    if (isMobile) {
      // Mobile : interface plein écran
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
        background: transparent;
        opacity: 1;
        pointer-events: auto;
        display: block;
      `;
    } else {
      // Desktop : utilise les dimensions exactes reçues
      const finalWidth = data.width || (this.config.width + 40);
      const finalHeight = data.height || (this.config.height + 40);
      
      // 🎯 CORRIGÉ: Prend en compte les vraies dimensions avec padding
      this.iframe.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: ${Math.min(finalWidth, window.innerWidth - 48)}px;
        height: ${Math.min(finalHeight, window.innerHeight - 100)}px;
        border: none;
        z-index: 999999;
        background: transparent;
        opacity: 1;
        pointer-events: auto;
        display: block;
      `;
    }
  },

  // 🔘 Widget fermé - 🎯 CORRIGÉ: Utilise les bonnes dimensions
  handleWidgetClose: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Fermeture du chat');
    this.isOpen = false;
    this.showButton();
  },

  // 📏 Redimensionnement dynamique
  handleWidgetResize: function(data) {
    if (!this.iframe || !this.isOpen) return;
    
    if (data.width) this.config.width = data.width;
    if (data.height) this.config.height = data.height;
    
    this.handleWidgetOpen(data);
  },

  // 🚨 Gestion d'erreur
  handleWidgetError: function(data) {
    console.error('AIChatWidget Error:', data.error);
    
    if (this.iframe) {
      this.iframe.style.opacity = '0';
      setTimeout(() => {
        if (this.iframe) {
          this.iframe.src = this.iframe.src;
        }
      }, 2000);
    }
  },

  // 📱 Gestion des changements de taille d'écran
  handleResize: function() {
    if (!this.iframe) return;
    
    if (this.isOpen) {
      this.handleWidgetOpen({ 
        width: this.config.width, 
        height: this.config.height 
      });
    } else {
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

  // 📊 API publique
  getStatus: function() {
    return {
      isLoaded: !!this.iframe,
      isOpen: this.isOpen,
      widgetId: this.widgetId,
      config: this.config
    };
  },

  // 🎛️ API de contrôle
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
    clearTimeout(window.AIChatWidget.resizeTimeout);
    window.AIChatWidget.resizeTimeout = setTimeout(() => {
      window.AIChatWidget.handleResize();
    }, 150);
  }
});

// 🔄 Auto-initialisation supprimée
(function() {
  console.log('AIChatWidget v2.1 chargé avec succès - Dimensions corrigées');
})();