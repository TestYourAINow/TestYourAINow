window.AIChatWidget = {
  init: function ({ widgetId }) {
    // Évite le double chargement
    if (document.getElementById("ai-chat-widget-container")) return;

    console.log("🚀 Initializing AI Chat Widget without iframe...");

    // Récupère la config du widget
    fetch(`https://testyourainow.com/api/widget/${widgetId}/embed`)
      .then(response => response.json())
      .then(data => {
        if (data.config) {
          this.createWidget(data.config);
        } else {
          console.error("❌ Widget config not found");
        }
      })
      .catch(error => {
        console.error("❌ Error loading widget:", error);
      });
  },

  createWidget: function(config) {
    // Créer le conteneur principal du widget
    const widgetContainer = document.createElement("div");
    widgetContainer.id = "ai-chat-widget-container";
    widgetContainer.style.position = "fixed";
    widgetContainer.style.bottom = "24px";
    widgetContainer.style.right = "24px";
    widgetContainer.style.zIndex = "999999";
    widgetContainer.style.fontFamily = "Inter, system-ui, sans-serif";

    // État du widget
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

    // Créer le bouton flottant
    const chatButton = document.createElement("button");
    chatButton.id = "ai-chat-button";
    chatButton.style.cssText = `
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.2);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${config.primaryColor || '#3b82f6'};
      color: white;
      font-size: 24px;
    `;
    chatButton.innerHTML = '💬';

    // Effet hover sur le bouton
    chatButton.addEventListener('mouseenter', () => {
      chatButton.style.transform = 'scale(1.05)';
      chatButton.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(59, 130, 246, 0.4)';
    });
    chatButton.addEventListener('mouseleave', () => {
      chatButton.style.transform = 'scale(1)';
      chatButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.2)';
    });

    // Créer la fenêtre de chat
    const chatWindow = document.createElement("div");
    chatWindow.id = "ai-chat-window";
    chatWindow.style.cssText = `
      position: absolute;
      bottom: 80px;
      right: 0;
      width: ${config.width || 380}px;
      height: ${config.height || 600}px;
      border-radius: 20px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(75, 85, 99, 0.2);
      overflow: hidden;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: bottom right;
      display: flex;
      flex-direction: column;
      background: ${config.theme === 'dark' ? 'rgba(17, 24, 39, 0.98)' : 'rgba(255, 255, 255, 0.98)'};
      backdrop-filter: blur(20px);
      opacity: 0;
      transform: scale(0.95) translateY(16px);
      pointer-events: none;
    `;

    // Header du chat
    const chatHeader = document.createElement("div");
    chatHeader.style.cssText = `
      height: 70px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, ${config.primaryColor || '#3b82f6'} 0%, ${config.primaryColor || '#3b82f6'}dd 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
    `;

    const headerContent = document.createElement("div");
    headerContent.style.cssText = `
      display: flex;
      align-items: center;
      flex: 1;
      gap: 12px;
    `;

    const avatar = document.createElement("img");
    avatar.src = config.avatar || '/Default Avatar.png';
    avatar.style.cssText = `
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 3px solid rgba(255, 255, 255, 0.3);
      object-fit: cover;
    `;
    avatar.onerror = () => avatar.src = '/Default Avatar.png';

    const chatInfo = document.createElement("div");
    chatInfo.innerHTML = `
      <h3 style="font-weight: 600; font-size: 16px; margin: 0; line-height: 1.4;">${config.chatTitle || 'AI Assistant'}</h3>
      <p style="font-size: 13px; color: rgba(255, 255, 255, 0.85); margin: 2px 0 0 0;">${config.subtitle || 'Online'}</p>
    `;

    const closeButton = document.createElement("button");
    closeButton.style.cssText = `
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.9);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    `;
    closeButton.innerHTML = '×';

    headerContent.appendChild(avatar);
    headerContent.appendChild(chatInfo);
    chatHeader.appendChild(headerContent);
    chatHeader.appendChild(closeButton);

    // Zone des messages
    const messagesArea = document.createElement("div");
    messagesArea.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: ${config.theme === 'dark' ? 'rgba(17, 24, 39, 0.95)' : 'rgba(248, 250, 252, 0.95)'};
    `;

    // Zone d'input
    const inputArea = document.createElement("div");
    inputArea.style.cssText = `
      padding: 16px;
      border-top: 1px solid ${config.theme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)'};
      background: ${config.theme === 'dark' ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
      display: flex;
      gap: 12px;
      align-items: flex-end;
    `;

    const messageInput = document.createElement("input");
    messageInput.type = "text";
    messageInput.placeholder = config.placeholderText || "Type your message...";
    messageInput.style.cssText = `
      flex: 1;
      padding: 12px 16px;
      border: 1px solid ${config.theme === 'dark' ? 'rgba(75, 85, 99, 0.8)' : 'rgba(209, 213, 219, 0.8)'};
      border-radius: 24px;
      font-size: 14px;
      outline: none;
      background: ${config.theme === 'dark' ? 'rgba(55, 65, 81, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
      color: ${config.theme === 'dark' ? 'white' : '#111827'};
    `;

    const sendButton = document.createElement("button");
    sendButton.style.cssText = `
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      background: ${config.primaryColor || '#3b82f6'};
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    `;
    sendButton.innerHTML = '→';

    inputArea.appendChild(messageInput);
    inputArea.appendChild(sendButton);

    // Assembler la fenêtre
    chatWindow.appendChild(chatHeader);
    chatWindow.appendChild(messagesArea);
    chatWindow.appendChild(inputArea);

    // Assembler le widget
    widgetContainer.appendChild(chatButton);
    widgetContainer.appendChild(chatWindow);

    // Fonction pour afficher les messages
    function renderMessages() {
      messagesArea.innerHTML = '';
      messages.forEach(message => {
        const messageDiv = document.createElement("div");
        messageDiv.style.cssText = `
          display: flex;
          margin-bottom: 12px;
          ${message.isBot ? 'align-items: flex-start;' : 'align-items: flex-end; flex-direction: row-reverse;'}
        `;

        const bubble = document.createElement("div");
        bubble.style.cssText = `
          padding: 12px 16px;
          border-radius: 20px;
          max-width: 280px;
          word-break: break-word;
          ${message.isBot 
            ? `background: ${config.theme === 'dark' ? 'linear-gradient(135deg, #374151, #4b5563)' : 'linear-gradient(135deg, #e5e7eb, #f3f4f6)'}; color: ${config.theme === 'dark' ? 'white' : '#111827'};`
            : `background: ${config.primaryColor || '#3b82f6'}; color: white; margin-left: auto;`
          }
        `;
        bubble.textContent = message.text;

        if (message.isBot) {
          const botAvatar = document.createElement("img");
          botAvatar.src = config.avatar || '/Default Avatar.png';
          botAvatar.style.cssText = "width: 32px; height: 32px; border-radius: 50%; margin-right: 8px; flex-shrink: 0;";
          botAvatar.onerror = () => botAvatar.src = '/Default Avatar.png';
          messageDiv.appendChild(botAvatar);
        }

        messageDiv.appendChild(bubble);
        messagesArea.appendChild(messageDiv);
      });

      // Scroll vers le bas
      messagesArea.scrollTop = messagesArea.scrollHeight;
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

      // Simuler typing
      isTyping = true;
      const typingDiv = document.createElement("div");
      typingDiv.style.cssText = "padding: 12px; font-style: italic; color: #666;";
      typingDiv.textContent = "AI is typing...";
      messagesArea.appendChild(typingDiv);

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
            }))
          })
        });

        const data = await response.json();
        
        // Enlever typing
        messagesArea.removeChild(typingDiv);
        
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
        messagesArea.removeChild(typingDiv);
        
        messages.push({
          id: (Date.now() + 1).toString(),
          text: "Sorry, something went wrong. Please try again.",
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
        chatWindow.style.opacity = '1';
        chatWindow.style.transform = 'scale(1) translateY(0)';
        chatWindow.style.pointerEvents = 'auto';
        chatButton.innerHTML = '×';
        messageInput.focus();
        renderMessages();
      } else {
        chatWindow.style.opacity = '0';
        chatWindow.style.transform = 'scale(0.95) translateY(16px)';
        chatWindow.style.pointerEvents = 'none';
        chatButton.innerHTML = '💬';
      }
    });

    closeButton.addEventListener('click', () => {
      isOpen = false;
      chatWindow.style.opacity = '0';
      chatWindow.style.transform = 'scale(0.95) translateY(16px)';
      chatWindow.style.pointerEvents = 'none';
      chatButton.innerHTML = '💬';
    });

    sendButton.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });

    // Ajouter au DOM
    document.body.appendChild(widgetContainer);

    console.log("✅ AI Chat Widget loaded successfully!");
  }
};