'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './ChatWidget.module.css'; // ✅ RÉUTILISE le même CSS !

// ✨ TYPES - Adaptés pour la demo page (INCHANGÉ de ton demo-agent)
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
  // ✅ NOUVEAUX PROPS pour contrôler depuis la page parent
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

// 🎯 COMPOSANT PRINCIPAL - Logique identique à ChatWidget mais adapté pour Demo
export default function DemoPageChatWidget({ 
  config, 
  isPreview = true, // Demo = toujours preview 
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
  
  // ========== REFS (IDENTIQUES) ==========
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ========== COMPUTED (IDENTIQUES) ==========
  const isDark = config.theme === 'dark';
  const primaryColor = config.primaryColor || '#3B82F6';

  // ========== EFFETS ==========
  
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

  // 📏 Auto-resize textarea
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120;
      const minHeight = 32;
      
      if (scrollHeight <= maxHeight) {
        textarea.style.height = Math.max(scrollHeight, minHeight) + 'px';
        textarea.style.overflowY = 'hidden';
      } else {
        textarea.style.height = maxHeight + 'px';
        textarea.style.overflowY = 'auto';
      }
    }
  }, [inputValue]);

  // ========== FONCTIONS ==========

  // 📨 Envoyer un message - ADAPTÉE pour DemoConfig
  const sendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || !config.agentId) return; // ← agentId au lieu de selectedAgent

    // Message utilisateur
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: trimmed,
      isBot: false,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    onMessagesChange(updatedMessages); // ← Notifier le parent
    onInputChange(''); // ← Reset input via parent
    
    // Animation typing
    setTimeout(() => onTypingChange(true), 200);

    try {
      // 🎯 API CALL - Identique à ChatWidget mais avec agentId
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
        onMessagesChange([...updatedMessages, botMessage]); // ← Notifier le parent
        onTypingChange(false);
      }, 800);
      
    } catch (error) {
      console.error('Erreur envoi message:', error);
      
      // Fallback responses comme dans ton demo original
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

  // 🔄 Nouvelle conversation - ADAPTÉE
  const resetChat = () => {
    const welcomeMessages = config.showWelcomeMessage && config.welcomeMessage
      ? [{
          id: 'welcome',
          text: config.welcomeMessage,
          isBot: true,
          timestamp: new Date()
        }]
      : [];
    
    onMessagesChange(welcomeMessages); // ← Notifier le parent
  };

  // 🎹 Gestion Enter dans l'input (IDENTIQUE)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        return;
      } else {
        e.preventDefault();
        sendMessage();
      }
    }
  };

  // ========== STYLES (IDENTIQUES) ==========
  const getWidgetClasses = () => {
    let classes = styles.chatWidget;
    if (isPreview) classes += ` ${styles.preview}`;
    return classes;
  };

  const getWidgetStyles = () => {
    return {
      '--primary-color': primaryColor,
      position: 'absolute',
      bottom: '24px',
      right: '24px',
    } as React.CSSProperties;
  };

  const getWindowStyles = () => {
    return {
      width: '380px',  // ← Dimensions fixes comme dans ton demo
      height: '600px',
    };
  };

  // ========== RENDER (IDENTIQUE structure, styles CSS Module) ==========
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                onChange={(e) => onInputChange(e.target.value)}
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