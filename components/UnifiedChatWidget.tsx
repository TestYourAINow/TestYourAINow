// components/UnifiedChatWidget.tsx - VERSION CORRIGÉE IDENTIQUE
'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, RotateCcw, Send } from 'lucide-react';

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

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface UnifiedChatWidgetProps {
  config: ChatWidgetConfig;
  mode: 'dashboard' | 'preview' | 'production';
  baseUrl?: string;
}

export default function UnifiedChatWidget({ 
  config, 
  mode,
  baseUrl = '' 
}: UnifiedChatWidgetProps) {
  
  // ========== ÉTATS ==========
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isDark = config.theme === 'dark';
  const primaryColor = config.primaryColor || '#3b82f6';

  // ========== EFFETS ==========
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

  useEffect(() => {
    if (isOpen && mode !== 'dashboard') {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, mode]);

  // ========== FONCTIONS ==========
  const sendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: trimmed,
      isBot: false,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    
    setTimeout(() => setIsTyping(true), 200);

    try {
      const apiUrl = mode === 'production' 
        ? `${baseUrl}/api/agents/${config.selectedAgent}/ask`
        : `/api/agents/${config.selectedAgent}/ask`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (mode === 'production') {
        headers['x-public-kind'] = 'widget';
        headers['x-widget-id'] = config._id;
        headers['x-widget-token'] = 'public';
      }

      const history = updatedMessages
        .filter(msg => msg.id !== 'welcome')
        .map(msg => ({
          role: msg.isBot ? 'assistant' : 'user',
          content: msg.text,
        }));

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
      
      setTimeout(() => {
        const botMessage: Message = {
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
      
      setTimeout(() => {
        const errorMessage: Message = {
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

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowPopup(false);

    if (mode === 'production') {
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
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getWidgetStyles = () => {
    const baseStyles = {
      '--primary-color': primaryColor,
      zIndex: mode === 'dashboard' ? 10 : 9999,
    } as React.CSSProperties;

    if (mode === 'dashboard') {
      return {
        ...baseStyles,
        position: 'absolute',
        [config.placement.split('-')[0]]: '24px',
        [config.placement.split('-')[1]]: '24px',
      } as React.CSSProperties;
    }

    return {
      ...baseStyles,
      position: 'fixed',
      bottom: '24px',
      right: '24px',
    } as React.CSSProperties;
  };

  useEffect(() => {
    if (mode === 'production') {
      parent.postMessage({
        type: 'WIDGET_READY',
        data: { 
          width: config.width, 
          height: config.height 
        }
      }, '*');
    }
  }, [mode, config.width, config.height]);

  // 🎯 RENDER AVEC CLASSES CSS EXACTES (pas Tailwind)
  return (
    <div className="chat-widget" style={getWidgetStyles()}>
      {/* CSS intégré pour garantir l'identité visuelle */}
      <style jsx>{`
        /* Reset et base */
        .message-container {
          display: flex;
          margin-bottom: 12px;
          align-items: flex-start;
        }
        
        .message-container.user {
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
        }
        
        .message-container.user .message-avatar {
          margin-right: 0;
          margin-left: 8px;
        }
        
        .message-content {
          display: flex;
          flex-direction: column;
          max-width: 384px;
          position: relative;
        }
        
        .message-text {
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
        
        .message-text.bot {
          background: linear-gradient(135deg, #e5e7eb, #f3f4f6);
          color: #111827;
        }
        
        .message-text.user {
          background: linear-gradient(135deg, ${primaryColor}, color-mix(in srgb, ${primaryColor} 90%, #06b6d4));
          color: white;
          align-self: flex-end;
        }
        
        .message-text.bot.dark {
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
        
        .typing-container {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 16px;
        }
        
        .typing-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: ${isDark ? '#9ca3af' : '#6b7280'};
          animation: bounce-dots 1.2s infinite ease-in-out;
        }
        
        .typing-dot:nth-child(1) { animation-delay: 0.5s; }
        .typing-dot:nth-child(2) { animation-delay: 0.7s; }
        .typing-dot:nth-child(3) { animation-delay: 0.9s; }
        
        @keyframes bounce-dots {
          0%, 80%, 100% { 
            transform: translateY(0);
            opacity: 0.7;
          } 
          40% { 
            transform: translateY(-6px);
            opacity: 1;
          }
        }
        
        .animate-message-in {
          animation: slide-in-message 0.2s ease-out forwards;
          opacity: 0;
        }
        
        @keyframes slide-in-message {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {showPopup && !isOpen && config.popupMessage && (
        <div 
          className="chat-popup animate-slide-in-message" 
          style={{ backgroundColor: primaryColor }}
        >
          {config.popupMessage}
        </div>
      )}

      {!isOpen && (
        <button
          className="chat-button animate-bounce-in"
          onClick={toggleChat}
          style={{ backgroundColor: primaryColor }}
          aria-label="Ouvrir le chat"
        >
          <MessageCircle size={24} color="white" />
        </button>
      )}

      {isOpen && (
        <div
          className={`chat-window animate-expand-from-button ${isDark ? 'dark' : ''}`}
          style={{
            width: config.width,
            height: config.height,
            '--primary-color': primaryColor
          } as React.CSSProperties}
        >
          <div className="chat-header">
            <div className="chat-header-content">
              <div className="chat-avatar-container">
                <img
                  src={config.avatar || '/Default Avatar.png'}
                  alt="Assistant Avatar"
                  className="chat-avatar"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = '/Default Avatar.png';
                  }}
                />
                <div className="chat-status" />
              </div>
              <div className="chat-info">
                <h3 className="chat-title">{config.chatTitle || config.name}</h3>
                <p className="chat-subtitle">{config.subtitle || 'En ligne'}</p>
              </div>
            </div>
            <div className="chat-actions">
              <button 
                className="chat-action-btn" 
                onClick={resetChat}
                title="Nouvelle conversation"
                aria-label="Nouvelle conversation"
              >
                <RotateCcw size={18} />
              </button>
              <button 
                className="chat-action-btn" 
                onClick={toggleChat}
                title="Fermer"
                aria-label="Fermer le chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className={`chat-messages ${isDark ? 'dark' : ''} custom-scrollbar`}>
            <div className="messages-container">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`message-container ${message.isBot ? 'bot' : 'user'} animate-message-in`}
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    animationFillMode: 'both'
                  }}
                >
                  {message.isBot && (
                    <img
                      src={config.avatar || '/Default Avatar.png'}
                      alt="Bot Avatar"
                      className="message-avatar"
                      style={{ 
                        animationDelay: `${index * 0.05 + 0.05}s`,
                        animationFillMode: 'both'
                      }}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = '/Default Avatar.png';
                      }}
                    />
                  )}
                  <div className="message-content">
                    <div className={`message-text ${message.isBot ? 'bot' : 'user'} ${isDark && message.isBot ? 'dark' : ''}`}>
                      {message.text}
                    </div>
                    <div className={`message-time ${message.isBot ? 'bot' : 'user'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="message-container bot animate-message-in">
                  <img
                    src={config.avatar || '/Default Avatar.png'}
                    alt="Bot Avatar"
                    className="message-avatar"
                    style={{
                      animationDelay: '0.1s',
                      animationFillMode: 'both'
                    }}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = '/Default Avatar.png';
                    }}
                  />
                  <div className="message-content">
                    <div className={`message-text bot ${isDark ? 'dark' : ''}`}>
                      <div className="typing-container">
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} style={{ height: '1px' }} />
            </div>
          </div>

          <div className={`chat-input-area ${isDark ? 'dark' : ''} animate-slide-up`}>
            <div className="chat-input-container">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={config.placeholderText || 'Tapez votre message...'}
                className={`chat-input ${isDark ? 'dark' : ''}`}
                disabled={isTyping}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="chat-send-btn animate-button-hover"
                style={{ backgroundColor: primaryColor }}
                aria-label="Envoyer le message"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}