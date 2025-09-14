'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './ChatWidget.module.css';

// ✨ TYPES - Adaptés pour la demo page
interface DemoConfig {
  name: string;
  agentId: string;
  avatar: string;
  welcomeMessage: string;
  placeholderText: string;
  theme: 'light' | 'dark';
  primaryColor: string;
  popupMessage: string;
  popupDelay: number;
  showPopup: boolean;
  showWelcomeMessage: boolean;
  chatTitle: string;
  subtitle: string;
}

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface DemoPageChatWidgetProps {
  config: DemoConfig;
  isPreview?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  messages: Message[];
  onMessagesChange: (messages: Message[]) => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  isTyping: boolean;
  onTypingChange: (typing: boolean) => void;
  showPopupBubble: boolean;
}

export default function DemoPageChatWidget({ 
  config, 
  isPreview = true,
  isOpen,
  onToggle,
  messages,
  onMessagesChange,
  inputValue,
  onInputChange,
  isTyping,
  onTypingChange,
  showPopupBubble
}: DemoPageChatWidgetProps) {
  
  // ========== ÉTATS LOCAUX ==========
  const [isMobile, setIsMobile] = useState(false);
  // 🆕 AJOUTER CET ÉTAT - IDENTIQUE À LAUNCH-AGENT
  const [isMobileView, setIsMobileView] = useState(false);

  // ========== REFS ==========
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // ========== COMPUTED ==========
  const isDark = config.theme === 'dark';
  const primaryColor = config.primaryColor || '#3b82f6';

  // ========== DÉTECTION MOBILE ==========
  const detectMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform)) ||
           window.innerWidth <= 768;
  };

  // ========== EFFETS ==========
  
  // 🏁 Initialisation mobile
  useEffect(() => {
    setIsMobile(detectMobile());
  }, []);

  // 🆕 AJOUTER CET EFFET - IDENTIQUE À LAUNCH-AGENT
  useEffect(() => {
    const detectMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
             (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform)) ||
             window.innerWidth <= 768;
    };

    const handleResize = () => {
      setIsMobileView(detectMobile());
    };

    setIsMobileView(detectMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // 🎯 Focus automatique et mobile setup
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        if (isMobile && inputRef.current) {
          inputRef.current.style.fontSize = '16px';
        }
      }, 300);
    }
  }, [isOpen, isMobile]);

  // 📏 Auto-resize textarea
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = newHeight + 'px';
      textarea.style.overflowY = newHeight >= 120 ? 'auto' : 'hidden';
    }
  }, [inputValue]);

  // 📱 Gestion resize et orientation
  useEffect(() => {
    const handleResize = () => {
      const wasMobile = isMobile;
      setIsMobile(detectMobile());
      
      if (wasMobile !== isMobile && isOpen) {
        // Logique de changement mobile/desktop si nécessaire
      }
    };

    const handleOrientationChange = () => {
      if (isMobile && isOpen) {
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
          
          if (document.activeElement === inputRef.current && inputRef.current) {
            inputRef.current.blur();
            setTimeout(() => inputRef.current?.focus(), 100);
          }
        }, 500);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isMobile, isOpen]);

  // 📱 Gestion du clavier virtuel mobile
  useEffect(() => {
    if (!isMobile) return;

    let initialViewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    
    const handleViewportChange = () => {
      if (window.visualViewport) {
        const currentHeight = window.visualViewport.height;
        const heightDiff = initialViewportHeight - currentHeight;
        
        if (heightDiff > 150 && isOpen && messagesContainerRef.current) {
          messagesContainerRef.current.style.height = `calc(100vh - 64px - 80px - ${heightDiff}px)`;
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        } else if (heightDiff < 50 && isOpen && messagesContainerRef.current) {
          messagesContainerRef.current.style.height = 'calc(100vh - 64px - 80px)';
        }
      }
    };
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      return () => window.visualViewport?.removeEventListener('resize', handleViewportChange);
    }
  }, [isMobile, isOpen]);

  // ========== FONCTIONS ==========

  // 📨 Envoyer un message
  const sendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || !config.agentId) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: trimmed,
      isBot: false,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    onMessagesChange(updatedMessages);
    onInputChange('');
    
    if (inputRef.current) {
      inputRef.current.style.height = isMobile ? '44px' : '32px';
    }

    if (isMobile && inputRef.current) {
      inputRef.current.blur();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    
    setTimeout(() => onTypingChange(true), 200);

    try {
      const history = updatedMessages
        .filter(msg => msg.id !== 'welcome')
        .map(msg => ({
          role: msg.isBot ? 'assistant' : 'user',
          content: msg.text,
        }));

      const body: any = {
        message: trimmed,
        previousMessages: history
      };

      if (config.showWelcomeMessage && config.welcomeMessage?.trim()) {
        body.welcomeMessage = config.welcomeMessage.trim();
      }

      const response = await fetch(`/api/agents/${config.agentId}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      setTimeout(() => {
        const botMessage: Message = {
          id: crypto.randomUUID(),
          text: data.reply || "Désolé, je n'ai pas pu traiter votre demande.",
          isBot: true,
          timestamp: new Date()
        };
        onMessagesChange([...updatedMessages, botMessage]);
        onTypingChange(false);
      }, 800);
      
    } catch (error) {
      console.error('Erreur envoi message:', error);
      
      const responses = [
        "Thanks for your message! I'm here to help you.",
        "That's an interesting question. Let me think about that...",
        "I understand your concern. Here's what I can suggest...",
        "Great question! I'd be happy to help you with that.",
        "I'm processing your request. Please give me a moment..."
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setTimeout(() => {
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          text: randomResponse,
          isBot: true,
          timestamp: new Date()
        };
        onMessagesChange([...updatedMessages, errorMessage]);
        onTypingChange(false);
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
    
    onMessagesChange(welcomeMessages);
  };

  // 🎹 Gestion Enter dans l'input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isMobile) {
        return;
      }
      
      if (!e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    }
  };

  // 🎯 Focus mobile optimisé
  const handleInputFocus = () => {
    if (isMobile) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 300);
    }
  };

  // ========== STYLES ==========
  const getWidgetClasses = () => {
    let classes = styles.chatWidget;
    if (isPreview) classes += ` ${styles.preview}`;
    if (isMobile && isOpen) classes += ` ${styles.mobileFullscreen}`;
    return classes;
  };

  const getWidgetStyles = () => {
    return {
      '--primary-color': primaryColor,
      '--chat-bg': isDark ? '#1f2937' : '#ffffff',
      position: 'absolute',
      bottom: '24px',
      right: '24px',
    } as React.CSSProperties;
  };

  const getWindowStyles = () => {
    return {
      width: '380px',
      height: '600px',
    };
  };

  // ========== UTILITAIRES ==========
  const getDefaultAvatar = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEM0Q0RDgiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0iIzY5NzU4NSIvPgo8cGF0aCBkPSJNMzAgMzJDMzAgMjYuNDc3MSAyNS41MjI5IDIyIDIwIDIyQzE0LjQ3NzEgMjIgMTAgMjYuNDc3MSAxMCAzMkgzMFoiIGZpbGw9IiM2OTc1ODUiLz4KPC9zdmc+';
  };

  // ========== RENDER ==========
  return (
    <div 
      className={getWidgetClasses()}
      style={getWidgetStyles()}
    >
      
      {/* 💭 POPUP BUBBLE */}
      {showPopupBubble && !isOpen && config.popupMessage && (
        <div className={styles.chatPopup}>
          {config.popupMessage}
        </div>
      )}

      {/* 🔘 CHAT BUTTON */}
      {!isOpen && (
        <button
          className={styles.chatButton}
          onClick={onToggle}
          aria-label="Ouvrir le chat"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
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
                  src={config.avatar || getDefaultAvatar()}
                  alt="Assistant Avatar"
                  className={styles.chatAvatar}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = getDefaultAvatar();
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
              </button>
              <button
                className={styles.chatActionBtn}
                onClick={onToggle}
                title="Fermer"
                aria-label="Fermer le chat"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* 💬 MESSAGES */}
          <div 
            ref={messagesContainerRef}
            className={`${styles.chatMessages} ${isDark ? styles.dark : ''}`}
          >
            <div className={styles.messagesContainer}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.message} ${message.isBot ? styles.bot : styles.user}`}
                >
                  {message.isBot && (
                    <img
                      src={config.avatar || getDefaultAvatar()}
                      alt="Bot Avatar"
                      className={styles.messageAvatar}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = getDefaultAvatar();
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
                    src={config.avatar || getDefaultAvatar()}
                    alt="Bot Avatar"
                    className={styles.messageAvatar}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = getDefaultAvatar();
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
                ref={inputRef}
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleInputFocus}
                placeholder={config.placeholderText || 'Tapez votre message...'}
                className={`${styles.chatInput} ${isDark ? styles.dark : ''}`}
                disabled={isTyping}
                autoComplete="off"
                rows={1}
                style={{ 
                  resize: 'none',
                  fontSize: isMobile ? '16px' : '14px',
                  minHeight: isMobile ? '44px' : '32px'
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isTyping}
                className={styles.chatSendBtn}
                aria-label="Envoyer le message"
                style={{
                  width: isMobile ? '44px' : '40px',
                  height: isMobile ? '44px' : '40px'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
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