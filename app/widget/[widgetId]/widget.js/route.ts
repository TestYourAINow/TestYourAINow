// app/widget/[widgetId]/widget.js/route.ts - SCRIPT DIRECT comme buildmyagent.io
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: any
) {
  const params = await context.params;
  const widgetId = params.widgetId;
  const baseUrl = req.nextUrl.origin;

  // 🎯 SCRIPT DIRECT qui s'auto-exécute (comme buildmyagent.io)
  const script = `
// ===== AI CHAT WIDGET - Version directe comme buildmyagent.io =====
(function() {
  'use strict';
  
  const WIDGET_ID = "${widgetId}";
  const BASE_URL = "${baseUrl}";
  
  console.log('[AIChatWidget] Initializing widget with ID:', WIDGET_ID);
  console.log('[AIChatWidget] Using base URL:', BASE_URL);
  
  // 🔍 Éviter double chargement
  if (window.AIChatWidget && window.AIChatWidget.initialized) {
    console.log('[AIChatWidget] Already initialized, skipping');
    return;
  }
  
  // 🏗️ WIDGET OBJECT
  window.AIChatWidget = {
    initialized: false,
    widgetId: WIDGET_ID,
    baseUrl: BASE_URL,
    config: null,
    iframe: null,
    isOpen: false,
    
    // 📥 CHARGER LA CONFIG
    async loadConfig() {
      try {
        console.log('[AIChatWidget] Fetching settings from:', BASE_URL + '/api/widget/' + WIDGET_ID + '/settings');
        
        const response = await fetch(BASE_URL + '/api/widget/' + WIDGET_ID + '/settings');
        console.log('[AIChatWidget] Settings response status:', response.status);
        
        if (!response.ok) {
          throw new Error('Settings load failed: ' + response.status);
        }
        
        const data = await response.json();
        this.config = data.settings || data.config || data;
        console.log('[AIChatWidget] Settings loaded successfully');
        console.log('[AIChatWidget] Final settings:', {
          template: this.config.template || 'standard',
          theme: this.config.theme || 'light',
          primaryColor: this.config.primaryColor
        });
        
        return true;
      } catch (error) {
        console.error('[AIChatWidget] Config load error:', error);
        return false;
      }
    },
    
    // 🏗️ CRÉER LE WIDGET
    createWidget() {
      // Container avec z-index maximum
      const container = document.createElement('div');
      container.id = 'ai-chat-widget-container';
      container.style.cssText = \`
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        z-index: 2147483647 !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        pointer-events: none !important;
      \`;
      
      // Créer iframe
      this.iframe = document.createElement('iframe');
      this.iframe.style.cssText = \`
        border: none !important;
        background: transparent !important;
        position: relative !important;
        pointer-events: auto !important;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
      \`;
      
      // 🔘 Démarrer par le bouton
      this.showButton();
      
      container.appendChild(this.iframe);
      document.body.appendChild(container);
      
      // 🎧 Écouter les messages de l'iframe
      this.setupIframeListeners();
      
      console.log('[AIChatWidget] Widget container created');
    },
    
    // 🔘 AFFICHER LE BOUTON
    showButton() {
      const buttonSize = this.config.buttonSize || 64;
      
      this.iframe.style.width = buttonSize + 'px';
      this.iframe.style.height = buttonSize + 'px';
      this.iframe.style.borderRadius = '50%';
      this.iframe.style.overflow = 'hidden';
      this.iframe.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
      
      const iframeUrl = this.buildIframeUrl('button');
      console.log('[AIChatWidget] Loading button iframe from:', iframeUrl);
      
      this.iframe.src = iframeUrl;
      this.isOpen = false;
    },
    
    // 💬 AFFICHER LE CHAT
    showChat() {
      const chatWidth = this.config.width || 380;
      const chatHeight = this.config.height || 600;
      
      // Responsive
      const isMobile = window.innerWidth <= 768;
      const finalWidth = isMobile ? Math.min(chatWidth, window.innerWidth - 40) : chatWidth;
      const finalHeight = isMobile ? Math.min(chatHeight, window.innerHeight - 100) : chatHeight;
      
      this.iframe.style.width = finalWidth + 'px';
      this.iframe.style.height = finalHeight + 'px';
      this.iframe.style.borderRadius = '16px';
      this.iframe.style.boxShadow = '0 8px 40px rgba(0,0,0,0.15)';
      
      const iframeUrl = this.buildIframeUrl('chat');
      console.log('[AIChatWidget] Loading chat iframe from:', iframeUrl);
      
      this.iframe.src = iframeUrl;
      this.isOpen = true;
    },
    
    // 🔗 CONSTRUIRE L'URL DE L'IFRAME
    buildIframeUrl(mode) {
      const params = new URLSearchParams({
        theme: this.config.theme || 'light',
        themeColor: encodeURIComponent(this.config.primaryColor || '#3b82f6'),
        template: this.config.template || 'standard',
        mode: mode
      });
      
      return BASE_URL + '/widget/' + WIDGET_ID + '?' + params.toString();
    },
    
    // 🎧 ÉCOUTER LES MESSAGES DE L'IFRAME
    setupIframeListeners() {
      window.addEventListener('message', (event) => {
        if (event.origin !== BASE_URL) return;
        
        const { type, data } = event.data || {};
        
        switch (type) {
          case 'widget_button_click':
          case 'widget_open':
            this.showChat();
            break;
            
          case 'widget_close':
            this.showButton();
            break;
            
          case 'widget_loaded':
            console.log('[AIChatWidget] Widget iframe loaded successfully');
            break;
        }
      });
    },
    
    // 🚀 INITIALISER
    async init() {
      if (this.initialized) return;
      
      const configLoaded = await this.loadConfig();
      if (!configLoaded) {
        console.error('[AIChatWidget] Failed to load config, aborting');
        return;
      }
      
      this.createWidget();
      this.initialized = true;
      
      console.log('[AIChatWidget] Widget initialized successfully with settings:', {
        widgetId: WIDGET_ID,
        theme: this.config.theme,
        themeColor: this.config.primaryColor,
        baseUrl: BASE_URL,
        placement: this.config.placement || 'bottom-right'
      });
      console.log('[AIChatWidget] Widget ready! ✓');
    }
  };
  
  // 🚀 AUTO-INIT quand le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.AIChatWidget.init();
    });
  } else {
    window.AIChatWidget.init();
  }
  
})();
`;

  return new NextResponse(script, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=300", // Cache court pour permettre updates
      'Access-Control-Allow-Origin': '*',
    },
  });
}