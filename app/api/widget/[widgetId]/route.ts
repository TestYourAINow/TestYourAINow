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

    // 🎯 HTML PROPRE AVEC CSS EXTERNE
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${config.name || 'Chat Widget'}</title>
  
  <!-- ✅ CSS EXTERNE UNIQUEMENT -->
  <link rel="stylesheet" href="/widget-styles.css" />
</head>

<body>
  <!-- WIDGET CONTAINER -->
  <div id="chat-widget-root"></div>
  
  <script>
    // Configuration du widget
    window.WIDGET_CONFIG = ${JSON.stringify(config)};
    
    // 🎯 CLASSE WIDGET VANILLA JS - VERSION PROPRE
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
        
        // ✅ HTML PROPRE - LAISSE LE CSS FAIRE SON TRAVAIL
        root.innerHTML = \`
          <div class="chat-widget" style="--primary-color: \${this.config.primaryColor};">
            
            <!-- Popup -->
            <div id="chat-popup" class="chat-popup animate-slide-in-message" style="display: none;">
              \${this.config.popupMessage || 'Hi! Need any help?'}
            </div>
            
            <!-- Bouton -->
            <button id="chat-button" class="chat-button animate-bounce-in">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            
            <!-- Chat Window -->
            <div id="chat-window" class="chat-window animate-expand-from-button \${this.config.theme === 'dark' ? 'dark' : ''}" style="display: none; width: \${this.config.width}px; height: \${this.config.height}px;">
              
              <!-- Header -->
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
                  <button id="reset-btn" class="chat-action-btn" title="Nouvelle conversation">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M3.51 15a9 9 0 102.13-9.36L1 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <button id="close-btn" class="chat-action-btn" title="Fermer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <!-- Messages -->
              <div id="messages-area" class="chat-messages \${this.config.theme === 'dark' ? 'dark' : ''} custom-scrollbar">
                <div id="messages-container" class="messages-container"></div>
              </div>
              
              <!-- Input -->
              <div class="chat-input-area \${this.config.theme === 'dark' ? 'dark' : ''} animate-slide-up">
                <div class="chat-input-container">
                  <input 
                    id="message-input" 
                    type="text" 
                    placeholder="\${this.config.placeholderText || 'Tapez votre message...'}" 
                    class="chat-input \${this.config.theme === 'dark' ? 'dark' : ''}"
                  />
                  <button id="send-btn" class="chat-send-btn animate-button-hover">
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
        const chatButton = document.getElementById('chat-button');
        const closeBtn = document.getElementById('close-btn');
        const resetBtn = document.getElementById('reset-btn');
        const sendBtn = document.getElementById('send-btn');
        const messageInput = document.getElementById('message-input');
        
        chatButton?.addEventListener('click', () => this.toggleChat());
        closeBtn?.addEventListener('click', () => this.toggleChat());
        resetBtn?.addEventListener('click', () => this.resetChat());
        sendBtn?.addEventListener('click', () => this.sendMessage());
        
        messageInput?.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
          }
        });
      }
      
      setupPopup() {
        if (this.config.showPopup && this.config.popupMessage) {
          setTimeout(() => {
            if (!this.isOpen) {
              this.showPopupBubble();
            }
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
          
          setTimeout(() => {
            document.getElementById('message-input')?.focus();
          }, 300);
          
          // Communication avec parent
          parent.postMessage({
            type: 'WIDGET_OPEN',
            data: { width: this.config.width, height: this.config.height }
          }, '*');
        } else {
          if (chatButton) chatButton.style.display = 'flex';
          if (chatWindow) chatWindow.style.display = 'none';
          
          // Communication avec parent
          parent.postMessage({
            type: 'WIDGET_CLOSE',
            data: {}
          }, '*');
        }
      }
      
      async sendMessage() {
        const input = document.getElementById('message-input');
        const text = input?.value?.trim();
        if (!text) return;
        
        // Message utilisateur
        this.messages.push({
          id: Date.now().toString(),
          text: text,
          isBot: false,
          timestamp: new Date()
        });
        
        if (input) input.value = '';
        this.renderMessages();
        
        // Typing indicator
        setTimeout(() => {
          this.isTyping = true;
          this.renderTyping();
        }, 200);
        
        try {
          // API Call
          const history = this.messages
            .filter(msg => msg.id !== 'welcome')
            .map(msg => ({
              role: msg.isBot ? 'assistant' : 'user',
              content: msg.text,
            }));
          
          const response = await fetch(\`/api/agents/\${this.config.selectedAgent}/ask\`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-public-kind': 'widget',
              'x-widget-id': this.config._id,
              'x-widget-token': 'public'
            },
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
              id: (Date.now() + 1).toString(),
              text: data.reply || "Désolé, je n'ai pas pu traiter votre demande.",
              isBot: true,
              timestamp: new Date()
            });
            this.renderMessages();
          }, 800);
          
        } catch (error) {
          console.error('Erreur envoi message:', error);
          setTimeout(() => {
            this.isTyping = false;
            this.messages.push({
              id: (Date.now() + 1).toString(),
              text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
              isBot: true,
              timestamp: new Date()
            });
            this.renderMessages();
          }, 800);
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
      
      renderMessages() {
        const container = document.getElementById('messages-container');
        if (!container) return;
        
        container.innerHTML = this.messages.map((message, index) => \`
          <div class="flex \${message.isBot ? 'items-start' : 'items-end'} mb-3 \${message.isBot ? 'flex-row' : 'flex-row-reverse'} animate-slide-in-message" style="animation-delay: \${index * 0.05}s; animation-fill-mode: both;">
            \${message.isBot ? \`
              <img src="\${this.config.avatar || '/Default Avatar.png'}" alt="Bot Avatar" class="w-8 h-8 rounded-full self-start mr-2 animate-avatar-pop" style="flex-shrink: 0; animation-delay: \${index * 0.05 + 0.05}s; animation-fill-mode: both;" onerror="this.src='/Default Avatar.png'"/>
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
        
        this.scrollToBottom();
      }
      
      renderTyping() {
        const container = document.getElementById('messages-container');
        if (!container) return;
        
        if (this.isTyping) {
          const typingHtml = \`
            <div id="typing-indicator" class="flex items-start mb-3 flex-row animate-slide-in-message">
              <img src="\${this.config.avatar || '/Default Avatar.png'}" alt="Bot Avatar" class="w-8 h-8 rounded-full self-start mr-2 animate-avatar-pop" style="animation-delay: 0.1s; animation-fill-mode: both;" onerror="this.src='/Default Avatar.png'"/>
              <div class="chat-bubble bot animate-typing-bubble" style="display: flex; align-items: center; gap: 4px; padding: 12px 16px; animation-delay: 0.2s; animation-fill-mode: both;">
                <span class="inline-block w-2 h-2 rounded-full animate-bounceDots" style="background-color: \${this.config.theme === 'dark' ? '#9ca3af' : '#6b7280'}; animation-delay: 0.5s;"></span>
                <span class="inline-block w-2 h-2 rounded-full animate-bounceDots" style="background-color: \${this.config.theme === 'dark' ? '#9ca3af' : '#6b7280'}; animation-delay: 0.7s;"></span>
                <span class="inline-block w-2 h-2 rounded-full animate-bounceDots" style="background-color: \${this.config.theme === 'dark' ? '#9ca3af' : '#6b7280'}; animation-delay: 0.9s;"></span>
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
        const messagesArea = document.getElementById('messages-area');
        if (messagesArea) {
          setTimeout(() => {
            messagesArea.scrollTop = messagesArea.scrollHeight;
          }, 100);
        }
      }
      
      communicateWithParent() {
        // Signaler que le widget est prêt
        parent.postMessage({
          type: 'WIDGET_READY',
          data: { 
            width: this.config.width, 
            height: this.config.height 
          }
        }, '*');
      }
    }
    
    // 🚀 INITIALISER LE WIDGET
    document.addEventListener('DOMContentLoaded', function() {
      console.log('🚀 Initializing chat widget...', window.WIDGET_CONFIG);
      window.chatWidget = new VanillaChatWidget(window.WIDGET_CONFIG);
    });
    
    // Gestion des erreurs
    window.addEventListener('error', function(e) {
      console.error('Widget error:', e);
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