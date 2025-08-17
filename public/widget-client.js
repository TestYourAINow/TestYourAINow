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

// 🔘 Afficher le bouton chat - AVEC PROPRIÉTÉS INDIVIDUELLES
showButton: function() {
  if (!this.iframe) return;
  
  const isMobile = window.innerWidth <= 768;
  const buttonSize = 64;
  const shadowMargin = 15;
  const hoverMargin = 8;
  const popupMarginTop = 120;
  const popupMarginLeft = 60;
  
  const iframeWidth = buttonSize + (shadowMargin * 2) + hoverMargin + popupMarginLeft;
  const iframeHeight = buttonSize + (shadowMargin * 2) + hoverMargin + popupMarginTop;
  
  const rightOffset = isMobile ? 16 : 24;
  const adjustedRight = rightOffset - (popupMarginLeft / 2);
  
  // 🎯 NOUVEAU: Propriétés individuelles au lieu de cssText
  this.iframe.style.position = 'fixed';
  this.iframe.style.bottom = (isMobile ? '16px' : '24px');
  this.iframe.style.right = adjustedRight + 'px';
  this.iframe.style.width = iframeWidth + 'px';
  this.iframe.style.height = iframeHeight + 'px';
  this.iframe.style.border = 'none';
  this.iframe.style.zIndex = '999999';
  this.iframe.style.background = 'transparent';
  this.iframe.style.opacity = '1';
  this.iframe.style.display = 'block';
  
  // 🎯 POINTER-EVENTS: d'abord none, puis auto sur le contenu
  this.iframe.style.pointerEvents = 'none';
  
  // Permettre les clics seulement sur le widget
  setTimeout(() => {
    if (this.iframe && this.iframe.contentDocument) {
      const style = this.iframe.contentDocument.createElement('style');
      style.textContent = `
        html, body { pointer-events: none !important; }
        .chat-widget, .chat-button, .chat-popup, .chat-window { 
          pointer-events: auto !important; 
        }
      `;
      this.iframe.contentDocument.head.appendChild(style);
    }
  }, 100);
},

// 🏠 Widget ouvert - AVEC PROPRIÉTÉS INDIVIDUELLES
handleWidgetOpen: function(data) {
  if (!this.iframe) return;
  
  console.log('AIChatWidget: Ouverture du chat');
  this.isOpen = true;
  
  const isMobile = window.innerWidth <= 768;
  const isSmallScreen = window.innerHeight <= 600;
  const maxHeight = window.innerHeight - (isMobile ? 60 : 100);
  
  if (isMobile) {
    // Mobile : propriétés individuelles
    this.iframe.style.position = 'fixed';
    this.iframe.style.bottom = '0';
    this.iframe.style.right = '0';
    this.iframe.style.left = '0';
    this.iframe.style.top = (isSmallScreen ? '10px' : '20px');
    this.iframe.style.width = '100%';
    this.iframe.style.height = `calc(100vh - ${isSmallScreen ? '10px' : '20px'})`;
    this.iframe.style.border = 'none';
    this.iframe.style.zIndex = '999999';
    this.iframe.style.background = 'transparent';
    this.iframe.style.opacity = '1';
    this.iframe.style.display = 'block';
    this.iframe.style.pointerEvents = 'auto'; // 🎯 Auto pour le chat ouvert
  } else {
    // Desktop : propriétés individuelles
    const baseWidth = Math.min(this.config.width, window.innerWidth - 48);
    const baseHeight = Math.min(this.config.height, maxHeight);
    
    const shadowMargin = 20;
    const animationMargin = 25;
    const borderRadius = 10;
    
    const totalMarginWidth = shadowMargin + animationMargin + borderRadius;
    const totalMarginHeight = shadowMargin + animationMargin + borderRadius;
    
    const finalWidth = baseWidth + totalMarginWidth;
    const finalHeight = baseHeight + totalMarginHeight;
    
    this.iframe.style.position = 'fixed';
    this.iframe.style.bottom = '24px';
    this.iframe.style.right = '24px';
    this.iframe.style.width = finalWidth + 'px';
    this.iframe.style.height = finalHeight + 'px';
    this.iframe.style.border = 'none';
    this.iframe.style.zIndex = '999999';
    this.iframe.style.background = 'transparent';
    this.iframe.style.opacity = '1';
    this.iframe.style.display = 'block';
    this.iframe.style.pointerEvents = 'auto'; // 🎯 Auto pour le chat ouvert
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