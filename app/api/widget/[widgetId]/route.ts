// app/api/widget/[widgetId]/route.ts - VERSION RENDERTOSTRING
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ChatbotConfig } from "@/models/ChatbotConfig";
import { renderToString } from 'react-dom/server';
import React from 'react';

// Import direct de ton composant
import UnifiedChatWidget from '@/components/UnifiedChatWidget';

export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    const { widgetId } = params;
    
    await connectToDatabase();
    
    const rawConfig = await ChatbotConfig.findById(widgetId).lean();
    
    if (!rawConfig) {
      return new NextResponse('Widget not found', { status: 404 });
    }

    const config = JSON.parse(JSON.stringify(rawConfig));
    const baseUrl = req.nextUrl.origin;

    // 🎯 RENDER TON COMPOSANT EXACTEMENT COMME DANS LE DASHBOARD
    const widgetComponent = React.createElement(UnifiedChatWidget, {
      config: config,
      mode: 'production',
      baseUrl: baseUrl
    });

    // Convertir en HTML string
    const widgetHTML = renderToString(widgetComponent);

    // 🎯 HTML FINAL - Inclut Tailwind CSS !
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${config.name || 'Chat Widget'}</title>
  
  <!-- ✅ TAILWIND CSS - COMME TON DASHBOARD -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- ✅ TON CSS CUSTOM -->
  <link rel="stylesheet" href="${baseUrl}/widget-styles.css" />
  
  <!-- ✅ LUCIDE ICONS - COMME TON DASHBOARD -->
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
  
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      background: transparent !important;
      overflow: hidden;
      height: 100%;
      width: 100%;
      font-family: Inter, system-ui, sans-serif;
    }
    
    #widget-root {
      background: transparent !important;
      height: 100vh;
      width: 100vw;
      position: relative;
    }
    
    /* Assurer que le widget prend tout l'espace */
    .chat-widget {
      position: fixed !important;
      bottom: 24px !important;
      right: 24px !important;
      z-index: 9999 !important;
    }
  </style>
</head>

