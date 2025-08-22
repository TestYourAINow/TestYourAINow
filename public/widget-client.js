// 🚀 CLIENT WIDGET SCRIPT - Version mise à jour avec optimisations mobile CHIRURGICALES
// Utilisé par les clients pour intégrer le widget sur leur site

window.AIChatWidget = {
  iframe: null,
  isOpen: false,
  widgetId: null,
  config: {
    width: 380,
    height: 600
  },
  
  // 🎯 Fonction d'initialisation principale - INCHANGÉE
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

  // 📱 Créer l'iframe - INCHANGÉ
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
    
    // 🔄 Timeout de sécurité si le widget ne charge pas
    setTimeout(() => {
      if (this.iframe && this.iframe.style.opacity === '0') {
        console.warn('AIChatWidget: Timeout de chargement, affichage forcé');
        this.showButton();
      }
    }, 10000); // 10 secondes
  },

  // 🎧 Écouter les messages de l'iframe - INCHANGÉ
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

  // ✅ Widget prêt : afficher le bouton - INCHANGÉ
  handleWidgetReady: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Widget prêt à être affiché');
    
    // Sauvegarder la config
    if (data.width) this.config.width = data.width;
    if (data.height) this.config.height = data.height;
    
    this.isOpen = false;
    this.showButton();
  },

// 🔘 Afficher le bouton chat - INCHANGÉ (marges déjà bonnes)
showButton: function() {
  if (!this.iframe) return;
  
  const isMobile = window.innerWidth <= 768;
  
  // 🎯 MARGES POUR: hover scale + box-shadow + popup
  const buttonSize = 64;
  const shadowMargin = 15; // Pour les box-shadows
  const hoverMargin = 8;   // Pour le scale(1.05)
  const popupMarginTop = 100; // Pour le popup au-dessus
  const popupMarginLeft = 60; // Marge à gauche pour le popup
  
  const iframeWidth = buttonSize + (shadowMargin * 2) + hoverMargin + popupMarginLeft;
  const iframeHeight = buttonSize + (shadowMargin * 2) + hoverMargin + popupMarginTop;
  
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

// 🏠 Widget ouvert - 🎯 MODIFICATION CHIRURGICALE ICI
handleWidgetOpen: function(data) {
  if (!this.iframe) return;
  
  console.log('AIChatWidget: Ouverture du chat');
  this.isOpen = true;
  
  // 🎯 NOUVELLE LOGIQUE: Détection mobile depuis les données du widget
  const isMobile = data.isMobile || window.innerWidth <= 768;
  
  if (isMobile) {
    // 🎯 MOBILE: Interface plein écran - NOUVEAU COMPORTEMENT
    this.iframe.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      border: none;
      z-index: 999999;
      background: transparent;
      opacity: 1;
      pointer-events: auto;
      display: block;
    `;
  } else {
    // 🎯 DESKTOP: Comportement existant PRÉSERVÉ
    const isSmallScreen = window.innerHeight <= 600;
    const maxHeight = window.innerHeight - 100;
    
    const baseWidth = Math.min(this.config.width, window.innerWidth - 48);
    const baseHeight = Math.min(this.config.height, maxHeight);
    
    // Marges pour ombres + animation (comportement existant)
    const animationMargin = 25;
    const borderRadius = 10;
    
    const totalMarginWidth = animationMargin + borderRadius;
    const totalMarginHeight = animationMargin + borderRadius;
    
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

  // 🔘 Widget fermé : revenir au bouton - INCHANGÉ
  handleWidgetClose: function() {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Fermeture du chat');
    this.isOpen = false;
    this.showButton();
  },

  // 📏 Redimensionnement dynamique du widget - 🎯 MODIFICATION LÉGÈRE
  handleWidgetResize: function(data) {
    if (!this.iframe || !this.isOpen) return;
    
    if (data.width) this.config.width = data.width;
    if (data.height) this.config.height = data.height;
    
    // Re-appliquer les dimensions avec la nouvelle logique
    this.handleWidgetOpen(data);
  },

  // 🚨 Gestion d'erreur - INCHANGÉE
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

  // 📱 Gestion des changements de taille d'écran - 🎯 MODIFICATION LÉGÈRE
  handleResize: function() {
    if (!this.iframe) return;
    
    if (this.isOpen) {
      // 🎯 NOUVEAU: Détecter si on est passé mobile/desktop
      const isMobile = window.innerWidth <= 768;
      
      // Recalculer les dimensions pour le chat ouvert
      this.handleWidgetOpen({ 
        width: this.config.width, 
        height: this.config.height,
        isMobile: isMobile
      });
    } else {
      // Repositionner le bouton (comportement existant)
      this.showButton();
    }
  },

  // 🗑️ Nettoyage complet - INCHANGÉ
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

  // 📊 API publique pour les développeurs - INCHANGÉE
  getStatus: function() {
    return {
      isLoaded: !!this.iframe,
      isOpen: this.isOpen,
      widgetId: this.widgetId,
      config: this.config
    };
  },

  // 🎛️ API pour contrôler le widget - INCHANGÉE
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

// 📱 Écouter les changements de taille d'écran - INCHANGÉ
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
  console.log('AIChatWidget v2.1 chargé avec succès - Optimisations mobile activées');
})();