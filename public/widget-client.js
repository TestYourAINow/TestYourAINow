// 🚀 CLIENT WIDGET SCRIPT - Version mobile optimisée
// public/widget-client.js

window.AIChatWidget = {
  iframe: null,
  isOpen: false,
  isMobile: false,
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
    this.isMobile = this.detectMobile();
    this.createIframe();
    this.setupMessageListener();
    this.setupMobileHandlers();
  },

  // 🎯 DÉTECTION MOBILE AMÉLIORÉE
  detectMobile: function() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform)) ||
           window.innerWidth <= 768;
  },

  // 📱 Créer l'iframe
  createIframe: function() {
    const iframe = document.createElement("iframe");
    iframe.id = "ai-chat-widget";
    iframe.src = `https://testyourainow.com/api/widget/${this.widgetId}`;
    iframe.title = "Assistant IA";
    iframe.loading = "lazy";
    
    // 🎯 MOBILE: Empêcher le zoom
    if (this.isMobile) {
      iframe.style.cssText = `
        position: fixed;
        bottom: 16px;
        right: 16px;
        width: 0px;
        height: 0px;
        border: none;
        z-index: 999999;
        background: transparent;
        opacity: 0;
        pointer-events: none;
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
      `;
    } else {
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
    }

    this.iframe = iframe;
    document.body.appendChild(iframe);
    
    // Timeout de sécurité
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

  // 🎯 GESTIONNAIRES MOBILES
  setupMobileHandlers: function() {
    if (!this.isMobile) return;

    // Gestion du scroll du body quand le widget est ouvert
    let initialBodyOverflow = '';
    
    this.lockBodyScroll = () => {
      initialBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      // Empêcher le bounce sur iOS
      document.addEventListener('touchmove', this.preventBounce, { passive: false });
    };
    
    this.unlockBodyScroll = () => {
      document.body.style.overflow = initialBodyOverflow;
      document.documentElement.style.overflow = '';
      document.removeEventListener('touchmove', this.preventBounce);
    };
    
    this.preventBounce = (e) => {
      // Permettre le scroll seulement dans l'iframe
      if (!e.target.closest('#ai-chat-widget')) {
        e.preventDefault();
      }
    };

    // Gestion du changement d'orientation
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.isMobile = this.detectMobile();
        if (this.isOpen) {
          this.handleWidgetOpen({ 
            width: this.config.width, 
            height: this.config.height,
            isMobile: this.isMobile 
          });
        }
      }, 500);
    });

    // Gestion du resize pour détection mobile dynamique
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const wasMobile = this.isMobile;
        this.isMobile = this.detectMobile();
        
        if (wasMobile !== this.isMobile) {
          // Changement mobile/desktop
          if (this.isOpen) {
            this.handleWidgetOpen({ 
              width: this.config.width, 
              height: this.config.height,
              isMobile: this.isMobile 
            });
          } else {
            this.showButton();
          }
        }
      }, 150);
    });
  },

  // ✅ Widget prêt
  handleWidgetReady: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Widget prêt - Mobile:', data.isMobile || this.isMobile);
    
    if (data.width) this.config.width = data.width;
    if (data.height) this.config.height = data.height;
    if (data.isMobile !== undefined) this.isMobile = data.isMobile;
    
    this.isOpen = false;
    this.showButton();
  },

  // 🔘 Afficher le bouton chat
