'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatWidgetConfig } from "@/types/ChatWidgetConfig";
import { MessageCircle, X, RotateCcw, Send } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export default function ChatWidget({ config }: { config: ChatWidgetConfig }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [animateNewMessages, setAnimateNewMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousMessageCount = useRef(0);
  const isDark = config.theme === 'dark';

  // Trigger animation only for new messages
  useEffect(() => {
    if (messages.length > previousMessageCount.current) {
      setAnimateNewMessages(true);
      previousMessageCount.current = messages.length;
      // Reset animation state after a short delay
      setTimeout(() => setAnimateNewMessages(false), 1000);
    }
  }, [messages.length]);

  useEffect(() => {
    if (config.showWelcomeMessage && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        text: config.welcomeMessage ?? '',
        isBot: true,
        timestamp: new Date()
      }]);
    }
  }, [config]);

  useEffect(() => {
    if (config.showPopup && !isOpen) {
      const timer = setTimeout(() => setShowPopup(true), config.popupDelay * 1000);
      return () => clearTimeout(timer);
    } else {
      setShowPopup(false);
    }
  }, [config.showPopup, config.popupDelay, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const newUserMessage: Message = {
      id: crypto.randomUUID(),
      text: trimmed,
      isBot: false,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const history = updatedMessages.map((msg) => ({
        role: msg.isBot ? 'assistant' : 'user',
        content: msg.text,
      }));

      const res = await fetch(`/api/agents/${config.selectedAgent}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          previousMessages: history,
          welcomeMessage: config.showWelcomeMessage ? config.welcomeMessage : null,
        }),
      });

      const data = await res.json();
      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: data.reply || 'Erreur de réponse.',
        isBot: true,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        text: "Erreur lors de l'envoi.",
        isBot: true,
        timestamp: new Date()
      }]);
    }

    setIsTyping(false);
  };

  const resetChat = () => {
    const resetMessages = config.showWelcomeMessage
      ? [{ id: 'welcome', text: config.welcomeMessage ?? '', isBot: true, timestamp: new Date() }]
      : [];
    setMessages(resetMessages);
    previousMessageCount.current = resetMessages.length;
    setAnimateNewMessages(true);
    setTimeout(() => setAnimateNewMessages(false), 1000);
  };

  return (
    <div
      className="chat-widget"
      style={{
        '--primary-color': config.primaryColor,
        [config.placement.split('-')[0]]: '24px',
        [config.placement.split('-')[1]]: '24px',
      } as React.CSSProperties}
    >
      {/* Popup Bubble */}
      {showPopup && !isOpen && (
        <div 
          className="chat-popup" 
          style={{ backgroundColor: config.primaryColor }}
        >
          {config.popupMessage}
        </div>
      )}

      {/* Chat Button */}
      <button
        className="chat-button"
        onClick={() => {
          setIsOpen(!isOpen);
          setShowPopup(false);
        }}
        style={{ backgroundColor: config.primaryColor }}
      >
        <div
          style={{
            transition: 'all 0.3s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        >
          {isOpen ? (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span className="w-2 h-2 rounded-full bg-white" />
              <span className="w-2 h-2 rounded-full bg-white" />
            </div>
          ) : (
            <MessageCircle size={24} color="white" />
          )}
        </div>
      </button>

      {/* Chat Window */}
      <div
        className={`chat-window ${isOpen ? 'open' : 'closed'} ${isDark ? 'dark' : ''}`}
        style={{
          width: config.width,
          height: config.height,
        } as React.CSSProperties}
      >
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-content">
            <div className="chat-avatar-container">
              <img
                src={config.avatar}
                alt="Bot"
                className="chat-avatar"
              />
              <span className="chat-status" />
            </div>
            <div className="chat-info">
              <h3 className="chat-title">{config.chatTitle}</h3>
              <p className="chat-subtitle">{config.subtitle}</p>
            </div>
          </div>
          <div className="chat-actions">
            <button className="chat-action-btn" onClick={resetChat} title="Nouvelle conversation">
              <RotateCcw size={18} />
            </button>
            <button className="chat-action-btn" onClick={() => setIsOpen(false)} title="Fermer">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className={`chat-messages ${isDark ? 'dark' : ''} custom-scrollbar`}>
          <div className="messages-container">
            {messages.map((m, index) => {
              const shouldAnimate = animateNewMessages && index >= previousMessageCount.current - 1;
              return (
                <div
                  key={m.id}
                  className={`flex ${m.isBot ? 'items-start' : 'items-end'} mb-3 ${m.isBot ? 'flex-row' : 'flex-row-reverse'} ${shouldAnimate ? 'animate-slide-up-fade' : ''}`}
                  style={shouldAnimate ? {
                    animationDelay: `${(index - (previousMessageCount.current - 1)) * 0.1}s`,
                    animationFillMode: 'both'
                  } : {}}
                >
                  {m.isBot && (
                    <img
                      src={config.avatar}
                      alt="Bot Avatar"
                      className="w-8 h-8 rounded-full self-start mr-2"
                      style={{ flexShrink: 0 }}
                    />
                  )}
                  <div className="flex flex-col max-w-sm relative">
                    <div className={`chat-bubble ${m.isBot ? 'bot' : 'user'}`}>
                      {m.text}
                    </div>
                    <div className={`chat-timestamp ${m.isBot ? 'bot' : 'user'}`}>
                      {new Date(m.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div 
                className={`flex items-start mb-3 flex-row ${animateNewMessages ? 'animate-slide-up-fade' : ''}`}
                style={animateNewMessages ? {
                  animationDelay: `0.2s`,
                  animationFillMode: 'both'
                } : {}}
              >
                <img
                  src={config.avatar}
                  alt="Bot Avatar"
                  className="w-8 h-8 rounded-full self-start mr-2"
                />
                <div 
                  className="chat-bubble bot"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '12px 16px'
                  }}
                >
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="inline-block w-2 h-2 rounded-full animate-bounceDots"
                      style={{ 
                        backgroundColor: isDark ? '#9ca3af' : '#6b7280',
                        animationDelay: `${i * 0.2}s` 
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className={`chat-input-area ${isDark ? 'dark' : ''}`}>
          <div className="chat-input-container">
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={config.placeholderText}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              className={`chat-input ${isDark ? 'dark' : ''}`}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="chat-send-btn"
              style={{ backgroundColor: config.primaryColor }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}