// components/DashboardChatWidget.tsx - COMPATIBLE AVEC TES PROPS EXACTES
'use client';

import { useEffect, useRef } from 'react';

// ✅ TYPES IDENTIQUES À TON UnifiedChatWidget
interface ChatWidgetConfig {
  _id: string;
  name: string;
  avatar?: string;
  welcomeMessage?: string;
  placeholderText?: string;
  theme: 'light' | 'dark';
  primaryColor: string;
  width: number;
  height: number;
  placement: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  popupMessage?: string;
  popupDelay: number;
  showPopup: boolean;
  showWelcomeMessage: boolean;
  selectedAgent: string;
  chatTitle?: string;
  subtitle?: string;
}

// ✅ PROPS IDENTIQUES À TON UnifiedChatWidget
interface DashboardChatWidgetProps {
  config: ChatWidgetConfig;
  mode: 'dashboard' | 'preview' | 'production';
  baseUrl?: string;
}

export default function DashboardChatWidget({ config, mode, baseUrl = '' }: DashboardChatWidgetProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current || !config) return;

    // 🎯 HTML IDENTIQUE À L'API ROUTE
    const widgetHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Chat Widget</title>
  
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
      background: transparent;
      overflow: hidden;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .widget-root {
      background: transparent;
      height: 100vh;
      width: 100vw;
      position: relative;
    }

    .chat-widget {
      position: ${mode === 'dashboard' ? 'absolute' : 'fixed'};
      ${config.placement.includes('bottom') ? 'bottom' : 'top'}: 24px;
      ${config.placement.includes('right') ? 'right' : 'left'}: 24px;
      z-index: ${mode === 'dashboard' ? '10' : '9999'};
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
      display: none;
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
      display: none;
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

    .message-item {
      display: flex;
      margin-bottom: 12px;
      align-items: flex-start;
    }

    .message-item.user {
      flex-direction: row-reverse;
      align-items: flex-end;
    }

    .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-right: 8px;
      align-self: flex-start;
      object-fit: cover;
    }

    .message-item.user .message-avatar {
      margin-right: 0;
      margin-left: 8px;
    }

    .message-content {
      display: flex;
      flex-direction: column;
      max-width: 320px;
      position: relative;
    }

    .message-bubble {
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

    .message-bubble.bot {
      background: linear-gradient(135deg, #e5e7eb, #f3f4f6);
      color: #111827;
    }

    .message-bubble.user {
      background: linear-gradient(135deg, var(--primary-color, #3b82f6), color-mix(in srgb, var(--primary-color, #3b82f6) 90%, #06b6d4));
      color: white;
      align-self: flex-end;
    }

    .dark .message-bubble.bot {
      background: linear-gradient(135deg, #374151, #4b5563);
      color: white;
      border-color: rgba(75, 85, 99, 0.3);
    }

    .message-time {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 2px;
      font-weight: 500;
    }

    .message-time.bot {
      text-align: left;
      padding-left: 4px;
    }

    .message-time.user {
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
      font-family: inherit;
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

    @keyframes bounceIn {
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
      animation: bounceIn 0.4s ease-out;
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

    .animate-slide-in {
      animation: slideInUp 0.3s ease-out;
    }

    @keyframes expand {
      0% {
        opacity: 0;
        transform: scale(0.9);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    .animate-expand {
      animation: expand 0.3s ease-out;
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

    .typing-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #6b7280;
      animation: bounceDots 1.2s infinite ease-in-out;
      margin: 0 1px;
    }

    .typing-dot:nth-child(1) { animation-delay: 0.0s; }
    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }

    .chat-messages::-webkit-scrollbar {
      width: 6px;
    }

    .chat-messages::-webkit-scrollbar-track {
      background: rgba(17, 24, 39, 0.3);
      border-radius: 8px;
    }

    .chat-messages::-webkit-scrollbar-thumb {
      background: linear-gradient(to bottom, rgba(59, 130, 246, 0.6), rgba(6, 182, 212, 0.6));
      border-radius: 8px;
    }

    .chat-messages::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(to bottom, rgba(59, 130, 246, 0.8), rgba(6, 182, 212, 0.8));
    }

    @media (max-height: 600px) {
      .chat-widget {
        max-height: calc(100vh - 50px);
        min-height: 250px;
      }
    }
  </style>
</head>

<body>
  <div class="widget-root"></div>

  <script>
    window.WIDGET_CONFIG = ${JSON.stringify(config)};
    window.MODE = "${mode}";
    window.BASE_URL = "${baseUrl}";
    
    class DashboardWidget {
      constructor(config) {
        this.config = config;
        this.messages = [];
        this.isOpen = false;
        this.isTyping = false;
        
        this.init();
      }
      
      init() {
        this.createWidget();
        this.setupEventListeners();
        this.addWelcomeMessage();
        this.applyConfig();
        
        // Pas de popup en mode dashboard
        if (window.MODE !== 'dashboard') {
          this.setupPopup();
        }
      }
      
      createWidget() {
        const root = document.querySelector('.widget-root');
        const isDark = this.config.theme === 'dark';
        
        root.innerHTML = \`
          <div class="chat-widget" style="--primary-color: \${this.config.primaryColor};">
            
            <div class="chat-popup" style="background-color: \${this.config.primaryColor}; display: none;">
              \${this.config.popupMessage || 'Salut ! Besoin d\\'aide ?'}
            </div>
            
            <button class="chat-button animate-bounce-in" style="background-color: \${this.config.primaryColor};">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            
            <div class="chat-window animate-expand \${isDark ? 'dark' : ''}" style="width: \${this.config.width}px; height: \${this.config.height}px; display: none;">
              
              <div class="chat-header">
                <div class="chat-header-content">
                  <div class="chat-avatar-container">
                    <img src="\${this.config.avatar || '/Default Avatar.png'}" alt="Avatar" class="chat-avatar" onerror="this.src='/Default Avatar.png'"/>
                    <div class="chat-status"></div>
                  </div>
                  <div class="chat-info">
                    <h3 class="chat-title">\${this.config.chatTitle || this.config.name}</h3>
                    <p class="chat-subtitle">\${this.config.subtitle || 'En ligne'}</p>
                  </div>
                </div>
                <div class="chat-actions">
                  <button class="chat-action-btn reset-btn" title="Nouvelle conversation">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M3.51 15a9 9 0 102.13-9.36L1 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <button class="chat-action-btn close-btn" title="Fermer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="chat-messages \${isDark ? 'dark' : ''}">
                <div class="messages-container">
                </div>
              </div>
              
              <div class="chat-input-area \${isDark ? 'dark' : ''}">
                <div class="chat-input-container">
                  <input type="text" class="chat-input \${isDark ? 'dark' : ''}" placeholder="\${this.config.placeholderText || 'Tapez votre message...'}" />
                  <button class="chat-send-btn" style="background-color: \${this.config.primaryColor};">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <polygon points="22,2 15,22 11,13 2,9 22,2" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        \`;
      }
      
      setupEventListeners() {
        document.querySelector('.chat-button')?.addEventListener('click', () => this.toggleChat());
        document.querySelector('.close-btn')?.addEventListener('click', () => this.toggleChat());
        document.querySelector('.reset-btn')?.addEventListener('click', () => this.resetChat());
        document.querySelector('.chat-send-btn')?.addEventListener('click', () => this.sendMessage());
        
        const input = document.querySelector('.chat-input');
        input?.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
          }
        });
      }
      
      applyConfig() {
        document.documentElement.style.setProperty('--primary-color', this.config.primaryColor);
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
      
      setupPopup() {
        if (this.config.showPopup && this.config.popupMessage) {
          setTimeout(() => {
            if (!this.isOpen) {
              const popup = document.querySelector('.chat-popup');
              if (popup) popup.style.display = 'block';
            }
          }, this.config.popupDelay * 1000);
        }
      }
      
      toggleChat() {
        this.isOpen = !this.isOpen;
        const button = document.querySelector('.chat-button');
        const window = document.querySelector('.chat-window');
        const popup = document.querySelector('.chat-popup');
        
        if (this.isOpen) {
          button.style.display = 'none';
          window.style.display = 'flex';
          popup.style.display = 'none';
          
          setTimeout(() => {
            document.querySelector('.chat-input')?.focus();
          }, 300);
        } else {
          button.style.display = 'flex';
          window.style.display = 'none';
        }
      }
      
      resetChat() {
        this.messages = [];
        if (this.config.showWelcomeMessage && this.config.welcomeMessage) {
          this.messages.push({
            id: 'welcome',
            text: this.config.welcomeMessage,
            isBot: true,
            timestamp: new Date()
          });
        }
        this.renderMessages();
      }
      
      async sendMessage() {
        const input = document.querySelector('.chat-input');
        const text = input?.value?.trim();
        if (!text) return;
        
        this.messages.push({
          id: crypto.randomUUID(),
          text: text,
          isBot: false,
          timestamp: new Date()
        });
        
        input.value = '';
        this.renderMessages();
        
        setTimeout(() => {
          this.isTyping = true;
          this.renderTyping();
        }, 300);
        
        try {
          // ✅ API selon le mode (identique à ton UnifiedChatWidget)
          const apiUrl = window.MODE === 'production' 
            ? \`\${window.BASE_URL}/api/agents/\${this.config.selectedAgent}/ask\`
            : \`/api/agents/\${this.config.selectedAgent}/ask\`;
          
          const headers = {
            'Content-Type': 'application/json',
          };
          
          // ✅ Headers publics seulement en production
          if (window.MODE === 'production') {
            headers['x-public-kind'] = 'widget';
            headers['x-widget-id'] = this.config._id;
            headers['x-widget-token'] = 'public';
          }
          
          const history = this.messages
            .filter(msg => msg.id !== 'welcome')
            .map(msg => ({
              role: msg.isBot ? 'assistant' : 'user',
              content: msg.text,
            }));
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              message: text,
              previousMessages: history,
              welcomeMessage: this.config.showWelcomeMessage ? this.config.welcomeMessage : null,
            }),
          });
          
          const data = await response.json();
          
          setTimeout(() => {
            this.isTyping = false;
            this.messages.push({
              id: crypto.randomUUID(),
              text: data.reply || "Désolé, je n'ai pas pu traiter votre demande.",
              isBot: true,
              timestamp: new Date()
            });
            this.renderMessages();
          }, 800);
          
        } catch (error) {
          console.error('Erreur:', error);
          setTimeout(() => {
            this.isTyping = false;
            this.messages.push({
              id: crypto.randomUUID(),
              text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
              isBot: true,
              timestamp: new Date()
            });
            this.renderMessages();
          }, 800);
        }
      }
      
      renderMessages() {
        const container = document.querySelector('.messages-container');
        if (!container) return;
        
        container.innerHTML = this.messages.map((message, index) => \`
          <div class="message-item \${message.isBot ? 'bot' : 'user'}" style="animation: slideInUp 0.3s ease-out \${index * 0.1}s both;">
            \${message.isBot ? \`
              <img src="\${this.config.avatar || '/Default Avatar.png'}" alt="Bot" class="message-avatar" onerror="this.src='/Default Avatar.png'"/>
            \` : ''}
            <div class="message-content">
              <div class="message-bubble \${message.isBot ? 'bot' : 'user'}">
                \${message.text}
              </div>
              <div class="message-time \${message.isBot ? 'bot' : 'user'}">
                \${new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        \`).join('');
        
        this.scrollToBottom();
      }
      
      renderTyping() {
        const container = document.querySelector('.messages-container');
        if (!container) return;
        
        if (this.isTyping) {
          const typingHtml = \`
            <div id="typing-indicator" class="message-item bot">
              <img src="\${this.config.avatar || '/Default Avatar.png'}" alt="Bot" class="message-avatar" onerror="this.src='/Default Avatar.png'"/>
              <div class="message-content">
                <div class="message-bubble bot" style="display: flex; align-items: center; gap: 4px; padding: 12px 16px;">
                  <span class="typing-dot"></span>
                  <span class="typing-dot"></span>
                  <span class="typing-dot"></span>
                </div>
              </div>
            </div>
          \`;
          container.insertAdjacentHTML('beforeend', typingHtml);
        } else {
          const typingIndicator = document.getElementById('typing-indicator');
          if (typingIndicator) {
            typingIndicator.remove();
          }
        }
        
        this.scrollToBottom();
      }
      
      scrollToBottom() {
        const messagesArea = document.querySelector('.chat-messages');
        if (messagesArea) {
          setTimeout(() => {
            messagesArea.scrollTop = messagesArea.scrollHeight;
          }, 100);
        }
      }
    }
    
    // Initialiser le widget
    const widget = new DashboardWidget(window.WIDGET_CONFIG);
    
    // Exposer pour debugging
    window.chatWidget = widget;
  </script>
</body>
</html>
    `;

    // Écrire le HTML dans l'iframe
    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(widgetHTML);
      doc.close();
    }
  }, [config, mode, baseUrl]);

  // ✅ MÊMES STYLES QUE TON UnifiedChatWidget
  const getWidgetStyles = () => {
    if (mode === 'dashboard') {
      return {
        position: 'absolute' as const,
        [config.placement.split('-')[0]]: '24px',
        [config.placement.split('-')[1]]: '24px',
        zIndex: 10,
        width: '100%',
        height: '100%',
      };
    }
    return {
      position: 'fixed' as const,
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      width: '100%',
      height: '100%',
    };
  };

  return (
    <div 
      className="relative"
      style={{ 
        minHeight: mode === 'dashboard' ? '400px' : '100vh',
        width: '100%'
      }}
    >
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        style={{
          background: 'transparent',
          pointerEvents: 'auto',
          ...getWidgetStyles()
        }}
        title="Chat Widget Preview"
      />
    </div>
  );
}