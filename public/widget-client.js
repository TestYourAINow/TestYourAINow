// public\widget-client.js
// Enterprise Chat Widget Client - Mobile Optimized
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
  
  // Primary initialization method
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

  // Advanced mobile device detection
  detectMobile: function() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform)) ||
           window.innerWidth <= 768;
  },

  // Create and configure iframe container
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
        this.showButtonOnly();
      }
    }, 10000);
  },

  // Setup cross-frame communication listener
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

  // Mobile-specific event handlers
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

    // Orientation change handling
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

    // Dynamic mobile/desktop detection on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const wasMobile = this.isMobile;
        this.isMobile = this.detectMobile();
        
        if (wasMobile !== this.isMobile) {
          // Handle mobile/desktop transition
          if (this.isOpen) {
            this.handleWidgetOpen({ 
              width: this.config.width, 
              height: this.config.height,
              isMobile: this.isMobile 
            });
          } else {
            // 🆕 Garde la bonne taille selon showPopup
            if (this.config.showPopup) {
              this.showButtonWithPopup();
            } else {
              this.showButtonOnly();
            }
          }
        }
      }, 150);
    });
  },

  // 🆕 MODIFIÉ - Widget ready state handler
  handleWidgetReady: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Widget ready - Mobile:', data.isMobile || this.isMobile, '- ShowPopup:', data.showPopup);
    
    if (data.width) this.config.width = data.width;
    if (data.height) this.config.height = data.height;
    if (data.isMobile !== undefined) this.isMobile = data.isMobile;
    if (data.showPopup !== undefined) this.config.showPopup = data.showPopup;
    
    this.isOpen = false;
    
    // 🆕 CHOIX DE LA TAILLE SELON LE POPUP
    if (data.showPopup) {
      this.showButtonWithPopup();
    } else {
      this.showButtonOnly();
    }
  },

  // 🆕 NOUVELLE FONCTION - Grande iframe (avec popup)
  showButtonWithPopup: function() {
    if (!this.iframe) return;
    
    const buttonSize = 64;
    const shadowMargin = 15;
    const hoverMargin = 8;
    
    // Popup dimensions (55 caractères max)
    const popupMaxWidth = 200;
    const popupHeight = 70;
    const popupMarginTop = popupHeight + 32;
    
    // Dimensions optimales pour le popup
    const iframeWidth = Math.max(
      buttonSize + (shadowMargin * 2) + hoverMargin,
      popupMaxWidth + 50  // 50px pour marges + bouton X
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
    
    console.log('AIChatWidget: Button with popup displayed -', iframeWidth + 'x' + iframeHeight);
  },

  // 🆕 NOUVELLE FONCTION - Petite iframe (sans popup)
  showButtonOnly: function() {
    if (!this.iframe) return;
    
    const buttonSize = 64;
    const shadowMargin = 15;
    const hoverMargin = 8;
    
    const iframeWidth = buttonSize + (shadowMargin * 2) + hoverMargin;
    const iframeHeight = buttonSize + (shadowMargin * 2) + hoverMargin;
    
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
    
    console.log('AIChatWidget: Button only displayed -', iframeWidth + 'x' + iframeHeight);
  },

  // Widget open state handler
  handleWidgetOpen: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Opening chat interface - Mobile:', data.isMobile || this.isMobile);
    this.isOpen = true;
    
    // Update mobile state if provided
    if (data.isMobile !== undefined) {
      this.isMobile = data.isMobile;
    }
    
    // 🎯 FIX: Fullscreen SEULEMENT pour vrais mobiles (pas desktop en fenêtre étroite)
    const isActualMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
    
    if (isActualMobile) {
      // Mobile: Fullscreen mode
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
      
      // Lock body scroll
      if (this.lockBodyScroll) {
        this.lockBodyScroll();
      }
      
    } else {
      // Desktop: Standard behavior (même si fenêtre étroite)
      const maxHeight = window.innerHeight - 100;
      const baseWidth = Math.min(this.config.width, window.innerWidth - 48);
      const baseHeight = Math.min(this.config.height, maxHeight);
      
      const animationMargin = 25;
      const borderRadius = 10;
      const totalMarginWidth = animationMargin + borderRadius;
      const totalMarginHeight = animationMargin + borderRadius;
      
      const finalWidth = baseWidth + totalMarginWidth;
      const finalHeight = baseHeight + totalMarginHeight;
      
      // 🎯 Desktop: Dimensions fixes en bas à droite
      this.iframe.style.cssText = `
        position: fixed !important;
        bottom: 24px !important;
        right: 24px !important;
        width: ${finalWidth}px !important;
        height: ${finalHeight}px !important;
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
  },

  // Widget close state handler
  handleWidgetClose: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Closing chat interface - Mobile:', data?.isMobile || this.isMobile);
    this.isOpen = false;
    
    // Unlock body scroll on mobile
    if (this.isMobile && this.unlockBodyScroll) {
      this.unlockBodyScroll();
    }
    
    // 🆕 Revenir à la bonne taille selon showPopup
    if (this.config.showPopup) {
      this.showButtonWithPopup();
    } else {
      this.showButtonOnly();
    }
  },

  // Dynamic resize handler
  handleWidgetResize: function(data) {
    if (!this.iframe || !this.isOpen) return;
    
    if (data.width) this.config.width = data.width;
    if (data.height) this.config.height = data.height;
    if (data.isMobile !== undefined) this.isMobile = data.isMobile;
    
    this.handleWidgetOpen(data);
  },

  // Error state handler
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

  // Screen size change handler
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
      this.handleWidgetOpen({ 
        width: this.config.width, 
        height: this.config.height,
        isMobile: this.isMobile
      });
    } else {
      // 🆕 Garde la bonne taille selon showPopup
      if (this.config.showPopup) {
        this.showButtonWithPopup();
      } else {
        this.showButtonOnly();
      }
    }
  },

  // Complete cleanup and resource management
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
    window.removeEventListener('resize', this.handleResize.bind(this));
    console.log('AIChatWidget: Successfully destroyed');
  },

  // Public API for status monitoring
  getStatus: function() {
    return {
      isLoaded: !!this.iframe,
      isOpen: this.isOpen,
      isMobile: this.isMobile,
      widgetId: this.widgetId,
      config: this.config
    };
  },

  // Widget control methods
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

// Global resize handler with debounce optimization
window.addEventListener('resize', function() {
  if (window.AIChatWidget && window.AIChatWidget.handleResize) {
    clearTimeout(window.AIChatWidget.resizeTimeout);
    window.AIChatWidget.resizeTimeout = setTimeout(() => {
      window.AIChatWidget.handleResize();
    }, 150);
  }
});

// Professional initialization log
(function() {
  console.log('AIChatWidget v2.1 Enterprise Edition loaded successfully');
})();