<body>
  <div id="widget-root">
    ${widgetHTML}
  </div>
  
  <script>
    // Configuration globale
    window.WIDGET_CONFIG = ${JSON.stringify(config)};
    window.BASE_URL = "${baseUrl}";
    
    // 🎯 HYDRATATION - Rendre le widget interactif
    document.addEventListener('DOMContentLoaded', function() {
      // Initialiser Lucide icons
      if (window.lucide) {
        lucide.createIcons();
      }
      
      // Simuler les événements React
      initializeWidgetEvents();
      
      // Notifier le parent
      parent.postMessage({
        type: 'WIDGET_READY',
        data: { 
          width: window.WIDGET_CONFIG.width, 
          height: window.WIDGET_CONFIG.height 
        }
      }, '*');
    });
    
    // 🎯 FONCTIONS D'ÉVÉNEMENTS - Copie de ton composant React
    function initializeWidgetEvents() {
      const config = window.WIDGET_CONFIG;
      let isOpen = false;
      let messages = [];
      let isTyping = false;
      
      // Ajouter message de bienvenue
      if (config.showWelcomeMessage && config.welcomeMessage) {
        messages.push({
          id: 'welcome',
          text: config.welcomeMessage,
          isBot: true,
          timestamp: new Date()
        });
      }
      
      // Event listeners
      const chatButton = document.querySelector('.chat-button');
      const closeBtn = document.querySelector('[title="Fermer"]');
      const resetBtn = document.querySelector('[title="Nouvelle conversation"]');
      const sendBtn = document.querySelector('.chat-send-btn');
      const messageInput = document.querySelector('.chat-input');
      
      if (chatButton) {
        chatButton.addEventListener('click', toggleChat);
      }
      
      if (closeBtn) {
        closeBtn.addEventListener('click', toggleChat);
      }
      
      if (resetBtn) {
        resetBtn.addEventListener('click', resetChat);
      }
      
      if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
      }
      
      if (messageInput) {
        messageInput.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        });
      }
      
      // Popup automatique
      if (config.showPopup && config.popupMessage) {
        setTimeout(() => {
          if (!isOpen) {
            const popup = document.querySelector('.chat-popup');
            if (popup) {
              popup.style.display = 'block';
            }
          }
        }, config.popupDelay * 1000);
      }
      
      function toggleChat() {
        isOpen = !isOpen;
        const chatButton = document.querySelector('.chat-button');
        const chatWindow = document.querySelector('.chat-window');
        const popup = document.querySelector('.chat-popup');
        
        if (isOpen) {
          if (chatButton) chatButton.style.display = 'none';
          if (chatWindow) chatWindow.style.display = 'flex';
          if (popup) popup.style.display = 'none';
          
          setTimeout(() => {
            const input = document.querySelector('.chat-input');
            if (input) input.focus();
          }, 300);
          
          parent.postMessage({
            type: 'WIDGET_OPEN',
            data: { width: config.width, height: config.height }
          }, '*');
        } else {
          if (chatButton) chatButton.style.display = 'flex';
          if (chatWindow) chatWindow.style.display = 'none';
          
          parent.postMessage({
            type: 'WIDGET_CLOSE',
            data: {}
          }, '*');
        }
      }
      
      function resetChat() {
        messages = [];
        if (config.showWelcomeMessage && config.welcomeMessage) {
          messages.push({
            id: 'welcome',
            text: config.welcomeMessage,
            isBot: true,
            timestamp: new Date()
          });
        }
        renderMessages();
      }
      
      async function sendMessage() {
        const input = document.querySelector('.chat-input');
        const text = input?.value?.trim();
        if (!text) return;
        
        // Message utilisateur
        messages.push({
          id: crypto.randomUUID(),
          text: text,
          isBot: false,
          timestamp: new Date()
        });
        
        input.value = '';
        renderMessages();
        
        // Typing indicator
        setTimeout(() => {
          isTyping = true;
          renderTyping();
        }, 200);
        
        try {
          const history = messages
            .filter(msg => msg.id !== 'welcome')
            .map(msg => ({
              role: msg.isBot ? 'assistant' : 'user',
              content: msg.text,
            }));
          
          const response = await fetch(\`\${window.BASE_URL}/api/agents/\${config.selectedAgent}/ask\`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-public-kind': 'widget',
              'x-widget-id': config._id,
              'x-widget-token': 'public'
            },
            body: JSON.stringify({
              message: text,
              previousMessages: history,
              welcomeMessage: config.showWelcomeMessage ? config.welcomeMessage : null,
            }),
          });
          
          const data = await response.json();
          
          setTimeout(() => {
            isTyping = false;
            messages.push({
              id: crypto.randomUUID(),
              text: data.reply || "Désolé, je n'ai pas pu traiter votre demande.",
              isBot: true,
              timestamp: new Date()
            });
            renderMessages();
          }, 800);
          
        } catch (error) {
          console.error('Erreur envoi message:', error);
          setTimeout(() => {
            isTyping = false;
            messages.push({
              id: crypto.randomUUID(),
              text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
              isBot: true,
              timestamp: new Date()
            });
            renderMessages();
          }, 800);
        }
      }
      
      function renderMessages() {
        const container = document.querySelector('.messages-container');
        if (!container) return;
        
        container.innerHTML = messages.map((message, index) => \`
          <div class="flex \${message.isBot ? 'items-start' : 'items-end'} mb-3 \${message.isBot ? 'flex-row' : 'flex-row-reverse'} animate-slide-in-message" style="animation-delay: \${index * 0.05}s; animation-fill-mode: both;">
            \${message.isBot ? \`
              <img src="\${config.avatar || '/Default Avatar.png'}" alt="Bot Avatar" class="w-8 h-8 rounded-full self-start mr-2" style="flex-shrink: 0;" onerror="this.src='/Default Avatar.png'"/>
            \` : ''}
            <div class="flex flex-col max-w-sm relative">
              <div class="chat-bubble \${message.isBot ? 'bot' : 'user'}">
                \${message.text}
              </div>
              <div class="chat-timestamp \${message.isBot ? 'bot' : 'user'}">
                \${new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        \`).join('');
        
        scrollToBottom();
      }
      
      function renderTyping() {
        const container = document.querySelector('.messages-container');
        if (!container) return;
        
        if (isTyping) {
          const typingHtml = \`
            <div id="typing-indicator" class="flex items-start mb-3 flex-row animate-slide-in-message">
              <img src="\${config.avatar || '/Default Avatar.png'}" alt="Bot Avatar" class="w-8 h-8 rounded-full self-start mr-2" style="animation-delay: 0.1s; animation-fill-mode: both;" onerror="this.src='/Default Avatar.png'"/>
              <div class="chat-bubble bot" style="display: flex; align-items: center; gap: 4px; padding: 12px 16px;">
                <span class="inline-block w-2 h-2 rounded-full animate-bounceDots" style="background-color: \${config.theme === 'dark' ? '#9ca3af' : '#6b7280'}; animation-delay: 0.5s;"></span>
                <span class="inline-block w-2 h-2 rounded-full animate-bounceDots" style="background-color: \${config.theme === 'dark' ? '#9ca3af' : '#6b7280'}; animation-delay: 0.7s;"></span>
                <span class="inline-block w-2 h-2 rounded-full animate-bounceDots" style="background-color: \${config.theme === 'dark' ? '#9ca3af' : '#6b7280'}; animation-delay: 0.9s;"></span>
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
        
        scrollToBottom();
      }
      
      function scrollToBottom() {
        const messagesArea = document.querySelector('.chat-messages');
        if (messagesArea) {
          setTimeout(() => {
            messagesArea.scrollTop = messagesArea.scrollHeight;
          }, 100);
        }
      }
      
      // Render initial
      renderMessages();
    }
    
    // Gestion des erreurs
    window.addEventListener('error', function(e) {
      parent.postMessage({
        type: 'WIDGET_ERROR',
        data: { error: e.message }
      }, '*');
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