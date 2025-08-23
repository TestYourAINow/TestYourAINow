// 🚀 CLIENT WIDGET SCRIPT v2.0 - Mobile-First avec Desktop support
// Style Messenger Facebook sur mobile, comportement desktop inchangé

window.AIChatWidget = {
  iframe: null,
  isOpen: false,
  widgetId: null,
  isMobile: false,
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
    this.detectDevice();
    this.createIframe();
    this.setupMessageListener();
  },

  // 🎯 DETECTION DEVICE - Plus précise
  detectDevice: function() {
    const width = window.innerWidth;
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Détection mobile multi-critères
    this.isMobile = width <= 768 || 
                    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
                    ('ontouchstart' in window) ||
                    (navigator.maxTouchPoints > 0);
    
    console.log('AIChatWidget: Device detected =', this.isMobile ? 'Mobile' : 'Desktop', { width });
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
    
    // 🔄 Timeout de sécurité si le widget ne charge pas
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

  // ✅ Widget prêt : afficher le bouton
  handleWidgetReady: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Widget prêt à être affiché');
    
    // Sauvegarder la config et info mobile du widget
    if (data.width) this.config.width = data.width;
    if (data.height) this.config.height = data.height;
    if (typeof data.isMobile !== 'undefined') {
      this.isMobile = data.isMobile; // Sync avec la détection du widget
    }
    
    this.isOpen = false;
    this.showButton();
  },

  // 🔘 Afficher le bouton chat (état initial)
  showButton: function() {
    if (!this.iframe) return;
    
    // 🎯 MÊME COMPORTEMENT sur mobile et desktop pour le bouton
    const buttonSize = 64;
    const shadowMargin = 15; 
    const hoverMargin = 8;   
    const popupMarginTop = 100; 
    const popupMarginLeft = 60; 
    
    const iframeWidth = buttonSize + (shadowMargin * 2) + hoverMargin + popupMarginLeft;
    const iframeHeight = buttonSize + (shadowMargin * 2) + hoverMargin + popupMarginTop;
    
    this.iframe.style.cssText = `
      position: fixed;
      bottom: ${this.isMobile ? '16px' : '24px'};
      right: ${this.isMobile ? '16px' : '24px'};
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

  // 🏠 Widget ouvert - COMPORTEMENTS DIFFÉRENTS mobile/desktop
  handleWidgetOpen: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Ouverture du chat');
    this.isOpen = true;
    
    // Sync mobile state du widget
    if (typeof data.isMobile !== 'undefined') {
      this.isMobile = data.isMobile;
    }
    
    if (this.isMobile) {
      this.openMobileChat();
    } else {
      this.openDesktopChat();
    }
  },

  // 📱 MODE MOBILE - Plein écran naturel comme Messenger
  openMobileChat: function() {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Mode Mobile - Plein écran');
    
    // 📱 MOBILE : Occupe tout l'écran naturellement
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
    
    // 🎯 BONUS : Empêcher le scroll du body sur mobile
    document.body.style.overflow = 'hidden';
  },

  // 🖥️ MODE DESKTOP - Comportement fenêtre comme avant
  openDesktopChat: function() {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Mode Desktop - Fenêtre');
    
    const maxHeight = window.innerHeight - 100;
    const baseWidth = Math.min(this.config.width, window.innerWidth - 48);
    const baseHeight = Math.min(this.config.height, maxHeight);
    
    // Marges pour animations et ombres
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
  },

  // 🔘 Widget fermé : revenir au bouton
  handleWidgetClose: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Fermeture du chat');
    this.isOpen = false;
    
    // 🎯 RESTAURER le scroll du body sur mobile
    if (this.isMobile) {
      document.body.style.overflow = '';
    }
    
    this.showButton();
  },

  // 📏 Redimensionnement dynamique du widget
  handleWidgetResize: function(data) {
    if (!this.iframe || !this.isOpen) return;
    
    if (data.width) this.config.width = data.width;
    if (data.height) this.config.height = data.height;
    if (typeof data.isMobile !== 'undefined') {
      this.isMobile = data.isMobile;
    }
    
    // Re-appliquer les dimensions selon le mode
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
    
    const oldIsMobile = this.isMobile;
    this.detectDevice();
    
    // Si le device type a changé, reconfigurer
    if (oldIsMobile !== this.isMobile) {
      console.log('AIChatWidget: Device type changed:', this.isMobile ? 'Mobile' : 'Desktop');
      
      if (this.isOpen) {
        // Reconfigurer l'ouverture selon le nouveau device
        if (this.isMobile) {
          this.openMobileChat();
        } else {
          this.openDesktopChat();
        }
      } else {
        // Repositionner le bouton
        this.showButton();
      }
    } else if (this.isOpen) {
      // Même device, juste redimensionnement
      if (this.isMobile) {
        this.openMobileChat();
      } else {
        this.openDesktopChat();
      }
    }
  },

  // 🗑️ Nettoyage complet
  destroy: function() {
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
    
    // Restaurer le scroll du body
    document.body.style.overflow = '';
    
    this.isOpen = false;
    this.widgetId = null;
    this.isMobile = false;
    
    window.removeEventListener('resize', this.handleResize.bind(this));
    console.log('AIChatWidget: Détruit proprement');
  },

  // 📊 API publique pour les développeurs
  getStatus: function() {
    return {
      isLoaded: !!this.iframe,
      isOpen: this.isOpen,
      widgetId: this.widgetId,
      isMobile: this.isMobile,
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

// 📱 Écouter les changements de taille d'écran avec debounce
window.addEventListener('resize', function() {
  if (window.AIChatWidget && window.AIChatWidget.handleResize) {
    clearTimeout(window.AIChatWidget.resizeTimeout);
    window.AIChatWidget.resizeTimeout = setTimeout(() => {
      window.AIChatWidget.handleResize();
    }, 150);
  }
});

// 🎯 DETECTION D'ORIENTATION sur mobile
window.addEventListener('orientationchange', function() {
  if (window.AIChatWidget && window.AIChatWidget.isMobile) {
    setTimeout(() => {
      window.AIChatWidget.handleResize();
    }, 300); // Attendre que l'orientation soit appliquée
  }
});

// 🔄 Auto-log de chargement
(function() {
  console.log('AIChatWidget v2.0 Mobile-First chargé avec succès');
  console.log('📱 Support: Mobile fullscreen + Desktop windowed');
})();