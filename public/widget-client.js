// public/widget-client.js - VERSION REFACTORISÉE
// Enterprise Chat Widget Client - Mobile Optimized with Clear States
// Professional-grade widget integration solution

window.AIChatWidget = {
  iframe: null,
  isOpen: false,
  isMobile: false,
  widgetId: null,
  config: {
    width: 380,
    height: 600
  },
  
  // 🆕 NOUVEAU - États clairs du widget
  WIDGET_STATES: {
    BUTTON_ONLY: 'button_only',           // Juste la bulle (64×64)
    BUTTON_WITH_POPUP: 'button_with_popup', // Bulle + popup visible
    CHAT_OPEN: 'chat_open'                 // Fenêtre de chat ouverte
  },
  
  currentState: null, // 🆕 Track l'état actuel
  
  // ✅ GARDÉ - Primary initialization method
  init: function(options = {}) {
    if (!options.widgetId) {
      console.error('AIChatWidget: widgetId required for initialization');
      return;
    }
    
    // Prevent duplicate widget initialization
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

  // ✅ GARDÉ - Advanced mobile device detection
  detectMobile: function() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform)) ||
           window.innerWidth <= 768;
  },

  // ✅ GARDÉ - Create and configure iframe container
  createIframe: function() {
    const iframe = document.createElement("iframe");
    iframe.id = "ai-chat-widget";
    iframe.src = `https://testyourainow.com/api/widget/${this.widgetId}`;
    iframe.title = "AI Assistant";
    iframe.loading = "lazy";
    
    // Mobile-specific optimization to prevent zoom
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
    
    // Fallback timeout for initialization
    setTimeout(() => {
      if (this.iframe && this.iframe.style.opacity === '0') {
        console.warn('AIChatWidget: Initialization timeout, forcing display');
        this.setWidgetState(this.WIDGET_STATES.BUTTON_ONLY);
      }
    }, 10000);
  },

  // ✅ GARDÉ - Setup cross-frame communication listener
  setupMessageListener: function() {
    window.addEventListener('message', (event) => {
      // Security: Verify origin whitelist
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
        
        // 🆕 NOUVEAU - Gestion des changements d'état (popup)
        case 'WIDGET_STATE_CHANGE':
          if (data.state === 'button_with_popup') {
            this.setWidgetState(this.WIDGET_STATES.BUTTON_WITH_POPUP, data);
          } else if (data.state === 'button_only') {
            this.setWidgetState(this.WIDGET_STATES.BUTTON_ONLY, data);
          }
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

  // ✅ GARDÉ - Mobile-specific event handlers
  setupMobileHandlers: function() {
    if (!this.isMobile) return;

    // Body scroll management for mobile fullscreen
    let initialBodyOverflow = '';
    
    this.lockBodyScroll = () => {
      initialBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      // Prevent iOS bounce scrolling
      document.addEventListener('touchmove', this.preventBounce, { passive: false });
    };
    
    this.unlockBodyScroll = () => {
      document.body.style.overflow = initialBodyOverflow;
      document.documentElement.style.overflow = '';
      document.removeEventListener('touchmove', this.preventBounce);
    };
    
    this.preventBounce = (e) => {
      // Allow scrolling only within iframe
      if (!e.target.closest('#ai-chat-widget')) {
        e.preventDefault();
      }
    };

    // ✅ GARDÉ - Orientation change handling
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.isMobile = this.detectMobile();
        if (this.isOpen) {
          this.setWidgetState(this.WIDGET_STATES.CHAT_OPEN, {
            width: this.config.width,
            height: this.config.height,
            isMobile: this.isMobile
          });
        }
      }, 500);
    });

    // ✅ GARDÉ - Dynamic mobile/desktop detection on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const wasMobile = this.isMobile;
        this.isMobile = this.detectMobile();
        
        if (wasMobile !== this.isMobile) {
          // Handle mobile/desktop transition
          if (this.isOpen) {
            this.setWidgetState(this.WIDGET_STATES.CHAT_OPEN, {
              width: this.config.width,
              height: this.config.height,
              isMobile: this.isMobile
            });
          } else {
            this.setWidgetState(this.currentState || this.WIDGET_STATES.BUTTON_ONLY);
          }
        }
      }, 150);
    });
  },

  // 🆕 NOUVEAU - Fonction master pour gérer tous les états
  setWidgetState: function(state, data = {}) {
    if (!this.iframe) return;
    
    this.currentState = state;
    
    // 🟢 CAS 1: BUTTON_ONLY - Juste la bulle (64×64)
    if (state === this.WIDGET_STATES.BUTTON_ONLY) {
      const buttonSize = 64;
      const margin = 16; // Pour shadow et hover effect
      
      if (this.isMobile) {
        this.iframe.style.cssText = `
          position: fixed;
          bottom: 16px;
          right: 16px;
          width: ${buttonSize + margin * 2}px;
          height: ${buttonSize + margin * 2}px;
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
          width: ${buttonSize + margin * 2}px;
          height: ${buttonSize + margin * 2}px;
          border: none;
          z-index: 999999;
          background: transparent;
          opacity: 1;
          pointer-events: auto;
          display: block;
        `;
      }
    }
    
    // 🟡 CAS 2: BUTTON_WITH_POPUP - Bulle + popup visible
    else if (state === this.WIDGET_STATES.BUTTON_WITH_POPUP) {
      const buttonSize = 64;
      // Popup responsive (max 320px ou largeur écran - 100px)
      const popupMaxWidth = Math.min(320, window.innerWidth - 100);
      const popupHeight = 100; // Hauteur estimée pour ~2 lignes (55 chars)
      const spacing = 16;
      
      const width = popupMaxWidth + 40; // Marge pour le popup
      const height = buttonSize + popupHeight + spacing + 32;
      
      if (this.isMobile) {
        this.iframe.style.cssText = `
          position: fixed;
          bottom: 16px;
          right: 16px;
          width: ${width}px;
          height: ${height}px;
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
          width: ${width}px;
          height: ${height}px;
          border: none;
          z-index: 999999;
          background: transparent;
          opacity: 1;
          pointer-events: auto;
          display: block;
        `;
      }
    }
    
    // 🔵 CAS 3: CHAT_OPEN - Fenêtre de chat ouverte
    else if (state === this.WIDGET_STATES.CHAT_OPEN) {
      // ✅ GARDÉ - Détection mobile exacte
      const isActualMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                             (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
      
      if (isActualMobile) {
        // 📱 MOBILE - Fullscreen (TON CODE EXACT)
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
        
        // ✅ GARDÉ - Lock body scroll
        if (this.lockBodyScroll) {
          this.lockBodyScroll();
        }
        
      } else {
        // 💻 DESKTOP - Dimensions adaptatives (TA LOGIQUE RESIZE)
        const chatWidth = Math.min(
          data.width || this.config.width || 380,
          window.innerWidth - 48 // ✅ GARDÉ - Resize adaptatif
        );
        const chatHeight = Math.min(
          data.height || this.config.height || 600,
          window.innerHeight - 100 // ✅ GARDÉ - Resize adaptatif
        );
        
        this.iframe.style.cssText = `
          position: fixed !important;
          bottom: 24px !important;
          right: 24px !important;
          width: ${chatWidth}px !important;
          height: ${chatHeight}px !important;
          top: auto !important;
          left: auto !important;
          border: none;
          z-index: 999999;
          background: transparent;
          opacity: 1;
          pointer-events: auto;
          display: block;
        `;
      }
      
      this.isOpen = true;
    }
  },

  // 🔄 MODIFIÉ - Widget ready state handler (utilise setWidgetState)
  handleWidgetReady: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Widget ready - Mobile:', data.isMobile || this.isMobile);
    
    if (data.width) this.config.width = data.width;
    if (data.height) this.config.height = data.height;
    if (data.isMobile !== undefined) this.isMobile = data.isMobile;
    
    this.isOpen = false;
    
    // 🔄 Utilise le nouvel état au lieu de showButton()
    this.setWidgetState(this.WIDGET_STATES.BUTTON_ONLY);
  },

  // 🔄 MODIFIÉ - Widget open state handler (utilise setWidgetState)
  handleWidgetOpen: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Opening chat interface - Mobile:', data.isMobile || this.isMobile);
    
    if (data.isMobile !== undefined) {
      this.isMobile = data.isMobile;
    }
    
    // 🔄 Utilise le nouvel état au lieu de calculs directs
    this.setWidgetState(this.WIDGET_STATES.CHAT_OPEN, data);
  },

  // 🔄 MODIFIÉ - Widget close state handler (utilise setWidgetState)
  handleWidgetClose: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Closing chat interface - Mobile:', data?.isMobile || this.isMobile);
    this.isOpen = false;
    
    // ✅ GARDÉ - Unlock body scroll on mobile
    if (this.isMobile && this.unlockBodyScroll) {
      this.unlockBodyScroll();
    }
    
    // 🔄 Utilise le nouvel état au lieu de showButton()
    this.setWidgetState(this.WIDGET_STATES.BUTTON_ONLY);
  },

  // ✅ GARDÉ - Dynamic resize handler
  handleWidgetResize: function(data) {
    if (!this.iframe || !this.isOpen) return;
    
    if (data.width) this.config.width = data.width;
    if (data.height) this.config.height = data.height;
    if (data.isMobile !== undefined) this.isMobile = data.isMobile;
    
    this.setWidgetState(this.WIDGET_STATES.CHAT_OPEN, data);
  },

  // ✅ GARDÉ - Error state handler
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

  // ✅ GARDÉ - Screen size change handler
  handleResize: function() {
    if (!this.iframe) return;
    
    const wasMobile = this.isMobile;
    this.isMobile = this.detectMobile();
    
    if (wasMobile !== this.isMobile) {
      // Handle mobile/desktop mode transition
      if (this.isOpen) {
        if (this.isMobile && this.lockBodyScroll) {
          this.lockBodyScroll();
        } else if (!this.isMobile && this.unlockBodyScroll) {
          this.unlockBodyScroll();
        }
      }
    }
    
    if (this.isOpen) {
      this.setWidgetState(this.WIDGET_STATES.CHAT_OPEN, {
        width: this.config.width,
        height: this.config.height,
        isMobile: this.isMobile
      });
    } else {
      this.setWidgetState(this.currentState || this.WIDGET_STATES.BUTTON_ONLY);
    }
  },

  // ✅ GARDÉ - Complete cleanup and resource management
  destroy: function() {
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
    
    // Unlock scroll if necessary
    if (this.isMobile && this.unlockBodyScroll) {
      this.unlockBodyScroll();
    }
    
    this.isOpen = false;
    this.widgetId = null;
    this.currentState = null;
    window.removeEventListener('resize', this.handleResize.bind(this));
    console.log('AIChatWidget: Successfully destroyed');
  },

  // ✅ GARDÉ - Public API for status monitoring
  getStatus: function() {
    return {
      isLoaded: !!this.iframe,
      isOpen: this.isOpen,
      isMobile: this.isMobile,
      widgetId: this.widgetId,
      config: this.config,
      currentState: this.currentState // 🆕 Nouveau
    };
  },

  // ✅ GARDÉ - Widget control methods
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

// ✅ GARDÉ - Global resize handler with debounce optimization
window.addEventListener('resize', function() {
  if (window.AIChatWidget && window.AIChatWidget.handleResize) {
    clearTimeout(window.AIChatWidget.resizeTimeout);
    window.AIChatWidget.resizeTimeout = setTimeout(() => {
      window.AIChatWidget.handleResize();
    }, 150);
  }
});

// ✅ GARDÉ - Professional initialization log
(function() {
  console.log('AIChatWidget v2.2 Enterprise Edition with State Management loaded successfully');
})();