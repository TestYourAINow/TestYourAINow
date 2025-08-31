'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './ChatWidget.module.css';

// ✨ TYPES - Identiques à route.ts
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

// 🎯 COMPOSANT PRINCIPAL - Identique à route.ts
export default function ChatWidget({ config, isPreview = false }: ChatWidgetProps) {
  // ========== ÉTATS ==========
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ========== REFS ==========
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // ========== STORAGE KEY ==========
  const STORAGE_KEY = `chatbot_conversation_${config._id}`;

  // ========== COMPUTED ==========
  const isDark = config.theme === 'dark';
  const primaryColor = config.primaryColor || '#3b82f6';

  // ========== DÉTECTION MOBILE (Identique à route.ts) ==========
  const detectMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform)) ||
           window.innerWidth <= 768;
  };

  // ========== PERSISTANCE (Identique à route.ts) ==========
  const saveConversation = () => {
    if (isPreview) return; // Pas de sauvegarde en mode preview
    
    try {
      const conversationData = {
        messages: messages.map(msg => ({
          text: msg.text,
          isBot: msg.isBot,
          timestamp: msg.timestamp
        })),
        timestamp: Date.now(),
        isOpen: isOpen
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversationData));
    } catch (error) {
      console.log('Impossible de sauvegarder la conversation');
    }
  };

  const loadConversation = () => {
    if (isPreview) return false; // Pas de chargement en mode preview
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        
        const maxAge = 60 * 60 * 1000; // 1 heure
        if (Date.now() - data.timestamp < maxAge) {
          const loadedMessages = (data.messages || []).map((msg: any, index: number) => ({
            id: `loaded_${index}`,
            text: msg.text,
            isBot: msg.isBot,
            timestamp: new Date(msg.timestamp)
          }));
          
          setMessages(loadedMessages);
          
          if (data.isOpen && !isPreview) {
            setTimeout(() => {
              setIsOpen(true);
            }, 100);
          }
          
          return true;
        }
      }
    } catch (error) {
      console.log('Impossible de charger la conversation');
    }
    return false;
  };

  // ========== EFFETS ==========
  
  // 🏁 Initialisation mobile et conversation
  useEffect(() => {
    setIsMobile(detectMobile());
    
    // Charger la conversation sauvegardée
    const loaded = loadConversation();
    
    // Si pas de conversation chargée, ajouter le message de bienvenue
    if (!loaded && config.showWelcomeMessage && config.welcomeMessage) {
      setMessages([{
        id: 'welcome',
        text: config.welcomeMessage,
        isBot: true,
        timestamp: new Date()
      }]);
    }
  }, []);

  // 💬 Popup automatique (identique à route.ts)
  useEffect(() => {
    if (config.showPopup && config.popupMessage && !isOpen) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, (config.popupDelay || 3) * 1000);
      return () => clearTimeout(timer);
    } else {
      setShowPopup(false);
    }
  }, [config.showPopup, config.popupMessage, config.popupDelay, isOpen]);

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

  // 📏 Auto-resize textarea (Identique à route.ts)
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = newHeight + 'px';
      textarea.style.overflowY = newHeight >= 120 ? 'auto' : 'hidden';
    }
  }, [inputValue]);

  // 📱 Gestion resize et orientation (Identique à route.ts)
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

  // 💾 Sauvegarder à chaque changement
  useEffect(() => {
    saveConversation();
  }, [messages, isOpen]);

  // 📱 Gestion du clavier virtuel mobile (Identique à route.ts)
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

  // 📨 Envoyer un message (API identique à route.ts)
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
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = isMobile ? '44px' : '32px';
    }

    // Blur et refocus sur mobile
    if (isMobile && inputRef.current) {
      inputRef.current.blur();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    
    // Animation typing
    setTimeout(() => setIsTyping(true), 200);

    try {
      // 🎯 API EXACTE de route.ts
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
    
    // Clear localStorage
    if (!isPreview) {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // 🎭 Toggle chat ouvert/fermé (Identique à route.ts)
  const toggleChat = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    setShowPopup(false);
    
    if (newIsOpen) {
      // Si on ouvre et qu'il y a un message de bienvenue et pas de messages
      if (config.showWelcomeMessage && config.welcomeMessage && messages.length === 0) {
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            setMessages([{
              id: 'welcome',
              text: config.welcomeMessage!,
              isBot: true,
              timestamp: new Date()
            }]);
          }, 1500);
        }, 400);
      }
    }
  };

  // 🎹 Gestion Enter dans l'input (Identique à route.ts)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Sur mobile : Entrée = toujours saut de ligne
      if (isMobile) {
        // Ne rien faire, laisser le comportement par défaut (saut de ligne)
        return;
      }
      
      // Sur desktop : Entrée seule = envoyer, Shift+Entrée = saut de ligne
      if (!e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
      // Si Shift+Entrée, ne rien faire = saut de ligne par défaut
    }
  };

  // 🎯 Focus mobile optimisé (Identique à route.ts)
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

  // ========== PLACEMENT DYNAMIQUE ==========
  const getWidgetClasses = () => {
    let classes = styles.chatWidget;
    if (isPreview) classes += ` ${styles.preview}`;
    if (isMobile && isOpen) classes += ` ${styles.mobileFullscreen}`;
    return classes;
  };

  const getWidgetStyles = () => {
    const baseStyles: React.CSSProperties = {
      '--primary-color': primaryColor,
      '--chat-bg': isDark ? '#1f2937' : '#ffffff',
    } as React.CSSProperties;

    if (!isPreview) {
      // Position selon config placement
      const [vertical, horizontal] = config.placement.split('-');
      if (vertical === 'top') {
        baseStyles.top = '8px';
      } else if (vertical === 'bottom') {
        baseStyles.bottom = '8px';
      }
      if (horizontal === 'left') {
        baseStyles.left = '8px';
        baseStyles.right = 'auto';
      } else if (horizontal === 'right') {
        baseStyles.right = '8px';
        baseStyles.left = 'auto';
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

  // ========== UTILITAIRES ==========
  const addMessageToDOM = (text: string, isBot: boolean, timestamp = new Date()) => {
    const message: Message = {
      id: crypto.randomUUID(),
      text,
      isBot,
      timestamp
    };
    setMessages(prev => [...prev, message]);
  };

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
          {/* SVG exact de route.ts */}
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
                {/* SVG exact de route.ts */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                {/* SVG exact de route.ts */}
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
                onChange={(e) => setInputValue(e.target.value)}
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
                {/* SVG exact de route.ts */}
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