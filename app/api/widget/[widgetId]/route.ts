import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ChatbotConfig } from "@/models/ChatbotConfig";

export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    const { widgetId } = params;
    
    await connectToDatabase();
    
    // Récupérer la config depuis la DB
    const rawConfig = await ChatbotConfig.findById(widgetId).lean();
    
    if (!rawConfig) {
      return new NextResponse('Widget not found', { status: 404 });
    }

    // Sérialiser la config
    const config = JSON.parse(JSON.stringify(rawConfig));

    // 🎯 HTML OPTIMISÉ POUR VERCEL
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${config.name || 'Chat Widget'}</title>
  
  <!-- ✅ TAILWIND CDN OPTIMISÉ -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- ✅ TES STYLES CUSTOM COMPLETS -->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    /* Configuration Tailwind avec tes animations */
    tailwind.config = {
      theme: {
        extend: {
          keyframes: {
            bounceDots: {
              "0%, 80%, 100%": { transform: "translateY(0)" },
              "40%": { transform: "translateY(-6px)" },
            },
            fadeIn: {
              "0%": { opacity: "0" },
              "100%": { opacity: "1" },
            },
            slideUpFade: {
              "0%": { opacity: "0", transform: "translateY(20px)" },
              "100%": { opacity: "1", transform: "translateY(0)" },
            },
          },
          animation: {
            bounceDots: "bounceDots 1.2s infinite ease-in-out both",
            "fade-in": "fadeIn 0.4s ease-out forwards",
            "slide-up-fade": "slideUpFade 0.5s ease-out forwards",
          },
        },
      },
    };

    /* Variables globales */
    :root {
      --background: #0a0a0b;
      --foreground: #ffffff;
    }

    body {
      background: var(--background);
      color: var(--foreground);
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
      overflow: hidden;
    }

    html {
      scroll-behavior: smooth;
      height: 100%;
      width: 100%;
    }

    /* Chat Widget Styles - IDENTIQUES AU DASHBOARD */
    .chat-widget {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      font-family: Inter, system-ui, sans-serif;
    }

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
      background: linear-gradient(135deg, var(--primary-color, #3b82f6), color-mix(in srgb, var(--primary-color, #3b82f6) 80%, #06b6d4));
    }

    .chat-button:hover {
      transform: scale(1.05);
      box-shadow: 
        0 8px 25px rgba(0, 0, 0, 0.2),
        0 0 0 1px rgba(59, 130, 246, 0.4),
        0 0 20px rgba(59, 130, 246, 0.3);
    }

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
      background: linear-gradient(135deg, var(--primary-color, #3b82f6), color-mix(in srgb, var(--primary-color, #3b82f6) 85%, #06b6d4));
      backdrop-filter: blur(16px);
    }

    .chat-popup::after {
      content: '';
      position: absolute;
      bottom: -6px;
      right: 24px;
      width: 12px;
      height: 12px;
      background: linear-gradient(135deg, var(--primary-color, #3b82f6), color-mix(in srgb, var(--primary-color, #3b82f6) 85%, #06b6d4));
      transform: rotate(45deg);
    }

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
    }

    .chat-window.dark {
      background: rgba(17, 24, 39, 0.98);
    }

    .chat-header {
      height: 70px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
      position: relative;
      background: linear-gradient(135deg, var(--primary-color, #3b82f6) 0%, color-mix(in srgb, var(--primary-color, #3b82f6) 85%, #06b6d4) 100%);
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
    }

    .chat-title {
      font-weight: 600;
      font-size: 16px;
      color: white;
      margin: 0;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .chat-subtitle {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.85);
      margin: 2px 0 0 0;
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
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

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: rgba(248, 250, 252, 0.95);
      min-height: 0;
      backdrop-filter: blur(10px);
    }

    .chat-messages.dark {
      background: rgba(17, 24, 39, 0.95);
    }

    .messages-container {
      transition: opacity 0.3s ease;
    }

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
      background: linear-gradient(135deg, var(--primary-color, #3b82f6), color-mix(in srgb, var(--primary-color, #3b82f6) 90%, #06b6d4));
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
      border-color: var(--primary-color, #3b82f6);
      box-shadow: 
        0 0 0 3px color-mix(in srgb, var(--primary-color, #3b82f6) 20%, transparent),
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
      border-color: var(--primary-color, #3b82f6);
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
      background: linear-gradient(135deg, var(--primary-color, #3b82f6), color-mix(in srgb, var(--primary-color, #3b82f6) 85%, #06b6d4));
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .chat-send-btn:hover:not(:disabled) {
      transform: scale(1.1);
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.2),
        0 0 0 3px color-mix(in srgb, var(--primary-color, #3b82f6) 20%, transparent);
    }

    .chat-send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    /* Animations */
    @keyframes bounceInSimple {
      0% { opacity: 0; transform: scale(0.8); }
      60% { opacity: 1; transform: scale(1.05); }
      100% { opacity: 1; transform: scale(1); }
    }

    .animate-bounce-in {
      animation: bounceInSimple 0.4s ease-out;
    }

    @keyframes slideInUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-slide-in-message {
      animation: slideInUp 0.3s ease-out;
    }

    @keyframes expandSimple {
      0% { opacity: 0; transform: scale(0.9); }
      100% { opacity: 1; transform: scale(1); }
    }

    .animate-expand-from-button {
      animation: expandSimple 0.3s ease-out;
    }

    @keyframes slideInMessage {
      0% { opacity: 0; transform: translateY(8px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    .animate-slide-in-message {
      animation: slideInMessage 0.2s ease-out forwards;
      opacity: 0;
    }

    @keyframes avatarPop {
      0% { opacity: 0; transform: scale(0.8); }
      100% { opacity: 1; transform: scale(1); }
    }

    .animate-avatar-pop {
      animation: avatarPop 0.2s ease-out forwards;
      opacity: 0;
    }

    @keyframes slideUp {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    .animate-slide-up {
      animation: slideUp 0.3s ease-out;
      animation-delay: 0.1s;
      animation-fill-mode: both;
      opacity: 0;
    }

    @keyframes typingSlideIn {
      0% { opacity: 0; transform: translateY(10px) scale(0.9); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    .animate-typing-bubble {
      animation: typingSlideIn 0.3s ease-out forwards;
      opacity: 0;
    }

    /* Tes animations custom */
    @keyframes bounceDots {
      0%, 80%, 100% { transform: translateY(0); opacity: 0.7; }
      40% { transform: translateY(-6px); opacity: 1; }
    }

    .animate-bounceDots {
      animation: bounceDots 1.2s infinite ease-in-out;
    }

    /* Scrollbar */
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { 
      background: rgba(17, 24, 39, 0.3); 
      border-radius: 8px; 
    }
    .custom-scrollbar::-webkit-scrollbar-thumb { 
      background: linear-gradient(to bottom, rgba(59, 130, 246, 0.6), rgba(6, 182, 212, 0.6)); 
      border-radius: 8px; 
    }
  </style>
</head>

<body>
  <div id="chat-widget-root"></div>
  
  <script>
    window.WIDGET_CONFIG = ${JSON.stringify(config)};
    
    class VanillaChatWidget {
      constructor(config) {
        this.config = config;
        this.messages = [];
        this.isOpen = false;
        this.isTyping = false;
        this.showPopup = false;
        this.init();
      }
      
      init() {
        this.createWidget();
        this.setupEventListeners();
        this.setupPopup();
        this.addWelcomeMessage();
        this.communicateWithParent();
      }
      
      createWidget() {
        const root = document.getElementById('chat-widget-root');
        root.innerHTML = \`
          <div class="chat-widget" style="--primary-color: \${this.config.primaryColor};">
            <div id="chat-popup" class="chat-popup" style="display: none;">
              \${this.config.popupMessage || 'Hi! Need any help?'}
            </div>
            
            <button id="chat-button" class="chat-button animate-bounce-in">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            
            <div id="chat-window" class="chat-window \${this.config.theme === 'dark' ? 'dark' : ''}" style="display: none; width: \${this.config.width}px; height: \${this.config.height}px;">
              <div class="chat-header">
                <div class="chat-header-content">
                  <div class="chat-avatar-container">
                    <img src="\${this.config.avatar || '/Default Avatar.png'}" alt="Bot" class="chat-avatar" onerror="this.src='/Default Avatar.png'"/>
                    <div class="chat-status"></div>
                  </div>
                  <div class="chat-info">
                    <h3 class="chat-title">\${this.config.chatTitle || this.config.name}</h3>
                    <p class="chat-subtitle">\${this.config.subtitle || 'En ligne'}</p>
                  </div>
                </div>
                <div class="chat-actions">
                  <button id="reset-btn" class="chat-action-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 4v6h6" stroke="currentColor" stroke-width="2"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10" stroke="currentColor" stroke-width="2"/></svg>
                  </button>
                  <button id="close-btn" class="chat-action-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/></svg>
                  </button>
                </div>
              </div>
              
              <div id="messages-area" class="chat-messages \${this.config.theme === 'dark' ? 'dark' : ''} custom-scrollbar">
                <div id="messages-container" class="messages-container"></div>
              </div>
              
              <div class="chat-input-area \${this.config.theme === 'dark' ? 'dark' : ''} animate-slide-up">
                <div class="chat-input-container">
                  <input id="message-input" type="text" placeholder="\${this.config.placeholderText || 'Tapez votre message...'}" class="chat-input \${this.config.theme === 'dark' ? 'dark' : ''}"/>
                  <button id="send-btn" class="chat-send-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" stroke-width="2"/><polygon points="22,2 15,22 11,13 2,9 22,2" fill="currentColor"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        \`;
      }
      
      setupEventListeners() {
        document.getElementById('chat-button')?.addEventListener('click', () => this.toggleChat());
        document.getElementById('close-btn')?.addEventListener('click', () => this.toggleChat());
        document.getElementById('reset-btn')?.addEventListener('click', () => this.resetChat());
        document.getElementById('send-btn')?.addEventListener('click', () => this.sendMessage());
        document.getElementById('message-input')?.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
          }
        });
      }
      
      setupPopup() {
        if (this.config.showPopup && this.config.popupMessage) {
          setTimeout(() => {
            if (!this.isOpen) this.showPopupBubble();
          }, this.config.popupDelay * 1000);
        }
      }
      
      showPopupBubble() {
        const popup = document.getElementById('chat-popup');
        if (popup && !this.isOpen) {
          popup.style.display = 'block';
          this.showPopup = true;
        }
      }
      
      hidePopupBubble() {
        const popup = document.getElementById('chat-popup');
        if (popup) {
          popup.style.display = 'none';
          this.showPopup = false;
        }
      }
      
      addWelcomeMessage() {
        if (this.config.showWelcomeMessage && this.config.welcomeMessage) {
          this.messages.push({
            id: 'welcome',
            text: this.config.welcomeMessage,
            isBot: true,
            timestamp: new Date()
          });
          this.renderMessages();
        }
      }
      
      toggleChat() {
        this.isOpen = !this.isOpen;
        const chatButton = document.getElementById('chat-button');
        const chatWindow = document.getElementById('chat-window');
        
        if (this.isOpen) {
          if (chatButton) chatButton.style.display = 'none';
          if (chatWindow) chatWindow.style.display = 'flex';
          this.hidePopupBubble();
          setTimeout(() => document.getElementById('message-input')?.focus(), 300);
          parent.postMessage({ type: 'WIDGET_OPEN', data: { width: this.config.width, height: this.config.height } }, '*');
        } else {
          if (chatButton) chatButton.style.display = 'flex';
          if (chatWindow) chatWindow.style.display = 'none';
          parent.postMessage({ type: 'WIDGET_CLOSE', data: {} }, '*');
        }
      }
      
      async sendMessage() {
        const input = document.getElementById('message-input');
        const text = input?.value?.trim();
        if (!text) return;
        
        this.messages.push({ id: Date.now().toString(), text, isBot: false, timestamp: new Date() });
        if (input) input.value = '';
        this.renderMessages();
        
        setTimeout(() => {
          this.isTyping = true;
          this.renderTyping();
        }, 200);
        
        try {
          const history = this.messages.filter(m => m.id !== 'welcome').map(m => ({ role: m.isBot ? 'assistant' : 'user', content: m.text }));
          const response = await fetch(\`/api/agents/\${this.config.selectedAgent}/ask\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-public-kind': 'widget', 'x-widget-id': this.config._id, 'x-widget-token': 'public' },
            body: JSON.stringify({ message: text, previousMessages: history, welcomeMessage: this.config.showWelcomeMessage ? this.config.welcomeMessage : null })
          });
          const data = await response.json();
          setTimeout(() => {
            this.isTyping = false;
            this.messages.push({ id: (Date.now() + 1).toString(), text: data.reply || "Désolé, erreur.", isBot: true, timestamp: new Date() });
            this.renderMessages();
          }, 800);
        } catch {
          setTimeout(() => {
            this.isTyping = false;
            this.messages.push({ id: (Date.now() + 1).toString(), text: "Erreur de connexion.", isBot: true, timestamp: new Date() });
            this.renderMessages();
          }, 800);
        }
      }
      
      resetChat() {
        this.messages = [];
        if (this.config.showWelcomeMessage && this.config.welcomeMessage) {
          this.messages.push({ id: 'welcome', text: this.config.welcomeMessage, isBot: true, timestamp: new Date() });
        }
        this.renderMessages();
      }
      
      renderMessages() {
        const container = document.getElementById('messages-container');
        if (!container) return;
        
        container.innerHTML = this.messages.map((m, i) => \`
          <div class="flex \${m.isBot ? 'items-start flex-row' : 'items-end flex-row-reverse'} mb-3">
            \${m.isBot ? \`<img src="\${this.config.avatar || '/Default Avatar.png'}" alt="Bot" class="w-8 h-8 rounded-full self-start mr-2" onerror="this.src='/Default Avatar.png'"/>\` : ''}
            <div class="flex flex-col max-w-sm relative">
              <div class="chat-bubble \${m.isBot ? 'bot' : 'user'}">
                \${m.text}
              </div>
              <div class="chat-timestamp \${m.isBot ? 'bot' : 'user'}">
                \${new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        \`).join('');
        
        this.scrollToBottom();
      }
      
      renderTyping() {
        const container = document.getElementById('messages-container');
        if (!container) return;
        
        if (this.isTyping) {
          const typingHtml = \`
            <div id="typing-indicator" class="flex items-start mb-3 flex-row">
              <img src="\${this.config.avatar || '/Default Avatar.png'}" alt="Bot" class="w-8 h-8 rounded-full self-start mr-2" onerror="this.src='/Default Avatar.png'"/>
              <div class="chat-bubble bot" style="display: flex; align-items: center; gap: 4px; padding: 12px 16px;">
                <span class="inline-block w-2 h-2 rounded-full animate-bounceDots" style="background-color: \${this.config.theme === 'dark' ? '#9ca3af' : '#6b7280'}; animation-delay: 0.5s;"></span>
                <span class="inline-block w-2 h-2 rounded-full animate-bounceDots" style="background-color: \${this.config.theme === 'dark' ? '#9ca3af' : '#6b7280'}; animation-delay: 0.7s;"></span>
                <span class="inline-block w-2 h-2 rounded-full animate-bounceDots" style="background-color: \${this.config.theme === 'dark' ? '#9ca3af' : '#6b7280'}; animation-delay: 0.9s;"></span>
              </div>
            </div>
          \`;
          container.insertAdjacentHTML('beforeend', typingHtml);
        } else {
          document.getElementById('typing-indicator')?.remove();
        }
        this.scrollToBottom();
      }
      
      scrollToBottom() {
        const messagesArea = document.getElementById('messages-area');
        if (messagesArea) {
          setTimeout(() => {
            messagesArea.scrollTop = messagesArea.scrollHeight;
          }, 100);
        }
      }
      
      communicateWithParent() {
        parent.postMessage({
          type: 'WIDGET_READY',
          data: { width: this.config.width, height: this.config.height }
        }, '*');
      }
    }
    
    document.addEventListener('DOMContentLoaded', function() {
      console.log('🚀 Initializing optimized chat widget...', window.WIDGET_CONFIG);
      window.chatWidget = new VanillaChatWidget(window.WIDGET_CONFIG);
    });
    
    window.addEventListener('error', function(e) {
      console.error('Widget error:', e);
      parent.postMessage({ type: 'WIDGET_ERROR', data: { error: e.message } }, '*');
    });
  </script>
</body>
</html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300',
      },
    });
    
  } catch (error) {
    console.error('Erreur API widget:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}