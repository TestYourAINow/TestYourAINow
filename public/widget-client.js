// public/widget-client.js - VERSION FINALE PRODUCTION
// Enterprise Chat Widget Client - Mobile Optimized with State Management
// Version 2.2 - Clean Production Build

window.AIChatWidget = {
  iframe: null,
  isOpen: false,
  isMobile: false,
  widgetId: null,
  config: {
    width: 380,
    height: 600
  },

  WIDGET_STATES: {
    BUTTON_ONLY: 'button_only',
    BUTTON_WITH_POPUP: 'button_with_popup',
    CHAT_OPEN: 'chat_open'
  },

  currentState: null,

  init: function (options = {}) {
    if (!options.widgetId) {
      console.error('AIChatWidget: widgetId required');
      return;
    }

    if (document.getElementById("ai-chat-widget")) {
      console.warn('AIChatWidget: Already initialized');
      return;
    }

    this.widgetId = options.widgetId;
    this.isMobile = this.detectMobile();
    this.createIframe();
    this.setupMessageListener();
    this.setupMobileHandlers();
  },

  detectMobile: function () {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
  },

  createIframe: function () {
    const iframe = document.createElement("iframe");
    iframe.id = "ai-chat-widget";
    iframe.src = `https://testyourainow.com/api/widget/${this.widgetId}`;
    iframe.title = "AI Assistant";
    iframe.loading = "lazy";

    if (this.isMobile) {
      iframe.style.cssText = `
        position: fixed; bottom: 16px; right: 16px;
        width: 0px; height: 0px; border: none; z-index: 999999;
        background: transparent; opacity: 0; pointer-events: none;
        -webkit-transform: translateZ(0); transform: translateZ(0);
      `;
    } else {
      iframe.style.cssText = `
        position: fixed; bottom: 24px; right: 24px;
        width: 0px; height: 0px; border: none; z-index: 999999;
        background: transparent; opacity: 0; pointer-events: none;
      `;
    }

    this.iframe = iframe;
    document.body.appendChild(iframe);

    setTimeout(() => {
      if (this.iframe && this.iframe.style.opacity === '0') {
        this.setWidgetState(this.WIDGET_STATES.BUTTON_ONLY);
      }
    }, 10000);
  },

  setupMessageListener: function () {
    window.addEventListener('message', (event) => {
      const allowedOrigins = [
        'https://testyourainow.com',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
      ];

      const isLocalhost = event.origin.includes('localhost') ||
        event.origin.includes('127.0.0.1') ||
        event.origin === 'null';

      if (!isLocalhost && !allowedOrigins.some(origin => event.origin.includes(origin))) return;

      const { type, data, state } = event.data;

      switch (type) {
        case 'WIDGET_READY':
          this.handleWidgetReady(data);
          break;
        case 'WIDGET_STATE_CHANGE':
          if (state === 'button_with_popup') {
            this.setWidgetState(this.WIDGET_STATES.BUTTON_WITH_POPUP, event.data);
          } else if (state === 'button_only') {
            this.setWidgetState(this.WIDGET_STATES.BUTTON_ONLY, event.data);
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

  setupMobileHandlers: function () {
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
      if (!e.target.closest('#ai-chat-widget')) e.preventDefault();
    };

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

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const wasMobile = this.isMobile;
        this.isMobile = this.detectMobile();

        if (wasMobile !== this.isMobile && this.isOpen) {
          this.setWidgetState(this.WIDGET_STATES.CHAT_OPEN, {
            width: this.config.width,
            height: this.config.height,
            isMobile: this.isMobile
          });
        } else if (wasMobile !== this.isMobile) {
          this.setWidgetState(this.currentState || this.WIDGET_STATES.BUTTON_ONLY);
        }
      }, 150);
    });
  },

  setWidgetState: function (state, data = {}) {
    if (!this.iframe) return;
    this.currentState = state;

    if (state === this.WIDGET_STATES.BUTTON_ONLY) {
      const size = 64, margin = 16;
      this.iframe.style.cssText = `
        position: fixed; ${this.isMobile ? 'bottom: 16px; right: 16px;' : 'bottom: 24px; right: 24px;'}
        width: ${size + margin * 2}px; height: ${size + margin * 2}px;
        border: none; z-index: 999999; background: transparent;
        opacity: 1; pointer-events: auto; display: block;
        ${this.isMobile ? '-webkit-transform: translateZ(0); transform: translateZ(0);' : ''}
      `;
    }
    else if (state === this.WIDGET_STATES.BUTTON_WITH_POPUP) {
      const popupMaxWidth = Math.min(320, window.innerWidth - 100);
      const width = popupMaxWidth + 40, height = 212;
      this.iframe.style.cssText = `
        position: fixed; ${this.isMobile ? 'bottom: 16px; right: 16px;' : 'bottom: 24px; right: 24px;'}
        width: ${width}px; height: ${height}px;
        border: none; z-index: 999999; background: transparent;
        opacity: 1; pointer-events: auto; display: block;
        ${this.isMobile ? '-webkit-transform: translateZ(0); transform: translateZ(0);' : ''}
      `;
    }
    else if (state === this.WIDGET_STATES.CHAT_OPEN) {
      const isActualMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));

      if (isActualMobile) {
        this.iframe.style.cssText = `
          position: fixed !important; inset: 0 !important;
          width: 100vw !important; height: 100vh !important;
          border: none; z-index: 999999; background: transparent;
          opacity: 1; pointer-events: auto; display: block;
          -webkit-transform: translateZ(0); transform: translateZ(0);
        `;
        if (this.lockBodyScroll) this.lockBodyScroll();
      } else {
        const animationMargin = 25;
        const borderRadius = 10;

        const baseWidth = Math.min(data.width || this.config.width || 380, window.innerWidth - 48);
        const baseHeight = Math.min(data.height || this.config.height || 600, window.innerHeight - 100);

        const chatWidth = baseWidth + animationMargin + borderRadius;   // ≈ 415
        const chatHeight = baseHeight + animationMargin + borderRadius;  // ≈ 635
        this.iframe.style.cssText = `
          position: fixed !important; bottom: 24px !important; right: 24px !important;
          width: ${chatWidth}px !important; height: ${chatHeight}px !important;
          border: none; z-index: 999999; background: transparent;
          opacity: 1; pointer-events: auto; display: block;
        `;
      }
      this.isOpen = true;
    }
  },

  handleWidgetReady: function (data) {
    if (!this.iframe) return;
    if (data.width) this.config.width = data.width;
    if (data.height) this.config.height = data.height;
    if (data.isMobile !== undefined) this.isMobile = data.isMobile;
    this.isOpen = false;
    this.setWidgetState(this.WIDGET_STATES.BUTTON_ONLY);
  },

  handleWidgetOpen: function (data) {
    if (!this.iframe) return;
    if (data.isMobile !== undefined) this.isMobile = data.isMobile;
    this.setWidgetState(this.WIDGET_STATES.CHAT_OPEN, data);
  },

  handleWidgetClose: function (data) {
    if (!this.iframe) return;
    this.isOpen = false;
    if (this.isMobile && this.unlockBodyScroll) this.unlockBodyScroll();
    this.setWidgetState(this.WIDGET_STATES.BUTTON_ONLY);
  },

  handleWidgetResize: function (data) {
    if (!this.iframe || !this.isOpen) return;
    if (data.width) this.config.width = data.width;
    if (data.height) this.config.height = data.height;
    if (data.isMobile !== undefined) this.isMobile = data.isMobile;
    this.setWidgetState(this.WIDGET_STATES.CHAT_OPEN, data);
  },

  handleWidgetError: function (data) {
    console.error('AIChatWidget Error:', data.error);
    if (this.iframe) {
      this.iframe.style.opacity = '0';
      setTimeout(() => { if (this.iframe) this.iframe.src = this.iframe.src; }, 2000);
    }
  },

  handleResize: function () {
    if (!this.iframe) return;
    const wasMobile = this.isMobile;
    this.isMobile = this.detectMobile();
    if (wasMobile !== this.isMobile && this.isOpen) {
      if (this.isMobile && this.lockBodyScroll) this.lockBodyScroll();
      else if (!this.isMobile && this.unlockBodyScroll) this.unlockBodyScroll();
    }
    if (this.isOpen) {
      this.setWidgetState(this.WIDGET_STATES.CHAT_OPEN, {
        width: this.config.width, height: this.config.height, isMobile: this.isMobile
      });
    } else {
      this.setWidgetState(this.currentState || this.WIDGET_STATES.BUTTON_ONLY);
    }
  },

  destroy: function () {
    if (this.iframe) { this.iframe.remove(); this.iframe = null; }
    if (this.isMobile && this.unlockBodyScroll) this.unlockBodyScroll();
    this.isOpen = false;
    this.widgetId = null;
    this.currentState = null;
  },

  getStatus: function () {
    return {
      isLoaded: !!this.iframe, isOpen: this.isOpen, isMobile: this.isMobile,
      widgetId: this.widgetId, config: this.config, currentState: this.currentState
    };
  },

  open: function () {
    if (this.iframe) this.iframe.contentWindow?.postMessage({ type: 'FORCE_OPEN' }, '*');
  },

  close: function () {
    if (this.iframe) this.iframe.contentWindow?.postMessage({ type: 'FORCE_CLOSE' }, '*');
  },

  toggle: function () {
    this.isOpen ? this.close() : this.open();
  }
};

window.addEventListener('resize', function () {
  if (window.AIChatWidget && window.AIChatWidget.handleResize) {
    clearTimeout(window.AIChatWidget.resizeTimeout);
    window.AIChatWidget.resizeTimeout = setTimeout(() => window.AIChatWidget.handleResize(), 150);
  }
});

console.log('AIChatWidget v2.2 loaded');