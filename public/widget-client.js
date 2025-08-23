// 🚀 CLIENT WIDGET SCRIPT - Version mobile-optimized v2.1
// Utilisé par les clients pour intégrer le widget sur leur site

window.AIChatWidget = {
  iframe: null,
  isOpen: false,
  widgetId: null,
  lastDetectedMobile: false,
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
    this.lastDetectedMobile = this.isMobileDevice();
    this.createIframe();
    this.setupMessageListener();
  },

  // 📱 Créer l'iframe qui pointe vers la nouvelle API route
  createIframe: function() {
    const iframe = document.createElement("iframe");
    iframe.id = "ai-chat-widget";
    // Pointe vers l'API route qui génère du HTML pur
    iframe.src = `https://testyourainow.com/api/widget/${this.widgetId}`;
    iframe.title = "Assistant IA";
    iframe.loading = "lazy";
    
    // Style initial : invisible jusqu'à ce que le widget soit prêt
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
    
    // Timeout de sécurité si le widget ne charge pas
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
      // Sécurité : vérifier l'origine
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

  // 🚨 Fonction mobile dédiée pour bouton
  showButtonMobile: function() {
    if (!this.iframe) return;
    
    console.log('🔧 Affichage bouton mobile forcé');
    
    this.iframe.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      width: 70px !important;
      height: 70px !important;
      border: none !important;
      z-index: 999999 !important;
      background: transparent !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      display: block !important;
      border-radius: 50% !important;
    `;
  },

  // 🔘 Afficher le bouton chat (état initial) - VERSION CORRIGÉE
  showButton: function() {
    if (!this.iframe) return;
    
    const isMobile = this.isMobileDevice();
    const screenWidth = window.innerWidth || document.documentElement.clientWidth;
    
    // 🔥 FORCE MOBILE si écran petit même si détection échoue
    if (screenWidth <= 768 || isMobile) {
      this.showButtonMobile();
      return;
    }
    
    // Version desktop (code existant)
    const buttonSize = 64;
    const shadowMargin = 15;
    const hoverMargin = 8;
    const popupMarginTop = 100;
    const popupMarginLeft = 60;
    
    const iframeWidth = buttonSize + (shadowMargin * 2) + hoverMargin + popupMarginLeft;
    const iframeHeight = buttonSize + (shadowMargin * 2) + hoverMargin + popupMarginTop;
    
    this.iframe.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
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

  // 🏠 Widget ouvert - VERSION CORRIGÉE AVEC FALLBACK
  handleWidgetOpen: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Ouverture du chat');
    this.isOpen = true;
    
    const isMobile = this.isMobileDevice();
    const screenWidth = window.innerWidth || document.documentElement.clientWidth;
    
    // 🔥 FORCE MOBILE si écran petit même si détection échoue  
    if (screenWidth <= 768 || isMobile) {
      console.log('🎯 Mode mobile activé');
      // 🎯 MOBILE : Solution complète avec gestion clavier
      this.iframe.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        z-index: 999999 !important;
        background: transparent !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        display: block !important;
        /* Optimisations mobile pour performance */
        -webkit-transform: translateZ(0) !important;
        transform: translateZ(0) !important;
        -webkit-backface-visibility: hidden !important;
        backface-visibility: hidden !important;
        /* Prévenir le scroll du body */
        overscroll-behavior: none !important;
      `;
      
      // 🚀 Bloquer le scroll du body parent sur mobile
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
    } else {
      console.log('🖥️ Mode desktop activé');
      // 🎯 DESKTOP : Version propre sans code mobile
      const baseWidth = Math.min(this.config.width, window.innerWidth - 48);
      const baseHeight = Math.min(this.config.height, window.innerHeight - 100);
      
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

  // 🔘 Mise à jour de handleWidgetClose pour restaurer le scroll
  handleWidgetClose: function() {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Fermeture du chat');
    this.isOpen = false;
    
    // 🚀 Restaurer le scroll du body sur mobile (avec fallback)
    const screenWidth = window.innerWidth || document.documentElement.clientWidth;
    if (screenWidth <= 768 || this.isMobileDevice()) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    
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

  // 🚨 Détection mobile CORRIGÉE - Plus robuste
  isMobileDevice: function() {
    // Method 1: User Agent (plus permissif)
    const userAgent = (navigator.userAgent || navigator.vendor || window.opera || '').toLowerCase();
    const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone', 'webos'];
    const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
    
    // Method 2: Touch capability (corrigé)
    const isTouchDevice = (
      'ontouchstart' in window ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
      (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0) ||
      (window.DocumentTouch && document instanceof window.DocumentTouch)
    );
    
    // Method 3: Screen size (plus permissif)
    const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const isMobileScreen = screenWidth <= 768 || screenHeight <= 768;
    
    // Method 4: CSS media query check
    const isMobileMediaQuery = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
    
    // Method 5: Orientation (mobile souvent en portrait)
    const isPortrait = screenHeight > screenWidth;
    
    // Décision finale (plus permissive)
    const result = isMobileUA || 
                   (isTouchDevice && isMobileScreen) || 
                   (isTouchDevice && isPortrait) ||
                   isMobileMediaQuery ||
                   screenWidth <= 768;
    
    console.log('🎯 Détection mobile (corrigée):', {
      userAgent: isMobileUA,
      touch: isTouchDevice,
      screen: isMobileScreen,
      mediaQuery: isMobileMediaQuery,
      portrait: isPortrait,
      screenSize: `${screenWidth}x${screenHeight}`,
      finalResult: result
    });
    
    return result;
  },

  // 🔄 Amélioration du handleResize pour mobile
  handleResize: function() {
    if (!this.iframe) return;
    
    // Recalculer si on est sur mobile (orientation change)
    const wasMobile = this.lastDetectedMobile;
    const isMobile = this.isMobileDevice();
    this.lastDetectedMobile = isMobile;
    
    if (wasMobile !== isMobile) {
      console.log('🔄 Changement mobile/desktop détecté');
      // Forcer un refresh complet
      if (this.isOpen) {
        this.handleWidgetOpen({ 
          width: this.config.width, 
          height: this.config.height 
        });
      } else {
        this.showButton();
      }
      return;
    }
    
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

  // 🎯 Nouvelle méthode pour gérer les changements d'orientation mobile
  handleOrientationChange: function() {
    if (!this.isMobileDevice()) return;
    
    console.log('📱 Changement d\'orientation mobile détecté');
    
    // Petit délai pour laisser l'orientation se stabiliser
    setTimeout(() => {
      if (this.isOpen) {
        // Notifier l'iframe du changement
        if (this.iframe && this.iframe.contentWindow) {
          this.iframe.contentWindow.postMessage({ 
            type: 'ORIENTATION_CHANGE',
            data: {
              width: window.innerWidth,
              height: window.innerHeight,
              orientation: window.screen?.orientation?.angle || 0
            }
          }, '*');
        }
        
        // Recalculer la taille de l'iframe
        this.handleWidgetOpen({ 
          width: this.config.width, 
          height: this.config.height 
        });
      }
    }, 300);
  },

  // 🗑️ Nettoyage complet
  destroy: function() {
    // Restaurer le scroll si nécessaire (avec fallback)
    const screenWidth = window.innerWidth || document.documentElement.clientWidth;
    if (screenWidth <= 768 || this.isMobileDevice()) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
    this.isOpen = false;
    this.widgetId = null;
    window.removeEventListener('resize', this.handleResize.bind(this));
    window.removeEventListener('orientationchange', this.handleOrientationChange.bind(this));
    console.log('AIChatWidget: Détruit proprement');
  },

  // 📊 API publique pour les développeurs
  getStatus: function() {
    return {
      isLoaded: !!this.iframe,
      isOpen: this.isOpen,
      widgetId: this.widgetId,
      config: this.config,
      isMobile: this.isMobileDevice()
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

// 🎧 Listeners pour l'orientation mobile
window.addEventListener('orientationchange', function() {
  if (window.AIChatWidget && window.AIChatWidget.handleOrientationChange) {
    window.AIChatWidget.handleOrientationChange();
  }
});

// 📱 Listener spécial pour iOS Safari et resize
window.addEventListener('resize', function() {
  if (window.AIChatWidget && window.AIChatWidget.handleResize) {
    // Debounce amélioré pour mobile
    clearTimeout(window.AIChatWidget.resizeTimeout);
    clearTimeout(window.AIChatWidget.orientationTimeout);
    
    window.AIChatWidget.resizeTimeout = setTimeout(() => {
      window.AIChatWidget.handleResize();
    }, window.innerWidth <= 768 ? 300 : 150); // Délai plus long sur mobile
  }
});

// 🎯 Log d'initialisation
(function() {
  console.log('🎯 AIChatWidget mobile-optimized v2.1 chargé avec succès');
})();