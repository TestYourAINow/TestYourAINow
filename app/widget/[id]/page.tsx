// app/widget/[id]/page.tsx - PAGE WIDGET COMME BUILDMYAGENT

'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

interface WidgetConfig {
  _id: string;
  name: string;
  avatar?: string;
  welcomeMessage?: string;
  placeholderText?: string;
  theme: 'light' | 'dark';
  primaryColor: string;
  width: number;
  height: number;
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

export default function WidgetPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const widgetId = params.id as string;

  // 🎨 Paramètres URL (comme buildmyagent)
  const urlTheme = searchParams.get('theme') || 'light';
  const urlThemeColor = searchParams.get('themeColor') || '#3b82f6';
  const urlTemplate = searchParams.get('template') || 'default';

  // 📊 États
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // 🔄 Charger la configuration
  useEffect(() => {
    if (!widgetId) return;

    const loadConfig = async () => {
      try {
        console.log(`📡 Loading widget config: ${widgetId}`);
        
        const response = await fetch(`/api/chatbot-configs/${widgetId}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Config not found');
        }

        // 🎨 Override avec paramètres URL
        const finalConfig = {
          ...data.config,
          theme: urlTheme as 'light' | 'dark',
          primaryColor: decodeURIComponent(urlThemeColor),
        };

        console.log(`✅ Widget config loaded:`, finalConfig);
        setConfig(finalConfig);

        // 📝 Message de bienvenue initial
        if (finalConfig.showWelcomeMessage && finalConfig.welcomeMessage) {
          setMessages([{
            id: 'welcome',
            text: finalConfig.welcomeMessage,
            isBot: true,
            timestamp: new Date()
          }]);
        }

      } catch (err) {
        console.error(`❌ Failed to load widget:`, err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [widgetId, urlTheme, urlThemeColor]);

  // 💭 Popup automatique
  useEffect(() => {
    if (!config?.showPopup || !config?.popupMessage || isOpen) return;

    const timer = setTimeout(() => {
      setShowPopup(true);
    }, config.popupDelay * 1000);

    return () => clearTimeout(timer);
  }, [config, isOpen]);

  // 📨 Communication avec le parent (widget-client.js)
  useEffect(() => {
    if (!config) return;

    // Notifier le parent que le widget est prêt
    const notifyParent = (type: string, data: any = {}) => {
      try {
        window.parent.postMessage({ 
          type, 
          data: { ...data, widgetId: config._id }
        }, '*');
      } catch (e) {
        console.log('📡 Parent notification failed:', e);
      }
    };

    notifyParent('WIDGET_READY', {
      width: config.width,
      height: config.height,
      theme: config.theme
    });

    console.log(`🎪 Widget ready: ${config.name}`);
  }, [config]);

  // 🎯 Fonctions
  const toggleChat = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    setShowPopup(false);

    // Notifier le parent
    try {
      window.parent.postMessage({ 
        type: newState ? 'WIDGET_OPEN' : 'WIDGET_CLOSE',
        data: { 
          widgetId: config?._id,
          width: config?.width,
          height: config?.height 
        }
      }, '*');
    } catch (e) {
      console.log('📡 Toggle notification failed:', e);
    }
  };

  const resetChat = () => {
    setMessages(config?.showWelcomeMessage && config?.welcomeMessage ? [{
      id: 'welcome',
      text: config.welcomeMessage,
      isBot: true,
      timestamp: new Date()
    }] : []);
  };

  const sendMessage = async () => {
    const text = inputValue.trim();
    if (!text || !config) return;

    // 👤 Ajouter message utilisateur
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text,
      isBot: false,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      // 🤖 Appel API
      const response = await fetch(`/api/agents/${config.selectedAgent}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-public-kind': 'widget',
          'x-widget-id': config._id,
          'x-widget-token': 'public'
        },
        body: JSON.stringify({
          message: text,
          previousMessages: updatedMessages
            .filter(m => m.id !== 'welcome')
            .map(m => ({
              role: m.isBot ? 'assistant' : 'user',
              content: m.text
            })),
          welcomeMessage: config.showWelcomeMessage ? config.welcomeMessage : null
        })
      });

      const data = await response.json();
      
      // 🤖 Ajouter réponse bot
      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: data.reply || "Désolé, je n'ai pas pu traiter votre demande.",
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('❌ Send message error:', error);
      
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 🔄 États de chargement et d'erreur
  if (loading) {
    return (
      <div className="widget-loading">
        <div className="loading-spinner"></div>
        <p>Chargement du widget...</p>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="widget-error">
        <h3>Widget indisponible</h3>
        <p>{error || 'Configuration non trouvée'}</p>
      </div>
    );
  }

  const isDark = config.theme === 'dark';
  const primaryColor = config.primaryColor;

  return (
    <>
      {/* 🎨 STYLES INLINE POUR ÉVITER LES CONFLITS */}
      <style jsx>{`
        /* 🔄 Reset et base */
        * {
          box-sizing: border-box !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        html, body {
          height: 100% !important;
          width: 100% !important;
          overflow: hidden !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          background: transparent !important;
        }

        .widget-container {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          background: ${isDark ? '#1f2937' : '#ffffff'} !important;
          border-radius: 20px !important;
          overflow: hidden !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15) !important;
          color: ${isDark ? '#ffffff' : '#000000'} !important;
        }

        /* 🔘 État bouton */
        .widget-button-state {
          position: absolute !important;
          bottom: 24px !important;
          right: 24px !important;
          width: 64px !important;
          height: 64px !important;
          border-radius: 50% !important;
          border: none !important;
          background: linear-gradient(135deg, ${primaryColor}, #06b6d4) !important;
          color: white !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          transition: all 0.3s ease !important;
          z-index: 1000 !important;
        }

        .widget-button-state:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 6px 20px rgba(0,0,0,0.2) !important;
        }

        /* 💭 Popup */
        .widget-popup {
          position: absolute !important;
          bottom: 80px !important;
          right: 24px !important;
          max-width: 200px !important;
          padding: 12px 16px !important;
          background: ${primaryColor} !important;
          color: white !important;
          border-radius: 12px !important;
          font-size: 13px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          z-index: 999 !important;
          animation: slideUp 0.3s ease !important;
        }

        .widget-popup::after {
          content: '' !important;
          position: absolute !important;
          bottom: -6px !important;
          right: 20px !important;
          width: 12px !important;
          height: 12px !important;
          background: ${primaryColor} !important;
          transform: rotate(45deg) !important;
        }

        /* 💬 État chat */
        .widget-chat-state {
          display: flex !important;
          flex-direction: column !important;
          height: 100% !important;
          width: 100% !important;
        }

        /* 📋 Header */
        .widget-header {
          background: linear-gradient(135deg, ${primaryColor}, #06b6d4) !important;
          padding: 16px 20px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          flex-shrink: 0 !important;
        }

        .widget-header-info {
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
        }

        .widget-avatar {
          width: 40px !important;
          height: 40px !important;
          border-radius: 50% !important;
          border: 2px solid rgba(255,255,255,0.3) !important;
          object-fit: cover !important;
        }

        .widget-header-text h3 {
          color: white !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          margin: 0 !important;
          line-height: 1.2 !important;
        }

        .widget-header-text p {
          color: rgba(255,255,255,0.8) !important;
          font-size: 12px !important;
          margin: 2px 0 0 0 !important;
          line-height: 1.2 !important;
        }

        .widget-header-actions {
          display: flex !important;
          gap: 8px !important;
        }

        .widget-action-btn {
          width: 32px !important;
          height: 32px !important;
          border: none !important;
          border-radius: 50% !important;
          background: rgba(255,255,255,0.2) !important;
          color: white !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s ease !important;
        }

        .widget-action-btn:hover {
          background: rgba(255,255,255,0.3) !important;
          transform: scale(1.1) !important;
        }

        /* 💬 Messages */
        .widget-messages {
          flex: 1 !important;
          padding: 20px !important;
          overflow-y: auto !important;
          background: ${isDark ? '#111827' : '#f8fafc'} !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 16px !important;
        }

        .widget-messages::-webkit-scrollbar {
          width: 4px !important;
        }

        .widget-messages::-webkit-scrollbar-thumb {
          background: ${primaryColor} !important;
          border-radius: 4px !important;
        }

        .widget-message {
          display: flex !important;
          gap: 12px !important;
          animation: slideUp 0.3s ease !important;
        }

        .widget-message.user {
          flex-direction: row-reverse !important;
        }

        .widget-message-avatar {
          width: 32px !important;
          height: 32px !important;
          border-radius: 50% !important;
          object-fit: cover !important;
          flex-shrink: 0 !important;
        }

        .widget-message-bubble {
          max-width: 260px !important;
          padding: 12px 16px !important;
          border-radius: 18px !important;
          font-size: 14px !important;
          line-height: 1.4 !important;
          word-wrap: break-word !important;
        }

        .widget-message.bot .widget-message-bubble {
          background: ${isDark ? '#374151' : '#ffffff'} !important;
          color: ${isDark ? '#ffffff' : '#374151'} !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        }

        .widget-message.user .widget-message-bubble {
          background: ${primaryColor} !important;
          color: white !important;
        }

        /* ⌨️ Input */
        .widget-input-area {
          padding: 20px !important;
          background: ${isDark ? '#1f2937' : '#ffffff'} !important;
          border-top: 1px solid ${isDark ? '#374151' : '#e5e7eb'} !important;
          flex-shrink: 0 !important;
        }

        .widget-input-container {
          display: flex !important;
          gap: 12px !important;
          align-items: flex-end !important;
        }

        .widget-input {
          flex: 1 !important;
          border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'} !important;
          border-radius: 20px !important;
          padding: 12px 16px !important;
          font-size: 14px !important;
          background: ${isDark ? '#374151' : '#ffffff'} !important;
          color: ${isDark ? '#ffffff' : '#374151'} !important;
          resize: none !important;
          outline: none !important;
          max-height: 120px !important;
          min-height: 44px !important;
          font-family: inherit !important;
          line-height: 1.4 !important;
        }

        .widget-input:focus {
          border-color: ${primaryColor} !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1) !important;
        }

        .widget-send-btn {
          width: 44px !important;
          height: 44px !important;
          border: none !important;
          border-radius: 50% !important;
          background: ${primaryColor} !important;
          color: white !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-shrink: 0 !important;
          transition: all 0.2s ease !important;
        }

        .widget-send-btn:hover:not(:disabled) {
          transform: scale(1.05) !important;
          box-shadow: 0 4px 12px rgba(59,130,246,0.3) !important;
        }

        .widget-send-btn:disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
          transform: none !important;
        }

        /* 🎭 Typing */
        .widget-typing {
          display: flex !important;
          gap: 4px !important;
          padding: 12px 16px !important;
          background: ${isDark ? '#374151' : '#ffffff'} !important;
          border-radius: 18px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        }

        .widget-typing-dot {
          width: 8px !important;
          height: 8px !important;
          border-radius: 50% !important;
          background: #9ca3af !important;
          animation: typing 1.4s infinite ease-in-out !important;
        }

        .widget-typing-dot:nth-child(2) { animation-delay: 0.2s !important; }
        .widget-typing-dot:nth-child(3) { animation-delay: 0.4s !important; }

        /* 🔄 Loading */
        .widget-loading, .widget-error {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          height: 100vh !important;
          background: ${isDark ? '#1f2937' : '#ffffff'} !important;
          color: ${isDark ? '#ffffff' : '#374151'} !important;
          text-align: center !important;
          padding: 20px !important;
        }

        .loading-spinner {
          width: 40px !important;
          height: 40px !important;
          border: 4px solid ${isDark ? '#374151' : '#e5e7eb'} !important;
          border-top: 4px solid ${primaryColor} !important;
          border-radius: 50% !important;
          animation: spin 1s linear infinite !important;
          margin-bottom: 16px !important;
        }

        /* 🎬 Animations */
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes typing {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-8px); opacity: 1; }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* 🎯 Utility */
        .hidden { display: none !important; }
      `}</style>

      <div className="widget-container">
        
        {/* 🔘 BUTTON STATE */}
        {!isOpen && (
          <>
            {showPopup && config.popupMessage && (
              <div className="widget-popup">
                {config.popupMessage}
              </div>
            )}
            
            <button 
              className="widget-button-state"
              onClick={toggleChat}
              aria-label="Ouvrir le chat"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"/>
              </svg>
            </button>
          </>
        )}

        {/* 💬 CHAT STATE */}
        {isOpen && (
          <div className="widget-chat-state">
            
            {/* Header */}
            <div className="widget-header">
              <div className="widget-header-info">
                <img 
                  src={config.avatar || '/Default Avatar.png'} 
                  alt="Avatar" 
                  className="widget-avatar"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = '/Default Avatar.png';
                  }}
                />
                <div className="widget-header-text">
                  <h3>{config.chatTitle || config.name || 'Assistant'}</h3>
                  <p>{config.subtitle || 'En ligne'}</p>
                </div>
              </div>
              <div className="widget-header-actions">
                <button 
                  className="widget-action-btn"
                  onClick={resetChat}
                  title="Nouvelle conversation"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                  </svg>
                </button>
                <button 
                  className="widget-action-btn"
                  onClick={toggleChat}
                  title="Fermer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="widget-messages">
              {messages.map((message) => (
                <div key={message.id} className={`widget-message ${message.isBot ? 'bot' : 'user'}`}>
                  {message.isBot && (
                    <img 
                      src={config.avatar || '/Default Avatar.png'} 
                      alt="Bot" 
                      className="widget-message-avatar"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = '/Default Avatar.png';
                      }}
                    />
                  )}
                  <div className="widget-message-bubble">
                    {message.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="widget-message bot">
                  <img 
                    src={config.avatar || '/Default Avatar.png'} 
                    alt="Bot" 
                    className="widget-message-avatar"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = '/Default Avatar.png';
                    }}
                  />
                  <div className="widget-typing">
                    <div className="widget-typing-dot"></div>
                    <div className="widget-typing-dot"></div>
                    <div className="widget-typing-dot"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="widget-input-area">
              <div className="widget-input-container">
                <textarea
                  className="widget-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={config.placeholderText || 'Tapez votre message...'}
                  rows={1}
                  disabled={isTyping}
                />
                <button
                  className="widget-send-btn"
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isTyping}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10L17 12 2 14Z"/>
                  </svg>
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}