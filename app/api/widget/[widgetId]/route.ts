// app/api/widget/[widgetId]/route.ts - VERSION ENTREPRISE (comme Intercom)

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ChatbotConfig } from "@/models/ChatbotConfig";

export async function GET(
  req: NextRequest,
  context: any
) {
  const params = await context.params;
  const widgetId = params.widgetId;

  try {
    await connectToDatabase();
    
    const rawConfig = await ChatbotConfig.findById(widgetId).lean();
    
    if (!rawConfig) {
      console.error(`❌ Widget not found: ${widgetId}`);
      return new NextResponse(createErrorWidget(), { 
        status: 404,
        headers: getSecureHeaders()
      });
    }

    const config = JSON.parse(JSON.stringify(rawConfig));
    
    console.log(`✅ Loading widget ${widgetId}:`, { 
      name: config.name, 
      theme: config.theme 
    });

    // 🎯 HTML OPTIMISÉ IFRAME - Méthode Entreprise
    const htmlContent = createWidgetHTML(config);

    return new NextResponse(htmlContent, {
      status: 200,
      headers: getSecureHeaders()
    });

  } catch (error) {
    console.error('❌ Widget loading error:', error);
    return new NextResponse(createErrorWidget(), {
      status: 500,
      headers: getSecureHeaders()
    });
  }
}

