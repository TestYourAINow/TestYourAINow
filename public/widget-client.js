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

// 🔘 Afficher le bouton chat (état initial) - AVEC MARGES COMPLÈTES
showButton: function() {
  if (!this.iframe) return;
  
  const isMobile = window.innerWidth <= 768;
  
  // 🎯 NOUVELLE APPROCHE: Iframe juste pour le bouton + popup visible
  const buttonSize = 64;
  const hoverMargin = 10;
  const popupWidth = 240; // Largeur max du popup
  const popupHeight = 80; // Hauteur approximative du popup
  
  // Iframe minimale qui couvre seulement ce qui est nécessaire
  const iframeWidth = Math.max(buttonSize + hoverMargin, popupWidth);
  const iframeHeight = buttonSize + hoverMargin + popupHeight;
  
  this.iframe.style.cssText = `
    position: fixed;
    bottom: ${isMobile ? '16px' : '24px'};
    right: ${isMobile ? '16px' : '24px'};
    width: ${iframeWidth}px;
    height: ${iframeHeight}px;
    border: none;
    z-index: 999999;
    background: transparent;
    opacity: 1;
    pointer-events: auto;
    display: block;
  `;
},

// 🏠 Widget ouvert - AVEC MARGES COMPLÈTES POUR OMBRES
handleWidgetOpen: function(data) {
  if (!this.iframe) return;
  
  console.log('AIChatWidget: Ouverture du chat');
  this.isOpen = true;
  
  const isMobile = window.innerWidth <= 768;
  const isSmallScreen = window.innerHeight <= 600;
  const maxHeight = window.innerHeight - (isMobile ? 60 : 100);
  
  if (isMobile) {
    // Mobile : interface plein écran (pas de problème d'ombres)
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
    // Desktop : marges pour ombres + animation
    const baseWidth = Math.min(this.config.width, window.innerWidth - 48);
    const baseHeight = Math.min(this.config.height, maxHeight);
    
    // 🎯 MARGES COMPLÈTES
    const shadowMargin = 20;    // Pour box-shadow du chat window
    const animationMargin = 25; // Pour expandIn translateY + scale
    const borderRadius = 10;    // Marge pour border-radius
    
    const totalMarginWidth = shadowMargin + animationMargin + borderRadius;
    const totalMarginHeight = shadowMargin + animationMargin + borderRadius;
    
    const finalWidth = baseWidth + totalMarginWidth;
    const finalHeight = baseHeight + totalMarginHeight;
    
    this.iframe.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: ${finalWidth}px;
      height: ${finalHeight}px;
      border: none;
      z-index: 999999;
      background: transparent;
      opacity: 1;
      pointer-events: auto;
      display: block;
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