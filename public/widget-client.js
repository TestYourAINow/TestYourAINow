// widget-client.js - VERSION EXACTE de ton preview ChatWidget.tsx
window.AIChatWidget = {
  widgetId: null,
  config: null,
  messages: [],
  inputValue: '',
  isTyping: false,
  isOpen: false,
  showPopup: false,
  animateNewMessages: false,
  previousMessageCount: 0,

  async init(options) {
    this.widgetId = options.widgetId;
    console.log('🚀 AIChatWidget initializing with exact preview styling');
    
    try {
      await this.loadConfig();
      this.injectExactCSS();
      this.createExactWidget();
      this.initializeInteractions();
      console.log('✅ Widget ready with exact preview styling');
    } catch (error) {
      console.error('❌ Widget error:', error);
    }
  },

  async loadConfig() {
    const response = await fetch('https://testyourainow.com/api/widget/' + this.widgetId + '/config');
    const data = await response.json();
    this.config = data.config;
    
    // Initialize messages with welcome message if enabled
    if (this.config.showWelcomeMessage && this.config.welcomeMessage) {
      this.messages = [{
        id: 'welcome',
        text: this.config.welcomeMessage,
        isBot: true,
        timestamp: new Date()
      }];
      this.previousMessageCount = 1;
    }
  },

  injectExactCSS() {
    if (document.getElementById('ai-widget-exact-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'ai-widget-exact-styles';
    // CSS EXACT depuis ton globals.css
    style.textContent = `
/* Variables CSS - EXACT depuis ton globals.css */
.chat-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --primary-color: ${this.config.primaryColor};
}

/* Chat Button - EXACT */
.chat-button {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(59, 130, 246, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 80%, #06b6d4));
}

.chat-button:hover {
  transform: scale(1.05);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(59, 130, 246, 0.4),
    0 0 20px rgba(59, 130, 246, 0.3);
}

/* Popup Bubble - EXACT */
.chat-popup {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 16px;
  max-width: 240px;
  padding: 12px 16px;
  border-radius: 16px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(75, 85, 99, 0.2);
  font-size: 14px;
  color: white;
  white-space: nowrap;
  background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 85%, #06b6d4));
  backdrop-filter: blur(16px);
}

.chat-popup::after {
  content: '';
  position: absolute;
  bottom: -6px;
  right: 24px;
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 85%, #06b6d4));
  transform: rotate(45deg);
}

/* Chat Window - EXACT */
.chat-window {
  position: absolute;
  bottom: 0;
  right: 0;
  border-radius: 20px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(75, 85, 99, 0.2);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: bottom right;
  display: flex;
  flex-direction: column;
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 100px);
  min-height: 300px;
  border: none;
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(20px);
  width: ${this.config.width}px;
  height: ${this.config.height}px;
}

.chat-window.dark {
  background: rgba(17, 24, 39, 0.98);
}

/* Chat Header - EXACT */
.chat-header {
  height: 70px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  position: relative;
  background: linear-gradient(135deg, var(--primary-color) 0%, color-mix(in srgb, var(--primary-color) 85%, #06b6d4) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-header-content {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  gap: 12px;
}

.chat-avatar-container {
  position: relative;
  flex-shrink: 0;
}

.chat-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  object-fit: cover;
  display: block;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.chat-status {
  width: 14px;
  height: 14px;
  background: #10b981;
  border-radius: 50%;
  border: 3px solid white;
  position: absolute;
  bottom: 0;
  right: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.chat-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: visible;
  padding: 2px 0;
}

.chat-title {
  font-weight: 600;
  font-size: 16px;
  color: white;
  margin: 0;
  line-height: 1.4;
  white-space: nowrap;
  overflow: visible;
  text-overflow: ellipsis;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.chat-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  margin: 2px 0 0 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: visible;
  text-overflow: ellipsis;
  font-weight: 400;
}

.chat-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  align-items: center;
}

.chat-action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-action-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  color: white;
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.2);
}

/* Messages Area - EXACT */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: rgba(248, 250, 252, 0.95);
  min-height: 0;
  backdrop-filter: blur(10px);
  max-height: none;
}

.chat-messages.dark {
  background: rgba(17, 24, 39, 0.95);
}

.messages-container {
  transition: opacity 0.3s ease;
}

.messages-container.show {
  opacity: 1;
}

/* Chat Bubbles - EXACT */
.chat-bubble {
  padding: 12px 16px;
  border-radius: 20px;
  line-height: 1.5;
  word-break: break-word;
  margin-bottom: 2px;
  white-space: pre-line;
  display: inline-block;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.chat-bubble.bot {
  background: linear-gradient(135deg, #e5e7eb, #f3f4f6);
  color: #111827;
}

.chat-bubble.user {
  background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 90%, #06b6d4));
  color: white;
  align-self: flex-end;
}

.chat-messages.dark .chat-bubble.bot {
  background: linear-gradient(135deg, #374151, #4b5563);
  color: white;
  border-color: rgba(75, 85, 99, 0.3);
}

.chat-timestamp {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
  font-weight: 500;
}

.chat-timestamp.bot {
  text-align: left;
  padding-left: 4px;
}

.chat-timestamp.user {
  text-align: right;
  padding-right: 4px;
}

/* Input Area - EXACT */
.chat-input-area {
  padding: 16px;
  border-top: 1px solid rgba(229, 231, 235, 0.5);
  background: rgba(255, 255, 255, 0.95);
  flex-shrink: 0;
  backdrop-filter: blur(20px);
}

.chat-input-area.dark {
  border-top-color: rgba(75, 85, 99, 0.5);
  background: rgba(17, 24, 39, 0.95);
}

.chat-input-container {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid rgba(209, 213, 219, 0.8);
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  resize: none;
  max-height: 120px;
  min-height: 40px;
  background: rgba(255, 255, 255, 0.9);
  color: #111827;
  backdrop-filter: blur(10px);
}

.chat-input:focus {
  border-color: var(--primary-color);
  box-shadow: 
    0 0 0 3px color-mix(in srgb, var(--primary-color) 20%, transparent),
    0 4px 6px -1px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 1);
}

.chat-input.dark {
  background: rgba(55, 65, 81, 0.9);
  border-color: rgba(75, 85, 99, 0.8);
  color: white;
}

.chat-input.dark::placeholder {
  color: #9ca3af;
}

.chat-input.dark:focus {
  background: rgba(55, 65, 81, 1);
  border-color: var(--primary-color);
}

.chat-send-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 85%, #06b6d4));
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chat-send-btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.2),
    0 0 0 3px color-mix(in srgb, var(--primary-color) 20%, transparent);
}

.chat-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Animations EXACTES depuis ton globals.css */
@keyframes bounceInSimple {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  60% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-bounce-in {
  animation: bounceInSimple 0.4s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-popup {
  animation: slideInUp 0.3s ease-out;
}

@keyframes expandSimple {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-expand-from-button {
  animation: expandSimple 0.3s ease-out;
}

@keyframes slideInMessage {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-in-message {
  animation: slideInMessage 0.2s ease-out forwards;
  opacity: 0;
}

@keyframes avatarPop {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-avatar-pop {
  animation: avatarPop 0.2s ease-out forwards;
  opacity: 0;
}

@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
  animation-delay: 0.1s;
  animation-fill-mode: both;
  opacity: 0;
}

@keyframes typingSlideIn {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-typing-bubble {
  animation: typingSlideIn 0.3s ease-out forwards;
  opacity: 0;
}

@keyframes bounceDots {
  0%, 80%, 100% { 
    transform: translateY(0);
    opacity: 0.7;
  } 
  40% { 
    transform: translateY(-6px);
    opacity: 1;
  }
}

.animate-bounceDots {
  animation: bounceDots 1.2s infinite ease-in-out;
}

@keyframes slideUpFade {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up-fade {
  animation: slideUpFade 0.2s ease-out forwards;
}

.animate-button-hover:hover:not(:disabled) {
  transform: scale(1.05);
}

/* Custom Scrollbar - EXACT */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(17, 24, 39, 0.3);
  border-radius: 8px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, rgba(59, 130, 246, 0.6), rgba(6, 182, 212, 0.6));
  border-radius: 8px;
  border: 1px solid rgba(75, 85, 99, 0.3);
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, rgba(59, 130, 246, 0.8), rgba(6, 182, 212, 0.8));
}

/* Responsive - EXACT */
@media (max-height: 600px) {
  .chat-window {
    max-height: calc(100vh - 50px);
    min-height: 250px;
  }
}

@media (max-height: 480px) {
  .chat-window {
    max-height: calc(100vh - 30px);
    min-height: 200px;
  }
}
`;
    
    document.head.appendChild(style);
    console.log('🎨 Exact CSS injected successfully');
  },

  createExactWidget() {
    const container = document.createElement('div');
    container.className = 'chat-widget';
    container.id = 'ai-chat-widget-container';
    
    this.renderButton(container);
    document.body.appendChild(container);
    
    this.setupPopup();
  },

  renderButton(container) {
    container.innerHTML = `
      <button class="chat-button animate-bounce-in" onclick="window.AIChatWidget.openChat()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
    `;
  },

  renderChat(container) {
    const isDark = this.config.theme === 'dark';
    
    container.innerHTML = `
      <div class="chat-window animate-expand-from-button ${isDark ? 'dark' : ''}">
        <div class="chat-header">
          <div class="chat-header-content">
            <div class="chat-avatar-container">
              <img src="${this.config.avatar}" alt="Bot" class="chat-avatar" onerror="this.src='/Default Avatar.png'">
              <span class="chat-status"></span>
            </div>
            <div class="chat-info">
              <h3 class="chat-title">${this.config.chatTitle}</h3>
              <p class="chat-subtitle">${this.config.subtitle}</p>
            </div>
          </div>
          <div class="chat-actions">
            <button class="chat-action-btn" onclick="window.AIChatWidget.resetChat()" title="New conversation">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 4v6h6"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
            </button>
            <button class="chat-action-btn" onclick="window.AIChatWidget.closeChat()" title="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18"/>
                <path d="M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="chat-messages ${isDark ? 'dark' : ''} custom-scrollbar" id="ai-chat-messages">
          <div class="messages-container show" id="ai-messages-container">
            ${this.renderMessages()}
          </div>
        </div>

        <div class="chat-input-area ${isDark ? 'dark' : ''} animate-slide-up">
          <div class="chat-input-container">
            <input 
              type="text" 
              class="chat-input ${isDark ? 'dark' : ''}" 
              placeholder="${this.config.placeholderText}"
              id="ai-chat-input"
              value=""
            >
            <button 
              class="chat-send-btn animate-button-hover" 
              onclick="window.AIChatWidget.sendMessage()"
              id="ai-send-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13"/>
                <path d="M22 2l-7 20-4-9-9-4z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  renderMessages() {
    return this.messages.map((message, index) => {
      const shouldAnimate = this.animateNewMessages && index >= this.previousMessageCount - 1;
      const animationClass = shouldAnimate ? 'animate-slide-up-fade' : 'animate-slide-in-message';
      const animationDelay = shouldAnimate ? 
        `${(index - (this.previousMessageCount - 1)) * 0.1}s` : 
        `${index * 0.05}s`;
      
      return `
        <div class="flex ${message.isBot ? 'items-start' : 'items-end'} mb-3 ${message.isBot ? 'flex-row' : 'flex-row-reverse'} ${animationClass}"
             style="animation-delay: ${animationDelay}; animation-fill-mode: both;">
          ${message.isBot ? `
            <img src="${this.config.avatar}" alt="Bot Avatar" 
                 class="w-8 h-8 rounded-full self-start mr-2 animate-avatar-pop"
                 style="flex-shrink: 0; animation-delay: ${shouldAnimate ? `${(index - (this.previousMessageCount - 1)) * 0.1 + 0.05}s` : `${index * 0.05 + 0.05}s`}; animation-fill-mode: both;"
                 onerror="this.src='/Default Avatar.png'">
          ` : ''}
          <div class="flex flex-col max-w-sm relative">
            <div class="chat-bubble ${message.isBot ? 'bot' : 'user'}">
              ${message.text}
            </div>
            <div class="chat-timestamp ${message.isBot ? 'bot' : 'user'}">
              ${new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  setupPopup() {
    if (this.config.showPopup) {
      setTimeout(() => {
        if (!this.isOpen) {
          const container = document.getElementById('ai-chat-widget-container');
          if (container && !container.querySelector('.chat-popup')) {
            const popup = document.createElement('div');
            popup.className = 'chat-popup';
            popup.textContent = this.config.popupMessage;
            container.appendChild(popup);
            this.showPopup = true;
          }
        }
      }, this.config.popupDelay * 1000);
    }
  },

  initializeInteractions() {
    document.addEventListener('keypress', (e) => {
      const input = document.getElementById('ai-chat-input');
      if (input && e.target === input && e.key === 'Enter') {
        this.sendMessage();
      }
    });
  },

  openChat() {
    const container = document.getElementById('ai-chat-widget-container');
    if (!container) return;
    
    // Remove popup if showing
    const popup = container.querySelector('.chat-popup');
    if (popup) popup.remove();
    
    this.renderChat(container);
    this.isOpen = true;
    this.animateNewMessages = true;
    
    setTimeout(() => {
      const input = document.getElementById('ai-chat-input');
      if (input) input.focus();
      this.animateNewMessages = false;
    }, 300);
  },

  closeChat() {
    const container = document.getElementById('ai-chat-widget-container');
    if (!container) return;
    
    this.renderButton(container);
    this.isOpen = false;
    this.setupPopup();
  },

  resetChat() {
    const resetMessages = this.config.showWelcomeMessage && this.config.welcomeMessage ? 
      [{ id: 'welcome', text: this.config.welcomeMessage, isBot: true, timestamp: new Date() }] : [];
    
    this.messages = resetMessages;
    this.previousMessageCount = resetMessages.length;
    this.animateNewMessages = true;
    
    this.openChat();
    
    setTimeout(() => {
      this.animateNewMessages = false;
    }, 1000);
  },

  async sendMessage() {
    const input = document.getElementById('ai-chat-input');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    // Add user message
    const userMessage = {
      id: crypto.randomUUID(),
      text: message,
      isBot: false,
      timestamp: new Date()
    };
    
    this.messages.push(userMessage);
    input.value = '';
    
    // Re-render messages
    this.updateMessages();
    
    // Show typing after delay
    setTimeout(() => {
      this.showTyping();
    }, 200);
    
    try {
      const history = this.messages.map((msg) => ({
        role: msg.isBot ? 'assistant' : 'user',
        content: msg.text,
      }));

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
          previousMessages: history,
          welcomeMessage: this.config.showWelcomeMessage ? this.config.welcomeMessage : null,
        }),
      });

      const data = await response.json();
      
      setTimeout(() => {
        this.hideTyping();
        
        const botMessage = {
          id: crypto.randomUUID(),
          text: data.reply || 'Sorry, I couldn\'t process your request.',
          isBot: true,
          timestamp: new Date()
        };
        
        this.messages.push(botMessage);
        this.updateMessages();
      }, 800);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      setTimeout(() => {
        this.hideTyping();
        
        const errorMessage = {
          id: crypto.randomUUID(),
          text: "Sorry, I couldn't process your request.",
          isBot: true,
          timestamp: new Date()
        };
        
        this.messages.push(errorMessage);
        this.updateMessages();
      }, 800);
    }
  },

  updateMessages() {
    const container = document.getElementById('ai-messages-container');
    if (!container) return;
    
    // Trigger animation for new messages
    if (this.messages.length > this.previousMessageCount) {
      this.animateNewMessages = true;
      this.previousMessageCount = this.messages.length;
      setTimeout(() => this.animateNewMessages = false, 1000);
    }
    
    container.innerHTML = this.renderMessages();
    this.scrollToBottom();
  },

  showTyping() {
    const container = document.getElementById('ai-messages-container');
    if (!container) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'ai-typing-indicator';
    typingDiv.className = 'flex items-start mb-3 flex-row animate-slide-in-message';
    typingDiv.innerHTML = `
      <img src="${this.config.avatar}" alt="Bot" 
           class="w-8 h-8 rounded-full self-start mr-2 animate-avatar-pop"
           style="animation-delay: 0.1s; animation-fill-mode: both;"
           onerror="this.src='/Default Avatar.png'">
      <div class="chat-bubble bot animate-typing-bubble"
           style="display: flex; align-items: center; gap: 4px; padding: 12px 16px; animation-delay: 0.2s; animation-fill-mode: both;">
        ${[0, 1, 2].map(i => `
          <span class="inline-block w-2 h-2 rounded-full animate-bounceDots"
                style="background-color: ${this.config.theme === 'dark' ? '#9ca3af' : '#6b7280'}; animation-delay: ${0.5 + (i * 0.2)}s;"></span>
        `).join('')}
      </div>
    `;
    
    container.appendChild(typingDiv);
    this.scrollToBottom();
  },

  hideTyping() {
    const typingIndicator = document.getElementById('ai-typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  },

  scrollToBottom() {
    const messagesArea = document.getElementById('ai-chat-messages');
    if (messagesArea) {
      setTimeout(() => {
        messagesArea.scrollTop = messagesArea.scrollHeight;
      }, 100);
    }
  }
};

console.log('🎯 AIChatWidget ready - EXACT preview version!');