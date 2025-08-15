'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './ChatWidget.module.css';

// ✨ TYPES - Compatibles avec ton système existant
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

interface ChatWidgetProps {
  config: ChatWidgetConfig;
  isPreview?: boolean;
}

// 🎯 COMPOSANT PRINCIPAL - Version CSS Module pure
export default function ChatWidget({ config, isPreview = false }: ChatWidgetProps) {
  // ========== ÉTATS ==========
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // ========== REFS ==========
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ========== COMPUTED ==========
  const isDark = config.theme === 'dark';
  const primaryColor = config.primaryColor || '#3b82f6';

  // ========== EFFETS ==========
  
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
    if (config.showPopup && config.popupMessage && !isOpen && !isPreview) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, config.popupDelay * 1000);
      return () => clearTimeout(timer);
    } else {
      setShowPopup(false);
    }
  }, [config.showPopup, config.popupMessage, config.popupDelay, isOpen, isPreview]);

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

  // 📏 Auto-resize textarea comme cette interface
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      // Reset height pour recalculer
      textarea.style.height = 'auto';
      
      // Calculer la nouvelle hauteur basée sur le contenu
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120; // Même que CSS
      const minHeight = 32;
      
      if (scrollHeight <= maxHeight) {
        // Pas encore besoin de scroll, on agrandit
        textarea.style.height = Math.max(scrollHeight, minHeight) + 'px';
        textarea.style.overflowY = 'hidden';
      } else {
        // Trop grand, on fixe la hauteur et on active le scroll
        textarea.style.height = maxHeight + 'px';
        textarea.style.overflowY = 'auto';
      }
    }
  }, [inputValue]);

  // ========== FONCTIONS ==========

  // 📨 Envoyer un message
  const sendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Message utilisateur
    const userMessage: Message = {
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
      if (isPreview) {
        // 🎯 MODE PREVIEW - Simulation comme ton HTML
        const responses = [
          "Merci pour votre message ! Comment puis-je vous aider davantage ?",
          "C'est une excellente question. Laissez-moi vous expliquer...",
          "Je comprends votre préoccupation. Voici ce que je peux vous suggérer :",
          "Parfait ! Je suis là pour vous aider avec ça.",
          "Intéressant ! Pouvez-vous me donner plus de détails ?"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        setTimeout(() => {
          const botMessage: Message = {
            id: crypto.randomUUID(),
            text: randomResponse,
            isBot: true,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
          setIsTyping(false);
        }, 1000 + Math.random() * 1000);

      } else {
        // 🌐 MODE PRODUCTION - Vraie API
        const history = updatedMessages
          .filter(msg => msg.id !== 'welcome')
          .map(msg => ({
            role: msg.isBot ? 'assistant' : 'user',
            content: msg.text,
          }));

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'x-public-kind': 'widget',
          'x-widget-id': config._id,
          'x-widget-token': 'public'
        };

        const response = await fetch(`/api/agents/${config.selectedAgent}/ask`, {
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
      }
      
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
  };

  // 🎹 Gestion Enter dans l'input avec support multi-lignes
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter = nouvelle ligne (comportement par défaut)
        return;
      } else {
        // Enter seul = envoyer message
        e.preventDefault();
        sendMessage();
      }
    }
  };

  // ========== PLACEMENT DYNAMIQUE ==========
  const getWidgetClasses = () => {
    let classes = styles.chatWidget;
    if (isPreview) classes += ` ${styles.preview}`;
    return classes;
  };

  const getWidgetStyles = () => {
    const baseStyles: React.CSSProperties = {
      '--primary-color': primaryColor,
    } as React.CSSProperties;

    if (!isPreview) {
      // Position selon config placement
      const [vertical, horizontal] = config.placement.split('-');
      if (vertical === 'top' || vertical === 'bottom') {
        baseStyles[vertical] = '24px';
      }
      if (horizontal === 'left' || horizontal === 'right') {
        baseStyles[horizontal] = '24px';
      }
    }

    return baseStyles;
  };

  const getWindowStyles = () => {
    return {
      width: `${config.width}px`,
      height: `${config.height}px`,
    };
  };

  // ========== RENDER ==========
  return (
    <div 
      className={getWidgetClasses()}
      style={getWidgetStyles()}
    >
      
      {/* 💭 POPUP BUBBLE */}
      {showPopup && !isOpen && config.popupMessage && (
        <div className={styles.chatPopup}>
          {config.popupMessage}
        </div>
      )}

      {/* 🔘 CHAT BUTTON */}
      {!isOpen && (
        <button
          className={styles.chatButton}
          onClick={toggleChat}
          aria-label="Ouvrir le chat"
        >
          {/* SVG exact de ton HTML */}
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"/>
          </svg>
        </button>
      )}

      {/* 🏠 CHAT WINDOW */}
      {isOpen && (
        <div 
          className={`${styles.chatWindow} ${isDark ? styles.dark : ''}`}
          style={getWindowStyles()}
        >
          
          {/* 📋 HEADER */}
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderContent}>
              <div className={styles.chatAvatarContainer}>
                <img
                  src={config.avatar || '/Default Avatar.png'}
                  alt="Assistant Avatar"
                  className={styles.chatAvatar}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = '/Default Avatar.png';
                  }}
                />
                <div className={styles.chatStatus} />
              </div>
              <div className={styles.chatInfo}>
                <h3 className={styles.chatTitle}>
                  {config.chatTitle || config.name}
                </h3>
                <p className={styles.chatSubtitle}>
                  {config.subtitle || 'En ligne'}
                </p>
              </div>
            </div>
            <div className={styles.chatActions}>
              <button
                className={styles.chatActionBtn}
                onClick={resetChat}
                title="Nouvelle conversation"
                aria-label="Nouvelle conversation"
              >
                {/* SVG exact de ton HTML */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
              </button>
              <button
                className={styles.chatActionBtn}
                onClick={toggleChat}
                title="Fermer"
                aria-label="Fermer le chat"
              >
                {/* SVG exact de ton HTML */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* 💬 MESSAGES */}
          <div className={`${styles.chatMessages} ${isDark ? styles.dark : ''}`}>
            <div className={styles.messagesContainer}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.message} ${message.isBot ? styles.bot : styles.user}`}
                >
                  {message.isBot && (
                    <img
                      src={config.avatar || '/Default Avatar.png'}
                      alt="Bot Avatar"
                      className={styles.messageAvatar}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = '/Default Avatar.png';
                      }}
                    />
                  )}
                  <div className={styles.messageContent}>
                    <div className={`${styles.messageBubble} ${message.isBot ? styles.bot : styles.user}`}>
                      {message.text}
                    </div>
                    <div className={styles.messageTimestamp}>
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {/* ⌨️ TYPING INDICATOR */}
              {isTyping && (
                <div className={`${styles.message} ${styles.bot}`}>
                  <img
                    src={config.avatar || '/Default Avatar.png'}
                    alt="Bot Avatar"
                    className={styles.messageAvatar}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = '/Default Avatar.png';
                    }}
                  />
                  <div className={styles.messageContent}>
                    <div className={styles.typingIndicator}>
                      <div className={styles.typingDot} />
                      <div className={styles.typingDot} />
                      <div className={styles.typingDot} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} style={{ height: '1px' }} />
            </div>
          </div>

          {/* ⌨️ INPUT AREA */}
          <div className={`${styles.chatInputArea} ${isDark ? styles.dark : ''}`}>
            <div className={styles.chatInputContainer}>
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={config.placeholderText || 'Tapez votre message...'}
                className={`${styles.chatInput} ${isDark ? styles.dark : ''}`}
                disabled={isTyping}
                autoComplete="off"
                rows={1}
                style={{ resize: 'none' }}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isTyping}
                className={styles.chatSendBtn}
                aria-label="Envoyer le message"
              >
                {/* SVG exact de ton HTML */}
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10L17 12 2 14Z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}