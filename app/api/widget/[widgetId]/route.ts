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

    // 🎯 HTML COMPLET MOBILE OPTIMISÉ
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <!-- 🎯 META MOBILE OPTIMISÉ -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <title>${config.name || 'Chat Widget'}</title>
  <style>
/* STYLES DE BASE - DESKTOP ET MOBILE */
* { 
  box-sizing: border-box; 
  margin: 0; 
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

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
  -webkit-tap-highlight-color: transparent;
  -webkit-user-select: none;
  user-select: none;
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
  /* 🎯 MÊMES DIMENSIONS QUE TON PREVIEW */
  min-width: 55px;
  max-width: min(200px, calc(100vw - 120px));
  width: max-content;
  padding: 12px 16px;
  /* 🎯 STYLE MODERNE UNIFIÉ */
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  line-height: 1.3;
  word-wrap: break-word;
  overflow-wrap: break-word;
  /* 🎯 DÉGRADÉ + BORDURE */
  background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 85%, #06b6d4));
  border: 2px solid rgba(255, 255, 255, 0.15);
  /* 🎯 OMBRE MODERNE */
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  /* 🎯 ANIMATION */
  animation: slideUpBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.chat-popup::after {
  content: '';
  position: absolute;
  bottom: -6px;
  right: 24px;
  width: 8px;
  height: 8px;
  background: var(--primary-color);
  transform: rotate(45deg);
  border-right: 1px solid rgba(255, 255, 255, 0.15);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.chat-window {
  position: absolute;
  bottom: 16px;
  right: 16px;
  /* 🎯 DIMENSIONS DESKTOP NORMALES - PAS PLEIN ÉCRAN */
  width: 380px;  /* Largeur fixe pour desktop */
  height: 600px; /* Hauteur fixe pour desktop */
  max-width: calc(100vw - 40px); /* Sécurité pour petits écrans */
  max-height: calc(100vh - 40px); /* Sécurité pour petits écrans */
  border-radius: 20px;
  box-shadow: 
  0 4px 16px rgba(0, 0, 0, 0.15),
  0 1px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: ${config.theme === 'dark' ? '#0f172a' : '#ffffff'};
  animation: expandIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.chat-window.dark {
  box-shadow: 
    0 6px 20px rgba(0, 0, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.chat-header {
  height: 64px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, var(--primary-color) 0%, color-mix(in srgb, var(--primary-color) 85%, #06b6d4) 100%);
  flex-shrink: 0;
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
  -webkit-tap-highlight-color: transparent;
}

.chat-action-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: ${config.theme === 'dark' ? '#020617' : '#f8fafc'};
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, rgba(0,0,0,0.28), rgba(0,0,0,0.18));
  border-radius: 8px;
}

.chat-messages.dark::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, rgba(100,116,139,0.4), rgba(100,116,139,0.2));
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
  -webkit-user-select: text;
  user-select: text;
  white-space: pre-wrap;
}

.message-bubble.bot {
  background: ${config.theme === 'dark' ? '#1e293b' : '#f1f5f9'};
  color: ${config.theme === 'dark' ? '#e2e8f0' : '#334155'};
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
  background: ${config.theme === 'dark' ? '#1e293b' : '#f1f5f9'};
  border-radius: 18px;
}

.typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${config.theme === 'dark' ? '#64748b' : '#6b7280'};
  animation: typingBounce 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

.chat-input-area {
  padding: 12px 16px;
  border-top: 1px solid ${config.theme === 'dark' ? 'rgba(51, 65, 85, 0.3)' : 'rgba(229, 231, 235, 0.6)'};
  background: ${config.theme === 'dark' ? '#0f172a' : '#ffffff'};
  flex-shrink: 0;
}

.chat-input-container {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.chat-input {
  flex: 1;
  padding: 8px 14px;
  border: 1px solid ${config.theme === 'dark' ? 'rgba(51, 65, 85, 0.6)' : 'rgba(209, 213, 219, 0.6)'};
  border-radius: 18px;
  font-size: 14px;
  outline: none;
  background: ${config.theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : '#ffffff'};
  color: ${config.theme === 'dark' ? '#e2e8f0' : '#111827'};
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
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
}

.chat-send-btn:hover:not(:disabled) {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.chat-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hidden { display: none !important; }

/* 🎯 MOBILE UNIQUEMENT - Media queries très spécifiques */
@media screen and (max-width: 768px) and (pointer: coarse) and (hover: none) {
  
  html, body {
    height: 100vh !important;
    height: 100dvh !important;
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
    touch-action: manipulation;
  }
  
  html {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
  
  .chat-button:hover {
    transform: none;
  }
  
  .chat-button:active {
    transform: scale(0.95);
  }
  
  .chat-action-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: none;
  }
  
  .chat-action-btn:active {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(0.95);
  }
  
  .chat-send-btn:hover:not(:disabled) {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .chat-send-btn:active:not(:disabled) {
    transform: scale(0.95);
  }
  
  .message-bubble {
    max-width: calc(100vw - 120px);
  }
  
  /* MOBILE FULLSCREEN UNIQUEMENT quand classe appliquée */
  .chat-widget.mobile-fullscreen {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    z-index: 999999 !important;
  }
  
  .chat-widget.mobile-fullscreen .chat-window {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    height: 100% !important;
    border-radius: 0 !important;
    max-width: none !important;
    max-height: none !important;
  }
  
  .chat-widget.mobile-fullscreen .chat-header {
    padding-top: max(10px, env(safe-area-inset-top)) !important;
    height: calc(64px + env(safe-area-inset-top)) !important;
  }
  
  .chat-widget.mobile-fullscreen .chat-input-area {
    position: sticky !important;
    bottom: 0 !important;
    background: ${config.theme === 'dark' ? '#1f2937' : '#ffffff'} !important;
    z-index: 10 !important;
    padding-bottom: max(12px, env(safe-area-inset-bottom)) !important;
  }
  
  .chat-widget.mobile-fullscreen .chat-messages {
    padding-bottom: 80px !important;
    height: calc(100vh - 64px - 80px) !important;
    height: calc(100dvh - 64px - 80px) !important;
  }
  
  .chat-widget.mobile-fullscreen .chat-input {
    font-size: 16px !important;
    min-height: 44px !important;
    padding: 12px 16px !important;
    border-radius: 24px !important;
    transform-origin: left top;
    zoom: 1 !important;
    -webkit-text-size-adjust: 100%;
    -webkit-appearance: none;
  }
  
  .chat-widget.mobile-fullscreen .chat-input:focus {
    zoom: 1;
    -webkit-text-size-adjust: 100%;
  }
  
  .chat-widget.mobile-fullscreen .chat-send-btn {
    width: 44px !important;
    height: 44px !important;
  }
  
  @media (orientation: landscape) {
    .chat-widget.mobile-fullscreen .chat-header {
      height: 50px !important;
      padding-top: 8px !important;
    }
    
    .chat-widget.mobile-fullscreen .chat-messages {
      padding: 8px 16px;
    }
    
    .chat-widget.mobile-fullscreen .chat-input-area {
      padding: 8px 16px;
    }
  }
}

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

@keyframes slideUpBounce {
  0% { 
    opacity: 0; 
    transform: translateY(10px) scale(0.8); 
  }
  60% { 
    opacity: 1; 
    transform: translateY(-2px) scale(1.02); 
  }
  100% { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
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
    let isMobile = false;
    let currentSessionId = null; // 🆕 NOUVEAU - sessionId persistant
    
    // Configuration
    const config = ${JSON.stringify(config)};
    
    // 🆕 NOUVELLE FONCTION - Génération/récupération sessionId
    function generateSessionId() {
      const storageKey = 'widget_session_' + config._id;
      
      // Essayer de récupérer depuis localStorage
      let sessionId = localStorage.getItem(storageKey);
      
      if (!sessionId) {
        // Générer un nouveau sessionId
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substr(2, 9);
        sessionId = 'session_' + timestamp + '_' + randomString;
        
        // Sauvegarder dans localStorage
        try {
          localStorage.setItem(storageKey, sessionId);
          console.log('🆕 [WIDGET] New sessionId generated:', sessionId);
        } catch (error) {
          console.warn('⚠️ [WIDGET] Cannot save sessionId to localStorage');
        }
      } else {
        console.log('✅ [WIDGET] Existing sessionId loaded:', sessionId);
      }
      
      return sessionId;
    }
    
    // 🎯 DÉTECTION MOBILE AMÉLIORÉE
    function detectMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
             (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform)) ||
             window.innerWidth <= 768;
    }
    
    // 💾 PERSISTANCE - Code existant modifié pour inclure sessionId
    const STORAGE_KEY = 'chatbot_conversation_' + config._id;
    
    function saveConversation() {
      try {
        const conversationData = {
          messages: messages,
          timestamp: Date.now(),
          isOpen: isOpen,
          sessionId: currentSessionId // 🆕 INCLURE sessionId
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
          
          const maxAge = 60 * 60 * 1000; // 1 heure
          if (Date.now() - data.timestamp < maxAge) {
            messages = data.messages || [];
            
            // 🆕 Récupérer sessionId sauvegardé si disponible
            if (data.sessionId) {
              currentSessionId = data.sessionId;
              console.log('📋 [WIDGET] SessionId loaded from conversation:', currentSessionId);
            }
            
            if (messages.length > 0) {
              messagesContainer.innerHTML = '';
              messages.forEach(msg => {
                addMessageToDOM(msg.text, msg.isBot, msg.timestamp);
              });
            }
            
            if (data.isOpen) {
              setTimeout(() => {
                isOpen = true;
                button?.classList.add('hidden');
                chatWindow?.classList.remove('hidden');
                popup?.classList.add('hidden');
                
                // 🎯 MOBILE: Appliquer le mode plein écran
                if (isMobile) {
                  chatWidget?.classList.add('mobile-fullscreen');
                }
                
                parent.postMessage({ 
                  type: 'WIDGET_OPEN', 
                  data: { width: config.width, height: config.height, isMobile: isMobile } 
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
    
    function addMessageToDOM(text, isBot, timestamp = new Date()) {
      const messageEl = document.createElement('div');
      messageEl.className = 'message ' + (isBot ? 'bot' : 'user');
      
      if (isBot) {
        messageEl.innerHTML = 
          '<img src="' + (config.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEM0Q0RDgiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0iIzY5NzU4NSIvPgo8cGF0aCBkPSJNMzAgMzJDMzAgMjYuNDc3MSAyNS41MjI5IDIyIDIwIDIyQzE0LjQ3NzEgMjIgMTAgMjYuNDc3MSAxMCAzMkgzMFoiIGZpbGw9IiM2OTc1ODUiLz4KPC9zdmc+') + '" alt="Bot" class="message-avatar">' +
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
    
    // Éléments DOM
    const popup = document.getElementById('chatPopup');
    const button = document.getElementById('chatButton');
    const chatWindow = document.getElementById('chatWindow');
    const chatWidget = document.querySelector('.chat-widget');
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
    
    // INPUT MOBILE OPTIMISÉ
    input?.addEventListener('input', function() {
      sendBtn.disabled = !this.value.trim();
      
      this.style.height = 'auto';
      const newHeight = Math.min(this.scrollHeight, 120);
      this.style.height = newHeight + 'px';
      this.style.overflowY = newHeight >= 120 ? 'auto' : 'hidden';
    });
    
    // MOBILE: Gestion du clavier virtuel
    input?.addEventListener('focus', function() {
      if (isMobile) {
        setTimeout(() => {
          const messages = document.getElementById('chatMessages');
          if (messages) {
            messages.scrollTop = messages.scrollHeight;
          }
          this.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
      }
    });
    
    input?.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        // Sur mobile : Entrée = toujours saut de ligne
        if (isMobile) {
          // Ne rien faire, laisser le comportement par défaut (saut de ligne)
          return;
        }
        
        // Sur desktop : Entrée seule = envoyer, Shift+Entrée = saut de ligne
        if (!e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
        // Si Shift+Entrée, ne rien faire = saut de ligne par défaut
      }
    });
    
    // MOBILE: Gestion du resize pour clavier virtuel
    if (isMobile) {
      let initialViewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      
      function handleViewportChange() {
        if (window.visualViewport) {
          const currentHeight = window.visualViewport.height;
          const heightDiff = initialViewportHeight - currentHeight;
          
          if (heightDiff > 150 && isOpen) {
            const messages = document.getElementById('chatMessages');
            if (messages) {
              messages.style.height = 'calc(100vh - 64px - 80px - ' + heightDiff + 'px)';
              setTimeout(() => {
                messages.scrollTop = messages.scrollHeight;
              }, 100);
            }
          } else if (heightDiff < 50 && isOpen) {
            const messages = document.getElementById('chatMessages');
            if (messages) {
              messages.style.height = 'calc(100vh - 64px - 80px)';
            }
          }
        }
      }
      
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleViewportChange);
      }
    }
    
    // FONCTIONS MODIFIÉES POUR MOBILE
    function toggleChat() {
      isOpen = !isOpen;
      if (isOpen) {
        button?.classList.add('hidden');
        chatWindow?.classList.remove('hidden');
        popup?.classList.add('hidden');
        
        if (isMobile) {
          chatWidget?.classList.add('mobile-fullscreen');
          document.body.style.overflow = 'hidden';
          document.documentElement.style.overflow = 'hidden';
        }
        
        if (config.showWelcomeMessage && config.welcomeMessage && messages.length === 0) {
          setTimeout(() => {
            showTyping();
            setTimeout(() => {
              hideTyping();
              addMessage(config.welcomeMessage, true);
            }, 1500);
          }, 400);
        }
        
        setTimeout(() => {
          input?.focus();
          if (isMobile && input) {
            input.style.fontSize = '16px';
          }
        }, 300);
        
        parent.postMessage({ 
          type: 'WIDGET_OPEN', 
          data: { 
            width: config.width, 
            height: config.height, 
            isMobile: isMobile 
          } 
        }, '*');
      } else {
        closeChat();
      }
      
      saveConversation();
    }
    
    function closeChat() {
      isOpen = false;
      chatWindow?.classList.add('hidden');
      button?.classList.remove('hidden');
      
      if (isMobile) {
        chatWidget?.classList.remove('mobile-fullscreen');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        if (input) {
          input.blur();
        }
      }
      
      parent.postMessage({ 
        type: 'WIDGET_CLOSE', 
        data: { isMobile: isMobile } 
      }, '*');
      
      saveConversation();
    }
    
    function resetChat() {
      messagesContainer.innerHTML = '';
      messages = [];
      localStorage.removeItem(STORAGE_KEY);
      
      // 🆕 NOUVEAU - Générer un nouveau sessionId lors du reset
      currentSessionId = generateSessionId();
      console.log('🔄 [WIDGET] Chat reset, new sessionId:', currentSessionId);
      
      if (config.showWelcomeMessage && config.welcomeMessage) {
        addMessage(config.welcomeMessage, true);
      }
    }
    
    async function sendMessage() {
      const text = input?.value?.trim();
      if (!text) return;
      
      // 🆕 S'assurer qu'on a un sessionId avant d'envoyer
      if (!currentSessionId) {
        currentSessionId = generateSessionId();
      }
      
      addMessage(text, false);
      input.value = '';
      input.style.height = isMobile ? '44px' : '32px';
      sendBtn.disabled = true;
      
      if (isMobile && input) {
        input.blur();
        setTimeout(() => input.focus(), 100);
      }
      
      showTyping();
      
      try {
        const response = await fetch('https://testyourainow.com/api/agents/' + config.selectedAgent + '/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-public-kind': 'widget',
            'x-widget-id': config._id,
            'x-widget-token': 'public'
          },
          body: JSON.stringify({
            message: text,
            sessionId: currentSessionId, // 🆕 PASSER LE sessionId
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
    
    function addMessage(text, isBot) {
      const timestamp = new Date();
      addMessageToDOM(text, isBot, timestamp);
      messages.push({ text, isBot, timestamp });
      saveConversation();
      scrollToBottom();
    }
    
    function showTyping() {
      isTyping = true;
      const typingEl = document.createElement('div');
      typingEl.id = 'typingIndicator';
      typingEl.className = 'message bot';
      typingEl.innerHTML = 
        '<img src="' + (config.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEM0Q0RDgiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0iIzY5NzU4NSIvPgo8cGF0aCBkPSJNMzAgMzJDMzAgMjYuNDc3MSAyNS41MjI5IDIyIDIwIDIyQzE0LjQ3NzEgMjIgMTAgMjYuNDc3MSAxMCAzMkgzMFoiIGZpbGw9IiM2OTc1ODUiLz4KPC9zdmc+') + '" alt="Bot" class="message-avatar">' +
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
    
    function handleOrientationChange() {
      if (isMobile && isOpen) {
        setTimeout(() => {
          const messages = document.getElementById('chatMessages');
          if (messages) {
            messages.scrollTop = messages.scrollHeight;
          }
          
          if (document.activeElement === input) {
            input.blur();
            setTimeout(() => input.focus(), 100);
          }
        }, 500);
      }
    }
    
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', function() {
      const wasMobile = isMobile;
      isMobile = detectMobile();
      
      if (wasMobile !== isMobile && isOpen) {
        if (isMobile) {
          chatWidget?.classList.add('mobile-fullscreen');
          document.body.style.overflow = 'hidden';
        } else {
          chatWidget?.classList.remove('mobile-fullscreen');
          document.body.style.overflow = '';
        }
      }
    });
    
    // 🆕 INITIALISATION - Générer sessionId au chargement
    window.addEventListener('DOMContentLoaded', function() {
      isMobile = detectMobile();
      
      // Générer/récupérer sessionId
      currentSessionId = generateSessionId();
      
      // Charger conversation existante
      const loaded = loadConversation();
      
      if (isMobile && input) {
        input.style.fontSize = '16px';
        input.style.minHeight = '44px';
      }
      
      console.log('🎯 [WIDGET] Initialized with sessionId:', currentSessionId);
    });
    
    if (config.showPopup && config.popupMessage && popup) {
      setTimeout(() => {
        if (!isOpen) { // Retiré la condition mobile qui masquait le popup
          popup.classList.remove('hidden');
        }
      }, (config.popupDelay || 3) * 1000);
    }
    
    parent.postMessage({ 
      type: 'WIDGET_READY', 
      data: { 
        width: config.width, 
        height: config.height,
        isMobile: isMobile
      } 
    }, '*');
    
    console.log('Widget chargé avec succès - Mobile:', isMobile, '- SessionId:', currentSessionId);
  </script>
</body>
</html>`;

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300",
        "X-Frame-Options": "ALLOWALL",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "*"
      },
    });

  } catch (error) {
    console.error('Erreur chargement widget:', error);
    
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