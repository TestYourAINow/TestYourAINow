// components/UnifiedChatWidget.tsx
// CRÉER CE FICHIER EXACTEMENT COMME CA

'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, RotateCcw, Send } from 'lucide-react';

// ✨ TYPES - Compatible avec ton système existant
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

// 🎯 COMPOSANT UNIFIÉ - UTILISÉ PARTOUT
export default function UnifiedChatWidget({ 
  config, 
  mode,
  baseUrl = '' 
}: UnifiedChatWidgetProps) {
  
  // ========== ÉTATS IDENTIQUES ==========
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // ========== REFS ==========
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // 💬 Popup automatique (seulement en production)
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
    if (isOpen && mode !== 'dashboard') {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, mode]);

  // 📨 Envoyer un message
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

  return (
    <div className="chat-widget" style={getWidgetStyles()}>
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
                  className={`flex ${message.isBot ? 'items-start' : 'items-end'} mb-3 ${
                    message.isBot ? 'flex-row' : 'flex-row-reverse'
                  } animate-slide-in-message`}
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    animationFillMode: 'both'
                  }}
                >
                  {message.isBot && (
                    <img
                      src={config.avatar || '/Default Avatar.png'}
                      alt="Bot Avatar"
                      className="w-8 h-8 rounded-full self-start mr-2 animate-avatar-pop"
                      style={{ 
                        flexShrink: 0,
                        animationDelay: `${index * 0.05 + 0.05}s`,
                        animationFillMode: 'both'
                      }}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = '/Default Avatar.png';
                      }}
                    />
                  )}
                  <div className="flex flex-col max-w-sm relative">
                    <div className={`chat-bubble ${message.isBot ? 'bot' : 'user'}`}>
                      {message.text}
                    </div>
                    <div className={`chat-timestamp ${message.isBot ? 'bot' : 'user'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start mb-3 flex-row animate-slide-in-message">
                  <img
                    src={config.avatar || '/Default Avatar.png'}
                    alt="Bot Avatar"
                    className="w-8 h-8 rounded-full self-start mr-2 animate-avatar-pop"
                    style={{
                      animationDelay: '0.1s',
                      animationFillMode: 'both'
                    }}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = '/Default Avatar.png';
                    }}
                  />
                  <div 
                    className="chat-bubble bot animate-typing-bubble"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '12px 16px',
                      animationDelay: '0.2s',
                      animationFillMode: 'both'
                    }}
                  >
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="inline-block w-2 h-2 rounded-full animate-bounceDots"
                        style={{ 
                          backgroundColor: isDark ? '#9ca3af' : '#6b7280',
                          animationDelay: `${0.5 + (i * 0.2)}s` 
                        }}
                      />
                    ))}
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