showButton: function() {
  if (!this.iframe) return;
  
  const buttonSize = 64;
  const shadowMargin = 15;
  const hoverMargin = 8;
  
  // 🎯 CALCUL POUR 55 CARACTÈRES + min-width: 55px
  const popupMinWidth = 55;
  const popupMaxWidth = 200; // Comme dans ton CSS
  const popupHeight = 55; // Estimation pour 55 chars sur ~2 lignes
  const popupMarginTop = popupHeight + 32; // popup + margin
  const popupMarginLeft = Math.max(60, popupMaxWidth - buttonSize);
  
  // 🎯 DIMENSIONS IFRAME OPTIMISÉES
  const iframeWidth = Math.max(
    buttonSize + (shadowMargin * 2) + hoverMargin, // Minimum pour le bouton
    popupMaxWidth + 24 // Maximum pour le popup + marges
  );
  
  const iframeHeight = buttonSize + (shadowMargin * 2) + hoverMargin + popupMarginTop;
  
  if (this.isMobile) {
    this.iframe.style.cssText = `
      position: fixed;
      bottom: 16px;
      right: 16px;
      width: ${iframeWidth}px;
      height: ${iframeHeight}px;
      border: none;
      z-index: 999999;
      background: transparent;
      opacity: 1;
      pointer-events: auto;
      display: block;
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
    `;
  } else {
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
  }
},

  // 🏠 Widget ouvert
  handleWidgetOpen: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Ouverture du chat - Mobile:', data.isMobile || this.isMobile);
    this.isOpen = true;
    
    // Mettre à jour l'état mobile si fourni
    if (data.isMobile !== undefined) {
      this.isMobile = data.isMobile;
    }
    
    if (this.isMobile) {
      // 🎯 MOBILE: Plein écran
      this.iframe.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        height: 100dvh !important;
        border: none;
        z-index: 999999;
        background: transparent;
        opacity: 1;
        pointer-events: auto;
        display: block;
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
      `;
      
      // Verrouiller le scroll du body
      if (this.lockBodyScroll) {
        this.lockBodyScroll();
      }
      
    } else {
      // Desktop : comportement normal avec marges pour ombres
      const maxHeight = window.innerHeight - 100;
      const baseWidth = Math.min(this.config.width, window.innerWidth - 48);
      const baseHeight = Math.min(this.config.height, maxHeight);
      
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

  // 🔘 Widget fermé
  handleWidgetClose: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Fermeture du chat - Mobile:', data?.isMobile || this.isMobile);
    this.isOpen = false;
    
    // Déverrouiller le scroll du body sur mobile
    if (this.isMobile && this.unlockBodyScroll) {
      this.unlockBodyScroll();
    }
    
    this.showButton();
  },

  // 📏 Redimensionnement dynamique
  handleWidgetResize: function(data) {
    if (!this.iframe || !this.isOpen) return;
    
    if (data.width) this.config.width = data.width;
    if (data.height) this.config.height = data.height;
    if (data.isMobile !== undefined) this.isMobile = data.isMobile;
    
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
    
    const wasMobile = this.isMobile;
    this.isMobile = this.detectMobile();
    
    if (wasMobile !== this.isMobile) {
      // Changement de mode mobile/desktop
      if (this.isOpen) {
        if (this.isMobile && this.lockBodyScroll) {
          this.lockBodyScroll();
        } else if (!this.isMobile && this.unlockBodyScroll) {
          this.unlockBodyScroll();
        }
      }
    }
    
    if (this.isOpen) {
      this.handleWidgetOpen({ 
        width: this.config.width, 
        height: this.config.height,
        isMobile: this.isMobile
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
    
    // Déverrouiller le scroll si nécessaire
    if (this.isMobile && this.unlockBodyScroll) {
      this.unlockBodyScroll();
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
      isMobile: this.isMobile,
      widgetId: this.widgetId,
      config: this.config
    };
  },

  // 🎛️ Contrôles
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

// 📱 Gestionnaire de resize global avec debounce
window.addEventListener('resize', function() {
  if (window.AIChatWidget && window.AIChatWidget.handleResize) {
    clearTimeout(window.AIChatWidget.resizeTimeout);
    window.AIChatWidget.resizeTimeout = setTimeout(() => {
      window.AIChatWidget.handleResize();
    }, 150);
  }
});

// 🔄 Log de chargement
(function() {
  console.log('AIChatWidget v2.1 Mobile chargé avec succès');
})();