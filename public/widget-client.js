// widget-client.js - VERSION SIMPLE comme Intercom/Zendesk
window.AIChatWidget = {
  widgetId: null,
  config: null,
  isOpen: false,
  
  async init(options) {
    this.widgetId = options.widgetId;
    console.log('🚀 Widget initializing:', this.widgetId);
    
    try {
      await this.loadConfig();
      this.injectStyles();
      this.createWidget();
      console.log('✅ Widget ready');
    } catch (error) {
      console.error('❌ Widget error:', error);
    }
  },

  async loadConfig() {
    const response = await fetch('https://testyourainow.com/api/widget/' + this.widgetId + '/config');
    const data = await response.json();
    this.config = data.config;
  },

  injectStyles() {
    if (document.getElementById('ai-widget-styles')) return;
    
    const css = this.buildCSS();
    const style = document.createElement('style');
    style.id = 'ai-widget-styles';
    style.textContent = css;
    document.head.appendChild(style);
  },

  buildCSS() {
    return `
      .ai-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .ai-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        background: ${this.config.primaryColor};
        color: white;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }
      
      .ai-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(0,0,0,0.2);
      }
      
      .ai-chat {
        position: absolute;
        bottom: 0;
        right: 0;
        width: ${this.config.width}px;
        height: ${this.config.height}px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 5px 40px rgba(0,0,0,0.16);
        display: none;
        flex-direction: column;
        overflow: hidden;
      }
      
      .ai-chat.open {
        display: flex;
        animation: slideUp 0.3s ease;
      }
      
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      
      .ai-header {
        background: ${this.config.primaryColor};
        color: white;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .ai-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .ai-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.3);
      }
      
      .ai-title {
        font-weight: 600;
        margin: 0;
        font-size: 16px;
      }
      
      .ai-subtitle {
        font-size: 12px;
        opacity: 0.8;
        margin: 0;
      }
      
      .ai-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        opacity: 0.8;
      }
      
      .ai-close:hover {
        opacity: 1;
        background: rgba(255,255,255,0.1);
      }
      
      .ai-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: #f8f9fa;
      }
      
      .ai-message {
        margin-bottom: 12px;
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }
      
      .ai-message.user {
        flex-direction: row-reverse;
      }
      
      .ai-bubble {
        max-width: 80%;
        padding: 10px 14px;
        border-radius: 18px;
        font-size: 14px;
        line-height: 1.4;
      }
      
      .ai-bubble.bot {
        background: #e9ecef;
        color: #333;
      }
      
      .ai-bubble.user {
        background: ${this.config.primaryColor};
        color: white;
      }
      
      .ai-input-area {
        padding: 16px;
        background: white;
        border-top: 1px solid #e9ecef;
        display: flex;
        gap: 8px;
        align-items: center;
      }
      
      .ai-input {
        flex: 1;
        border: 1px solid #ddd;
        border-radius: 20px;
        padding: 10px 16px;
        font-size: 14px;
        outline: none;
      }
      
      .ai-input:focus {
        border-color: ${this.config.primaryColor};
      }
      
      .ai-send {
        background: ${this.config.primaryColor};
        border: none;
        color: white;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .ai-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .ai-typing {
        display: flex;
        gap: 4px;
        padding: 10px 14px;
        background: #e9ecef;
        border-radius: 18px;
        align-items: center;
      }
      
      .ai-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #999;
        animation: typing 1.4s infinite;
      }
      
      .ai-dot:nth-child(2) { animation-delay: 0.2s; }
      .ai-dot:nth-child(3) { animation-delay: 0.4s; }
      
      @keyframes typing {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-8px); }
      }
      
      @media (max-width: 768px) {
        .ai-chat {
          width: calc(100vw - 40px) !important;
          height: calc(100vh - 80px) !important;
          max-width: 400px;
        }
      }
    `;
  },

  createWidget() {
    const container = document.createElement('div');
    container.className = 'ai-widget';
    container.innerHTML = this.getHTML();
    document.body.appendChild(container);
    
    this.bindEvents();
    this.showWelcomeMessage();
  },

  getHTML() {
    return `
      <button class="ai-button" onclick="window.AIChatWidget.toggle()">
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
      </button>
      
      <div class="ai-chat" id="ai-chat">
        <div class="ai-header">
          <div class="ai-header-info">
            <img src="${this.config.avatar}" alt="Avatar" class="ai-avatar">
            <div>
              <div class="ai-title">${this.config.chatTitle}</div>
              <div class="ai-subtitle">${this.config.subtitle}</div>
            </div>
          </div>
          <button class="ai-close" onclick="window.AIChatWidget.close()">✕</button>
        </div>
        
        <div class="ai-messages" id="ai-messages"></div>
        
        <div class="ai-input-area">
          <input 
            type="text" 
            class="ai-input" 
            placeholder="${this.config.placeholderText}"
            id="ai-input"
          >
          <button class="ai-send" onclick="window.AIChatWidget.send()" id="ai-send">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  },

  bindEvents() {
    const input = document.getElementById('ai-input');
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.send();
      });
    }
  },

  showWelcomeMessage() {
    if (this.config.showWelcomeMessage && this.config.welcomeMessage) {
      setTimeout(() => {
        this.addMessage(this.config.welcomeMessage, true);
      }, 500);
    }
  },

  toggle() {
    const chat = document.getElementById('ai-chat');
    if (this.isOpen) {
      this.close();
    } else {
      chat.classList.add('open');
      this.isOpen = true;
      document.getElementById('ai-input').focus();
    }
  },

  close() {
    const chat = document.getElementById('ai-chat');
    chat.classList.remove('open');
    this.isOpen = false;
  },

  async send() {
    const input = document.getElementById('ai-input');
    const message = input.value.trim();
    if (!message) return;

    this.addMessage(message, false);
    input.value = '';
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
      this.addMessage(data.reply || 'Sorry, something went wrong.', true);
    } catch (error) {
      this.hideTyping();
      this.addMessage('Connection error. Please try again.', true);
    }
  },

  addMessage(text, isBot) {
    const messages = document.getElementById('ai-messages');
    const div = document.createElement('div');
    div.className = 'ai-message ' + (isBot ? 'bot' : 'user');
    
    div.innerHTML = `
      ${isBot ? '<img src="' + this.config.avatar + '" class="ai-avatar" style="width:24px;height:24px;">' : ''}
      <div class="ai-bubble ${isBot ? 'bot' : 'user'}">${text}</div>
    `;
    
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  },

  showTyping() {
    const messages = document.getElementById('ai-messages');
    const div = document.createElement('div');
    div.className = 'ai-message bot';
    div.id = 'ai-typing';
    div.innerHTML = `
      <img src="${this.config.avatar}" class="ai-avatar" style="width:24px;height:24px;">
      <div class="ai-typing">
        <div class="ai-dot"></div>
        <div class="ai-dot"></div>
        <div class="ai-dot"></div>
      </div>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  },

  hideTyping() {
    const typing = document.getElementById('ai-typing');
    if (typing) typing.remove();
  },

  getHistory() {
    const messages = document.querySelectorAll('.ai-message:not(#ai-typing)');
    return Array.from(messages).map(msg => {
      const isBot = msg.classList.contains('bot');
      const text = msg.querySelector('.ai-bubble').textContent;
      return {
        role: isBot ? 'assistant' : 'user',
        content: text
      };
    });
  }
};

console.log('🎯 AIChatWidget ready!');