'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, RotateCcw, X, Activity, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface DemoConfig {
  name: string;
  theme: 'light' | 'dark';
  color: string;
  avatarUrl: string;
  agentId: string;
  showWelcome: boolean;
  welcomeMessage: string;
  placeholderText: string;
  chatTitle: string;
  subtitle: string;
  showPopup: boolean;
  popupMessage: string;
  popupDelay: number;
  usageLimit: number;
  usedCount: number;
  demoToken?: string;
  publicEnabled?: boolean;
}

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface Props {
  demo: DemoConfig;
  demoId: string;
}

// Composant TypingDots
function TypingDots() {
  return (
    <div className="flex gap-1 items-center justify-center h-5 mt-1">
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounceDots" style={{ animationDelay: '0s' }} />
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounceDots" style={{ animationDelay: '0.2s' }} />
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounceDots" style={{ animationDelay: '0.4s' }} />
    </div>
  );
}

// Composant ChatButton
const ChatButton: React.FC<{
  isOpen: boolean;
  onClick: () => void;
  config: DemoConfig;
  showPopup: boolean;
}> = ({ isOpen, onClick, config, showPopup }) => {
  return (
    <>
      {/* Popup Bubble */}
      {showPopup && !isOpen && (
        <div
          className="chat-popup"
          style={{ backgroundColor: config.color }}
        >
          {config.popupMessage}
        </div>
      )}

      {/* Chat Button */}
      <button
        className="chat-button"
        onClick={onClick}
        style={{ backgroundColor: config.color }}
      >
        <div style={{
          transition: 'all 0.3s ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>
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
    </>
  );
};

// Composant ChatHeader
const ChatHeader: React.FC<{
  config: DemoConfig;
  onNewChat: () => void;
  onClose: () => void;
}> = ({ config, onNewChat, onClose }) => {
  const defaultAvatarSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0QzE0IDUuMSAxMy4xIDYgMTIgNkMxMC45IDYgMTAgNS4xIDEwIDRDMTAgMi45IDEwLjkgMiAxMiAyWk0yMSA5VjIyQzE5IDIyIDE3IDIxIDE1Ljk5IDE5LjM2QzE2LjA1IDE5LjkgMTYgMTkuOTEgMTYgMjBDMTYgMjEuMSAxNS4xIDIyIDE0IDIySDE0QzguOSAyMiA4IDIxLjEgOCAyMFYxNEgxMFYxMEwxMiA5TDE0IDlMMTYgMTBWMTRIMThWMTBMMjAgOUgyMSIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo=';

  return (
    <div className="chat-header">
      <div className="chat-header-content">
        <div className="chat-avatar-container">
          <img
            src={config.avatarUrl || defaultAvatarSrc}
            alt="Avatar"
            className="chat-avatar"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              const target = e.currentTarget;
              target.src = defaultAvatarSrc;
            }}
          />
          <div className="chat-status"></div>
        </div>
        <div className="chat-info">
          <h3 className="chat-title">{config.chatTitle}</h3>
          <p className="chat-subtitle">{config.subtitle}</p>
        </div>
      </div>
      <div className="chat-actions">
        <button
          className="chat-action-btn"
          onClick={onNewChat}
          title="Nouvelle conversation"
        >
          <RotateCcw size={18} />
        </button>
        <button
          className="chat-action-btn"
          onClick={onClose}
          title="Réduire"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

// Composant ChatWindow
const ChatWindow: React.FC<{
  isOpen: boolean;
  config: DemoConfig;
  messages: Message[];
  isTyping: boolean;
  inputValue: string;
  usedCount: number;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onNewChat: () => void;
  onClose: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
}> = ({
  isOpen,
  config,
  messages,
  isTyping,
  inputValue,
  usedCount,
  onInputChange,
  onSendMessage,
  onNewChat,
  onClose,
  messagesEndRef,
  inputRef
}) => {
    const defaultBotAvatarSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSI2IiB5PSI2IiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMCAyQzEwLjkgMiAxMS43IDIuOSAxMS43IDRDMTEuNyA1LjEgMTAuOSA2IDEwIDZDOS4xIDYgOC4zIDUuMSA4LjMgNEM4LjMgMi45IDkuMSAyIDEwIDJaTTE3LjUgN1YxOEMxNS44IDE4IDE0LjIgMTcuMyAxMy4zIDE2LjFDMTMuNCAxNi42IDEzLjMgMTYuNiAxMy4zIDE2LjdDMTMuMyAxNy41IDEyLjYgMTguMyAxMS43IDE4LjNIOC4zQzcuNSAxOC4zIDYuNyAxNy41IDYuNyAxNi43VjExLjdIOC4zVjguM0wxMCA3LjVMMTEuNyA3LjVMMTMuMyA4LjNWMTEuN0gxNVY4LjNMMTYuNyA3LjVIMTcuNSIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo=';

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSendMessage();
      }
    };

    const isLimitReached = usedCount >= config.usageLimit;

    return (
      <div
        className={`chat-window ${isOpen ? 'open' : 'closed'} ${config.theme === 'dark' ? 'dark' : ''}`}
        style={{
          width: `480px`,
          height: `650px`,
          '--primary-color': config.color
        } as React.CSSProperties}
      >
        {/* Header */}
        <ChatHeader
          config={config}
          onNewChat={onNewChat}
          onClose={onClose}
        />

        {/* Usage Counter */}
        <div className={`px-4 py-2 border-b text-xs ${config.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
          <div className="flex items-center justify-between">
            <span>Messages used: {usedCount} / {config.usageLimit}</span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isLimitReached ? 'bg-red-500' : usedCount / config.usageLimit > 0.8 ? 'bg-yellow-500' : 'bg-green-500'}`} />
              <span className={isLimitReached ? 'text-red-500' : usedCount / config.usageLimit > 0.8 ? 'text-yellow-500' : 'text-green-500'}>
                {isLimitReached ? 'Limite atteinte' : 'Available'}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className={`chat-messages ${config.theme === 'dark' ? 'dark' : ''} custom-scrollbar`} style={{ height: 'calc(100% - 140px)' }}>
          <div className="messages-container show">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'items-start' : 'items-end'} mb-3 ${message.isBot ? 'flex-row' : 'flex-row-reverse'}`}
              >
                {message.isBot && (
                  <img
                    src={config.avatarUrl || defaultBotAvatarSrc}
                    alt="Bot"
                    className="w-8 h-8 rounded-full self-start mr-2"
                    style={{ flexShrink: 0 }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      const target = e.currentTarget;
                      target.src = defaultBotAvatarSrc;
                    }}
                  />
                )}
                <div className="flex flex-col max-w-sm relative">
                  <div className={`chat-bubble ${message.isBot ? 'bot' : 'user'}`}>
                    {message.text}
                  </div>
                  <div className={`chat-timestamp ${message.isBot ? 'bot' : 'user'}`}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start mb-3 flex-row">
                <img
                  src={config.avatarUrl || defaultBotAvatarSrc}
                  alt="Bot"
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
                        backgroundColor: config.theme === 'dark' ? '#9ca3af' : '#6b7280',
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
        <div className={`chat-input-area ${config.theme === 'dark' ? 'dark' : ''}`}>
          <div className="chat-input-container">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isLimitReached ? 'Limite de messages atteinte' : config.placeholderText}
              className={`chat-input ${config.theme === 'dark' ? 'dark' : ''}`}
              disabled={isLimitReached}
            />
            <button
              onClick={onSendMessage}
              disabled={!inputValue.trim() || isLimitReached}
              className="chat-send-btn"
              style={{ backgroundColor: config.color }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

export default function SharedDemoClient({ demo, demoId }: Props) {
  // États pour le chat
  const [messages, setMessages] = useState<Message[]>(() => {
    if (demo.showWelcome && demo.welcomeMessage) {
      return [{
        id: '1',
        text: demo.welcomeMessage,
        isBot: true,
        timestamp: new Date()
      }];
    }
    return [];
  });

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [usedCount, setUsedCount] = useState(demo.usedCount || 0);

  // États pour l'interface
  const [isOpen, setIsOpen] = useState(false); // Fermé par défaut
  const [showPopupBubble, setShowPopupBubble] = useState(false);
  const [mobileView, setMobileView] = useState<'info' | 'chat'>('info'); // Nouveau: gestion 2 pages mobile

  // Refs pour le chat
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Gestion du popup (si chat fermé)
  useEffect(() => {
    if (demo.showPopup && !isOpen) {
      const timer = setTimeout(() => {
        setShowPopupBubble(true);
      }, demo.popupDelay * 1000);
      return () => clearTimeout(timer);
    } else {
      setShowPopupBubble(false);
    }
  }, [demo.showPopup, demo.popupDelay, isOpen]);

  // Scroll to bottom when new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Fonction pour envoyer un message
  const sendMessage = async () => {
    if (!inputValue.trim() || !demo.agentId || usedCount >= demo.usageLimit) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue; // Sauvegarder la valeur
    setInputValue('');
    setIsTyping(true);

    try {
      const body: any = {
        message: currentInput, // Utiliser la valeur sauvegardée
        previousMessages: messages.map(msg => ({
          role: msg.isBot ? 'assistant' : 'user',
          content: msg.text
        }))
      };

      if (demo.showWelcome && demo.welcomeMessage?.trim()) {
        body.welcomeMessage = demo.welcomeMessage.trim();
      }

      const response = await fetch(`/api/agents/${demo.agentId}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-public-kind': 'demo',        // 👈 nouveau
          'x-demo-id': demoId,            // 👈 nouveau
          'x-demo-token': demo.demoToken ?? '', // 👈 nouveau
        },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        const data = await response.json();

        // IMPORTANT: Arrêter typing AVANT d'ajouter le message
        setIsTyping(false);

        // Petit délai pour éviter le flash
        setTimeout(() => {
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: data.reply || 'Désolé, je n\'ai pas pu traiter votre demande.',
            isBot: true,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
          setUsedCount(prev => prev + 1);
        }, 100);

        // Mettre à jour le compteur côté serveur
        await fetch(`/api/demo/${demoId}/usage`, {
          method: 'POST'
        });
      } else {
        throw new Error('Erreur API');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);

      // IMPORTANT: Arrêter typing AVANT d'ajouter le message d'erreur
      setIsTyping(false);

      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
          isBot: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }, 100);
    }
  };

  // Toggle chat pour mobile (change de page)
  const toggleChatMobile = () => {
    if (mobileView === 'info') {
      setMobileView('chat');
    } else {
      setMobileView('info');
    }
    setShowPopupBubble(false);
  };

  // Toggle chat pour desktop
  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowPopupBubble(false);
  };

  // New chat function
  const startNewChat = () => {
    if (demo.showWelcome) {
      setMessages([{
        id: '1',
        text: demo.welcomeMessage,
        isBot: true,
        timestamp: new Date()
      }]);
    } else {
      setMessages([]);
    }
  };

  const usagePercentage = (usedCount / demo.usageLimit) * 100;
  const isLimitReached = usedCount >= demo.usageLimit;

  // Fonction pour gérer Enter dans l'input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const defaultBotAvatarSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSI2IiB5PSI2IiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMCAyQzEwLjkgMiAxMS43IDIuOSAxMS43IDRDMTEuNyA1LjEgMTAuOSA2IDEwIDZDOS4xIDYgOC4zIDUuMSA4LjMgNEM4LjMgMi45IDkuMSAyIDEwIDJaTTE3LjUgN1YxOEMxNS44IDE4IDE0LjIgMTcuMyAxMy4zIDE2LjFDMTMuNCAxNi42IDEzLjMgMTYuNiAxMy4zIDE2LjdDMTMuMyAxNy41IDEyLjYgMTguMyAxMS43IDE4LjNIOC4zQzcuNSAxOC4zIDYuNyAxNy41IDYuNyAxNi43VjExLjdIOC4zVjguM0wxMCA3LjVMMTEuNyA3LjVMMTMuMyA4LjNWMTEuN0gxNVY4LjNMMTYuNyA7LjVIMTcuNSIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo=';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-7xl mx-auto">

          {/* Mobile/Tablet Layout */}
          <div className="block lg:hidden">
            {mobileView === 'info' ? (
              // PAGE 1 - Infos
              <div className="max-w-2xl mx-auto space-y-6 text-white min-h-screen flex flex-col justify-center">
                {/* Header Mobile */}
                <div className="text-center">
                  <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {demo.name}
                  </h1>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    Test our AI assistant in real time.
                  </p>
                </div>

                {/* Stats Mobile */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <Activity className="text-blue-400" size={18} />
                      <h3 className="font-semibold text-blue-200 text-sm">Usage</h3>
                    </div>
                    <div className="text-sm text-gray-400">{usedCount} / {demo.usageLimit}</div>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="text-purple-400" size={18} />
                      <h3 className="font-semibold text-purple-200 text-sm">Status</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${usedCount >= demo.usageLimit ? 'bg-red-500' : 'bg-green-500'
                        }`} />
                      <span className={`text-xs ${usedCount >= demo.usageLimit ? 'text-red-400' : 'text-green-400'
                        }`}>
                        {usedCount >= demo.usageLimit ? 'Limite' : 'Actif'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="text-cyan-400" size={20} />
                    Features
                  </h3>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                      <span>Real-time conversation</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                      <span>Modern and intuitive interface</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                      <span>Smart contextual responses</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                      <span>Demo limited to {demo.usageLimit} messages</span>
                    </li>
                  </ul>
                </div>

                {/* Message expérience desktop */}
                <div className="bg-gradient-to-r from-orange-600/20 to-yellow-600/20 border border-orange-500/30 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-orange-400 text-sm">💻</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-orange-300 font-medium text-sm mb-1">
                        💡 Conseil
                      </h4>
                      <p className="text-orange-200/90 text-xs leading-relaxed">
                        Pour une expérience optimale avec toutes les fonctionnalités, utilisez un ordinateur ou élargissez votre écran !
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bouton Principal */}
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Ready to get started ?
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Cliquez sur le bouton pour démarrer la conversation.
                  </p>
                  <button
                    onClick={toggleChatMobile}
                    disabled={isLimitReached}
                    className={`w-full py-4 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-3 text-lg ${isLimitReached
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                      }`}
                  >
                    <MessageCircle size={24} />
                    {isLimitReached ? 'Limite atteinte' : 'Ouvrir le Chat'}
                  </button>
                </div>
              </div>
            ) : (
              // PAGE 2 - Chat Fullscreen
              <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
                {/* Header Chat Mobile avec couleur */}
                <div
                  className="border-b border-gray-700 p-4"
                  style={{
                    backgroundColor: demo.color,
                    background: `linear-gradient(135deg, ${demo.color} 0%, ${demo.color}dd 100%)`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={toggleChatMobile}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X size={20} className="text-white" />
                    </button>
                    <div className="flex items-center gap-3">
                      <img
                        src={demo.avatarUrl || defaultBotAvatarSrc}
                        alt="Bot"
                        className="w-8 h-8 rounded-full border-2 border-white/20"
                      />
                      <div>
                        <h3 className="text-white font-medium text-sm">{demo.chatTitle}</h3>
                        <p className="text-white/80 text-xs">{demo.subtitle}</p>
                      </div>
                    </div>
                    <button
                      onClick={startNewChat}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Nouvelle conversation"
                    >
                      <RotateCcw size={18} className="text-white" />
                    </button>
                  </div>

                  {/* Usage Counter Mobile */}
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/90">Messages: {usedCount} / {demo.usageLimit}</span>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${isLimitReached ? 'bg-red-300' : usedCount / demo.usageLimit > 0.8 ? 'bg-yellow-300' : 'bg-green-300'}`} />
                        <span className={isLimitReached ? 'text-red-200' : usedCount / demo.usageLimit > 0.8 ? 'text-yellow-200' : 'text-green-200'}>
                          {isLimitReached ? 'Limite' : 'Actif'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages Fullscreen */}
                <div className="flex-1 overflow-hidden">
                  <div className="h-full overflow-y-auto p-4 custom-scrollbar">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isBot ? 'items-start' : 'items-end'} mb-4 ${message.isBot ? 'flex-row' : 'flex-row-reverse'}`}
                      >
                        {message.isBot && (
                          <img
                            src={demo.avatarUrl || defaultBotAvatarSrc}
                            alt="Bot"
                            className="w-8 h-8 rounded-full self-start mr-3"
                          />
                        )}
                        <div className="flex flex-col max-w-xs relative">
                          <div className={`px-4 py-3 rounded-2xl ${message.isBot
                              ? 'bg-gray-700 text-white'
                              : 'bg-blue-600 text-white'
                            }`}>
                            {message.text}
                          </div>
                          <div className={`text-xs text-gray-400 mt-1 ${message.isBot ? 'text-left' : 'text-right'}`}>
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex items-start mb-4">
                        <img
                          src={demo.avatarUrl || defaultBotAvatarSrc}
                          alt="Bot"
                          className="w-8 h-8 rounded-full self-start mr-3"
                        />
                        <div className="bg-gray-700 px-4 py-3 rounded-2xl flex items-center gap-1">
                          {[0, 1, 2].map(i => (
                            <span
                              key={i}
                              className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounceDots"
                              style={{ animationDelay: `${i * 0.2}s` }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input Fullscreen */}
                <div className="bg-gray-800 border-t border-gray-700 p-4 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isLimitReached ? 'Limite atteinte' : demo.placeholderText}
                      disabled={isLimitReached}
                      className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!inputValue.trim() || isLimitReached}
                      className="p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      style={{ backgroundColor: demo.color }}
                    >
                      <Send size={20} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-12 gap-8 items-start min-h-[80vh]">

              {/* Left Side - Info (5 colonnes) */}
              <div className="col-span-5 text-white space-y-6">
                <div>
                  <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {demo.name}
                  </h1>
                  <p className="text-xl text-gray-300 leading-relaxed">
                    Test our AI assistant in real time. An interactive demo to explore its capabilities.
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <Activity className="text-blue-400" size={20} />
                      <h3 className="font-semibold text-blue-200">Usage</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Messages:</span>
                        <span className="text-white font-medium">{usedCount} / {demo.usageLimit}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${usagePercentage >= 100 ? 'bg-red-500' :
                              usagePercentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="text-purple-400" size={20} />
                      <h3 className="font-semibold text-purple-200">Status</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${usedCount >= demo.usageLimit ? 'bg-red-500' : 'bg-green-500'
                        }`} />
                      <span className={`text-sm font-medium ${usedCount >= demo.usageLimit ? 'text-red-400' : 'text-green-400'
                        }`}>
                        {usedCount >= demo.usageLimit ? 'Limite atteinte' : 'Available'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="text-cyan-400" size={20} />
                    Features
                  </h3>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                      <span>Real-time conversation</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                      <span>Modern and intuitive interface</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                      <span>Smart contextual responses</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                      <span>Demo limited to {demo.usageLimit} messages</span>
                    </li>
                  </ul>
                </div>

                {/* CTA Desktop */}
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Ready to get started ?
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    {isOpen
                      ? 'The chat is open! Start asking your questions.'
                      : 'Click the chat button to start the conversation.'
                    }
                  </p>
                  {!isOpen && (
                    <button
                      onClick={toggleChat}
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={20} />
                      Ouvrir le Chat
                    </button>
                  )}
                </div>
              </div>

              {/* Center Spacer (2 colonnes) */}
              <div className="col-span-2"></div>

              {/* Right Side - Chat Widget Container Fixe (5 colonnes) */}
              <div className="col-span-5">
                {/* Conteneur invisible fixe comme demo-agent */}
                <div
                  className="relative"
                  style={{
                    position: 'sticky',
                    top: '2rem',
                    height: 'calc(100vh - 4rem)',
                    maxHeight: '700px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div
                    className="chat-widget"
                    style={{
                      '--primary-color': demo.color,
                      position: 'absolute',
                      bottom: '24px',
                      right: '24px',
                    } as React.CSSProperties}
                  >
                    <ChatButton
                      isOpen={isOpen}
                      onClick={toggleChat}
                      config={demo}
                      showPopup={showPopupBubble}
                    />

                    <ChatWindow
                      isOpen={isOpen}
                      config={demo}
                      messages={messages}
                      isTyping={isTyping}
                      inputValue={inputValue}
                      usedCount={usedCount}
                      onInputChange={setInputValue}
                      onSendMessage={sendMessage}
                      onNewChat={startNewChat}
                      onClose={toggleChat}
                      messagesEndRef={messagesEndRef}
                      inputRef={inputRef}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}