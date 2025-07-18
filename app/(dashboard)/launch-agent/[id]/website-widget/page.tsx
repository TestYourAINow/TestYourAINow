'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Send, X, MessageCircle, Settings, Globe, Smartphone, Plus, RotateCcw, User, Bot, Info } from 'lucide-react';
import { DeploymentModal, DeployButton } from '@/components/DeploymentModal';

// Types
interface ChatbotConfig {
  name: string;
  avatar: string;
  welcomeMessage: string;
  placeholderText: string;
  typingText: string;
  theme: 'light' | 'dark';
  primaryColor: string;
  width: number;
  height: number;
  placement: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  popupMessage: string;
  popupDelay: number;
  showPopup: boolean;
  showWelcomeMessage: boolean;
  selectedAgent: string;
  chatTitle: string;
  subtitle: string;
}

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface Agent {
  _id: string;
  name: string;
}

// 1. ChatButton Component
const ChatButton: React.FC<{
  isOpen: boolean;
  onClick: () => void;
  config: ChatbotConfig;
  showPopup: boolean;
}> = ({ isOpen, onClick, config, showPopup }) => {
  return (
    <>
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
        onClick={onClick}
        style={{ backgroundColor: config.primaryColor }}
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

// 2. ChatHeader Component
const ChatHeader: React.FC<{
  config: ChatbotConfig;
  onNewChat: () => void;
  onClose: () => void;
}> = ({ config, onNewChat, onClose }) => {
  return (
    <div className="chat-header">
      <div className="chat-header-content">
        <div className="chat-avatar-container">
          <img
            src={config.avatar}
            alt="Avatar"
            className="chat-avatar"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0QzE0IDUuMSAxMy4xIDYgMTIgNkMxMC45IDYgMTAgNS4xIDEwIDRDMTAgMi45IDEwLjkgMiAxMiAyWk0yMSA5VjIyQzE5IDIyIDE3IDIxIDE1Ljk5IDE5LjM2QzE2LjA1IDE5LjkgMTYgMTkuOTEgMTYgMjBDMTYgMjEuMSAxNS4xIDIyIDE0IDIySDE0QzguOSAyMiA4IDIxLjEgOCAyMFYxNEgxMFYxMEwxMiA5TDE0IDlMMTYgMTBWMTRIMThWMTBMMjAgOUgyMSIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo=';
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
          title="Fermer"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

// 3. ChatWindow Component
const ChatWindow: React.FC<{
  isOpen: boolean;
  config: ChatbotConfig;
  messages: Message[];
  isTyping: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onNewChat: () => void;
  onClose: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  animateMessages: boolean;
}> = ({
  isOpen,
  config,
  messages,
  isTyping,
  inputValue,
  onInputChange,
  onSendMessage,
  onNewChat,
  onClose,
  messagesEndRef,
  inputRef,
  animateMessages
}) => {
    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSendMessage();
      }
    };

    return (
      <div
        className={`chat-window ${isOpen ? 'open' : 'closed'} ${config.theme === 'dark' ? 'dark' : ''}`}
        style={{
          width: `${config.width}px`,
          height: `${config.height}px`,
          '--primary-color': config.primaryColor
        } as React.CSSProperties}
      >
        {/* Header */}
        <ChatHeader
          config={config}
          onNewChat={onNewChat}
          onClose={onClose}
        />

        {/* Messages */}
        <div className={`chat-messages ${config.theme === 'dark' ? 'dark' : ''} custom-scrollbar`}>
          <div className={`messages-container ${animateMessages ? 'show' : ''}`}>
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'items-start' : 'items-end'} mb-3 ${message.isBot ? 'flex-row' : 'flex-row-reverse'}`}
              >
                {message.isBot && (
                  <img
                    src={config.avatar}
                    alt="Bot"
                    className="w-8 h-8 rounded-full self-start mr-2"
                    style={{ flexShrink: 0 }}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSI2IiB5PSI2IiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMCAyQzEwLjkgMiAxMS43IDIuOSAxMS43IDRDMTEuNyA1LjEgMTAuOSA2IDEwIDZDOS4xIDYgOC4zIDUuMSA4LjMgNEM4LjMgMi45IDkuMSAyIDEwIDJaTTE3LjUgN1YxOEMxNS44IDE4IDE0LjIgMTcuMyAxMy4zIDE2LjFDMTMuNCAxNi42IDEzLjMgMTYuNiAxMy4zIDE2LjdDMTMuMyAxNy41IDEyLjYgMTguMyAxMS43IDE4LjNIOC4zQzcuNSAxOC4zIDYuNyAxNy41IDYuNyAxNi43VjExLjdIOC4zVjguM0wxMCA3LjVMMTEuNyA3LjVMMTMuMyA4LjNWMTEuN0gxNVY4LjNMMTYuNyA3LjVIMTcuNSIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo=';
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
                  src={config.avatar}
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
              placeholder={config.placeholderText}
              className={`chat-input ${config.theme === 'dark' ? 'dark' : ''}`}
            />
            <button
              onClick={onSendMessage}
              disabled={!inputValue.trim()}
              className="chat-send-btn"
              style={{ backgroundColor: config.primaryColor }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

// 4. Main ChatWidget Component
const ChatWidget: React.FC<{
  config: ChatbotConfig;
}> = ({ config }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showPopupBubble, setShowPopupBubble] = useState(false);
  const [animateMessages, setAnimateMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Initialize welcome message
  useEffect(() => {
    if (config.showWelcomeMessage && messages.length === 0) {
      setMessages([{
        id: '1',
        text: config.welcomeMessage,
        isBot: true,
        timestamp: new Date()
      }]);
    } else if (!config.showWelcomeMessage) {
      setMessages(prev => prev.filter(msg => msg.id !== '1' || !msg.isBot || msg.text !== config.welcomeMessage));
    }
  }, [config.welcomeMessage, config.showWelcomeMessage]);

  // Popup logic
  useEffect(() => {
    if (config.showPopup && !isOpen) {
      const timer = setTimeout(() => {
        setShowPopupBubble(true);
      }, config.popupDelay * 1000);

      return () => clearTimeout(timer);
    } else {
      setShowPopupBubble(false);
    }
  }, [config.showPopup, config.popupDelay, isOpen]);

  // Scroll to bottom when new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened + animate messages
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setAnimateMessages(true);
    } else {
      setAnimateMessages(false);
    }
  }, [isOpen]);

  // Send message
  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Si un agent est sélectionné, utiliser l'API
      if (config.selectedAgent) {
        const body: any = {
          message: inputValue,
          previousMessages: messages.map(msg => ({
            role: msg.isBot ? 'assistant' : 'user',
            content: msg.text
          }))
        };

        // Ajouter le welcomeMessage si activé
        if (config.showWelcomeMessage && config.welcomeMessage?.trim()) {
          body.welcomeMessage = config.welcomeMessage.trim();
        }

        const response = await fetch(`/api/agents/${config.selectedAgent}/ask`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });

        if (response.ok) {
          const data = await response.json();
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: data.reply || 'Désolé, je n\'ai pas pu traiter votre demande.',
            isBot: true,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
        } else {
          throw new Error('Erreur API');
        }
      } else {
        // Réponse par défaut si aucun agent sélectionné
        throw new Error('Aucun agent sélectionné');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);

      // Fallback avec réponses simulées
      const responses = [
        "Merci pour votre message ! Je suis là pour vous aider.",
        "C'est une question intéressante. Laissez-moi réfléchir à ça...",
        "Je comprends votre préoccupation. Voici ce que je peux vous suggérer...",
        "Excellente question ! Je serais ravi de vous aider avec ça.",
        "Je traite votre demande. Donnez-moi un moment s'il vous plaît..."
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Toggle chat
  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowPopupBubble(false);
  };

  // New chat function
  const startNewChat = () => {
    setMessages([]);
    if (config.showWelcomeMessage) {
      setTimeout(() => {
        setMessages([{
          id: '1',
          text: config.welcomeMessage,
          isBot: true,
          timestamp: new Date()
        }]);
      }, 100);
    }
  };

  return (
    <div
      className="chat-widget"
      style={{
        '--primary-color': config.primaryColor,
        // Dans le ChatBuilder, position relative au conteneur
        position: 'absolute',
        [config.placement.split('-')[0]]: '24px',
        [config.placement.split('-')[1]]: '24px',
      } as React.CSSProperties}
    >
      <ChatButton
        isOpen={isOpen}
        onClick={toggleChat}
        config={config}
        showPopup={showPopupBubble}
      />
      <ChatWindow
        isOpen={isOpen}
        config={config}
        messages={messages}
        isTyping={isTyping}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSendMessage={sendMessage}
        onNewChat={startNewChat}
        onClose={toggleChat}
        messagesEndRef={messagesEndRef}
        inputRef={inputRef}
        animateMessages={animateMessages}
      />
    </div>
  );
};

// 5. Main ChatbotBuilder Component
const ChatbotBuilder: React.FC = () => {
  // Récupération de l'ID depuis l'URL
  const { id } = useParams();
  const connectionId = id as string;

  // États contrôlables pour l'API
  const [connection, setConnection] = useState<any>(null);
  const [name, setName] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [settings, setSettings] = useState<any>({});
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [savedWidgetId, setSavedWidgetId] = useState<string | null>(null);

  // Fetch des données de connexion
  useEffect(() => {
    const fetchConnection = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/connections/${connectionId}`);
        const data = await res.json();
        if (data?.connection) {
          setConnection(data.connection);
        }
      } catch (err) {
        console.error('Erreur de chargement de la connexion:', err);
        setError('Erreur lors du chargement');
      } finally {
        setIsLoading(false);
      }
    };
    if (connectionId) fetchConnection();
  }, [connectionId]);

  // Configuration du chatbot (mise à jour en temps réel)
  const config: ChatbotConfig = {
    name: name || 'Assistant IA',
    avatar: settings.avatar || 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png',
    welcomeMessage: settings.welcomeMessage || 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
    placeholderText: settings.placeholderText || 'Tapez votre message...',
    typingText: settings.typingText || 'L\'IA tape...',
    theme: settings.theme || 'light',
    primaryColor: settings.primaryColor || '#007bff',
    width: settings.width || 380,
    height: settings.height || 600,
    placement: settings.placement || 'bottom-right',
    popupMessage: settings.popupMessage || 'Salut ! Besoin d\'aide ?',
    popupDelay: settings.popupDelay || 2,
    showPopup: settings.showPopup !== undefined ? settings.showPopup : true,
    showWelcomeMessage: settings.showWelcomeMessage !== undefined ? settings.showWelcomeMessage : true,
    selectedAgent: selectedAgent,
    chatTitle: settings.chatTitle || 'Assistant IA',
    subtitle: settings.subtitle || 'En ligne'
  };

  // Initialisation des données depuis l'API
  useEffect(() => {
    if (connection) {
      setName(connection.name || '');
      setSelectedAgent(connection.aiBuildId || '');
      setSettings(connection.settings || {});
    }
  }, [connection]);

  // Load agents depuis l'API
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch('/api/agents');
        const data = await res.json();
        setAgents(data.agents || []);
      } catch (error) {
        console.error('Erreur lors du chargement des agents:', error);
        setAgents([]); // Fallback en cas d'erreur
      }
    };
    fetchAgents();
  }, []);

  // Color presets
  const colorPresets = [
    '#007bff', '#28a745', '#dc3545', '#ffc107',
    '#17a2b8', '#6f42c1', '#e83e8c', '#6c757d'
  ];

  // Fonction de sauvegarde
  const saveChanges = async () => {
    if (!connectionId) return;

    setIsSaving(true);
    try {
      const connectionResponse = await fetch(`/api/connections/${connectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          aiBuildId: selectedAgent,
          settings
        })
      });

      if (!connectionResponse.ok) {
        const errorData = await connectionResponse.json();
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde de la connexion');
      }

      const chatbotConfigResponse = await fetch('/api/chatbot-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name || 'Assistant IA',
          avatar: settings.avatar || 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png',
          welcomeMessage: settings.welcomeMessage || 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
          placeholderText: settings.placeholderText || 'Tapez votre message...',
          typingText: settings.typingText || 'L\'IA tape...',
          theme: settings.theme || 'light',
          primaryColor: settings.primaryColor || '#007bff',
          width: settings.width || 380,
          height: settings.height || 600,
          placement: settings.placement || 'bottom-right',
          popupMessage: settings.popupMessage || 'Salut ! Besoin d\'aide ?',
          popupDelay: settings.popupDelay || 2,
          showPopup: settings.showPopup !== undefined ? settings.showPopup : true,
          showWelcomeMessage: settings.showWelcomeMessage !== undefined ? settings.showWelcomeMessage : true,
          selectedAgent: selectedAgent,
          chatTitle: settings.chatTitle || 'Assistant IA',
          subtitle: settings.subtitle || 'En ligne'
        })
      });

      if (chatbotConfigResponse.ok) {
        const chatbotResult = await chatbotConfigResponse.json();
        if (chatbotResult.success && chatbotResult.widgetId) {
          setSavedWidgetId(chatbotResult.widgetId);
        }
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
      alert('Erreur lors de la sauvegarde: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setIsSaving(false);
    }
  };

  // Fonctions de mise à jour
  const updateName = (newName: string) => {
    setName(newName);
  };

  const updateSelectedAgent = (agentId: string) => {
    setSelectedAgent(agentId);
  };

  const updateSettings = (key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-white text-lg">Chargement de la configuration...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-red-400 text-lg">Erreur lors du chargement: {error}</div>
      </div>
    );
  }

  const selectedAgentName = agents.find(a => a._id === selectedAgent)?.name;

  return (
    <div className="min-h-screen bg-transparent">
      {/* Status de sauvegarde */}
      <div className="fixed top-4 right-4 z-50">
        {isSaving && (
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Sauvegarde...
          </div>
        )}
        {lastSaved && !isSaving && (
          <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
            Sauvegardé à {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Main Content - Centered Container */}
      <div className="flex justify-center min-h-screen py-6">
        <div className="w-full max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-white">
              {name || 'Configuration du Chatbot'}
            </h1>
            <p className="text-sm text-gray-400">
              Créé le 05/06/2025 • ID: {connectionId}
            </p>
          </div>

          <div style={{ display: 'flex', height: 'calc(100vh - 180px)', gap: '24px' }}>
            {/* Preview Panel - Left avec style InfoDemoModal */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl relative overflow-hidden" style={{ flex: '1.4' }}>
              {/* Watermark */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                color: 'rgba(255, 255, 255, 0.15)',
                fontSize: '20px',
                fontWeight: 500,
                pointerEvents: 'none',
                zIndex: 1
              }}>
                <MessageCircle className="w-40 h-40 mb-3" />
                <span>Zone de prévisualisation</span>
              </div>

              <ChatWidget config={config} />
            </div>

            {/* Configuration Panel - Right avec style InfoDemoModal */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl text-white overflow-hidden max-h-[90vh] overflow-y-auto" style={{ width: '400px', display: 'flex', flexDirection: 'column' }}>

              {/* Configuration Section */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                {/* Configuration Générale */}
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Settings className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-blue-200">Configuration Générale</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Titre du Widget
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => updateName(e.target.value)}
                        placeholder="Nom du widget"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Choisir un Agent
                      </label>
                      <select
                        value={selectedAgent}
                        onChange={(e) => updateSelectedAgent(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150"
                      >
                        <option value="">Sélectionner un agent...</option>
                        {agents.map((agent) => (
                          <option key={agent._id} value={agent._id}>
                            {agent.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Avatar du Bot */}
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <User className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-blue-200">Avatar du Bot</h3>
                  </div>

                  {!settings.avatar ? (
                    <div
                      className="border-2 border-dashed border-gray-500 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-600/30"
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file && file.type.startsWith('image/')) {
                          if (file.size <= 1024 * 1024) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              if (e.target?.result) {
                                updateSettings('avatar', e.target.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          } else {
                            alert('⚠️ Avatar trop lourd (max 1MB)');
                          }
                        } else {
                          alert('⚠️ Veuillez sélectionner une image (.png, .jpg, .gif)');
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => {
                        const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
                        fileInput?.click();
                      }}
                    >
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target?.files?.[0];
                          if (file) {
                            if (file.size <= 1024 * 1024) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                if (e.target?.result) {
                                  updateSettings('avatar', e.target.result);
                                }
                              };
                              reader.readAsDataURL(file);
                            } else {
                              alert('⚠️ Avatar trop lourd (max 1MB)');
                            }
                          }
                        }}
                      />
                      <div className="text-gray-400">
                        <div className="mx-auto w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V22H15L13.5 7.5C13.1 7.1 12.6 6.9 12 6.9S10.9 7.1 10.5 7.5L9 22H3V9L8 5H16L21 9Z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-300">Avatar du bot</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (max 1MB)</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="p-6 border border-gray-500 rounded-lg bg-gray-600/30">
                        <div className="flex items-center justify-center">
                          <img
                            src={settings.avatar}
                            alt="Avatar"
                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-400"
                          />
                        </div>
                        <p className="text-xs text-gray-400 text-center mt-3">
                          ✅ Avatar uploadé avec succès
                        </p>
                      </div>
                      <button
                        onClick={() => updateSettings('avatar', '')}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                        title="Supprimer l'avatar"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                {/* Configuration du Chat */}
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageCircle className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-blue-200">Configuration du Chat</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Titre du Chat
                      </label>
                      <input
                        type="text"
                        value={settings.chatTitle || ''}
                        onChange={(e) => updateSettings('chatTitle', e.target.value)}
                        placeholder="Titre du chat"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Sous-titre
                      </label>
                      <input
                        type="text"
                        value={settings.subtitle || ''}
                        onChange={(e) => updateSettings('subtitle', e.target.value)}
                        placeholder="Sous-titre"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Texte de Placeholder
                      </label>
                      <input
                        type="text"
                        value={settings.placeholderText || ''}
                        onChange={(e) => updateSettings('placeholderText', e.target.value)}
                        placeholder="Tapez votre message..."
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Dimensions
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">Largeur</label>
                          <input
                            type="number"
                            value={settings.width || 380}
                            onChange={(e) => updateSettings('width', parseInt(e.target.value) || 380)}
                            min="300"
                            max="600"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">Hauteur</label>
                          <input
                            type="number"
                            value={settings.height || 600}
                            onChange={(e) => updateSettings('height', parseInt(e.target.value) || 600)}
                            min="400"
                            max="800"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Largeur: 300-600px • Hauteur: 400-800px
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Position du Widget
                      </label>
                      <select
                        value={settings.placement || 'bottom-right'}
                        onChange={(e) => updateSettings('placement', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150"
                      >
                        <option value="bottom-right">Bas Droite</option>
                        <option value="bottom-left">Bas Gauche</option>
                        <option value="top-right">Haut Droite</option>
                        <option value="top-left">Haut Gauche</option>
                      </select>
                      <p className="text-xs text-gray-400 mt-2">
                        La position sera appliquée lors du déploiement sur votre site web
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message de Bienvenue */}
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Bot className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-blue-200">Message de Bienvenue</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300">
                        Afficher le message de bienvenue
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="showWelcomeMessage"
                          checked={settings.showWelcomeMessage !== undefined ? settings.showWelcomeMessage : true}
                          onChange={(e) => updateSettings('showWelcomeMessage', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={settings.welcomeMessage || ''}
                        onChange={(e) => updateSettings('welcomeMessage', e.target.value)}
                        placeholder="Bonjour ! Comment puis-je vous aider aujourd'hui ?"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Message Popup */}
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageCircle className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-blue-200">Message Popup</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300">
                        Activer le popup
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="showPopup"
                          checked={settings.showPopup !== undefined ? settings.showPopup : true}
                          onChange={(e) => updateSettings('showPopup', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={settings.popupMessage || ''}
                        onChange={(e) => updateSettings('popupMessage', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
                        placeholder="Salut ! Besoin d'aide ?"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-2">
                        Délai (secondes)
                      </label>
                      <input
                        type="number"
                        value={settings.popupDelay || 2}
                        onChange={(e) => updateSettings('popupDelay', parseInt(e.target.value) || 2)}
                        min="0"
                        max="30"
                        className="w-24 px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150"
                      />
                    </div>
                  </div>
                </div>

                {/* Thème et Couleurs */}
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Globe className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-blue-200">Thème et Couleurs</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Thème
                      </label>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateSettings('theme', 'light')}
                          className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${(settings.theme || 'light') === 'light'
                            ? 'bg-blue-600 text-white border border-blue-400'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                            }`}
                        >
                          <Globe className="w-4 h-4" />
                          Clair
                        </button>
                        <button
                          onClick={() => updateSettings('theme', 'dark')}
                          className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${settings.theme === 'dark'
                            ? 'bg-blue-600 text-white border border-blue-400'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                            }`}
                        >
                          <Smartphone className="w-4 h-4" />
                          Sombre
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Couleur Principale
                      </label>
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        {colorPresets.map((color) => (
                          <button
                            key={color}
                            onClick={() => updateSettings('primaryColor', color)}
                            className={`w-12 h-10 rounded-lg border-2 transition-transform hover:scale-105 ${(settings.primaryColor || '#007bff') === color
                              ? 'border-white ring-2 ring-blue-500'
                              : 'border-gray-500'
                              }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={settings.primaryColor || '#007bff'}
                          onChange={(e) => updateSettings('primaryColor', e.target.value)}
                          className="w-10 h-10 border border-gray-600 rounded-lg cursor-pointer bg-gray-800"
                        />
                        <input
                          type="text"
                          value={settings.primaryColor || '#007bff'}
                          onChange={(e) => updateSettings('primaryColor', e.target.value)}
                          className="flex-1 px-4 py-3 text-sm bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
                          placeholder="#007bff"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 pt-4">
                  <button
                    onClick={saveChanges}
                    disabled={isSaving}
                    className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-green-700 disabled:opacity-75 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <Settings className="w-5 h-5" />
                        Enregistrer la Configuration
                      </>
                    )}
                  </button>

                  {savedWidgetId && (
                    <DeployButton
                      widgetId={savedWidgetId}
                      onDeploy={() => setShowDeployModal(true)}
                      disabled={isSaving}
                    />
                  )}
                </div>

                {/* Informations du Widget - avec fond bleu */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Info className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-blue-200">Informations du Widget</h3>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Agent:</span>
                      <span className="text-white font-medium">{selectedAgentName || 'Aucun sélectionné'}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Taille:</span>
                      <span className="text-white">{settings.width || 380}×{settings.height || 600}px</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Thème:</span>
                      <span className="text-white capitalize">{(settings.theme || 'light') === 'light' ? 'Clair' : 'Sombre'}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Couleur Principale:</span>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-600"
                          style={{ backgroundColor: settings.primaryColor || '#007bff' }}
                        />
                        <span className="text-white text-xs font-mono">{settings.primaryColor || '#007bff'}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Position du Widget:</span>
                      <span className="text-white capitalize">
                        {(settings.placement || 'bottom-right') === 'bottom-right' ? 'Bas Droite' :
                          (settings.placement || 'bottom-right') === 'bottom-left' ? 'Bas Gauche' :
                            (settings.placement || 'bottom-right') === 'top-right' ? 'Haut Droite' : 'Haut Gauche'}
                      </span>
                    </div>
                    {lastSaved && (
                      <div className="flex justify-between text-gray-300">
                        <span>Dernière sauvegarde:</span>
                        <span className="text-white">{lastSaved.toLocaleTimeString()}</span>
                      </div>
                    )}
                    {savedWidgetId && (
                      <div className="flex justify-between text-gray-300">
                        <span>Widget ID:</span>
                        <span className="text-white font-mono text-xs bg-blue-800/50 px-2 py-1 rounded">
                          {savedWidgetId.slice(-8)}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeploymentModal
        isOpen={showDeployModal}
        onClose={() => setShowDeployModal(false)}
        widgetId={savedWidgetId || ''}
        widgetName={name || 'Assistant IA'}
      />
    </div>
  );
};

export default ChatbotBuilder;