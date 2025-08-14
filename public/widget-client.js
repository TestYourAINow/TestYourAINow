// 🚀 CLIENT WIDGET SCRIPT - Version API Route
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
  },

  // 📱 Créer l'iframe invisible
  createIframe: function() {
    const iframe = document.createElement("iframe");
    iframe.id = "ai-chat-widget";
    // ✅ NOUVEAU: Pointer vers l'API route au lieu de la page
    iframe.src = `https://testyourainow.com/api/widget/${this.widgetId}`;
    iframe.title = "Assistant IA";
    
    // 🔧 Style initial : invisible
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
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      border-radius: 20px;
    `;

    this.iframe = iframe;
    document.body.appendChild(iframe);
  },

  // 🎧 Écouter les messages de l'iframe
  setupMessageListener: function() {
    window.addEventListener('message', (event) => {
      // 🔒 Sécurité : vérifier l'origine
      if (!event.origin.includes('testyourainow.com')) return;
      
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
      }
    });
  },

  // ✅ Widget prêt : afficher le bouton
  handleWidgetReady: function(data) {
    if (!this.iframe) return;
    
    // Sauvegarder la config
    if (data.width) this.config.width = data.width;
    if (data.height) this.config.height = data.height;
    
    this.isOpen = false;
    
    // 🔘 Afficher le bouton chat
    this.iframe.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 64px;
      height: 64px;
      border: none;
      z-index: 999999;
      border-radius: 50%;
      background: transparent;
      opacity: 1;
      pointer-events: auto;
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    // ✨ Animation d'entrée
    this.animateButtonEntrance();
  },

  // 🏠 Widget ouvert : agrandir en chat
  handleWidgetOpen: function(data) {
    if (!this.iframe) return;
    
    this.isOpen = true;
    
    // 📱 Responsive design
    const isMobile = window.innerWidth <= 768;
    const maxHeight = window.innerHeight - 100;
    
    if (isMobile) {
      // Mobile : plein écran
      this.iframe.style.cssText = `
        position: fixed;
        bottom: 0;
        right: 0;
        left: 0;
        top: 20px;
        width: 100%;
        height: calc(100vh - 20px);
        border: none;
        z-index: 999999;
        border-radius: 20px 20px 0 0;
        background: transparent;
        opacity: 1;
        pointer-events: auto;
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.3);
      `;
    } else {
      // Desktop : fenêtre dimensionnée
      this.iframe.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: ${Math.min(this.config.width, window.innerWidth - 48)}px;
        height: ${Math.min(this.config.height, maxHeight)}px;
        border: none;
        z-index: 999999;
        border-radius: 20px;
        background: transparent;
        opacity: 1;
        pointer-events: auto;
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      `;
    }
  },

  // 🔘 Widget fermé : revenir au bouton
  handleWidgetClose: function() {
    if (!this.iframe) return;
    
    this.isOpen = false;
    
    this.iframe.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 64px;
      height: 64px;
      border: none;
      z-index: 999999;
      border-radius: 50%;
      background: transparent;
      opacity: 1;
      pointer-events: auto;
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
  },

  // 🚨 Gestion d'erreur
  handleWidgetError: function(data) {
    console.error('AIChatWidget Error:', data.error);
  },

  // ✨ Animation d'apparition du bouton
  animateButtonEntrance: function() {
    if (!this.iframe) return;
    
    // Effet bounce d'entrée
    this.iframe.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
      this.iframe.style.transform = 'scale(1.1)';
      setTimeout(() => {
        this.iframe.style.transform = 'scale(1)';
      }, 150);
    }, 100);
  },

  // 📱 Gestion responsive
  handleResize: function() {
    if (this.isOpen && this.iframe) {
      // Recalculer les dimensions si le chat est ouvert
      this.handleWidgetOpen({ 
        width: this.config.width, 
        height: this.config.height 
      });
    }
  },

  // 🗑️ Nettoyage
  destroy: function() {
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
    this.isOpen = false;
    this.widgetId = null;
  },

  // 📊 API publique pour les développeurs
  getStatus: function() {
    return {
      isLoaded: !!this.iframe,
      isOpen: this.isOpen,
      widgetId: this.widgetId
    };
  }
};

// 📱 Écouter les changements de taille d'écran
window.addEventListener('resize', function() {
  if (window.AIChatWidget && window.AIChatWidget.handleResize) {
    window.AIChatWidget.handleResize();
  }
});

// 🔄 Auto-initialisation si un widgetId est fourni dans l'URL du script
(function() {
  const scripts = document.querySelectorAll('script[src*="widget-client.js"]');
  const lastScript = scripts[scripts.length - 1];
  
  if (lastScript && lastScript.src) {
    const url = new URL(lastScript.src);
    const widgetId = url.searchParams.get('widgetId') || url.searchParams.get('id');
    
    if (widgetId) {
      // Attendre que le DOM soit prêt
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          window.AIChatWidget.init({ widgetId: widgetId });
        });
      } else {
        window.AIChatWidget.init({ widgetId: widgetId });
      }
    }
  }
})();