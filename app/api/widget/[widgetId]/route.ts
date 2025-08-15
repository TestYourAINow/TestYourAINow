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
    const baseUrl = req.nextUrl.origin;

    // 🎯 HTML AVEC REACT + RENDU CÔTÉ SERVEUR
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${config.name || 'Chat Widget'}</title>
  
  <!-- CSS EXTERNE IDENTIQUE AU DASHBOARD -->
  <link rel="stylesheet" href="${baseUrl}/widget-styles.css" />
  
  <!-- REACT LIBRARIES -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  
  <!-- LUCIDE ICONS -->
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
</head>

<body>
  <!-- WIDGET CONTAINER -->
  <div id="widget-root"></div>
  
  <script>
    // Configuration du widget
    window.WIDGET_CONFIG = ${JSON.stringify(config)};
    window.BASE_URL = "${baseUrl}";
    
    // 🎯 COMPOSANT REACT IDENTIQUE AU DASHBOARD
    const { useState, useEffect, useRef, createElement: h } = React;
    const { MessageCircle, X, RotateCcw, Send } = lucide;
    
    function UnifiedChatWidget({ config, mode = 'production', baseUrl = '' }) {
      // ========== ÉTATS IDENTIQUES ==========
      const [messages, setMessages] = useState([]);
      const [inputValue, setInputValue] = useState('');
      const [isTyping, setIsTyping] = useState(false);
      const [isOpen, setIsOpen] = useState(false);
      const [showPopup, setShowPopup] = useState(false);

      // ========== REFS ==========
      const messagesEndRef = useRef(null);
      const inputRef = useRef(null);

      // ========== COMPUTED ==========
      const isDark = config.theme === 'dark';
      const primaryColor = config.primaryColor || '#3b82f6';

      // ========== EFFETS IDENTIQUES ==========
      
      // 🏁 Message de bienvenue initial
      useEffect(() => {
        if (config.showWelcomeMessage && config.welcomeMessage && messages.length === 0) {
          setMessages([{
            id: 'welcome',
            text: config.welcomeMessage,
            isBot: true,
            timestamp: new Date()
          }]);
        }
      }, [config.showWelcomeMessage, config.welcomeMessage]);

      // 💬 Popup automatique
      useEffect(() => {
        if (config.showPopup && config.popupMessage && !isOpen && mode === 'production') {
          const timer = setTimeout(() => {
            setShowPopup(true);
          }, config.popupDelay * 1000);
          return () => clearTimeout(timer);
        } else {
          setShowPopup(false);
        }
      }, [config.showPopup, config.popupMessage, config.popupDelay, isOpen, mode]);

      // 🔄 Auto-scroll des messages
      useEffect(() => {
        if (messagesEndRef.current) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ 
              behavior: 'smooth',
              block: 'end'
            });
          }, 100);
        }
      }, [messages, isTyping]);

      // 🎯 Focus automatique quand ouvert
      useEffect(() => {
        if (isOpen) {
          setTimeout(() => inputRef.current?.focus(), 300);
        }
      }, [isOpen]);

      // 📨 Envoyer un message
      const sendMessage = async () => {
        const trimmed = inputValue.trim();
        if (!trimmed) return;

        // Message utilisateur
        const userMessage = {
          id: crypto.randomUUID(),
          text: trimmed,
          isBot: false,
          timestamp: new Date()
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInputValue('');
        
        // Animation typing avec délai
        setTimeout(() => setIsTyping(true), 200);

        try {
          // 🔧 URL d'API
          const apiUrl = \`\${baseUrl}/api/agents/\${config.selectedAgent}/ask\`;

          // 🌐 Headers publics
          const headers = {
            'Content-Type': 'application/json',
            'x-public-kind': 'widget',
            'x-widget-id': config._id,
            'x-widget-token': 'public'
          };

          // 🔧 Préparer l'historique pour l'API
          const history = updatedMessages
            .filter(msg => msg.id !== 'welcome')
            .map(msg => ({
              role: msg.isBot ? 'assistant' : 'user',
              content: msg.text,
            }));

          // 📡 Appel API
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              message: trimmed,
              previousMessages: history,
              welcomeMessage: config.showWelcomeMessage ? config.welcomeMessage : null,
            }),
          });

          const data = await response.json();
          
          // 🤖 Réponse du bot avec délai minimum
          setTimeout(() => {
            const botMessage = {
              id: crypto.randomUUID(),
              text: data.reply || "Désolé, je n'ai pas pu traiter votre demande.",
              isBot: true,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
          }, 800);
          
        } catch (error) {
          console.error('Erreur envoi message:', error);
          
          // 🚨 Message d'erreur
          setTimeout(() => {
            const errorMessage = {
              id: crypto.randomUUID(),
              text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
              isBot: true,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
            setIsTyping(false);
          }, 800);
        }
      };

      // 🔄 Nouvelle conversation
      const resetChat = () => {
        const welcomeMessages = config.showWelcomeMessage && config.welcomeMessage
          ? [{
              id: 'welcome',
              text: config.welcomeMessage,
              isBot: true,
              timestamp: new Date()
            }]
          : [];
        
        setMessages(welcomeMessages);
      };

      // 🎭 Toggle chat ouvert/fermé
      const toggleChat = () => {
        setIsOpen(!isOpen);
        setShowPopup(false);

        // 📡 Communication avec parent iframe
        if (!isOpen) {
          parent.postMessage({
            type: 'WIDGET_OPEN',
            data: { width: config.width, height: config.height }
          }, '*');
        } else {
          parent.postMessage({
            type: 'WIDGET_CLOSE',
            data: {}
          }, '*');
        }
      };

      // 🎹 Gestion Enter dans l'input
      const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      };

      // ========== COMMUNICATION IFRAME ==========
      useEffect(() => {
        // Signaler que le widget est prêt
        parent.postMessage({
          type: 'WIDGET_READY',
          data: { 
            width: config.width, 
            height: config.height 
          }
        }, '*');
      }, []);

      // ========== RENDER ==========
      return h('div', {
        className: 'chat-widget',
        style: {
          '--primary-color': primaryColor,
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999
        }
      }, [
        // 💭 POPUP BUBBLE
        showPopup && !isOpen && config.popupMessage && h('div', {
          key: 'popup',
          className: 'chat-popup animate-slide-in-message',
          style: { backgroundColor: primaryColor }
        }, config.popupMessage),

        // 🔘 CHAT BUTTON
        !isOpen && h('button', {
          key: 'button',
          className: 'chat-button animate-bounce-in',
          onClick: toggleChat,
          style: { backgroundColor: primaryColor },
          'aria-label': 'Ouvrir le chat'
        }, h(MessageCircle, { size: 24, color: 'white' })),

        // 🏠 CHAT WINDOW
        isOpen && h('div', {
          key: 'window',
          className: \`chat-window animate-expand-from-button \${isDark ? 'dark' : ''}\`,
          style: {
            width: config.width,
            height: config.height,
            '--primary-color': primaryColor
          }
        }, [
          // 📋 HEADER
          h('div', { key: 'header', className: 'chat-header' }, [
            h('div', { key: 'header-content', className: 'chat-header-content' }, [
              h('div', { key: 'avatar-container', className: 'chat-avatar-container' }, [
                h('img', {
                  key: 'avatar',
                  src: config.avatar || '/Default Avatar.png',
                  alt: 'Assistant Avatar',
                  className: 'chat-avatar',
                  onError: (e) => {
                    e.currentTarget.src = '/Default Avatar.png';
                  }
                }),
                h('div', { key: 'status', className: 'chat-status' })
              ]),
              h('div', { key: 'info', className: 'chat-info' }, [
                h('h3', { key: 'title', className: 'chat-title' }, config.chatTitle || config.name),
                h('p', { key: 'subtitle', className: 'chat-subtitle' }, config.subtitle || 'En ligne')
              ])
            ]),
            h('div', { key: 'actions', className: 'chat-actions' }, [
              h('button', {
                key: 'reset',
                className: 'chat-action-btn',
                onClick: resetChat,
                title: 'Nouvelle conversation'
              }, h(RotateCcw, { size: 18 })),
              h('button', {
                key: 'close',
                className: 'chat-action-btn',
                onClick: toggleChat,
                title: 'Fermer'
              }, h(X, { size: 18 }))
            ])
          ]),

          // 💬 MESSAGES
          h('div', {
            key: 'messages',
            className: \`chat-messages \${isDark ? 'dark' : ''} custom-scrollbar\`
          }, [
            h('div', { key: 'messages-container', className: 'messages-container' }, [
              ...messages.map((message, index) => 
                h('div', {
                  key: message.id,
                  className: \`flex \${message.isBot ? 'items-start' : 'items-end'} mb-3 \${message.isBot ? 'flex-row' : 'flex-row-reverse'} animate-slide-in-message\`,
                  style: {
                    animationDelay: \`\${index * 0.05}s\`,
                    animationFillMode: 'both'
                  }
                }, [
                  message.isBot && h('img', {
                    key: 'bot-avatar',
                    src: config.avatar || '/Default Avatar.png',
                    alt: 'Bot Avatar',
                    className: 'w-8 h-8 rounded-full self-start mr-2 animate-avatar-pop',
                    style: { 
                      flexShrink: 0,
                      animationDelay: \`\${index * 0.05 + 0.05}s\`,
                      animationFillMode: 'both'
                    },
                    onError: (e) => {
                      e.currentTarget.src = '/Default Avatar.png';
                    }
                  }),
                  h('div', { key: 'message-content', className: 'flex flex-col max-w-sm relative' }, [
                    h('div', {
                      key: 'bubble',
                      className: \`chat-bubble \${message.isBot ? 'bot' : 'user'}\`
                    }, message.text),
                    h('div', {
                      key: 'timestamp',
                      className: \`chat-timestamp \${message.isBot ? 'bot' : 'user'}\`
                    }, new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    }))
                  ])
                ])
              ),

              // ⌨️ TYPING INDICATOR
              isTyping && h('div', {
                key: 'typing',
                className: 'flex items-start mb-3 flex-row animate-slide-in-message'
              }, [
                h('img', {
                  key: 'typing-avatar',
                  src: config.avatar || '/Default Avatar.png',
                  alt: 'Bot Avatar',
                  className: 'w-8 h-8 rounded-full self-start mr-2 animate-avatar-pop',
                  style: {
                    animationDelay: '0.1s',
                    animationFillMode: 'both'
                  },
                  onError: (e) => {
                    e.currentTarget.src = '/Default Avatar.png';
                  }
                }),
                h('div', {
                  key: 'typing-bubble',
                  className: 'chat-bubble bot animate-typing-bubble',
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '12px 16px',
                    animationDelay: '0.2s',
                    animationFillMode: 'both'
                  }
                }, [0, 1, 2].map(i => 
                  h('span', {
                    key: i,
                    className: 'inline-block w-2 h-2 rounded-full animate-bounceDots',
                    style: { 
                      backgroundColor: isDark ? '#9ca3af' : '#6b7280',
                      animationDelay: \`\${0.5 + (i * 0.2)}s\` 
                    }
                  })
                ))
              ]),
              
              // 📍 SCROLL ANCHOR
              h('div', { 
                key: 'scroll-anchor',
                ref: messagesEndRef, 
                style: { height: '1px' } 
              })
            ])
          ]),

          // ⌨️ INPUT AREA
          h('div', {
            key: 'input-area',
            className: \`chat-input-area \${isDark ? 'dark' : ''} animate-slide-up\`
          }, [
            h('div', { key: 'input-container', className: 'chat-input-container' }, [
              h('input', {
                key: 'input',
                ref: inputRef,
                type: 'text',
                value: inputValue,
                onChange: (e) => setInputValue(e.target.value),
                onKeyDown: handleKeyDown,
                placeholder: config.placeholderText || 'Tapez votre message...',
                className: \`chat-input \${isDark ? 'dark' : ''}\`,
                disabled: isTyping
              }),
              h('button', {
                key: 'send',
                onClick: sendMessage,
                disabled: !inputValue.trim() || isTyping,
                className: 'chat-send-btn animate-button-hover',
                style: { backgroundColor: primaryColor },
                'aria-label': 'Envoyer le message'
              }, h(Send, { size: 18 }))
            ])
          ])
        ])
      ]);
    }
    
    // 🚀 RENDU DU WIDGET
    function App() {
      return h(UnifiedChatWidget, {
        config: window.WIDGET_CONFIG,
        mode: 'production',
        baseUrl: window.BASE_URL
      });
    }
    
    // 🎯 INITIALISATION
    document.addEventListener('DOMContentLoaded', function() {
      const root = ReactDOM.createRoot(document.getElementById('widget-root'));
      root.render(h(App));
    });
    
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