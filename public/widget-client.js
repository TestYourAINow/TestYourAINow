// public\widget-client.js
// Enterprise Chat Widget Client - DYNAMIC IFRAME SIZING
// L'iframe s'ajuste automatiquement selon la taille réelle du popup !

window.AIChatWidget = {
  iframe: null,
  isOpen: false,
  isMobile: false,
  widgetId: null,
  popupVisible: false, // 🆕 Track popup visibility
  config: {
    width: 380,
    height: 600
  },
  
  init: function(options = {}) {
    if (!options.widgetId) {
      console.error('AIChatWidget: widgetId required for initialization');
      return;
    }
    
    if (document.getElementById("ai-chat-widget")) {
      console.warn('AIChatWidget: Widget already initialized');
      return;
    }

    this.widgetId = options.widgetId;
    this.isMobile = this.detectMobile();
    this.createIframe();
    this.setupMessageListener();
    this.setupMobileHandlers();
  },

  detectMobile: function() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform)) ||
           window.innerWidth <= 768;
  },

  createIframe: function() {
    const iframe = document.createElement("iframe");
    iframe.id = "ai-chat-widget";
    iframe.src = `https://testyourainow.com/api/widget/${this.widgetId}`;
    iframe.title = "AI Assistant";
    iframe.loading = "lazy";
    
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
    
    setTimeout(() => {
      if (this.iframe && this.iframe.style.opacity === '0') {
        console.warn('AIChatWidget: Initialization timeout, forcing display');
        this.showButton();
      }
    }, 10000);
  },

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
          
        // 🆕 NOUVEAU - Recevoir la taille réelle du popup
        case 'POPUP_SHOW':
          this.handlePopupShow(data);
          break;
          
        case 'POPUP_HIDE':
          this.handlePopupHide();
          break;
      }
    });
  },

  setupMobileHandlers: function() {
    if (!this.isMobile) return;

    let initialBodyOverflow = '';
    
    this.lockBodyScroll = () => {
      initialBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.addEventListener('touchmove', this.preventBounce, { passive: false });
    };
    
    this.unlockBodyScroll = () => {
      document.body.style.overflow = initialBodyOverflow;
      document.documentElement.style.overflow = '';
      document.removeEventListener('touchmove', this.preventBounce);
    };
    
    this.preventBounce = (e) => {
      if (!e.target.closest('#ai-chat-widget')) {
        e.preventDefault();
      }
    };

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

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const wasMobile = this.isMobile;
        this.isMobile = this.detectMobile();
        
        if (wasMobile !== this.isMobile) {
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

  handleWidgetReady: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Widget ready - Mobile:', data.isMobile || this.isMobile);
    
    if (data.width) this.config.width = data.width;
    if (data.height) this.config.height = data.height;
    if (data.isMobile !== undefined) this.isMobile = data.isMobile;
    
    this.isOpen = false;
    this.popupVisible = false;
    this.showButton();
  },

  // 🎯 TAILLE MINIMALE - JUSTE LE BOUTON (sans popup)
  showButton: function() {
    if (!this.iframe) return;
    
    const buttonSize = 64;
    const margin = 20; // Marge de sécurité
    
    // 🎯 IFRAME MINIMALE - Juste pour le bouton !
    const iframeWidth = buttonSize + (margin * 2);
    const iframeHeight = buttonSize + (margin * 2);
    
    console.log('📐 [IFRAME] Button only mode:', iframeWidth, 'x', iframeHeight);
    
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

  // 🆕 AJUSTER L'IFRAME QUAND LE POPUP APPARAÎT
  handlePopupShow: function(data) {
    if (!this.iframe || this.isOpen) return;
    
    this.popupVisible = true;
    
    const buttonSize = 64;
    const margin = 20;
    
    // 🎯 UTILISER LA LARGEUR RÉELLE DU POPUP !
    const popupWidth = data.popupWidth || 200; // Largeur réelle envoyée par l'iframe
    const popupHeight = data.popupHeight || 60; // Hauteur réelle envoyée par l'iframe
    
    // Calculer les dimensions de l'iframe pour contenir le popup + bouton
    const iframeWidth = Math.max(
      buttonSize + (margin * 2), // Minimum pour le bouton
      popupWidth + (margin * 2)  // Largeur pour le popup
    );
    
    const iframeHeight = buttonSize + popupHeight + (margin * 3); // Bouton + popup + marges
    
    console.log('📐 [IFRAME] Popup visible - Adjusting to:', iframeWidth, 'x', iframeHeight);
    console.log('   └─ Popup size:', popupWidth, 'x', popupHeight);
    
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

  // 🆕 RÉDUIRE L'IFRAME QUAND LE POPUP SE CACHE
  handlePopupHide: function() {
    if (!this.iframe || this.isOpen) return;
    
    this.popupVisible = false;
    console.log('📐 [IFRAME] Popup hidden - Back to button only mode');
    
    // Retour à la taille minimale
    this.showButton();
  },

  handleWidgetOpen: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Opening chat interface - Mobile:', data.isMobile || this.isMobile);
    this.isOpen = true;
    this.popupVisible = false; // Le popup disparaît quand le chat s'ouvre
    
    if (data.isMobile !== undefined) {
      this.isMobile = data.isMobile;
    }
    
    if (this.isMobile) {
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
      
      if (this.lockBodyScroll) {
        this.lockBodyScroll();
      }
      
    } else {
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

  handleWidgetClose: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Closing chat interface - Mobile:', data?.isMobile || this.isMobile);
    this.isOpen = false;
    
    if (this.isMobile && this.unlockBodyScroll) {
      this.unlockBodyScroll();
    }
    
    this.showButton();
  },

  handleWidgetResize: function(data) {
    if (!this.iframe || !this.isOpen) return;
    
    if (data.width) this.config.width = data.width;
    if (data.height) this.config.height = data.height;
    if (data.isMobile !== undefined) this.isMobile = data.isMobile;
    
    this.handleWidgetOpen(data);
  },

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

  handleResize: function() {
    if (!this.iframe) return;
    
    const wasMobile = this.isMobile;
    this.isMobile = this.detectMobile();
    
    if (wasMobile !== this.isMobile) {
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
    } else if (this.popupVisible) {
      // Si le popup est visible, garder la taille actuelle
      // (l'iframe se réajustera au prochain POPUP_SHOW)
    } else {
      this.showButton();
    }
  },

  destroy: function() {
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
    
    if (this.isMobile && this.unlockBodyScroll) {
      this.unlockBodyScroll();
    }
    
    this.isOpen = false;
    this.popupVisible = false;
    this.widgetId = null;
    window.removeEventListener('resize', this.handleResize.bind(this));
    console.log('AIChatWidget: Successfully destroyed');
  },

  getStatus: function() {
    return {
      isLoaded: !!this.iframe,
      isOpen: this.isOpen,
      popupVisible: this.popupVisible,
      isMobile: this.isMobile,
      widgetId: this.widgetId,
      config: this.config
    };
  },

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

window.addEventListener('resize', function() {
  if (window.AIChatWidget && window.AIChatWidget.handleResize) {
    clearTimeout(window.AIChatWidget.resizeTimeout);
    window.AIChatWidget.resizeTimeout = setTimeout(() => {
      window.AIChatWidget.handleResize();
    }, 150);
  }
});

(function() {
  console.log('🎯 AIChatWidget v2.2 - Dynamic Iframe Sizing Edition');
})();