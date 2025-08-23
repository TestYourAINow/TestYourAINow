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

    // 🎯 HTML COMPLET MOBILE-FIRST
    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no, viewport-fit=cover">
  <title>${config.name || 'Chat Widget'}</title>
  <style>
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, system-ui, sans-serif;
      height: 100vh !important;
      width: 100vw !important;
      position: relative !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .chat-widget {
      position: fixed !important;
      bottom: 8px !important;
      right: 8px !important;
      z-index: 999999 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, system-ui, sans-serif;
      --primary-color: ${config.primaryColor || '#3b82f6'};
    }
    
    /* 🎯 DETECTION MOBILE VS DESKTOP */
    .is-mobile {
      --is-mobile: 1;
    }
    
    .is-desktop {
      --is-mobile: 0;
    }
    
    /* 🔘 BOUTON CHAT - Identique sur mobile et desktop */
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
    
    .chat-button:active {
      transform: scale(0.95);
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
    
    /* 🖥️ DESKTOP CHAT WINDOW - Inchangé */
    .chat-window.desktop {
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
    
    /* 📱 MOBILE CHAT WINDOW - NOUVEAU ! Style Messenger */
    .chat-window.mobile {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      border-radius: 0;
      box-shadow: none;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: ${isDark ? '#111827' : '#ffffff'};
      animation: slideInFromBottom 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      /* Support safe areas iPhone */
      padding-top: env(safe-area-inset-top);
      padding-bottom: env(safe-area-inset-bottom);
    }
    
    /* 📱 HEADER MOBILE - Style Messenger */
    .chat-header.mobile {
      height: 60px;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: ${isDark ? '#1f2937' : '#ffffff'};
      border-bottom: 1px solid ${isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)'};
      /* Status bar sur iOS */
      padding-top: calc(8px + env(safe-area-inset-top));
    }
    
    /* 🖥️ HEADER DESKTOP - Inchangé */
    .chat-header.desktop {
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
    
    /* 📱 AVATAR MOBILE - Plus petit */
    .chat-avatar.mobile {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid ${isDark ? 'rgba(75, 85, 99, 0.4)' : 'rgba(229, 231, 235, 0.6)'};
      object-fit: cover;
    }
    
    /* 🖥️ AVATAR DESKTOP - Inchangé */
    .chat-avatar.desktop {
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
    
    /* 📱 TITRE MOBILE */
    .chat-title.mobile {
      font-weight: 600;
      font-size: 16px;
      color: ${isDark ? 'white' : '#111827'};
      margin: 0;
    }
    
    .chat-subtitle.mobile {
      font-size: 12px;
      color: ${isDark ? 'rgba(156, 163, 175, 0.8)' : '#6b7280'};
      margin: 1px 0 0 0;
      font-weight: 400;
    }
    
    /* 🖥️ TITRE DESKTOP - Inchangé */
    .chat-title.desktop {
      font-weight: 600;
      font-size: 15px;
      color: white;
      margin: 0;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
    
    .chat-subtitle.desktop {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.85);
      margin: 1px 0 0 0;
      font-weight: 400;
    }
    
    .chat-actions {
      display: flex;
      gap: 6px;
    }
    
    /* 📱 BOUTONS ACTION MOBILE */
    .chat-action-btn.mobile {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      background: ${isDark ? 'rgba(55, 65, 81, 0.8)' : 'rgba(243, 244, 246, 0.9)'};
      color: ${isDark ? 'rgba(156, 163, 175, 0.9)' : '#6b7280'};
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .chat-action-btn.mobile:hover {
      background: ${isDark ? 'rgba(75, 85, 99, 0.8)' : 'rgba(229, 231, 235, 0.9)'};
      transform: scale(1.05);
    }
    
    .chat-action-btn.mobile:active {
      transform: scale(0.95);
    }
    
    /* 🖥️ BOUTONS ACTION DESKTOP - Inchangé */
    .chat-action-btn.desktop {
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
    
    .chat-action-btn.desktop:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: scale(1.05);
    }
    
    /* 📱 MESSAGES MOBILE - Optimisé pour petits écrans */
    .chat-messages.mobile {
      flex: 1;
      overflow-y: auto;
      padding: 12px 16px;
      background: ${isDark ? '#111827' : '#f8fafc'};
      /* Optimisation scroll mobile */
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
    }
    
    /* 🖥️ MESSAGES DESKTOP - Inchangé */
    .chat-messages.desktop {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: ${isDark ? '#111827' : '#f8fafc'};
    }
    
    .chat-messages::-webkit-scrollbar {
      width: 4px; /* Plus fin sur mobile */
    }
    
    .chat-messages::-webkit-scrollbar-thumb {
      background: linear-gradient(to bottom, rgba(59, 130, 246, 0.4), rgba(6, 182, 212, 0.4));
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
    
    /* 📱 AVATAR MESSAGE MOBILE - Plus petit */
    .message-avatar.mobile {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      margin: 0 8px 0 0;
      object-fit: cover;
    }
    
    /* 🖥️ AVATAR MESSAGE DESKTOP - Inchangé */
    .message-avatar.desktop {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      margin: 0 8px 0 0;
      object-fit: cover;
    }
    
    /* 📱 BUBBLE MESSAGE MOBILE - Plus moderne */
    .message-bubble.mobile {
      padding: 8px 12px;
      border-radius: 18px;
      font-size: 15px; /* Légèrement plus gros sur mobile */
      line-height: 1.4;
      max-width: calc(100vw - 120px); /* Adapté aux petits écrans */
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.06);
    }
    
    /* 🖥️ BUBBLE MESSAGE DESKTOP - Inchangé */
    .message-bubble.desktop {
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
    
    /* 📱 INPUT AREA MOBILE - Plus spacieux */
    .chat-input-area.mobile {
      padding: 12px 16px;
      border-top: 1px solid ${isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.6)'};
      background: ${isDark ? '#1f2937' : '#ffffff'};
      /* Safe area pour iPhone */
      padding-bottom: calc(12px + env(safe-area-inset-bottom));
    }
    
    /* 🖥️ INPUT AREA DESKTOP - Inchangé */
    .chat-input-area.desktop {
      padding: 12px 16px;
      border-top: 1px solid ${isDark ? 'rgba(75, 85, 99, 0.4)' : 'rgba(229, 231, 235, 0.6)'};
      background: ${isDark ? '#1f2937' : '#ffffff'};
    }
    
    .chat-input-container {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    
    /* 📱 INPUT MOBILE - Plus grand et tactile */
    .chat-input.mobile {
      flex: 1;
      padding: 10px 16px; /* Plus de padding sur mobile */
      border: 1px solid ${isDark ? 'rgba(75, 85, 99, 0.6)' : 'rgba(209, 213, 219, 0.6)'};
      border-radius: 20px; /* Plus arrondi sur mobile */
      font-size: 16px; /* Évite le zoom sur iOS */
      outline: none;
      background: ${isDark ? 'rgba(55, 65, 81, 0.9)' : '#ffffff'};
      color: ${isDark ? 'white' : '#111827'};
      resize: none;
      min-height: 40px; /* Plus haut sur mobile */
      max-height: 120px;
      font-family: inherit;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* 🖥️ INPUT DESKTOP - Inchangé */
    .chat-input.desktop {
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
    
    /* 📱 SEND BUTTON MOBILE - Plus grand */
    .chat-send-btn.mobile {
      width: 44px;
      height: 44px;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 85%, #06b6d4));
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .chat-send-btn.mobile:active {
      transform: scale(0.95);
    }
    
    /* 🖥️ SEND BUTTON DESKTOP - Inchangé */
    .chat-send-btn.desktop {
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
    
    /* 🎬 ANIMATIONS */
    @keyframes bounceIn {
      0% { opacity: 0; transform: scale(0.3); }
      50% { opacity: 1; transform: scale(1.03); }
      100% { opacity: 1; transform: scale(1); }
    }
    
    @keyframes expandIn {
      0% { opacity: 0; transform: scale(0.8) translateY(20px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    
    /* 📱 ANIMATION MOBILE - Slide from bottom comme Messenger */
    @keyframes slideInFromBottom {
      0% { 
        opacity: 0; 
        transform: translateY(100%); 
      }
      100% { 
        opacity: 1; 
        transform: translateY(0); 
      }
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
    
    /* 📱 MEDIA QUERIES - Définition précise du mobile */
    @media (max-width: 768px) {
      .chat-widget {
        --is-mobile: 1;
      }
      
      /* Force certains comportements mobiles */
      .chat-input {
        font-size: 16px !important; /* Évite le zoom iOS */
      }
      
      .message-bubble {
        max-width: calc(100vw - 100px) !important;
      }
    }
    
    @media (min-width: 769px) {
      .chat-widget {
        --is-mobile: 0;
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
    
    <!-- Fenêtre Chat - Classes dynamiques selon device -->
    <div class="chat-window hidden" id="chatWindow">
      <!-- Header -->
      <div class="chat-header" id="chatHeader">
        <div class="chat-header-content">
          <div style="position: relative;">
            <img src="${config.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEM0Q0RDgiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0iIzY5NzU4NSIvPgo8cGF0aCBkPSJNMzAgMzJDMzAgMjYuNDc3MSAyNS41MjI5IDIyIDIwIDIyQzE0LjQ3NzEgMjIgMTAgMjYuNDc3MSAxMCAzMkgzMFoiIGZpbGw9IiM2OTc1ODUiLz4KPC9zdmc+'}" alt="Avatar" class="chat-avatar" id="chatAvatar">
            <div class="chat-status"></div>
          </div>
          <div>
            <div class="chat-title" id="chatTitle">${config.chatTitle || config.name}</div>
            <div class="chat-subtitle" id="chatSubtitle">${config.subtitle || 'En ligne'}</div>
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
      <div class="chat-input-area" id="chatInputArea">
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
    
    // Configuration
    const config = ${JSON.stringify(config)};
    
    // 🎯 DETECTION MOBILE - Plus précise
    function detectDevice() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Détection mobile multi-critères
      isMobile = width <= 768 || 
                /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
                ('ontouchstart' in window) ||
                (navigator.maxTouchPoints > 0);
      
      console.log('Device detected:', isMobile ? 'Mobile' : 'Desktop', { width, height });
      
      // Appliquer les classes CSS
      const widget = document.querySelector('.chat-widget');
      if (widget) {
        widget.classList.toggle('is-mobile', isMobile);
        widget.classList.toggle('is-desktop', !isMobile);
      }
      
      // Mise à jour des classes des éléments selon le device
      updateElementClasses();
    }
    
    // 🎯 MISE A JOUR DES CLASSES CSS selon le device
    function updateElementClasses() {
      const elements = [
        { id: 'chatWindow', baseClass: 'chat-window' },
        { id: 'chatHeader', baseClass: 'chat-header' },
        { id: 'chatAvatar', baseClass: 'chat-avatar' },
        { id: 'chatTitle', baseClass: 'chat-title' },
        { id: 'chatSubtitle', baseClass: 'chat-subtitle' },
        { id: 'chatMessages', baseClass: 'chat-messages' },
        { id: 'chatInputArea', baseClass: 'chat-input-area' },
        { id: 'messageInput', baseClass: 'chat-input' },
        { id: 'sendBtn', baseClass: 'chat-send-btn' },
        { id: 'resetBtn', baseClass: 'chat-action-btn' },
        { id: 'closeBtn', baseClass: 'chat-action-btn' }
      ];
      
      elements.forEach(el => {
        const element = document.getElementById(el.id);
        if (element) {
          element.className = el.baseClass + (isMobile ? ' mobile' : ' desktop');
        }
      });
      
      // Mise à jour des avatars de messages existants
      document.querySelectorAll('.message-avatar').forEach(avatar => {
        avatar.className = 'message-avatar' + (isMobile ? ' mobile' : ' desktop');
      });
      
      // Mise à jour des bulles de messages existantes
      document.querySelectorAll('.message-bubble').forEach(bubble => {
        const isBot = bubble.classList.contains('bot');
        const isUser = bubble.classList.contains('user');
        bubble.className = 'message-bubble' + (isMobile ? ' mobile' : ' desktop') + 
                          (isBot ? ' bot' : '') + (isUser ? ' user' : '');
      });
    }
    
    // 💾 PERSISTANCE
    const STORAGE_KEY = 'chatbot_conversation_' + config._id;
    
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
            
            // Restaurer l'état ouvert CORRECTEMENT
            if (data.isOpen) {
              setTimeout(() => {
                isOpen = true;
                button?.classList.add('hidden');
                chatWindow?.classList.remove('hidden');
                popup?.classList.add('hidden');
                
                // Envoyer message pour redimensionner l'iframe
                parent.postMessage({ 
                  type: 'WIDGET_OPEN', 
                  data: { width: config.width, height: config.height, isMobile } 
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
    
    // Fonction pour ajouter au DOM sans sauvegarder - AVEC CLASSES DYNAMIQUES
    function addMessageToDOM(text, isBot, timestamp = new Date()) {
      const messageEl = document.createElement('div');
      messageEl.className = 'message ' + (isBot ? 'bot' : 'user');
      
      if (isBot) {
        messageEl.innerHTML = 
          '<img src="' + (config.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEM0Q0RDgiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0iIzY5NzU4NSIvPgo8cGF0aCBkPSJNMzAgMzJDMzAgMjYuNDc3MSAyNS41MjI5IDIyIDIwIDIyQzE0LjQ3NzEgMjIgMTAgMjYuNDc3MSAxMCAzMkgzMFoiIGZpbGw9IiM2OTc1ODUiLz4KPC9zdmc>') + '" alt="Bot" class="message-avatar' + (isMobile ? ' mobile' : ' desktop') + '">' +
          '<div>' +
            '<div class="message-bubble' + (isMobile ? ' mobile' : ' desktop') + ' bot">' + text + '</div>' +
            '<div class="message-timestamp">' + new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) + '</div>' +
          '</div>';
      } else {
        messageEl.innerHTML = 
          '<div>' +
            '<div class="message-bubble' + (isMobile ? ' mobile' : ' desktop') + ' user">' + text + '</div>' +
            '<div class="message-timestamp">' + new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) + '</div>' +
          '</div>';
      }
      
      messagesContainer?.appendChild(messageEl);
    }
    
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
    
    // 🎯 EVENT LISTENER RESIZE - Redetection automatique
    window.addEventListener('resize', function() {
      const oldIsMobile = isMobile;
      detectDevice();
      
      // Si le device type a changé, reconfigurer
      if (oldIsMobile !== isMobile) {
        console.log('Device type changed:', isMobile ? 'Mobile' : 'Desktop');
        
        // Notifier le parent du changement
        if (isOpen) {
          parent.postMessage({ 
            type: 'WIDGET_OPEN', 
            data: { width: config.width, height: config.height, isMobile } 
          }, '*');
        }
      }
    });
    
    // Fonctions MODIFIÉES avec gestion mobile/desktop
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
        
        // 🎯 NOTIFIER LE PARENT avec info mobile
        parent.postMessage({ 
          type: 'WIDGET_OPEN', 
          data: { width: config.width, height: config.height, isMobile } 
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
      
      // 🎯 NOTIFIER LE PARENT avec info mobile
      parent.postMessage({ 
        type: 'WIDGET_CLOSE', 
        data: { isMobile } 
      }, '*');
      
      saveConversation();
    }
    
    function resetChat() {
      messagesContainer.innerHTML = '';
      messages = [];
      
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
      input.style.height = isMobile ? '40px' : '32px'; // Hauteur différente selon device
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
      const timestamp = new Date();
      
      // Ajouter au DOM avec les bonnes classes
      addMessageToDOM(text, isBot, timestamp);
      
      // Ajouter aux données
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
        '<img src="' + (config.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEM0Q0RDgiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0iIzY5NzU4NSIvPgo8cGF0aCBkPSJNMzAgMzJDMzAgMjYuNDc3MSAyNS41MjI5IDIyIDIwIDIyQzE0LjQ3NzEgMjIgMTAgMjYuNDc3MSAxMCAzMkgzMFoiIGZpbGw9IiM2OTc1ODUiLz4KPC9zdmc>') + '" alt="Bot" class="message-avatar' + (isMobile ? ' mobile' : ' desktop') + '">' +
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
    
    // 🎯 INITIALISATION
    window.addEventListener('DOMContentLoaded', function() {
      // Détecter le device dès le départ
      detectDevice();
      
      // Charger la conversation sauvée
      const loaded = loadConversation();
    });
    
    // Popup automatique
    if (config.showPopup && config.popupMessage && popup) {
      setTimeout(() => {
        if (!isOpen) popup.classList.remove('hidden');
      }, config.popupDelay * 1000);
    }
    
    // 🎯 COMMUNICATION AVEC PARENT - Avec info mobile
    parent.postMessage({ 
      type: 'WIDGET_READY', 
      data: { width: config.width, height: config.height, isMobile } 
    }, '*');
    
    console.log('Widget chargé avec succès - Device:', isMobile ? 'Mobile' : 'Desktop');
  </script>
</body>
</html>`;
return new NextResponse(htmlContent, {
  status: 200,
  headers: {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store', // optionnel
  },
});
} catch (err) {
  console.error('Widget GET error:', err);
  return new NextResponse('Internal Server Error', { status: 500 });
}
}