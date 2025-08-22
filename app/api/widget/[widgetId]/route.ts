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
    
    // Récupérer la config depuis la DB
    const rawConfig = await ChatbotConfig.findById(widgetId).lean();
    
    if (!rawConfig) {
      return new NextResponse('Widget not found', { status: 404 });
    }

    const config = JSON.parse(JSON.stringify(rawConfig));
    const isDark = config.theme === 'dark';

    // 🎯 HTML COMPLET SANS NEXT.JS
    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${config.name || 'Chat Widget'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
      overflow: hidden !important;
      font-family: Inter, system-ui, sans-serif;
      height: 100vh !important;
      width: 100vw !important;
      position: relative !important;
    }
    
.chat-widget {
      position: fixed !important;
      bottom: 8px !important;
      right: 8px !important;
      z-index: 999999 !important;
      font-family: Inter, system-ui, sans-serif;
      --primary-color: ${config.primaryColor || '#3b82f6'};
    }
    
    .chat-button {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 80%, #06b6d4));
      animation: bounceIn 0.6s ease-out;
    }
    
    .chat-button:hover {
      transform: scale(1.05);
      box-shadow: 0 3px 9px rgba(0, 0, 0, 0.15);
    }
    
.chat-popup {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 16px;
  max-width: 180px;
  padding: 10px 8px 10px 10px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  color: white;
  background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 85%, #06b6d4));
  animation: slideUp 0.3s ease-out;
  word-wrap: break-word;
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
    
    .chat-window {
      position: absolute;
      bottom: 0;
      right: 0;
      width: calc(100vw - 20px);
      height: calc(100vh - 20px);
      border-radius: 20px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: ${isDark ? '#1f2937' : '#ffffff'};
      animation: expandIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .chat-header {
      height: 64px;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, var(--primary-color) 0%, color-mix(in srgb, var(--primary-color) 85%, #06b6d4) 100%);
    }
    
    .chat-header-content {
      display: flex;
      align-items: center;
      flex: 1;
      gap: 12px;
    }
    
    .chat-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.3);
      object-fit: cover;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .chat-status {
      width: 12px;
      height: 12px;
      background: #10b981;
      border-radius: 50%;
      border: 2px solid white;
      position: absolute;
      bottom: -1px;
      right: -1px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
    
    .chat-title {
      font-weight: 600;
      font-size: 15px;
      color: white;
      margin: 0;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
    
    .chat-subtitle {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.85);
      margin: 1px 0 0 0;
      font-weight: 400;
    }
    
    .chat-actions {
      display: flex;
      gap: 6px;
    }
    
    .chat-action-btn {
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
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .chat-action-btn:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: scale(1.05);
    }
    
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: ${isDark ? '#111827' : '#f8fafc'};
    }
    
    .chat-messages::-webkit-scrollbar {
      width: 6px;
    }
    
    .chat-messages::-webkit-scrollbar-thumb {
      background: linear-gradient(to bottom, rgba(59, 130, 246, 0.6), rgba(6, 182, 212, 0.6));
      border-radius: 8px;
    }
    
    .message {
      display: flex;
      margin-bottom: 8px;
      animation: slideInMessage 0.3s ease-out;
    }
    
    .message.user {
      flex-direction: row-reverse;
    }
    
    .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      margin: 0 8px 0 0;
      object-fit: cover;
    }
    
    .message-bubble {
      padding: 10px 14px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.4;
      max-width: 280px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(0, 0, 0, 0.04);
    }
    
    .message-bubble.bot {
      background: ${isDark ? '#374151' : '#f1f5f9'};
      color: ${isDark ? 'white' : '#334155'};
    }
    
    .message-bubble.user {
      background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 90%, #06b6d4));
      color: white;
    }
    
    .message-timestamp {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 4px;
    }
    
    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 12px 16px;
      background: ${isDark ? '#374151' : '#f1f5f9'};
      border-radius: 18px;
    }
    
    .typing-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${isDark ? '#9ca3af' : '#6b7280'};
      animation: typingBounce 1.4s infinite ease-in-out;
    }
    
    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }
    
    .chat-input-area {
      padding: 12px 16px;
      border-top: 1px solid ${isDark ? 'rgba(75, 85, 99, 0.4)' : 'rgba(229, 231, 235, 0.6)'};
      background: ${isDark ? '#1f2937' : '#ffffff'};
    }
    
    .chat-input-container {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    
    .chat-input {
      flex: 1;
      padding: 8px 14px;
      border: 1px solid ${isDark ? 'rgba(75, 85, 99, 0.8)' : 'rgba(209, 213, 219, 0.6)'};
      border-radius: 18px;
      font-size: 14px;
      outline: none;
      background: ${isDark ? 'rgba(55, 65, 81, 0.9)' : '#ffffff'};
      color: ${isDark ? 'white' : '#111827'};
      resize: none;
      min-height: 32px;
      max-height: 120px;
      font-family: inherit;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .chat-input:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color) 15%, transparent);
    }
    
    .chat-input::-webkit-scrollbar {
      width: 4px;
    }
    
    .chat-input::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 10px;
    }
    
    .chat-send-btn {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 85%, #06b6d4));
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .chat-send-btn:hover:not(:disabled) {
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }
    
    .chat-send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .hidden { display: none !important; }
    
    @keyframes bounceIn {
      0% { opacity: 0; transform: scale(0.3); }
      50% { opacity: 1; transform: scale(1.03); }
      100% { opacity: 1; transform: scale(1); }
    }
    
    @keyframes expandIn {
      0% { opacity: 0; transform: scale(0.8) translateY(20px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    
    @keyframes slideUp {
      0% { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideInMessage {
      0% { opacity: 0; transform: translateY(8px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes typingBounce {
      0%, 80%, 100% { transform: translateY(0); opacity: 0.7; }
      40% { transform: translateY(-6px); opacity: 1; }
    }

    /* 🎯 MOBILE ONLY - Desktop non affecté */
@media only screen and (max-width: 767px) and (hover: none) and (pointer: coarse) {
  /* Popup mobile plus large */
  .chat-popup {
    max-width: calc(100vw - 120px) !important;
    right: -20px !important;
    font-size: 13px !important;
    padding: 8px 6px 8px 8px !important;
  }
  
  .chat-popup::after {
    right: 40px !important;
  }
  
  /* Chat window fullscreen sur mobile */
  .chat-window {
    position: fixed !important;
    top: 0px !important;
    left: 0px !important;
    right: 0px !important;
    bottom: 0px !important;
    border-radius: 0 !important;
  }
  
  /* Header mobile plus compact */
  .chat-header {
    height: 56px !important;
    padding: 8px 12px !important;
  }
  
  .chat-avatar {
    width: 36px !important;
    height: 36px !important;
  }
  
  .chat-title {
    font-size: 14px !important;
  }
  
  .chat-subtitle {
    font-size: 11px !important;
  }
  
  .chat-action-btn {
    width: 32px !important;
    height: 32px !important;
  }
  
  /* Input mobile optimisé */
.chat-input-area {
  position: sticky !important;  /* Au lieu de relative */
  bottom: 0 !important;
  background: ${isDark ? '#1f2937' : '#ffffff'} !important;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1) !important;
  z-index: 10 !important;
}
  
.chat-input {
  font-size: 16px !important;
  transform: translateZ(0) !important;
}
  
  .chat-send-btn {
    width: 44px !important;
    height: 44px !important;
  }
  
  /* Scroll mobile amélioré */
  .chat-messages {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
      padding-bottom: 0 !important;  /* Le sticky input gère l'espace */
  height: calc(100vh - 56px - 60px) !important;
  }
}
  </style>
</head>

<body>
  <div class="chat-widget">
    <!-- Popup -->
    ${config.showPopup && config.popupMessage ? `
      <div class="chat-popup hidden" id="chatPopup">
        ${config.popupMessage}
      </div>
    ` : ''}
    
    <!-- Bouton -->
    <button class="chat-button" id="chatButton">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"/>
      </svg>
    </button>
    
    <!-- Fenêtre Chat -->
    <div class="chat-window hidden" id="chatWindow">
      <!-- Header -->
      <div class="chat-header">
        <div class="chat-header-content">
          <div style="position: relative;">
            <img src="${config.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEM0Q0RDgiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0iIzY5NzU4NSIvPgo8cGF0aCBkPSJNMzAgMzJDMzAgMjYuNDc3MSAyNS41MjI5IDIyIDIwIDIyQzE0LjQ3NzEgMjIgMTAgMjYuNDc3MSAxMCAzMkgzMFoiIGZpbGw9IiM2OTc1ODUiLz4KPC9zdmc+'}" alt="Avatar" class="chat-avatar">
            <div class="chat-status"></div>
          </div>
          <div>
            <div class="chat-title">${config.chatTitle || config.name}</div>
            <div class="chat-subtitle">${config.subtitle || 'En ligne'}</div>
          </div>
        </div>
        <div class="chat-actions">
          <button class="chat-action-btn" id="resetBtn" title="Nouvelle conversation">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
          </button>
          <button class="chat-action-btn" id="closeBtn" title="Fermer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Messages -->
      <div class="chat-messages" id="chatMessages">
        <div id="messagesContainer">
        </div>
      </div>
      
      <!-- Input -->
      <div class="chat-input-area">
        <div class="chat-input-container">
          <textarea 
            class="chat-input" 
            id="messageInput" 
            placeholder="${config.placeholderText || 'Tapez votre message...'}"
            rows="1"
          ></textarea>
          <button class="chat-send-btn" id="sendBtn" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10L17 12 2 14Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
  
<script>
    // Variables globales
    let isOpen = false;
    let isTyping = false;
    let messages = [];
    
    // Configuration
    const config = ${JSON.stringify(config)};
    
    // 💾 PERSISTANCE - NOUVEAU CODE ICI
    const STORAGE_KEY = 'chatbot_conversation_' + config._id;
    
    // Fonctions de sauvegarde
    function saveConversation() {
      try {
        const conversationData = {
          messages: messages,
          timestamp: Date.now(),
          isOpen: isOpen
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversationData));
      } catch (error) {
        console.log('Impossible de sauvegarder la conversation');
      }
    }
    
function loadConversation() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          
          // Vérifier que ce n'est pas trop vieux (1h max)
          const maxAge = 60 * 60 * 1000; // 1 heure
          if (Date.now() - data.timestamp < maxAge) {
            messages = data.messages || [];
            
            // Restaurer les messages dans le DOM
            if (messages.length > 0) {
              messagesContainer.innerHTML = '';
              messages.forEach(msg => {
                addMessageToDOM(msg.text, msg.isBot, msg.timestamp);
              });
            }
            
            // 🎯 FIX: Restaurer l'état ouvert CORRECTEMENT
            if (data.isOpen) {
              setTimeout(() => {
                isOpen = true;
                button?.classList.add('hidden');
                chatWindow?.classList.remove('hidden');
                popup?.classList.add('hidden');
                
                // 🎯 NOUVEAU: Envoyer message pour redimensionner l'iframe
                parent.postMessage({ 
                  type: 'WIDGET_OPEN', 
                  data: { width: config.width, height: config.height } 
                }, '*');
                
              }, 100);
            }
            
            return true;
          }
        }
      } catch (error) {
        console.log('Impossible de charger la conversation');
      }
      return false;
    }
    
    // Fonction pour ajouter au DOM sans sauvegarder
    function addMessageToDOM(text, isBot, timestamp = new Date()) {
      const messageEl = document.createElement('div');
      messageEl.className = 'message ' + (isBot ? 'bot' : 'user');
      
      if (isBot) {
        messageEl.innerHTML = 
          '<img src="' + (config.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEM0Q0RDgiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0iIzY5NzU4NSIvPgo8cGF0aCBkPSJNMzAgMzJDMzAgMjYuNDc3MSAyNS41MjI5IDIyIDIwIDIyQzE0LjQ3NzEgMjIgMTAgMjYuNDc3MSAxMCAzMkgzMFoiIGZpbGw9IiM2OTc1ODUiLz4KPC9zdmc>') + '" alt="Bot" class="message-avatar">' +
          '<div>' +
            '<div class="message-bubble bot">' + text + '</div>' +
            '<div class="message-timestamp">' + new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) + '</div>' +
          '</div>';
      } else {
        messageEl.innerHTML = 
          '<div>' +
            '<div class="message-bubble user">' + text + '</div>' +
            '<div class="message-timestamp">' + new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) + '</div>' +
          '</div>';
      }
      
      messagesContainer?.appendChild(messageEl);
    }
    // FIN PERSISTANCE
    
    // Éléments DOM
    const popup = document.getElementById('chatPopup');
    const button = document.getElementById('chatButton');
    const chatWindow = document.getElementById('chatWindow');
    const messagesContainer = document.getElementById('messagesContainer');
    const input = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const resetBtn = document.getElementById('resetBtn');
    const closeBtn = document.getElementById('closeBtn');
    
    // Event listeners
    button?.addEventListener('click', toggleChat);
    closeBtn?.addEventListener('click', closeChat);
    resetBtn?.addEventListener('click', resetChat);
    sendBtn?.addEventListener('click', sendMessage);
    
    input?.addEventListener('input', function() {
      sendBtn.disabled = !this.value.trim();
      this.style.height = 'auto';
      const newHeight = Math.min(this.scrollHeight, 120);
      this.style.height = newHeight + 'px';
      this.style.overflowY = newHeight >= 120 ? 'auto' : 'hidden';
    });
    
    input?.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    
    // Fonctions MODIFIÉES
    function toggleChat() {
      isOpen = !isOpen;
      if (isOpen) {
        button?.classList.add('hidden');
        chatWindow?.classList.remove('hidden');
        popup?.classList.add('hidden');
        
        // Message de bienvenue seulement si pas de conversation sauvée
        if (config.showWelcomeMessage && config.welcomeMessage && messages.length === 0) {
          setTimeout(() => {
            showTyping();
            
            setTimeout(() => {
              hideTyping();
              addMessage(config.welcomeMessage, true);
            }, 1500);
          }, 400);
        }
        
        setTimeout(() => input?.focus(), 300);
        parent.postMessage({ type: 'WIDGET_OPEN', data: { width: config.width, height: config.height } }, '*');
      } else {
        closeChat();
      }
      
      // 💾 SAUVEGARDER l'état
      saveConversation();
    }
    
    function closeChat() {
      isOpen = false;
      chatWindow?.classList.add('hidden');
      button?.classList.remove('hidden');
      parent.postMessage({ type: 'WIDGET_CLOSE', data: {} }, '*');
      
      // 💾 SAUVEGARDER l'état
      saveConversation();
    }
    
    function resetChat() {
      messagesContainer.innerHTML = '';
      messages = [];
      
      // 💾 SUPPRIMER la sauvegarde
      localStorage.removeItem(STORAGE_KEY);
      
      if (config.showWelcomeMessage && config.welcomeMessage) {
        addMessage(config.welcomeMessage, true);
      }
    }
    
    async function sendMessage() {
      const text = input?.value?.trim();
      if (!text) return;
      
      addMessage(text, false);
      input.value = '';
      input.style.height = '32px';
      sendBtn.disabled = true;
      
      showTyping();
      
      try {
        const response = await fetch('/api/agents/' + config.selectedAgent + '/ask', {
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
        console.error('Erreur:', error);
        hideTyping();
        addMessage("Désolé, une erreur s'est produite. Veuillez réessayer.", true);
      }
    }
    
    // 💾 FONCTION addMessage MODIFIÉE
    function addMessage(text, isBot) {
      const timestamp = new Date();
      
      // Ajouter au DOM
      addMessageToDOM(text, isBot, timestamp);
      
      // Ajouter aux données
      messages.push({ text, isBot, timestamp });
      
      // 💾 SAUVEGARDER
      saveConversation();
      
      scrollToBottom();
    }
    
    function showTyping() {
      isTyping = true;
      const typingEl = document.createElement('div');
      typingEl.id = 'typingIndicator';
      typingEl.className = 'message bot';
      typingEl.innerHTML = 
        '<img src="' + (config.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEM0Q0RDgiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0iIzY5NzU4NSIvPgo8cGF0aCBkPSJNMzAgMzJDMzAgMjYuNDc3MSAyNS41MjI5IDIyIDIwIDIyQzE0LjQ3NzEgMjIgMTAgMjYuNDc3MSAxMCAzMkgzMFoiIGZpbGw9IiM2OTc1ODUiLz4KPC9zdmc>') + '" alt="Bot" class="message-avatar">' +
        '<div>' +
          '<div class="typing-indicator">' +
            '<div class="typing-dot"></div>' +
            '<div class="typing-dot"></div>' +
            '<div class="typing-dot"></div>' +
          '</div>' +
        '</div>';
      messagesContainer?.appendChild(typingEl);
      scrollToBottom();
    }
    
    function hideTyping() {
      isTyping = false;
      document.getElementById('typingIndicator')?.remove();
    }
    
    function scrollToBottom() {
      const messages = document.getElementById('chatMessages');
      if (messages) {
        setTimeout(() => {
          messages.scrollTop = messages.scrollHeight;
        }, 100);
      }
    }
    
    // 💾 CHARGER la conversation au démarrage
    window.addEventListener('DOMContentLoaded', function() {
      const loaded = loadConversation();
      
      // Si pas de conversation sauvée ET pas déjà ouvert, ne rien faire
      // Le message de bienvenue sera ajouté à l'ouverture
    });
    
    // Popup automatique
    if (config.showPopup && config.popupMessage && popup) {
      setTimeout(() => {
        if (!isOpen) popup.classList.remove('hidden');
      }, config.popupDelay * 1000);
    }
    
    // Communication avec parent
    parent.postMessage({ 
      type: 'WIDGET_READY', 
      data: { width: config.width, height: config.height } 
    }, '*');
    
    console.log('Widget chargé avec succès');
  </script>
</body>
</html>`;

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300", // 5 minutes
        "X-Frame-Options": "ALLOWALL", // Permet l'iframe
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "*"
      },
    });

  } catch (error) {
    console.error('Erreur chargement widget:', error);
    
    // Page d'erreur simple
    const errorHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Widget Error</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      height: 100vh; 
      margin: 0; 
      background: #f5f5f5; 
    }
    .error { 
      text-align: center; 
      color: #666; 
    }
  </style>
</head>
<body>
  <div class="error">
    <h3>Widget non disponible</h3>
    <p>Le widget demandé n'a pas pu être chargé.</p>
  </div>
</body>
</html>`;

    return new NextResponse(errorHtml, {
      status: 404,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }
} 