// 🛡️ Headers sécurisés comme les entreprises
function getSecureHeaders() {
  return {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    "X-Frame-Options": "SAMEORIGIN", // ✅ Plus sécurisé que ALLOWALL
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// 🎨 Widget HTML optimisé iframe
function createWidgetHTML(config: any) {
  const isDark = config.theme === 'dark';
  const primaryColor = config.primaryColor || '#3b82f6';
  
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <title>${config.name || 'Chat'}</title>
  <style>
    /* 🔥 CSS DÉFENSIF ENTREPRISE - Méthode Intercom */
    *, *::before, *::after {
      box-sizing: border-box !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    html {
      height: 100% !important;
      width: 100% !important;
      overflow: hidden !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
    }
    
    body {
      height: 100% !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
      background: transparent !important;
      font-family: inherit !important;
      font-size: 14px !important;
      line-height: 1.4 !important;
      color: ${isDark ? '#ffffff' : '#000000'} !important;
    }
    
    /* 🎯 ROOT CONTAINER - Position absolue pour iframe */
    .widget-root {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100% !important;
      height: 100% !important;
      display: flex !important;
      flex-direction: column !important;
      background: ${isDark ? '#1f2937' : '#ffffff'} !important;
      border-radius: 20px !important;
      overflow: hidden !important;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15) !important;
      --primary: ${primaryColor};
    }
    
    /* 📱 RESPONSIVE STATES */
    .widget-state-button {
      position: absolute !important;
      bottom: 24px !important;
      right: 24px !important;
      width: 64px !important;
      height: 64px !important;
      border-radius: 50% !important;
      border: none !important;
      background: linear-gradient(135deg, var(--primary), #06b6d4) !important;
      color: white !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
      transition: all 0.3s ease !important;
      z-index: 1000 !important;
    }
    
    .widget-state-button:hover {
      transform: scale(1.05) !important;
      box-shadow: 0 6px 20px rgba(0,0,0,0.2) !important;
    }
    
    .widget-state-chat {
      display: flex !important;
      flex-direction: column !important;
      height: 100% !important;
      width: 100% !important;
    }
    
    /* 🎨 HEADER PREMIUM */
    .widget-header {
      background: linear-gradient(135deg, var(--primary), #06b6d4) !important;
      padding: 16px 20px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      flex-shrink: 0 !important;
      border-radius: 20px 20px 0 0 !important;
    }
    
    .widget-header-info {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
    }
    
    .widget-avatar {
      width: 40px !important;
      height: 40px !important;
      border-radius: 50% !important;
      border: 2px solid rgba(255,255,255,0.3) !important;
      object-fit: cover !important;
    }
    
    .widget-header-text h3 {
      color: white !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      margin: 0 !important;
      line-height: 1.2 !important;
    }
    
    .widget-header-text p {
      color: rgba(255,255,255,0.8) !important;
      font-size: 12px !important;
      margin: 2px 0 0 0 !important;
      line-height: 1.2 !important;
    }
    
    .widget-header-actions {
      display: flex !important;
      gap: 8px !important;
    }
    
    .widget-action-btn {
      width: 32px !important;
      height: 32px !important;
      border: none !important;
      border-radius: 50% !important;
      background: rgba(255,255,255,0.2) !important;
      color: white !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: all 0.2s ease !important;
    }
    
    .widget-action-btn:hover {
      background: rgba(255,255,255,0.3) !important;
      transform: scale(1.1) !important;
    }
    
    /* 💬 MESSAGES AREA */
    .widget-messages {
      flex: 1 !important;
      padding: 20px !important;
      overflow-y: auto !important;
      background: ${isDark ? '#111827' : '#f8fafc'} !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 16px !important;
    }
    
    .widget-messages::-webkit-scrollbar {
      width: 4px !important;
    }
    
    .widget-messages::-webkit-scrollbar-thumb {
      background: var(--primary) !important;
      border-radius: 4px !important;
    }
    
    .widget-message {
      display: flex !important;
      gap: 12px !important;
      animation: slideUp 0.3s ease !important;
    }
    
    .widget-message.user {
      flex-direction: row-reverse !important;
    }
    
    .widget-message-avatar {
      width: 32px !important;
      height: 32px !important;
      border-radius: 50% !important;
      object-fit: cover !important;
      flex-shrink: 0 !important;
    }
    
    .widget-message-bubble {
      max-width: 260px !important;
      padding: 12px 16px !important;
      border-radius: 18px !important;
      font-size: 14px !important;
      line-height: 1.4 !important;
      word-wrap: break-word !important;
    }
    
    .widget-message.bot .widget-message-bubble {
      background: ${isDark ? '#374151' : '#ffffff'} !important;
      color: ${isDark ? '#ffffff' : '#374151'} !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
    }
    
    .widget-message.user .widget-message-bubble {
      background: var(--primary) !important;
      color: white !important;
    }
    
    /* ⌨️ INPUT AREA */
    .widget-input-area {
      padding: 20px !important;
      background: ${isDark ? '#1f2937' : '#ffffff'} !important;
      border-top: 1px solid ${isDark ? '#374151' : '#e5e7eb'} !important;
      flex-shrink: 0 !important;
    }
    
    .widget-input-container {
      display: flex !important;
      gap: 12px !important;
      align-items: flex-end !important;
    }
    
    .widget-input {
      flex: 1 !important;
      border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'} !important;
      border-radius: 20px !important;
      padding: 12px 16px !important;
      font-size: 14px !important;
      background: ${isDark ? '#374151' : '#ffffff'} !important;
      color: ${isDark ? '#ffffff' : '#374151'} !important;
      resize: none !important;
      outline: none !important;
      max-height: 120px !important;
      min-height: 44px !important;
      font-family: inherit !important;
      line-height: 1.4 !important;
    }
    
    .widget-input:focus {
      border-color: var(--primary) !important;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.1) !important;
    }
    
    .widget-send-btn {
      width: 44px !important;
      height: 44px !important;
      border: none !important;
      border-radius: 50% !important;
      background: var(--primary) !important;
      color: white !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      flex-shrink: 0 !important;
      transition: all 0.2s ease !important;
    }
    
    .widget-send-btn:hover:not(:disabled) {
      transform: scale(1.05) !important;
      box-shadow: 0 4px 12px rgba(59,130,246,0.3) !important;
    }
    
    .widget-send-btn:disabled {
      opacity: 0.5 !important;
      cursor: not-allowed !important;
      transform: none !important;
    }
    
    /* 🎭 TYPING INDICATOR */
    .widget-typing {
      display: flex !important;
      gap: 4px !important;
      padding: 12px 16px !important;
      background: ${isDark ? '#374151' : '#ffffff'} !important;
      border-radius: 18px !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
    }
    
    .widget-typing-dot {
      width: 8px !important;
      height: 8px !important;
      border-radius: 50% !important;
      background: #9ca3af !important;
      animation: typing 1.4s infinite ease-in-out !important;
    }
    
    .widget-typing-dot:nth-child(2) { animation-delay: 0.2s !important; }
    .widget-typing-dot:nth-child(3) { animation-delay: 0.4s !important; }
    
    /* 🎪 POPUP */
    .widget-popup {
      position: absolute !important;
      bottom: 80px !important;
      right: 24px !important;
      max-width: 200px !important;
      padding: 12px 16px !important;
      background: var(--primary) !important;
      color: white !important;
      border-radius: 12px !important;
      font-size: 13px !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
      animation: slideUp 0.3s ease !important;
      z-index: 999 !important;
    }
    
    .widget-popup::after {
      content: '' !important;
      position: absolute !important;
      bottom: -6px !important;
      right: 20px !important;
      width: 12px !important;
      height: 12px !important;
      background: var(--primary) !important;
      transform: rotate(45deg) !important;
    }
    
    /* 🎬 ANIMATIONS */
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes typing {
      0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
      40% { transform: translateY(-8px); opacity: 1; }
    }
    
    /* 🎯 UTILITY CLASSES */
    .hidden { display: none !important; }
    .visible { display: block !important; }
  </style>
</head>
<body>
  <div class="widget-root" id="widgetRoot">
    
    <!-- 🔘 BUTTON STATE -->
    <button class="widget-state-button hidden" id="chatButton">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"/>
      </svg>
    </button>
    
    <!-- 💭 POPUP -->
    ${config.showPopup && config.popupMessage ? `
    <div class="widget-popup hidden" id="widgetPopup">
      ${config.popupMessage}
    </div>
    ` : ''}
    
    <!-- 💬 CHAT STATE -->
    <div class="widget-state-chat" id="chatWindow">
      
      <!-- HEADER -->
      <div class="widget-header">
        <div class="widget-header-info">
          <img src="${config.avatar || '/Default Avatar.png'}" alt="Avatar" class="widget-avatar" onerror="this.src='/Default Avatar.png'">
          <div class="widget-header-text">
            <h3>${config.chatTitle || config.name || 'Assistant'}</h3>
            <p>${config.subtitle || 'En ligne'}</p>
          </div>
        </div>
        <div class="widget-header-actions">
          <button class="widget-action-btn" id="resetBtn" title="Nouvelle conversation">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
          </button>
          <button class="widget-action-btn" id="closeBtn" title="Fermer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- MESSAGES -->
      <div class="widget-messages" id="messagesArea">
        <div id="messagesContainer">
          ${config.showWelcomeMessage && config.welcomeMessage ? `
          <div class="widget-message bot">
            <img src="${config.avatar || '/Default Avatar.png'}" alt="Bot" class="widget-message-avatar" onerror="this.src='/Default Avatar.png'">
            <div class="widget-message-bubble">${config.welcomeMessage}</div>
          </div>
          ` : ''}
        </div>
      </div>
      
      <!-- INPUT -->
      <div class="widget-input-area">
        <div class="widget-input-container">
          <textarea 
            class="widget-input" 
            id="messageInput" 
            placeholder="${config.placeholderText || 'Tapez votre message...'}"
            rows="1"
          ></textarea>
          <button class="widget-send-btn" id="sendBtn" disabled>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10L17 12 2 14Z"/>
            </svg>
          </button>
        </div>
      </div>
      
    </div>
  </div>
  
  <script>
    // 🚀 WIDGET ENTERPRISE LOGIC
    const config = ${JSON.stringify(config)};
    let isOpen = false;
    let isTyping = false;
    let messages = [];
    
    // 🎯 DOM ELEMENTS
    const elements = {
      root: document.getElementById('widgetRoot'),
      button: document.getElementById('chatButton'),
      popup: document.getElementById('widgetPopup'),
      chat: document.getElementById('chatWindow'),
      messages: document.getElementById('messagesContainer'),
      input: document.getElementById('messageInput'),
      sendBtn: document.getElementById('sendBtn'),
      resetBtn: document.getElementById('resetBtn'),
      closeBtn: document.getElementById('closeBtn')
    };
    
    // 🎪 EVENT LISTENERS
    elements.button?.addEventListener('click', openChat);
    elements.closeBtn?.addEventListener('click', closeChat);
    elements.resetBtn?.addEventListener('click', resetChat);
    elements.sendBtn?.addEventListener('click', sendMessage);
    
    elements.input?.addEventListener('input', function() {
      elements.sendBtn.disabled = !this.value.trim();
      autoResize(this);
    });
    
    elements.input?.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    
    // 🔧 FUNCTIONS
    function openChat() {
      isOpen = true;
      elements.button?.classList.add('hidden');
      elements.popup?.classList.add('hidden');
      elements.chat?.classList.remove('hidden');
      setTimeout(() => elements.input?.focus(), 100);
      notifyParent('WIDGET_OPEN');
    }
    
    function closeChat() {
      isOpen = false;
      elements.chat?.classList.add('hidden');
      elements.button?.classList.remove('hidden');
      notifyParent('WIDGET_CLOSE');
    }
    
    function resetChat() {
      elements.messages.innerHTML = '';
      messages = [];
      if (config.showWelcomeMessage && config.welcomeMessage) {
        addMessage(config.welcomeMessage, true);
      }
    }
    
    async function sendMessage() {
      const text = elements.input?.value?.trim();
      if (!text) return;
      
      addMessage(text, false);
      elements.input.value = '';
      elements.sendBtn.disabled = true;
      autoResize(elements.input);
      
      showTyping();
      
      try {
        const response = await fetch(\`/api/agents/\${config.selectedAgent}/ask\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-public-kind': 'widget',
            'x-widget-id': config._id,
            'x-widget-token': 'public'
          },
          body: JSON.stringify({
            message: text,
            previousMessages: messages.map(m => ({ 
              role: m.isBot ? 'assistant' : 'user', 
              content: m.text 
            })),
            welcomeMessage: config.showWelcomeMessage ? config.welcomeMessage : null
          })
        });
        
        const data = await response.json();
        hideTyping();
        addMessage(data.reply || "Désolé, je n'ai pas pu traiter votre demande.", true);
      } catch (error) {
        console.error('❌ Send error:', error);
        hideTyping();
        addMessage("Désolé, une erreur s'est produite.", true);
      }
    }
    
    function addMessage(text, isBot) {
      const messageDiv = document.createElement('div');
      messageDiv.className = \`widget-message \${isBot ? 'bot' : 'user'}\`;
      
      if (isBot) {
        messageDiv.innerHTML = \`
          <img src="\${config.avatar || '/Default Avatar.png'}" alt="Bot" class="widget-message-avatar" onerror="this.src='/Default Avatar.png'">
          <div class="widget-message-bubble">\${text}</div>
        \`;
      } else {
        messageDiv.innerHTML = \`
          <div class="widget-message-bubble">\${text}</div>
        \`;
      }
      
      elements.messages?.appendChild(messageDiv);
      messages.push({ text, isBot, timestamp: new Date() });
      scrollToBottom();
    }
    
    function showTyping() {
      isTyping = true;
      const typingDiv = document.createElement('div');
      typingDiv.id = 'typingIndicator';
      typingDiv.className = 'widget-message bot';
      typingDiv.innerHTML = \`
        <img src="\${config.avatar || '/Default Avatar.png'}" alt="Bot" class="widget-message-avatar" onerror="this.src='/Default Avatar.png'">
        <div class="widget-typing">
          <div class="widget-typing-dot"></div>
          <div class="widget-typing-dot"></div>
          <div class="widget-typing-dot"></div>
        </div>
      \`;
      elements.messages?.appendChild(typingDiv);
      scrollToBottom();
    }
    
    function hideTyping() {
      isTyping = false;
      document.getElementById('typingIndicator')?.remove();
    }
    
    function autoResize(textarea) {
      textarea.style.height = 'auto';
      const height = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = height + 'px';
    }
    
    function scrollToBottom() {
      const messagesArea = document.getElementById('messagesArea');
      if (messagesArea) {
        setTimeout(() => {
          messagesArea.scrollTop = messagesArea.scrollHeight;
        }, 50);
      }
    }
    
    function notifyParent(type, data = {}) {
      try {
        window.parent.postMessage({ 
          type, 
          data: { ...data, width: config.width, height: config.height } 
        }, '*');
      } catch (e) {
        console.log('Parent notification failed:', e);
      }
    }
    
    // 🎪 INIT
    function init() {
      console.log('✅ Widget loaded:', config.name);
      
      // Auto popup
      if (config.showPopup && config.popupMessage && elements.popup) {
        setTimeout(() => {
          if (!isOpen) elements.popup?.classList.remove('hidden');
        }, config.popupDelay * 1000);
      }
      
      // Notify parent
      notifyParent('WIDGET_READY');
    }
    
    // 🚀 START
    init();
  </script>
</body>
</html>`;
}

// 💥 Widget d'erreur simple
function createErrorWidget() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Widget Error</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      display: flex; 
      align-items: center; 
      justify-content: center; 
      height: 100vh; 
      margin: 0; 
      background: #f5f5f5;
      color: #666;
    }
    .error { text-align: center; }
  </style>
</head>
<body>
  <div class="error">
    <h3>Widget temporairement indisponible</h3>
    <p>Veuillez réessayer dans quelques instants.</p>
  </div>
</body>
</html>`;
}