// widget-client.js - VERSION PARFAITEMENT ISOLÉE
window.AIChatWidget = {
  widgetId: null,
  config: null,
  messages: [],
  isOpen: false,
  isTyping: false,
  shadowRoot: null,

  async init(options) {
    this.widgetId = options.widgetId;
    console.log('🚀 AIChatWidget - Version isolée');
    
    try {
      await this.loadConfig();
      this.createIsolatedWidget();
      console.log('✅ Widget isolé créé');
    } catch (error) {
      console.error('❌ Widget error:', error);
    }
  },

  async loadConfig() {
    const response = await fetch('https://testyourainow.com/api/widget/' + this.widgetId + '/config');
    const data = await response.json();
    this.config = data.config;
    
    if (this.config.showWelcomeMessage && this.config.welcomeMessage) {
      this.messages = [{
        id: 'welcome',
        text: this.config.welcomeMessage,
        isBot: true,
        timestamp: new Date()
      }];
    }
  },

  createIsolatedWidget() {
    // 🔒 ISOLATION TOTALE avec Shadow DOM
    const container = document.createElement('div');
    container.id = 'ai-chat-widget-root';
    
    // Style container pour isolation Z-index
    container.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      z-index: 2147483647 !important;
      pointer-events: none !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    `;
    
    // Créer Shadow DOM pour isolation totale
    this.shadowRoot = container.attachShadow({ mode: 'closed' });
    
    // Injecter CSS isolé
    this.injectIsolatedCSS();
    
    // Créer widget HTML
    this.createWidgetHTML();
    
    document.body.appendChild(container);
    this.setupInteractions();
    this.setupPopup();
  },

  injectIsolatedCSS() {
    const style = document.createElement('style');
    style.textContent = `
      /* 🔒 CSS COMPLÈTEMENT ISOLÉ - Reset total */
      * {
        box-sizing: border-box !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        outline: none !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
      
      :host {
        --primary-color: ${this.config.primaryColor};
        all: initial !important;
        display: block !important;
      }
      
      .widget-container {
        position: relative !important;
        pointer-events: auto !important;
        isolation: isolate !important;
      }
      
      /* Button - Style simple et efficace */
      .chat-button {
        width: 60px !important;
        height: 60px !important;
        border-radius: 50% !important;
        background: var(--primary-color) !important;
        color: white !important;
        border: none !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        font-size: 0 !important;
        overflow: hidden !important;
        position: relative !important;
      }
      
      .chat-button:hover {
        transform: scale(1.05) !important;
        box-shadow: 0 6px 20px rgba(0,0,0,0.15) !important;
      }
      
      .chat-button svg {
        width: 24px !important;
        height: 24px !important;
        fill: currentColor !important;
        pointer-events: none !important;
      }
      
      /* Popup */
      .chat-popup {
        position: absolute !important;
        bottom: 100% !important;
        right: 0 !important;
        margin-bottom: 12px !important;
        background: var(--primary-color) !important;
        color: white !important;
        padding: 8px 12px !important;
        border-radius: 12px !important;
        font-size: 13px !important;
        white-space: nowrap !important;
        max-width: 200px !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        animation: slideUp 0.3s ease !important;
        pointer-events: none !important;
      }
      
      .chat-popup::after {
        content: '' !important;
        position: absolute !important;
        bottom: -5px !important;
        right: 16px !important;
        width: 10px !important;
        height: 10px !important;
        background: var(--primary-color) !important;
        transform: rotate(45deg) !important;
      }
      
      /* Chat Window - Dimensions exactes */
      .chat-window {
        position: absolute !important;
        bottom: 0 !important;
        right: 0 !important;
        width: ${this.config.width}px !important;
        height: ${this.config.height}px !important;
        background: white !important;
        border-radius: 16px !important;
        box-shadow: 0 8px 40px rgba(0,0,0,0.12) !important;
        display: none !important;
        flex-direction: column !important;
        overflow: hidden !important;
        animation: chatOpen 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        border: 1px solid #e5e7eb !important;
      }
      
      .chat-window.open {
        display: flex !important;
      }
      
      .chat-window.dark {
        background: #1f2937 !important;
        border-color: #374151 !important;
      }
      
      /* Header */
      .chat-header {
        background: var(--primary-color) !important;
        color: white !important;
        padding: 16px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        min-height: 70px !important;
        flex-shrink: 0 !important;
      }
      
      .header-content {
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        flex: 1 !important;
      }
      
      .avatar {
        width: 40px !important;
        height: 40px !important;
        border-radius: 50% !important;
        border: 2px solid rgba(255,255,255,0.3) !important;
        object-fit: cover !important;
      }
      
      .chat-info h3 {
        font-size: 16px !important;
        font-weight: 600 !important;
        margin: 0 !important;
        color: white !important;
      }
      
      .chat-info p {
        font-size: 12px !important;
        opacity: 0.9 !important;
        margin: 2px 0 0 0 !important;
        color: white !important;
      }
      
      .header-actions {
        display: flex !important;
        gap: 8px !important;
      }
      
      .action-btn {
        width: 32px !important;
        height: 32px !important;
        border-radius: 50% !important;
        background: rgba(255,255,255,0.2) !important;
        color: white !important;
        border: none !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: background 0.2s !important;
      }
      
      .action-btn:hover {
        background: rgba(255,255,255,0.3) !important;
      }
      
      .action-btn svg {
        width: 16px !important;
        height: 16px !important;
        fill: currentColor !important;
      }
      
      /* Messages */
      .messages-area {
        flex: 1 !important;
        overflow-y: auto !important;
        padding: 16px !important;
        background: #f8f9fa !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 12px !important;
      }
      
      .messages-area.dark {
        background: #111827 !important;
      }
      
      .message {
        display: flex !important;
        align-items: flex-start !important;
        gap: 8px !important;
        max-width: 85% !important;
        animation: messageIn 0.3s ease !important;
      }
      
      .message.user {
        align-self: flex-end !important;
        flex-direction: row-reverse !important;
      }
      
      .message-avatar {
        width: 28px !important;
        height: 28px !important;
        border-radius: 50% !important;
        object-fit: cover !important;
        flex-shrink: 0 !important;
      }
      
      .message-bubble {
        padding: 10px 14px !important;
        border-radius: 16px !important;
        font-size: 14px !important;
        line-height: 1.4 !important;
        word-wrap: break-word !important;
        position: relative !important;
      }
      
      .message-bubble.bot {
        background: #e5e7eb !important;
        color: #1f2937 !important;
      }
      
      .message-bubble.user {
        background: var(--primary-color) !important;
        color: white !important;
      }
      
      .messages-area.dark .message-bubble.bot {
        background: #374151 !important;
        color: white !important;
      }
      
      .message-time {
        font-size: 11px !important;
        color: #6b7280 !important;
        margin-top: 4px !important;
        text-align: center !important;
      }
      
      /* Typing indicator */
      .typing-indicator {
        display: flex !important;
        align-items: center !important;
        gap: 4px !important;
        padding: 10px 14px !important;
        background: #e5e7eb !important;
        border-radius: 16px !important;
      }
      
      .typing-dot {
        width: 6px !important;
        height: 6px !important;
        border-radius: 50% !important;
        background: #9ca3af !important;
        animation: typing 1.4s infinite ease-in-out !important;
      }
      
      .typing-dot:nth-child(2) { animation-delay: 0.2s !important; }
      .typing-dot:nth-child(3) { animation-delay: 0.4s !important; }
      
      /* Input */
      .input-area {
        padding: 16px !important;
        background: white !important;
        border-top: 1px solid #e5e7eb !important;
        display: flex !important;
        gap: 8px !important;
        align-items: center !important;
        flex-shrink: 0 !important;
      }
      
      .input-area.dark {
        background: #1f2937 !important;
        border-color: #374151 !important;
      }
      
      .message-input {
        flex: 1 !important;
        padding: 10px 16px !important;
        border: 1px solid #d1d5db !important;
        border-radius: 20px !important;
        font-size: 14px !important;
        background: white !important;
        color: #1f2937 !important;
        resize: none !important;
        font-family: inherit !important;
      }
      
      .message-input:focus {
        border-color: var(--primary-color) !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
      }
      
      .message-input.dark {
        background: #374151 !important;
        border-color: #4b5563 !important;
        color: white !important;
      }
      
      .send-button {
        width: 36px !important;
        height: 36px !important;
        border-radius: 50% !important;
        background: var(--primary-color) !important;
        color: white !important;
        border: none !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: transform 0.2s !important;
      }
      
      .send-button:hover:not(:disabled) {
        transform: scale(1.05) !important;
      }
      
      .send-button:disabled {
        opacity: 0.5 !important;
        cursor: not-allowed !important;
      }
      
      .send-button svg {
        width: 16px !important;
        height: 16px !important;
        fill: currentColor !important;
      }
      
      /* Animations */
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes chatOpen {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      
      @keyframes messageIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes typing {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-6px); }
      }
      
      /* Scrollbar */
      .messages-area::-webkit-scrollbar {
        width: 4px !important;
      }
      
      .messages-area::-webkit-scrollbar-track {
        background: transparent !important;
      }
      
      .messages-area::-webkit-scrollbar-thumb {
        background: #cbd5e1 !important;
        border-radius: 2px !important;
      }
      
      /* Responsive */
      @media (max-width: 480px) {
        .chat-window {
          width: calc(100vw - 40px) !important;
          height: calc(100vh - 120px) !important;
          max-width: 360px !important;
        }
      }
    `;
    
    this.shadowRoot.appendChild(style);
  },

  createWidgetHTML() {
    const container = document.createElement('div');
    container.className = 'widget-container';
    
    const isDark = this.config.theme === 'dark';
    
    container.innerHTML = `
      <button class="chat-button" id="chat-toggle">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
      </button>
      
      <div class="chat-window ${isDark ? 'dark' : ''}" id="chat-window">
        <div class="chat-header">
          <div class="header-content">
            <img src="${this.config.avatar}" alt="Avatar" class="avatar" onerror="this.src='/Default Avatar.png'">
            <div class="chat-info">
              <h3>${this.config.chatTitle}</h3>
              <p>${this.config.subtitle}</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="action-btn" id="reset-btn" title="New conversation">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
            </button>
            <button class="action-btn" id="close-btn" title="Close">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="messages-area ${isDark ? 'dark' : ''}" id="messages"></div>
        
        <div class="input-area ${isDark ? 'dark' : ''}">
          <input type="text" class="message-input ${isDark ? 'dark' : ''}" placeholder="${this.config.placeholderText}" id="message-input">
          <button class="send-button" id="send-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    this.shadowRoot.appendChild(container);
    this.renderMessages();
  },

  setupInteractions() {
    const toggle = this.shadowRoot.getElementById('chat-toggle');
    const close = this.shadowRoot.getElementById('close-btn');
    const reset = this.shadowRoot.getElementById('reset-btn');
    const send = this.shadowRoot.getElementById('send-btn');
    const input = this.shadowRoot.getElementById('message-input');
    
    toggle.addEventListener('click', () => this.toggle());
    close.addEventListener('click', () => this.close());
    reset.addEventListener('click', () => this.reset());
    send.addEventListener('click', () => this.send());
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.send();
    });
  },

  setupPopup() {
    if (this.config.showPopup) {
      setTimeout(() => {
        if (!this.isOpen) {
          const container = this.shadowRoot.querySelector('.widget-container');
          const popup = document.createElement('div');
          popup.className = 'chat-popup';
          popup.textContent = this.config.popupMessage;
          container.appendChild(popup);
        }
      }, this.config.popupDelay * 1000);
    }
  },

  toggle() {
    const window = this.shadowRoot.getElementById('chat-window');
    const popup = this.shadowRoot.querySelector('.chat-popup');
    
    if (popup) popup.remove();
    
    if (this.isOpen) {
      window.classList.remove('open');
      this.isOpen = false;
    } else {
      window.classList.add('open');
      this.isOpen = true;
      this.shadowRoot.getElementById('message-input').focus();
    }
  },

  close() {
    const window = this.shadowRoot.getElementById('chat-window');
    window.classList.remove('open');
    this.isOpen = false;
    this.setupPopup();
  },

  reset() {
    this.messages = this.config.showWelcomeMessage ? 
      [{ id: 'welcome', text: this.config.welcomeMessage, isBot: true, timestamp: new Date() }] : [];
    this.renderMessages();
  },

  async send() {
    const input = this.shadowRoot.getElementById('message-input');
    const message = input.value.trim();
    if (!message) return;

    this.messages.push({
      id: Date.now().toString(),
      text: message,
      isBot: false,
      timestamp: new Date()
    });

    input.value = '';
    this.renderMessages();
    this.showTyping();

    try {
      const response = await fetch('https://testyourainow.com/api/agents/' + this.config.selectedAgent + '/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-public-kind': 'widget',
          'x-widget-id': this.widgetId,
          'x-widget-token': 'public'
        },
        body: JSON.stringify({
          message: message,
          previousMessages: this.getHistory(),
          welcomeMessage: this.config.welcomeMessage
        })
      });

      const data = await response.json();
      this.hideTyping();
      
      this.messages.push({
        id: Date.now().toString(),
        text: data.reply || 'Sorry, something went wrong.',
        isBot: true,
        timestamp: new Date()
      });
      
      this.renderMessages();
    } catch (error) {
      this.hideTyping();
      this.messages.push({
        id: Date.now().toString(),
        text: 'Connection error. Please try again.',
        isBot: true,
        timestamp: new Date()
      });
      this.renderMessages();
    }
  },

  renderMessages() {
    const container = this.shadowRoot.getElementById('messages');
    container.innerHTML = '';
    
    this.messages.forEach(message => {
      const div = document.createElement('div');
      div.className = `message ${message.isBot ? 'bot' : 'user'}`;
      
      div.innerHTML = `
        ${message.isBot ? `<img src="${this.config.avatar}" class="message-avatar" onerror="this.src='/Default Avatar.png'">` : ''}
        <div>
          <div class="message-bubble ${message.isBot ? 'bot' : 'user'}">${message.text}</div>
          <div class="message-time">${new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
        </div>
      `;
      
      container.appendChild(div);
    });
    
    container.scrollTop = container.scrollHeight;
  },

  showTyping() {
    const container = this.shadowRoot.getElementById('messages');
    const typing = document.createElement('div');
    typing.className = 'message bot';
    typing.id = 'typing';
    typing.innerHTML = `
      <img src="${this.config.avatar}" class="message-avatar" onerror="this.src='/Default Avatar.png'">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
  },

  hideTyping() {
    const typing = this.shadowRoot.getElementById('typing');
    if (typing) typing.remove();
  },

  getHistory() {
    return this.messages.map(msg => ({
      role: msg.isBot ? 'assistant' : 'user',
      content: msg.text
    }));
  }
};

console.log('🎯 AIChatWidget - Version isolée parfaite!');