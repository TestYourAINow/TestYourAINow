// 🚀 CLIENT WIDGET SCRIPT - Version MOBILE OPTIMISÉE
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
    this.setupMobileOptimizations();
  },

  // 📱 Nouvelles optimisations mobile
  setupMobileOptimizations: function() {
    // Détecter le changement d'orientation
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.handleResize(), 200);
    });
    
    // Gérer le viewport mobile
    this.updateViewportHeight();
    window.addEventListener('resize', () => this.updateViewportHeight());
  },

  // 📏 Calculer la vraie hauteur disponible sur mobile
  updateViewportHeight: function() {
    // CSS custom property pour la vraie hauteur de viewport
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  },

  // 📱 Détecter le type d'appareil
  getDeviceInfo: function() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width <= 768;
    const isTablet = width > 768 && width <= 1024;
    const isSmallHeight = height <= 600;
    const isLandscape = width > height;
    
    return { 
      isMobile, 
      isTablet, 
      isSmallHeight, 
      isLandscape,
      availableHeight: height - (isMobile ? 20 : 40) // Marge pour status bar
    };
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
      bottom: 0;
      right: 0;
      width: 0px;
      height: 0px;
      border: none;
      z-index: 999999;
      background: transparent;
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s ease;
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
    
    if (data.width) this.config.width = data.width;
    if (data.height) this.config.height = data.height;
    
    this.isOpen = false;
    this.showButton();
  },

  // 🔘 Afficher le bouton chat - VERSION SIMPLIFIÉE MOBILE
  showButton: function() {
    if (!this.iframe) return;
    
    const device = this.getDeviceInfo();
    
    // Tailles simplifiées selon l'appareil
    let buttonSize, margin, safeArea;
    
    if (device.isMobile) {
      buttonSize = device.isLandscape ? 56 : 64; // Plus petit en landscape
      margin = 16;
      safeArea = 20; // Pour les encoches/safe areas
    } else {
      buttonSize = 64;
      margin = 24;
      safeArea = 0;
    }
    
    // Taille d'iframe simplifiée : juste bouton + popup space
    const iframeWidth = buttonSize + 200; // 200px pour popup à gauche
    const iframeHeight = buttonSize + 120; // 120px pour popup au-dessus
    
    this.iframe.style.cssText = `
      position: fixed;
      bottom: ${margin + safeArea}px;
      right: ${margin}px;
      width: ${iframeWidth}px;
      height: ${iframeHeight}px;
      border: none;
      z-index: 999999;
      background: transparent;
      opacity: 1;
      pointer-events: auto;
      display: block;
      transition: all 0.3s ease;
    `;
  },

  // 🏠 Widget ouvert - VERSION MOBILE OPTIMISÉE
  handleWidgetOpen: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Ouverture du chat');
    this.isOpen = true;
    
    const device = this.getDeviceInfo();
    
    if (device.isMobile) {
      // 📱 MOBILE : Interface adaptative
      this.openMobileFullscreen(device);
    } else if (device.isTablet) {
      // 📟 TABLET : Interface hybride
      this.openTabletMode(device);
    } else {
      // 💻 DESKTOP : Interface classique
      this.openDesktopMode(device);
    }
  },

  // 📱 Mode mobile plein écran AMÉLIORÉ
  openMobileFullscreen: function(device) {
    const topMargin = device.isLandscape ? 10 : 20;
    const height = device.isLandscape ? 
      `calc(100vh - ${topMargin}px)` : 
      `calc(var(--vh, 1vh) * 100 - ${topMargin}px)`;
    
    this.iframe.style.cssText = `
      position: fixed;
      top: ${topMargin}px;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: ${height};
      border: none;
      z-index: 999999;
      background: transparent;
      opacity: 1;
      pointer-events: auto;
      display: block;
      transition: all 0.3s ease;
    `;
  },

  // 📟 Mode tablet optimisé
  openTabletMode: function(device) {
    const maxWidth = Math.min(this.config.width + 40, device.isLandscape ? 500 : 420);
    const maxHeight = Math.min(this.config.height + 40, device.availableHeight);
    
    this.iframe.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: ${maxWidth}px;
      height: ${maxHeight}px;
      border: none;
      z-index: 999999;
      background: transparent;
      opacity: 1;
      pointer-events: auto;
      display: block;
      border-radius: 20px;
      transition: all 0.3s ease;
    `;
  },

  // 💻 Mode desktop classique
  openDesktopMode: function(device) {
    const width = Math.min(this.config.width + 30, window.innerWidth - 60);
    const height = Math.min(this.config.height + 30, device.availableHeight);
    
    this.iframe.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: ${width}px;
      height: ${height}px;
      border: none;
      z-index: 999999;
      background: transparent;
      opacity: 1;
      pointer-events: auto;
      display: block;
      transition: all 0.3s ease;
    `;
  },

  // 🔘 Widget fermé : revenir au bouton
  handleWidgetClose: function() {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Fermeture du chat');
    this.isOpen = false;
    this.showButton();
  },

  // 📏 Redimensionnement SIMPLIFIÉ
  handleWidgetResize: function(data) {
    if (!this.iframe || !this.isOpen) return;
    
    if (data.width) this.config.width = data.width;
    if (data.height) this.config.height = data.height;
    
    // Re-appliquer selon le mode actuel
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

  // 📱 Gestion des changements de taille d'écran AMÉLIORÉE
  handleResize: function() {
    if (!this.iframe) return;
    
    // Mettre à jour la hauteur du viewport
    this.updateViewportHeight();
    
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
    window.removeEventListener('orientationchange', this.handleResize.bind(this));
    console.log('AIChatWidget: Détruit proprement');
  },

  // 📊 API publique
  getStatus: function() {
    return {
      isLoaded: !!this.iframe,
      isOpen: this.isOpen,
      widgetId: this.widgetId,
      config: this.config,
      device: this.getDeviceInfo()
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

// 📱 Event listeners optimisés
let resizeTimeout;
window.addEventListener('resize', function() {
  if (window.AIChatWidget && window.AIChatWidget.handleResize) {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      window.AIChatWidget.handleResize();
    }, 100); // Plus rapide pour mobile
  }
});

// Optimisation pour le changement d'orientation
window.addEventListener('orientationchange', function() {
  if (window.AIChatWidget && window.AIChatWidget.handleResize) {
    // Délai plus long pour laisser le navigateur s'adapter
    setTimeout(() => {
      window.AIChatWidget.handleResize();
    }, 300);
  }
});

console.log('AIChatWidget v2.1 Mobile Optimized chargé avec succès');