// public/widget-client.js - VERSION MODERNE
window.AIChatWidget = {
  iframe: null,
  isOpen: false,
  
  init: function ({ widgetId }) {
    // Évite le double chargement
    if (document.getElementById("ai-chat-widget")) return;

    // 🆕 Crée un iframe INVISIBLE au début
    const iframe = document.createElement("iframe");
    iframe.id = "ai-chat-widget";
    iframe.src = `https://testyourainow.com/widget/${widgetId}`;
    
    // 🎯 COMMENCE INVISIBLE - Sera redimensionné par les messages
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
    `;

    this.iframe = iframe;
    document.body.appendChild(iframe);

    // 🎧 Écouter les messages du widget pour redimensionner
    window.addEventListener('message', this.handleMessage.bind(this));
  },

  // 🎧 Gestion des messages depuis l'iframe
  handleMessage: function(event) {
    // Sécurité : vérifier l'origine
    if (!event.origin.includes('testyourainow.com')) return;
    
    const { type, data } = event.data;
    
    switch (type) {
      case 'WIDGET_OPEN':
        this.expandToChat(data.width || 380, data.height || 600);
        break;
        
      case 'WIDGET_CLOSE':
        this.shrinkToButton();
        break;
        
      case 'WIDGET_READY':
        // 🆕 Widget prêt : montrer SEULEMENT le bouton (64x64)
        this.showButton();
        break;
    }
  },

  // 🔘 Montrer seulement le bouton (état initial)
  showButton: function() {
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

  // 🏠 Agrandir en chat (remplace complètement le bouton)
  expandToChat: function(width, height) {
    if (!this.iframe) return;
    
    this.isOpen = true;
    
    // 📱 Responsive selon l'écran
    const isMobile = window.innerWidth <= 600;
    
    if (isMobile) {
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
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.3);
        pointer-events: auto;
      `;
    } else {
      this.iframe.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: ${width}px;
        height: ${Math.min(height, window.innerHeight - 100)}px;
        border: none;
        z-index: 999999;
        border-radius: 20px;
        background: transparent;
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
        pointer-events: auto;
      `;
    }
  },

  // 🔘 Rétrécir en bouton (revenir à l'état initial)
  shrinkToButton: function() {
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

  // ✨ Animation d'apparition du bouton
  animateButtonIn: function() {
    if (!this.iframe) return;
    
    // Petit effet bounce à l'apparition
    this.iframe.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
      this.iframe.style.transform = 'scale(1.05)';
      setTimeout(() => {
        this.iframe.style.transform = 'scale(1)';
      }, 150);
    }, 100);
  },

  // 🗑️ Fonction de nettoyage
  destroy: function() {
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
    window.removeEventListener('message', this.handleMessage.bind(this));
  }
};

// 📱 Écouter les resize d'écran
window.addEventListener('resize', function() {
  if (window.AIChatWidget.isOpen && window.AIChatWidget.iframe) {
    // Re-calculer les dimensions si ouvert
    window.AIChatWidget.expandToChat(380, 600);
  }
});