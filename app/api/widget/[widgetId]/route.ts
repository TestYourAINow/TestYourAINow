// app/api/widget/[widgetId]/route.ts - VERSION BULLETPROOF

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
      return new NextResponse('Widget not found', { status: 404 });
    }

    const config = JSON.parse(JSON.stringify(rawConfig));
    const isDark = config.theme === 'dark';

    // 🎯 HTML AVEC CSS ULTRA-DÉFENSIF CONTRE TOUS LES SITES
    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${config.name || 'Chat Widget'}</title>
  <style>
    /* 🛡️ RESET TOTAL pour neutraliser le CSS du site parent */
    * { 
      box-sizing: border-box !important; 
      margin: 0 !important; 
      padding: 0 !important; 
    }
    
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
      overflow: hidden !important;
      font-family: Inter, system-ui, sans-serif !important;
      height: 100vh !important;
      width: 100vw !important;
      position: relative !important;
      /* 🔥 NOUVEAU : Empêche les interférences */
      transform: none !important;
      top: auto !important;
      left: auto !important;
      right: auto !important;
      bottom: auto !important;
    }
    
    /* 🎯 CONTENEUR PRINCIPAL - POSITION ABSOLUE ULTRA-ROBUSTE */
    .chat-widget {
      /* ⚡ POSITION ABSOLUE au lieu de FIXED pour éviter les conflits iframe */
      position: absolute !important;
      bottom: 0px !important;
      right: 0px !important;
      z-index: 999999 !important;
      font-family: Inter, system-ui, sans-serif !important;
      --primary-color: ${config.primaryColor || '#3b82f6'};
      /* 🛡️ PROTECTION CONTRE TOUS LES CSS EXTERNES */
      transform: none !important;
      margin: 0 !important;
      padding: 0 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      /* 🔒 Isolation complète */
      contain: layout style paint !important;
    }
    
    .chat-button {
      width: 64px !important;
      height: 64px !important;
      border-radius: 50% !important;
      border: none !important;
      cursor: pointer !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 80%, #06b6d4)) !important;
      animation: bounceIn 0.6s ease-out !important;
      /* 🛡️ PROTECTION MAXIMALE */
      position: relative !important;
      margin: 0 !important;
      padding: 0 !important;
      transform: none !important;
      top: auto !important;
      left: auto !important;
      right: auto !important;
      bottom: auto !important;
      /* ✅ NOUVEAU : Couleur blanche forcée pour l'icône */
      color: white !important;
    }
    
    .chat-button svg {
      width: 24px !important;
      height: 24px !important;
      color: white !important;
      fill: white !important;
    }
    
    .chat-button:hover {
      transform: scale(1.05) !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    }
    
    .chat-popup {
      position: absolute !important;
      bottom: 100% !important;
      right: 0 !important;
      margin-bottom: 16px !important;
      max-width: 240px !important;
      padding: 12px 16px !important;
      border-radius: 16px !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
      font-size: 14px !important;
      color: white !important;
      background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 85%, #06b6d4)) !important;
      animation: slideUp 0.3s ease-out !important;
      /* 🛡️ PROTECTION */
      transform: none !important;
      margin-top: 0 !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
      /* ✅ NOUVEAU : Z-index élevé et visibilité forcée */
      z-index: 999999 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    
    .chat-popup::after {
      content: '' !important;
      position: absolute !important;
      bottom: -6px !important;
      right: 24px !important;
      width: 12px !important;
      height: 12px !important;
      background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 85%, #06b6d4)) !important;
      transform: rotate(45deg) !important;
    }
    
    .chat-window {
      position: absolute !important;
      bottom: 0 !important;
      right: 0 !important;
      width: ${config.width || 380}px !important;
      height: ${config.height || 600}px !important;
      border-radius: 20px !important;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12) !important;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
      background: ${isDark ? '#1f2937' : '#ffffff'} !important;
      animation: expandIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
      /* 🛡️ PROTECTION ABSOLUE */
      margin: 0 !important;
      padding: 0 !important;
      transform: none !important;
      top: auto !important;
      left: auto !important;
    }
    
    .chat-header {
      height: 64px !important;
      padding: 10px 16px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      background: linear-gradient(135deg, var(--primary-color) 0%, color-mix(in srgb, var(--primary-color) 85%, #06b6d4) 100%) !important;
      /* 🛡️ PROTECTION */
      margin: 0 !important;
      flex-shrink: 0 !important;
      position: relative !important;
      transform: none !important;
    }
    
    .chat-header-content {
      display: flex !important;
      align-items: center !important;
      flex: 1 !important;
      gap: 12px !important;
      /* 🛡️ PROTECTION */
      margin: 0 !important;
      padding: 0 !important;
      transform: none !important;
    }
    
    .chat-avatar {
      width: 40px !important;
      height: 40px !important;
      border-radius: 50% !important;
      border: 2px solid rgba(255, 255, 255, 0.3) !important;
      object-fit: cover !important;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
      /* 🛡️ PROTECTION */
      margin: 0 !important;
      padding: 0 !important;
      transform: none !important;
      display: block !important;
    }
    
    .chat-status {
      width: 12px !important;
      height: 12px !important;
      background: #10b981 !important;
      border-radius: 50% !important;
      border: 2px solid white !important;
      position: absolute !important;
      bottom: -1px !important;
      right: -1px !important;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
    }
    
    .chat-title {
      font-weight: 600 !important;
      font-size: 15px !important;
      color: white !important;
      margin: 0 !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
      /* 🛡️ PROTECTION */
      padding: 0 !important;
      transform: none !important;
      line-height: 1.2 !important;
    }
    
    .chat-subtitle {
      font-size: 12px !important;
      color: rgba(255, 255, 255, 0.85) !important;
      margin: 1px 0 0 0 !important;
      font-weight: 400 !important;
      /* 🛡️ PROTECTION */
      padding: 0 !important;
      transform: none !important;
      line-height: 1.2 !important;
    }
    
    .chat-actions {
      display: flex !important;
      gap: 6px !important;
      /* 🛡️ PROTECTION */
      margin: 0 !important;
      padding: 0 !important;
      transform: none !important;
    }
    
    .chat-action-btn {
      width: 36px !important;
      height: 36px !important;
      border: none !important;
      border-radius: 50% !important;
      background: rgba(255, 255, 255, 0.15) !important;
      color: rgba(255, 255, 255, 0.9) !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      backdrop-filter: blur(10px) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      /* 🛡️ PROTECTION */
      margin: 0 !important;
      padding: 0 !important;
      transform: none !important;
    }
    
    .chat-action-btn:hover {
      background: rgba(255, 255, 255, 0.25) !important;
      transform: scale(1.05) !important;
    }
    
    .chat-messages {
      flex: 1 !important;
      overflow-y: auto !important;
      padding: 16px !important;
      background: ${isDark ? '#111827' : '#f8fafc'} !important;
      /* 🛡️ PROTECTION */
      margin: 0 !important;
      transform: none !important;
      min-height: 0 !important;
    }
    
    .chat-messages::-webkit-scrollbar {
      width: 6px !important;
    }
    
    .chat-messages::-webkit-scrollbar-thumb {
      background: linear-gradient(to bottom, rgba(59, 130, 246, 0.6), rgba(6, 182, 212, 0.6)) !important;
      border-radius: 8px !important;
    }
    
    .message {
      display: flex !important;
      margin-bottom: 8px !important;
      animation: slideInMessage 0.3s ease-out !important;
      /* 🛡️ PROTECTION */
      padding: 0 !important;
      transform: none !important;
    }
    
    .message.user {
      flex-direction: row-reverse !important;
    }
    
    .message-avatar {
      width: 32px !important;
      height: 32px !important;
      border-radius: 50% !important;
      margin: 0 8px 0 0 !important;
      object-fit: cover !important;
      /* 🛡️ PROTECTION */
      padding: 0 !important;
      transform: none !important;
      display: block !important;
    }
    
    .message-bubble {
      padding: 10px 14px !important;
      border-radius: 18px !important;
      font-size: 14px !important;
      line-height: 1.4 !important;
      max-width: 280px !important;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08) !important;
      border: 1px solid rgba(0, 0, 0, 0.04) !important;
      /* 🛡️ PROTECTION */
      margin: 0 !important;
      transform: none !important;
      word-break: break-word !important;
    }
    
    .message-bubble.bot {
      background: ${isDark ? '#374151' : '#f1f5f9'} !important;
      color: ${isDark ? 'white' : '#334155'} !important;
    }
    
    .message-bubble.user {
      background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 90%, #06b6d4)) !important;
      color: white !important;
    }
    
    .message-timestamp {
      font-size: 11px !important;
      color: #9ca3af !important;
      margin-top: 4px !important;
      /* 🛡️ PROTECTION */
      padding: 0 !important;
      transform: none !important;
    }
    
    .typing-indicator {
      display: flex !important;
      align-items: center !important;
      gap: 4px !important;
      padding: 12px 16px !important;
      background: ${isDark ? '#374151' : '#f1f5f9'} !important;
      border-radius: 18px !important;
      /* 🛡️ PROTECTION */
      margin: 0 !important;
      transform: none !important;
    }
    
    .typing-dot {
      width: 8px !important;
      height: 8px !important;
      border-radius: 50% !important;
      background: ${isDark ? '#9ca3af' : '#6b7280'} !important;
      animation: typingBounce 1.4s infinite ease-in-out !important;
    }
    
    .typing-dot:nth-child(2) { animation-delay: 0.2s !important; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s !important; }
    
    .chat-input-area {
      padding: 12px 16px !important;
      border-top: 1px solid ${isDark ? 'rgba(75, 85, 99, 0.4)' : 'rgba(229, 231, 235, 0.6)'} !important;
      background: ${isDark ? '#1f2937' : '#ffffff'} !important;
      /* 🛡️ PROTECTION */
      margin: 0 !important;
      transform: none !important;
      flex-shrink: 0 !important;
    }
    
    .chat-input-container {
      display: flex !important;
      gap: 10px !important;
      align-items: center !important;
      /* 🛡️ PROTECTION */
      margin: 0 !important;
      padding: 0 !important;
      transform: none !important;
    }
    
    .chat-input {
      flex: 1 !important;
      padding: 8px 14px !important;
      border: 1px solid ${isDark ? 'rgba(75, 85, 99, 0.8)' : 'rgba(209, 213, 219, 0.6)'} !important;
      border-radius: 18px !important;
      font-size: 14px !important;
      outline: none !important;
      background: ${isDark ? 'rgba(55, 65, 81, 0.9)' : '#ffffff'} !important;
      color: ${isDark ? 'white' : '#111827'} !important;
      resize: none !important;
      min-height: 32px !important;
      max-height: 120px !important;
      font-family: inherit !important;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      /* 🛡️ PROTECTION */
      margin: 0 !important;
      transform: none !important;
      line-height: 1.4 !important;
    }
    
    .chat-input:focus {
      border-color: var(--primary-color) !important;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color) 15%, transparent) !important;
    }
    
    .chat-input::-webkit-scrollbar {
      width: 4px !important;
    }
    
    .chat-input::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2) !important;
      border-radius: 10px !important;
    }
    
    .chat-send-btn {
      width: 40px !important;
      height: 40px !important;
      border: none !important;
      border-radius: 50% !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: white !important;
      background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 85%, #06b6d4)) !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      /* 🛡️ PROTECTION */
      margin: 0 !important;
      padding: 0 !important;
      transform: none !important;
    }
    
    .chat-send-btn:hover:not(:disabled) {
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15) !important;
    }
    
    .chat-send-btn:disabled {
      opacity: 0.5 !important;
      cursor: not-allowed !important;
    }
    
    .hidden { 
      display: none !important; 
    }
    
    /* 🎬 ANIMATIONS INDESTRUCTIBLES */
    @keyframes bounceIn {
      0% { opacity: 0 !important; transform: scale(0.3) !important; }
      50% { opacity: 1 !important; transform: scale(1.05) !important; }
      100% { opacity: 1 !important; transform: scale(1) !important; }
    }
    
    @keyframes expandIn {
      0% { opacity: 0 !important; transform: scale(0.8) translateY(20px) !important; }
      100% { opacity: 1 !important; transform: scale(1) translateY(0) !important; }
    }
    
    @keyframes slideUp {
      0% { opacity: 0 !important; transform: translateY(10px) !important; }
      100% { opacity: 1 !important; transform: translateY(0) !important; }
    }
    
    @keyframes slideInMessage {
      0% { opacity: 0 !important; transform: translateY(8px) !important; }
      100% { opacity: 1 !important; transform: translateY(0) !important; }
    }
    
    @keyframes typingBounce {
      0%, 80%, 100% { transform: translateY(0) !important; opacity: 0.7 !important; }
      40% { transform: translateY(-6px) !important; opacity: 1 !important; }
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
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
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
          ${config.showWelcomeMessage && config.welcomeMessage ? `
            <div class="message bot">
              <img src="${config.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEM0Q0RDgiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0iIzY5NzU4NSIvPgo8cGF0aCBkPSJNMzAgMzJDMzAgMjYuNDc3MSAyNS41MjI5IDIyIDIwIDIyQzE0LjQ3NzEgMjIgMTAgMjYuNDc3MSAxMCAzMkgzMFoiIGZpbGw9IiM2OTc1ODUiLz4KPC9zdmc+'}" alt="Bot" class="message-avatar">
              <div>
                <div class="message-bubble bot">${config.welcomeMessage}</div>
                <div class="message-timestamp">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          ` : ''}
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
      // Auto-resize
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
    
    // Fonctions
    function toggleChat() {
      console.log('🔄 Toggle chat clicked, isOpen:', isOpen);
      isOpen = !isOpen;
      if (isOpen) {
        console.log('📂 Opening chat window');
        button?.classList.add('hidden');
        chatWindow?.classList.remove('hidden');
        popup?.classList.add('hidden');
        setTimeout(() => input?.focus(), 300);
        parent.postMessage({ type: 'WIDGET_OPEN', data: { width: config.width, height: config.height } }, '*');
      } else {
        closeChat();
      }
    }
    
    function closeChat() {
      console.log('📁 Closing chat window');
      isOpen = false;
      chatWindow?.classList.add('hidden');
      button?.classList.remove('hidden');
      parent.postMessage({ type: 'WIDGET_CLOSE', data: {} }, '*');
    }
    
    function resetChat() {
      messagesContainer.innerHTML = '';
      messages = [];
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
    
    function addMessage(text, isBot) {
      const messageEl = document.createElement('div');
      messageEl.className = 'message ' + (isBot ? 'bot' : 'user');
      
      if (isBot) {
        messageEl.innerHTML = 
          '<img src="' + (config.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEM0Q0RDgiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0iIzY5NzU4NSIvPgo8cGF0aCBkPSJNMzAgMzJDMzAgMjYuNDc3MSAyNS41MjI5IDIyIDIwIDIyQzE0LjQ3NzEgMjIgMTAgMjYuNDc3MSAxMCAzMkgzMFoiIGZpbGw9IiM2OTc1ODUiLz4KPC9zdmc+') + '" alt="Bot" class="message-avatar">' +
          '<div>' +
            '<div class="message-bubble bot">' + text + '</div>' +
            '<div class="message-timestamp">' + new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) + '</div>' +
          '</div>';
      } else {
        messageEl.innerHTML = 
          '<div>' +
            '<div class="message-bubble user">' + text + '</div>' +
            '<div class="message-timestamp">' + new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) + '</div>' +
          '</div>';
      }
      
      messagesContainer?.appendChild(messageEl);
      messages.push({ text, isBot, timestamp: new Date() });
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
    
    // Popup automatique avec debug
    if (config.showPopup && config.popupMessage && popup) {
      console.log('⏰ Setting up popup with delay:', config.popupDelay + 's');
      setTimeout(() => {
        if (!isOpen) {
          console.log('💬 Showing popup:', config.popupMessage);
          popup.classList.remove('hidden');
        }
      }, config.popupDelay * 1000);
    } else {
      console.log('❌ Popup disabled or missing:', { 
        showPopup: config.showPopup, 
        hasMessage: !!config.popupMessage, 
        hasElement: !!popup 
      });
    }
    
    // Communication avec parent
    parent.postMessage({ 
      type: 'WIDGET_READY', 
      data: { width: config.width, height: config.height } 
    }, '*');
    
    console.log('✅ Widget chargé avec succès');
    console.log('📊 Configuration:', config);
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