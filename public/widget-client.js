// 🚀 CLIENT WIDGET SCRIPT v2.0 - Mobile-First GARDANT TES VALEURS DB
// Ajoute seulement la couche mobile par-dessus ton système existant

window.AIChatWidget = {
  iframe: null,
  isOpen: false,
  widgetId: null,
  isMobile: false,
  config: {
    width: 380,  // Tes valeurs par défaut de la DB
    height: 600
  },
  
  // 🎯 Fonction d'initialisation principale
  init: function(options) {
    options = options || {};
    
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
    this.detectDevice();
    this.createIframe();
    this.setupMessageListener();
  },

  // 🎯 DETECTION DEVICE
  detectDevice: function() {
    var width = window.innerWidth;
    var userAgent = navigator.userAgent.toLowerCase();
    
    this.isMobile = width <= 768 || 
                    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
                    ('ontouchstart' in window) ||
                    (navigator.maxTouchPoints > 0);
    
    console.log('AIChatWidget: Device detected =', this.isMobile ? 'Mobile' : 'Desktop', { width: width });
  },

  // 📱 Créer l'iframe - POINTE VERS TON API INCHANGÉE
  createIframe: function() {
    var iframe = document.createElement("iframe");
    iframe.id = "ai-chat-widget";
    // 🎯 TON URL API ORIGINALE
    iframe.src = "https://testyourainow.com/api/widget/" + this.widgetId;
    iframe.title = "Assistant IA";
    iframe.loading = "lazy";
    
    // Style initial : invisible jusqu'à ce que le widget soit prêt
    iframe.style.cssText = [
      'position: fixed',
      'bottom: 24px',
      'right: 24px', 
      'width: 0px',
      'height: 0px',
      'border: none',
      'z-index: 999999',
      'background: transparent',
      'opacity: 0',
      'pointer-events: none'
    ].join(';') + ';';

    this.iframe = iframe;
    document.body.appendChild(iframe);
    
    // Timeout de sécurité
    var self = this;
    setTimeout(function() {
      if (self.iframe && self.iframe.style.opacity === '0') {
        console.warn('AIChatWidget: Timeout de chargement, affichage forcé');
        self.showButton();
      }
    }, 10000);
  },

  // 🎧 Écouter les messages de l'iframe - GÈRE TES VALEURS
  setupMessageListener: function() {
    var self = this;
    
    window.addEventListener('message', function(event) {
      // Sécurité : vérifier l'origine
      var allowedOrigins = [
        'https://testyourainow.com',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
      ];
      
      var isAllowedOrigin = false;
      for (var i = 0; i < allowedOrigins.length; i++) {
        if (event.origin.indexOf(allowedOrigins[i]) !== -1) {
          isAllowedOrigin = true;
          break;
        }
      }
      
      if (!isAllowedOrigin) {
        return;
      }
      
      var type = event.data.type;
      var data = event.data.data;
      
      switch (type) {
        case 'WIDGET_READY':
          self.handleWidgetReady(data);
          break;
          
        case 'WIDGET_OPEN':
          self.handleWidgetOpen(data);
          break;
          
        case 'WIDGET_CLOSE':
          self.handleWidgetClose(data);
          break;
          
        case 'WIDGET_ERROR':
          self.handleWidgetError(data);
          break;
          
        case 'WIDGET_RESIZE':
          self.handleWidgetResize(data);
          break;
      }
    });
  },

  // ✅ Widget prêt : utiliser TES VALEURS de config
  handleWidgetReady: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Widget prêt à être affiché');
    
    // 🎯 UTILISER TES VALEURS DE LA DB
    if (data.width) this.config.width = data.width;        // Ta valeur width de ChatbotConfig
    if (data.height) this.config.height = data.height;     // Ta valeur height de ChatbotConfig
    if (typeof data.isMobile !== 'undefined') {
      this.isMobile = data.isMobile;
    }
    
    this.isOpen = false;
    this.showButton();
  },

  // 🔘 Afficher le bouton chat - TON COMPORTEMENT ORIGINAL
  showButton: function() {
    if (!this.iframe) return;
    
    // TES MARGES ORIGINALES POUR LE BOUTON
    var buttonSize = 64;
    var shadowMargin = 15; 
    var hoverMargin = 8;   
    var popupMarginTop = 100; 
    var popupMarginLeft = 60; 
    
    var iframeWidth = buttonSize + (shadowMargin * 2) + hoverMargin + popupMarginLeft;
    var iframeHeight = buttonSize + (shadowMargin * 2) + hoverMargin + popupMarginTop;
    
    this.iframe.style.cssText = [
      'position: fixed',
      'bottom: ' + (this.isMobile ? '16px' : '24px'),
      'right: ' + (this.isMobile ? '16px' : '24px'),
      'width: ' + iframeWidth + 'px',
      'height: ' + iframeHeight + 'px',
      'border: none',
      'z-index: 999999',
      'background: transparent',
      'opacity: 1',
      'pointer-events: auto',
      'display: block'
    ].join(';') + ';';
  },

  // 🏠 Widget ouvert - COMPORTEMENTS DIFFÉRENTS selon device
  handleWidgetOpen: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Ouverture du chat');
    this.isOpen = true;
    
    // Sync mobile state du widget
    if (typeof data.isMobile !== 'undefined') {
      this.isMobile = data.isMobile;
    }
    
    if (this.isMobile) {
      this.openMobileChat();
    } else {
      this.openDesktopChat();
    }
  },

  // 📱 MODE MOBILE - Plein écran naturel
  openMobileChat: function() {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Mode Mobile - Plein écran');
    
    // Mobile : Occupe tout l'écran comme Messenger
    this.iframe.style.cssText = [
      'position: fixed',
      'top: 0',
      'left: 0',
      'right: 0',
      'bottom: 0',
      'width: 100vw',
      'height: 100vh',
      'border: none',
      'z-index: 999999',
      'background: transparent',
      'opacity: 1',
      'pointer-events: auto',
      'display: block'
    ].join(';') + ';';
    
    // Empêcher le scroll du body sur mobile
    document.body.style.overflow = 'hidden';
  },

  // 🖥️ MODE DESKTOP - FENÊTRE RESPONSIVE (s'adapte à l'écran)
  openDesktopChat: function() {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Mode Desktop - Fenêtre responsive');
    
    // 🎯 RESPONSIVE: Utilise tes valeurs mais s'adapte à l'écran
    var desiredWidth = this.config.width || 380;
    var desiredHeight = this.config.height || 600;
    
    // S'adapter à l'écran disponible
    var maxWidth = window.innerWidth - 60;  // Marge 30px de chaque côté
    var maxHeight = window.innerHeight - 100; // Marge 50px top/bottom
    
    var finalWidth = Math.min(desiredWidth, maxWidth) + 40; // +40 pour marges/ombres
    var finalHeight = Math.min(desiredHeight, maxHeight) + 40;
    
    this.iframe.style.cssText = [
      'position: fixed',
      'bottom: 24px',
      'right: 24px',
      'width: ' + finalWidth + 'px',
      'height: ' + finalHeight + 'px',
      'border: none',
      'z-index: 999999',
      'background: transparent',
      'opacity: 1',
      'pointer-events: auto',
      'display: block'
    ].join(';') + ';';
  },

  // 🔘 Widget fermé : TON COMPORTEMENT ORIGINAL
  handleWidgetClose: function(data) {
    if (!this.iframe) return;
    
    console.log('AIChatWidget: Fermeture du chat');
    this.isOpen = false;
    
    // Restaurer le scroll du body sur mobile
    if (this.isMobile) {
      document.body.style.overflow = '';
    }
    
    this.showButton();
  },

  // 📏 Redimensionnement - GARDE TES VALEURS
  handleWidgetResize: function(data) {
    if (!this.iframe || !this.isOpen) return;
    
    // 🎯 SYNC TES VALEURS de la DB
    if (data.width) this.config.width = data.width;
    if (data.height) this.config.height = data.height;
    if (typeof data.isMobile !== 'undefined') {
      this.isMobile = data.isMobile;
    }
    
    // Re-appliquer selon le mode
    this.handleWidgetOpen(data);
  },

  // 🚨 Gestion d'erreur - TON CODE ORIGINAL
  handleWidgetError: function(data) {
    console.error('AIChatWidget Error:', data.error);
    
    if (this.iframe) {
      this.iframe.style.opacity = '0';
      var self = this;
      setTimeout(function() {
        if (self.iframe) {
          self.iframe.src = self.iframe.src; // Recharger
        }
      }, 2000);
    }
  },

  // 📱 Gestion resize - DETECTION AUTOMATIQUE
  handleResize: function() {
    if (!this.iframe) return;
    
    var oldIsMobile = this.isMobile;
    this.detectDevice();
    
    // Si le device type a changé
    if (oldIsMobile !== this.isMobile) {
      console.log('AIChatWidget: Device type changed:', this.isMobile ? 'Mobile' : 'Desktop');
      
      if (this.isOpen) {
        if (this.isMobile) {
          this.openMobileChat();
        } else {
          this.openDesktopChat();
        }
      } else {
        this.showButton();
      }
    } else if (this.isOpen) {
      // Même device, juste redimensionnement
      if (this.isMobile) {
        this.openMobileChat();
      } else {
        this.openDesktopChat();
      }
    }
  },

  // 🗑️ Nettoyage complet
  destroy: function() {
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
    
    // Restaurer le scroll du body
    document.body.style.overflow = '';
    
    this.isOpen = false;
    this.widgetId = null;
    this.isMobile = false;
    
    window.removeEventListener('resize', this.handleResize.bind(this));
    console.log('AIChatWidget: Détruit proprement');
  },

  // 📊 API publique - INCLUT TES VALEURS
  getStatus: function() {
    return {
      isLoaded: !!this.iframe,
      isOpen: this.isOpen,
      widgetId: this.widgetId,
      isMobile: this.isMobile,
      config: this.config  // Tes valeurs width/height de la DB
    };
  },

  // 🎛️ API pour contrôler le widget
  open: function() {
    if (this.iframe && this.iframe.contentWindow) {
      this.iframe.contentWindow.postMessage({ type: 'FORCE_OPEN' }, '*');
    }
  },

  close: function() {
    if (this.iframe && this.iframe.contentWindow) {
      this.iframe.contentWindow.postMessage({ type: 'FORCE_CLOSE' }, '*');
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

// 📱 Event listeners
window.addEventListener('resize', function() {
  if (window.AIChatWidget && window.AIChatWidget.handleResize) {
    clearTimeout(window.AIChatWidget.resizeTimeout);
    window.AIChatWidget.resizeTimeout = setTimeout(function() {
      window.AIChatWidget.handleResize();
    }, 150);
  }
});

// Gestion rotation mobile
window.addEventListener('orientationchange', function() {
  if (window.AIChatWidget && window.AIChatWidget.isMobile) {
    setTimeout(function() {
      window.AIChatWidget.handleResize();
    }, 300);
  }
});

// Auto-log de chargement
(function() {
  console.log('AIChatWidget v2.0 Mobile-First chargé avec succès');
  console.log('📱 Respecte tes valeurs DB: width, height, primaryColor, theme, etc.');
  console.log('🖥️ Desktop inchangé, Mobile plein écran naturel');
})();