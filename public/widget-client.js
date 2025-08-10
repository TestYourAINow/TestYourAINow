window.AIChatWidget = {
  init: function ({ widgetId }) {
    // Évite le double chargement
    if (document.getElementById("ai-chat-widget-container")) return;

    console.log("🚀 Initializing AI Chat Widget without iframe...");

    // Charger d'abord les styles CSS de ton site
    this.loadStyles();

    // Récupère la config du widget
    fetch(`https://testyourainow.com/api/widget/${widgetId}/embed`)
      .then(response => response.json())
      .then(data => {
        if (data.config) {
          this.createWidget(data.config, widgetId);
        } else {
          console.error("❌ Widget config not found");
        }
      })
      .catch(error => {
        console.error("❌ Error loading widget:", error);
      });
  },

  loadStyles: function() {
    // Charger les styles de ton site (une seule fois)
    if (!document.getElementById('ai-widget-styles')) {
      const link = document.createElement('link');
      link.id = 'ai-widget-styles';
      link.rel = 'stylesheet';
      link.href = 'https://testyourainow.com/_next/static/css/app/globals.css';
      document.head.appendChild(link);
    }
  },

  createWidget: function(config, widgetId) {
    // Créer un conteneur qui va utiliser tes classes CSS existantes
    const widgetContainer = document.createElement("div");
    widgetContainer.id = "ai-chat-widget-container";
    widgetContainer.className = "chat-widget"; // 👈 Utilise ta classe CSS !
    
    // Variables d'état
    let isOpen = false;
    let messages = [];
    let isTyping = false;

    // Ajouter le message de bienvenue si activé
    if (config.showWelcomeMessage && config.welcomeMessage) {
      messages.push({
        id: '1',
        text: config.welcomeMessage,
        isBot: true,
        timestamp: new Date()
      });
    }

    // Créer le HTML en utilisant tes classes CSS existantes
    widgetContainer.innerHTML = `
      <!-- Bouton de chat -->
      <button class="chat-button" style="background-color: ${config.primaryColor || '#3b82f6'}">
        <span id="button-icon">💬</span>
      </button>

      <!-- Fenêtre de chat -->
      <div class="chat-window ${config.theme === 'dark' ? 'dark' : ''}" 
           style="width: ${config.width || 380}px; height: ${config.height || 600}px; --primary-color: ${config.primaryColor || '#3b82f6'}">
        
        <!-- Header -->
        <div class="chat-header">
          <div class="chat-header-content">
            <div class="chat-avatar-container">
              <img src="${config.avatar || '/Default Avatar.png'}" alt="Avatar" class="chat-avatar" 
                   onerror="this.src='/Default Avatar.png'">
              <div class="chat-status"></div>
            </div>
            <div class="chat-info">
              <h3 class="chat-title">${config.chatTitle || 'AI Assistant'}</h3>
              <p class="chat-subtitle">${config.subtitle || 'Online'}</p>
            </div>
          </div>
          <div class="chat-actions">
            <button class="chat-action-btn" id="new-chat-btn" title="New conversation">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 4v6h6M23 20v-6h-6"/>
                <path d="m21 4-6 6m0-6 6 6"/>
              </svg>
            </button>
            <button class="chat-action-btn" id="close-chat-btn" title="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div class="chat-messages ${config.theme === 'dark' ? 'dark' : ''} custom-scrollbar">
          <div class="messages-container show" id="messages-container">
            <!-- Messages seront ajoutés ici -->
          </div>
        </div>

        <!-- Input -->
        <div class="chat-input-area ${config.theme === 'dark' ? 'dark' : ''}">
          <div class="chat-input-container">
            <input type="text" id="message-input" placeholder="${config.placeholderText || 'Type your message...'}" 
                   class="chat-input ${config.theme === 'dark' ? 'dark' : ''}">
            <button id="send-btn" class="chat-send-btn" style="background-color: ${config.primaryColor || '#3b82f6'}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    // Références aux éléments
    const chatButton = widgetContainer.querySelector('.chat-button');
    const chatWindow = widgetContainer.querySelector('.chat-window');
    const messagesContainer = widgetContainer.querySelector('#messages-container');
    const messageInput = widgetContainer.querySelector('#message-input');
    const sendBtn = widgetContainer.querySelector('#send-btn');
    const closeBtn = widgetContainer.querySelector('#close-chat-btn');
    const newChatBtn = widgetContainer.querySelector('#new-chat-btn');
    const buttonIcon = widgetContainer.querySelector('#button-icon');

    // Fonction pour afficher les messages
    function renderMessages() {
      messagesContainer.innerHTML = '';
      
      messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${message.isBot ? 'items-start' : 'items-end'} mb-3 ${message.isBot ? 'flex-row' : 'flex-row-reverse'}`;
        
        messageDiv.innerHTML = `
          ${message.isBot ? `
            <img src="${config.avatar || '/Default Avatar.png'}" alt="Bot" 
                 class="w-8 h-8 rounded-full self-start mr-2" style="flex-shrink: 0;"
                 onerror="this.src='/Default Avatar.png'">
          ` : ''}
          <div class="flex flex-col max-w-sm relative">
            <div class="chat-bubble ${message.isBot ? 'bot' : 'user'}">
              ${message.text}
            </div>
            <div class="chat-timestamp ${message.isBot ? 'bot' : 'user'}">
              ${message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
      });

      // Scroll vers le bas
      messagesContainer.parentElement.scrollTop = messagesContainer.parentElement.scrollHeight;
    }

    // Fonction pour envoyer un message
    async function sendMessage() {
      const text = messageInput.value.trim();
      if (!text) return;

      // Ajouter le message utilisateur
      messages.push({
        id: Date.now().toString(),
        text: text,
        isBot: false,
        timestamp: new Date()
      });

      messageInput.value = '';
      renderMessages();

      // Afficher typing
      isTyping = true;
      const typingDiv = document.createElement('div');
      typingDiv.className = 'flex items-start mb-3 flex-row';
      typingDiv.innerHTML = `
        <img src="${config.avatar || '/Default Avatar.png'}" alt="Bot" 
             class="w-8 h-8 rounded-full self-start mr-2"
             onerror="this.src='/Default Avatar.png'">
        <div class="chat-bubble bot" style="display: flex; align-items: center; gap: 4px; padding: 12px 16px;">
          <span class="inline-block w-2 h-2 rounded-full animate-bounceDots" style="background-color: ${config.theme === 'dark' ? '#9ca3af' : '#6b7280'}; animation-delay: 0s"></span>
          <span class="inline-block w-2 h-2 rounded-full animate-bounceDots" style="background-color: ${config.theme === 'dark' ? '#9ca3af' : '#6b7280'}; animation-delay: 0.2s"></span>
          <span class="inline-block w-2 h-2 rounded-full animate-bounceDots" style="background-color: ${config.theme === 'dark' ? '#9ca3af' : '#6b7280'}; animation-delay: 0.4s"></span>
        </div>
      `;
      messagesContainer.appendChild(typingDiv);

      try {
        // Appel à l'API
        const response = await fetch(`https://testyourainow.com/api/agents/${config.selectedAgent}/ask`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-public-kind': 'widget',
            'x-widget-id': widgetId,
            'x-widget-token': 'public'
          },
          body: JSON.stringify({
            message: text,
            previousMessages: messages.slice(-10).map(msg => ({
              role: msg.isBot ? 'assistant' : 'user',
              content: msg.text
            })),
            welcomeMessage: config.showWelcomeMessage ? config.welcomeMessage : undefined
          })
        });

        const data = await response.json();
        
        // Enlever typing
        messagesContainer.removeChild(typingDiv);
        
        // Ajouter la réponse
        messages.push({
          id: (Date.now() + 1).toString(),
          text: data.reply || "Sorry, I couldn't process your request.",
          isBot: true,
          timestamp: new Date()
        });

        renderMessages();
      } catch (error) {
        console.error('Error:', error);
        messagesContainer.removeChild(typingDiv);
        
        // Réponse de fallback
        const fallbackResponses = [
          "Thanks for your message! I'm here to help you.",
          "That's an interesting question. Let me think about that...",
          "I understand your concern. Here's what I can suggest..."
        ];
        
        messages.push({
          id: (Date.now() + 1).toString(),
          text: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
          isBot: true,
          timestamp: new Date()
        });
        renderMessages();
      }
    }

    // Event listeners
    chatButton.addEventListener('click', () => {
      isOpen = !isOpen;
      if (isOpen) {
        chatWindow.classList.remove('closed');
        chatWindow.classList.add('open');
        buttonIcon.innerHTML = '×';
        messageInput.focus();
        renderMessages();
      } else {
        chatWindow.classList.remove('open');
        chatWindow.classList.add('closed');
        buttonIcon.innerHTML = '💬';
      }
    });

    closeBtn.addEventListener('click', () => {
      isOpen = false;
      chatWindow.classList.remove('open');
      chatWindow.classList.add('closed');
      buttonIcon.innerHTML = '💬';
    });

    newChatBtn.addEventListener('click', () => {
      messages = [];
      if (config.showWelcomeMessage && config.welcomeMessage) {
        messages.push({
          id: '1',
          text: config.welcomeMessage,
          isBot: true,
          timestamp: new Date()
        });
      }
      renderMessages();
    });

    sendBtn.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Initialiser avec le message de bienvenue
    renderMessages();

    // Ajouter au DOM
    document.body.appendChild(widgetContainer);

    console.log("✅ AI Chat Widget loaded successfully!");
  }
};