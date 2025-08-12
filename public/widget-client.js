// widget-client.js - VERSION AUTO-DÉTECTION comme buildmyagent.io
window.AIChatWidget = {
  widgetId: null,
  config: null,
  iframe: null,
  isOpen: false,
  baseUrl: null,

  async init(options) {
    this.widgetId = options.widgetId;
    
    // 🔍 AUTO-DÉTECTION du domaine comme buildmyagent.io
    this.detectBaseUrl();
    
    console.log('[AIChatWidget] Widget initializing with ID:', this.widgetId);
    console.log('[AIChatWidget] Using API host:', this.baseUrl);
    
    try {
      await this.loadSettings();
      this.createWidget();
      console.log('[AIChatWidget] Widget initialized successfully');
      console.log('[AIChatWidget] Widget ready! ✓');
    } catch (error) {
      console.error('[AIChatWidget] Widget error:', error);
    }
  },

  // 🔍 DÉTECTION AUTOMATIQUE du domaine comme buildmyagent.io
  detectBaseUrl() {
    // Chercher le script widget dans tous les scripts
    const scripts = document.querySelectorAll('script');
    console.log('[AIChatWidget] Looking for widget script among', scripts.length, 'scripts');
    
    for (let script of scripts) {
      if (script.src && script.src.includes('widget-client.js')) {
        const url = new URL(script.src);
        this.baseUrl = url.origin;
        console.log('[AIChatWidget] Found widget script:', script.src);
        console.log('[AIChatWidget] Script domain detected:', this.baseUrl);
        return;
      }
    }
    
    // Fallback si pas trouvé
    this.baseUrl = 'https://testyourainow.com';
    console.log('[AIChatWidget] Using fallback domain:', this.baseUrl);
  },

  // 📥 CHARGER LES SETTINGS comme buildmyagent.io
  async loadSettings() {
    const settingsUrl = `${this.baseUrl}/api/widget/${this.widgetId}/settings`;
    console.log('[AIChatWidget] Fetching settings from:', settingsUrl);
    
    const response = await fetch(settingsUrl);
    console.log('[AIChatWidget] Settings response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Settings load failed: ${response.status}`);
    }
    
    const data = await response.json();
    this.config = data.config || data.settings || data;
    console.log('[AIChatWidget] Settings loaded successfully');
    console.log('[AIChatWidget] Final settings:', {
      template: this.config.template || 'standard',
      theme: this.config.theme || 'light',
      primaryColor: this.config.primaryColor
    });
  },

  // 🏗️ CRÉER LE WIDGET avec iframe comme eux
  createWidget() {
    // Container principal
    const container = document.createElement('div');
    container.id = 'ai-chat-widget-root';
    container.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      z-index: 2147483647 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    `;

    // Iframe pour le widget (comme buildmyagent.io)
    this.iframe = document.createElement('iframe');
    this.iframe.style.cssText = `
      border: none !important;
      background: transparent !important;
      position: relative !important;
      z-index: 1 !important;
    `;
    
    // 🎯 COMMENCER PAR LE BOUTON (dimensions du bouton)
    this.showButton();
    
    container.appendChild(this.iframe);
    document.body.appendChild(container);
    
    this.setupIframeListeners();
  },

  // 🔘 AFFICHER LE BOUTON
  showButton() {
    const buttonSize = 64; // Comme buildmyagent.io
    
    this.iframe.style.width = buttonSize + 'px';
    this.iframe.style.height = buttonSize + 'px';
    this.iframe.style.borderRadius = '50%';
    this.iframe.style.overflow = 'hidden';
    this.iframe.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
    this.iframe.style.transition = 'all 0.3s ease';
    
    // URL de l'iframe avec paramètres comme buildmyagent.io
    const iframeUrl = this.buildIframeUrl('button');
    console.log('[AIChatWidget] Loading button iframe from:', iframeUrl);
    
    this.iframe.src = iframeUrl;
    this.isOpen = false;
  },

  // 💬 AFFICHER LE CHAT
  showChat() {
    const chatWidth = this.config.width || 380;
    const chatHeight = this.config.height || 600;
    
    // Responsive sur mobile
    const isMobile = window.innerWidth <= 768;
    const finalWidth = isMobile ? Math.min(chatWidth, window.innerWidth - 40) : chatWidth;
    const finalHeight = isMobile ? Math.min(chatHeight, window.innerHeight - 100) : chatHeight;
    
    this.iframe.style.width = finalWidth + 'px';
    this.iframe.style.height = finalHeight + 'px';
    this.iframe.style.borderRadius = '16px';
    this.iframe.style.boxShadow = '0 8px 40px rgba(0,0,0,0.12)';
    
    // URL de l'iframe pour le chat
    const iframeUrl = this.buildIframeUrl('chat');
    console.log('[AIChatWidget] Loading chat iframe from:', iframeUrl);
    
    this.iframe.src = iframeUrl;
    this.isOpen = true;
  },

  // 🔗 CONSTRUIRE L'URL de l'iframe comme buildmyagent.io
  buildIframeUrl(mode) {
    const params = new URLSearchParams({
      theme: this.config.theme || 'light',
      themeColor: encodeURIComponent(this.config.primaryColor || '#3b82f6'),
      template: this.config.template || 'standard',
      mode: mode // 'button' ou 'chat'
    });
    
    return `${this.baseUrl}/widget/${this.widgetId}?${params.toString()}`;
  },

  // 🎧 ÉCOUTER LES MESSAGES de l'iframe
  setupIframeListeners() {
    window.addEventListener('message', (event) => {
      // Vérifier l'origine
      if (event.origin !== this.baseUrl) return;
      
      const { type, data } = event.data || {};
      
      switch (type) {
        case 'widget_button_click':
          this.showChat();
          break;
          
        case 'widget_close':
          this.showButton();
          break;
          
        case 'widget_loaded':
          console.log('[AIChatWidget] Widget iframe loaded successfully');
          break;
          
        default:
          // Ignore autres messages
          break;
      }
    });
  }
};

console.log('[AIChatWidget] Auto-detection widget ready!');