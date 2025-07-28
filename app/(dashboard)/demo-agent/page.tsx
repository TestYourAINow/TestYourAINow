'use client';

import { useState, useEffect, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { 
  Moon, Sun, Bot, User, Info, X, Upload, Send, Settings, MessageCircle, 
  RotateCcw, Globe, Smartphone, Palette, Monitor, Eye, Trash2, Sparkles, CheckCircle
} from "lucide-react";
import { cn } from '@/lib/utils';
import CreateDemoModal from '@/components/CreateDemoModal';
import InfoDemoModal from '@/components/InfoDemoModal';
import { DeleteDemoModal } from '@/components/DeleteDemoModal';
import RequireApiKey from "@/components/RequireApiKey";

// Types
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

interface Agent {
  _id: string;
  name: string;
  avatarUrl?: string;
}

interface DemoItem {
  _id: string;
  name: string;
}

// TypingDots Component
function TypingDots() {
  return (
    <div className="flex gap-1 items-center justify-center h-5 mt-1">
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounceDots" style={{ animationDelay: '0s' }} />
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounceDots" style={{ animationDelay: '0.2s' }} />
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounceDots" style={{ animationDelay: '0.4s' }} />
    </div>
  );
}

// ChatButton Component
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

// ChatHeader Component
const ChatHeader: React.FC<{
  config: DemoConfig;
  onNewChat: () => void;
  onClose: () => void;
}> = ({ config, onNewChat, onClose }) => {
  return (
    <div className="chat-header">
      <div className="chat-header-content">
        <div className="chat-avatar-container">
          <img
            src={config.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0QzE0IDUuMSAxMy4xIDYgMTIgNkMxMC45IDYgMTAgNS4xIDEwIDRDMTAgMi45IDEwLjkgMiAxMiAyWk0yMSA5VjIyQzE5IDIyIDE3IDIxIDE1Ljk5IDE5LjM2QzE2LjA1IDE5LjkgMTYgMTkuOTEgMTYgMjBDMTYgMjEuMSAxNS4xIDIyIDE0IDIySDE0QzguOSAyMiA4IDIxLjEgOCAyMFYxNEgxMFYxMEwxMiA5TDE0IDlMMTYgMTBWMTRIMThWMTBMMjAgOUgyMSIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo='}
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
          title="New conversation"
        >
          <RotateCcw size={18} />
        </button>
        <button
          className="chat-action-btn"
          onClick={onClose}
          title="Close"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

// ChatWindow Component
const ChatWindow: React.FC<{
  isOpen: boolean;
  config: DemoConfig;
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
          width: `380px`,
          height: `600px`,
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
                    src={config.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSI2IiB5PSI2IiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMCAyQzEwLjkgMiAxMS43IDIuOSAxMS43IDRDMTEuNyA1LjEgMTAuOSA2IDEwIDZDOS4xIDYgOC4zIDUuMSA4LjMgNEM4LjMgMi45IDkuMSAyIDEwIDJaTTE3LjUgN1YxOEMxNS4IDE4IDE0LjIgMTcuMyAxMy4zIDE2LjFDMTMuNCAxNi42IDEzLjMgMTYuNiAxMy4zIDE2LjdDMTMuMyAxNy41IDEyLjYgMTguMyAxMS43IDE4LjNIOC4zQzcuNSAxOC4zIDYuNyAxNy41IDYuNyAxNi43VjExLjdIOC4zVjguM0wxMCA3LjVMMTEuNyA3LjVMMTMuMyA4LjNWMTEuN0gxNVY4LjNMMTYuNyA3LjVIMTcuNSIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo='}
                    alt="Bot"
                    className="w-8 h-8 rounded-full self-start mr-2"
                    style={{ flexShrink: 0 }}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSI2IiB5PSI2IiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMCAyQzEwLjkgMiAxMS43IDIuOSAxMS43IDRDMTEuNyA1LjEgMTAuOSA2IDEwIDZDOS4xIDYgOC4zIDUuMSA4LjMgNEM4LjMgMi45IDkuMSAyIDEwIDJaTTE3LjUgN1YxOEMxNS44IDE4IDE0LjIgMTcuMyAxMy4zIDE2LjFDMTMuNCAxNi42IDEzLjMgMTYuNiAxMy4zIDE2LjdDMTMuMyAxNy41IDEyLjYgMTguMyAxMS43IDE4LjNIOC4zQzcuNSAxOC4zIDYuNyAxNy41IDYuNyAxNi43VjExLjdIOC4zVjguM0wxMCA3LjVMMTEuNyA7LjVMMTMuMyA4LjNWMTEuN0gxNVY4LjNMMTYuNyA3LjVIMTcuNSIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo=';
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
                  src={config.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSI2IiB5PSI2IiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMCAyQzEwLjkgMiAxMS43IDIuOSAxMS43IDRDMTEuNyA1LjEgMTAuOSA2IDEwIDZDOS4xIDYgOC4zIDUuMSA4LjMgNEM4LjMgMi45IDkuMSAyIDEwIDJaTTE3LjUgN1YxOEMxNS4IDE4IDE0LjIgMTcuMyAxMy4zIDE2LjFDMTMuNCAxNi42IDEzLjMgMTYuNiAxMy4zIDE2LjdDMTMuMyAxNy41IDEyLjYgMTguMyAxMS43IDE4LjNIOC4zQzcuNSAxOC4zIDYuNyAxNy41IDYuNyAxNi43VjExLjdIOC4zVjguM0wxMCA3LjVMMTEuNyA3LjVMMTMuMyA4LjNWMTEuN0gxNVY4LjNMMTYuNyA3LjVIMTcuNSIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo='}
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

// Composant pour les actions de démo
const DemoActions = ({ 
  demo, 
  onView, 
  onDelete 
}: { 
  demo: DemoItem; 
  onView: () => void; 
  onDelete: () => void; 
}) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={onView}
        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors"
        title="View Info"
      >
        <Eye size={14} />
      </button>
      <button
        onClick={onDelete}
        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
        title="Delete"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default function DemoAgentPage() {
  // Configuration states
  const [config, setConfig] = useState<DemoConfig>({
    name: 'AI Assistant Demo',
    agentId: '',
    avatar: '',
    welcomeMessage: 'Hello! How can I help you today?',
    placeholderText: 'Type your message...',
    theme: 'dark',
    primaryColor: '#3B82F6',
    popupMessage: 'Hello! Need any help?',
    popupDelay: 2,
    showPopup: true,
    showWelcomeMessage: true,
    chatTitle: 'AI Assistant',
    subtitle: 'Online',
  });

  // Chat states
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Interface states
  const [isOpen, setIsOpen] = useState(false);
  const [showPopupBubble, setShowPopupBubble] = useState(false);
  const [animateMessages, setAnimateMessages] = useState(false);

  // Agents and demos states
  const [agents, setAgents] = useState<Agent[]>([]);
  const [userDemos, setUserDemos] = useState<DemoItem[]>([]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [deleteDemoModal, setDeleteDemoModal] = useState({
    isOpen: false,
    demoId: '',
    demoName: ''
  });
  const [isDeletingDemo, setIsDeletingDemo] = useState(false);

  // Color picker state
  const [customColor, setCustomColor] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Chat refs
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Load agents
  useEffect(() => {
    fetch("/api/agents")
      .then((res) => res.json())
      .then((data) => setAgents(data.agents || []))
      .catch((err) => console.error('Error loading agents:', err));
  }, []);

  // Load user demos
  useEffect(() => {
    fetch('/api/demo/list')
      .then((res) => res.json())
      .then((data) => setUserDemos(data.demos || []))
      .catch((err) => console.error('Error loading demos:', err));
  }, []);

  // Welcome message handling
  useEffect(() => {
    if (config.showWelcomeMessage) {
      setMessages([{
        id: '1',
        text: config.welcomeMessage,
        isBot: true,
        timestamp: new Date()
      }]);
    } else {
      setMessages([]);
    }
  }, [config.showWelcomeMessage, config.welcomeMessage]);

  // Popup handling
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

  // Color picker handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  // Send message function
  const sendMessage = async () => {
    if (!inputValue.trim() || !config.agentId) return;

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
      const body: any = {
        message: inputValue,
        previousMessages: messages.map(msg => ({
          role: msg.isBot ? 'assistant' : 'user',
          content: msg.text
        }))
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

      if (response.ok) {
        const data = await response.json();
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.reply || 'Sorry, I couldn\'t process your request.',
          isBot: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('API Error');
      }
    } catch (error) {
      console.error('Error sending message:', error);

      const responses = [
        "Thanks for your message! I'm here to help you.",
        "That's an interesting question. Let me think about that...",
        "I understand your concern. Here's what I can suggest...",
        "Great question! I'd be happy to help you with that.",
        "I'm processing your request. Please give me a moment..."
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

  // Utility functions
  const updateConfig = (key: keyof DemoConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowPopupBubble(false);
  };

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

  const openInfoModal = (id: string) => {
    setSelectedDemoId(id);
    setShowInfoModal(true);
  };

  const openDeleteDemoModal = (demoId: string, demoName: string) => {
    setDeleteDemoModal({
      isOpen: true,
      demoId: demoId,
      demoName: demoName
    });
  };

  const closeDeleteDemoModal = () => {
    setDeleteDemoModal({
      isOpen: false,
      demoId: '',
      demoName: ''
    });
  };

  const handleDelete = async () => {
    setIsDeletingDemo(true);

    try {
      const response = await fetch(`/api/demo/${deleteDemoModal.demoId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setUserDemos(prev => prev.filter(d => d._id !== deleteDemoModal.demoId));
        closeDeleteDemoModal();
      } else {
        console.error('Failed to delete demo');
      }
    } catch (err) {
      console.error('Error deleting demo:', err);
    } finally {
      setIsDeletingDemo(false);
    }
  };

  // Predefined colors
  const colorPresets = [
    '#3B82F6', '#10B981', '#EF4444', '#F59E0B',
    '#06B6D4', '#8B5CF6', '#EC4899', '#6B7280'
  ];

  const appliedColor = customColor || config.primaryColor;
  const selectedAgent = agents.find(a => a._id === config.agentId);

  return (
    <RequireApiKey>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          {/* Enhanced Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-600/20">
                    <Smartphone className="text-white" size={28} />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
                    <Sparkles className="text-white" size={12} />
                  </div>
                </div>
                
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2">
                    Demo Agent Builder
                  </h1>
                  <p className="text-gray-400 text-lg">
                    Create stunning interactive demos for your AI agents
                  </p>
                </div>
              </div>
              
              {/* Enhanced Stats */}
              {userDemos.length > 0 && (
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{userDemos.length}</div>
                    <div className="text-sm text-gray-400">Active Demos</div>
                  </div>
                  <div className="w-px h-12 bg-gray-700" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{agents.length}</div>
                    <div className="text-sm text-gray-400">Available Agents</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', height: 'calc(100vh - 200px)', gap: '24px' }}>
            {/* Preview Panel - Enhanced but keeping original structure */}
            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl relative overflow-hidden" style={{ flex: '1.4' }}>
              
              {/* Enhanced Device Frame */}
              <div className="absolute top-4 left-4 bg-gray-800/50 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-3 border border-gray-700/50">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <div className="w-px h-4 bg-gray-600" />
                <Monitor size={16} className="text-gray-400" />
                <span className="text-xs text-gray-400 font-medium">Live Preview</span>
              </div>

              {/* Enhanced Live Indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl backdrop-blur-sm">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium">Live</span>
              </div>

              {/* Preview Content - keeping original logic */}
              {!config.agentId ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl flex items-center justify-center mb-8 shadow-2xl border border-gray-600/50">
                    <MessageCircle className="w-16 h-16 text-gray-500" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                    Select an Agent to Preview
                  </h3>
                  <p className="text-gray-400 max-w-md leading-relaxed">
                    Choose an AI agent from the configuration panel to see your demo come to life with real-time interactions
                  </p>
                  <div className="mt-8 flex items-center gap-2 text-blue-400">
                    <span className="text-2xl">👉</span>
                    <span className="font-medium">Configure your demo settings</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-grid opacity-5" />
                  
                  {/* Enhanced Watermark */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    color: 'rgba(255, 255, 255, 0.08)',
                    fontSize: '20px',
                    fontWeight: 500,
                    pointerEvents: 'none',
                    zIndex: 1
                  }}>
                    <MessageCircle className="w-32 h-32 mb-3" />
                    <span>Interactive Preview</span>
                  </div>

                  {/* Chat Widget Preview - keeping original */}
                  <div
                    className="chat-widget"
                    style={{
                      '--primary-color': config.primaryColor,
                      position: 'absolute',
                      bottom: '24px',
                      right: '24px',
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
                </>
              )}
            </div>

            {/* Configuration Panel - Enhanced but keeping structure */}
            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl text-white overflow-hidden" style={{ width: '400px', display: 'flex', flexDirection: 'column' }}>

              {/* Enhanced Header */}
              <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-blue-600/10 to-cyan-600/10">
                <div className="flex items-center gap-3 mb-2">
                  <Settings className="text-blue-400" size={24} />
                  <h2 className="text-xl font-bold text-white">Configuration Panel</h2>
                </div>
                <p className="text-gray-400 text-sm">Customize your demo experience</p>
              </div>

              {/* Configuration Section - keeping all original logic */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                {/* General Configuration - Enhanced styling */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Settings className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">General Configuration</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Demo Name
                      </label>
                      <input
                        type="text"
                        value={config.name}
                        onChange={(e) => updateConfig('name', e.target.value)}
                        placeholder="Demo name"
                        className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm placeholder-gray-400 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Choose Agent
                      </label>
                      <select
                        value={config.agentId}
                        onChange={(e) => updateConfig('agentId', e.target.value)}
                        className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm font-medium"
                      >
                        <option value="">Select an agent...</option>
                        {agents.map((agent) => (
                          <option key={agent._id} value={agent._id}>
                            {agent.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bot Avatar Section - Enhanced */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <User className="text-purple-400" size={20} />
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">Bot Avatar</h3>
                  </div>

                  {!config.avatar ? (
                    <div
                      className="border-2 border-dashed border-gray-600/50 rounded-xl p-8 text-center hover:border-blue-400/50 transition-all cursor-pointer bg-gray-900/30 backdrop-blur-sm group"
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file && file.type.startsWith('image/')) {
                          if (file.size <= 1024 * 1024) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              if (e.target?.result) {
                                updateConfig('avatar', e.target.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          } else {
                            alert('⚠️ Avatar too large (max 1MB)');
                          }
                        } else {
                          alert('⚠️ Please select an image (.png, .jpg, .gif)');
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
                                  updateConfig('avatar', e.target.result);
                                }
                              };
                              reader.readAsDataURL(file);
                            } else {
                              alert('⚠️ Avatar too large (max 1MB)');
                            }
                          }
                        }}
                      />
                      <div className="text-gray-400 group-hover:text-gray-300 transition-colors">
                        <div className="mx-auto w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4 group-hover:bg-gray-600/50 transition-colors">
                          <Upload className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-medium">Upload Bot Avatar</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (max 1MB)</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative bg-gray-900/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
                      <div className="flex items-center gap-4">
                        <img
                          src={config.avatar}
                          alt="Avatar"
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-600/50"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">✅ Avatar uploaded successfully</p>
                          <p className="text-xs text-gray-400 mt-1">Ready to use in your demo</p>
                        </div>
                        <button
                          onClick={() => updateConfig('avatar', '')}
                          className="w-8 h-8 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg flex items-center justify-center transition-colors"
                          title="Remove avatar"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Configuration - Enhanced */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageCircle className="text-cyan-400" size={20} />
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">Chat Configuration</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Chat Title
                      </label>
                      <input
                        type="text"
                        value={config.chatTitle}
                        onChange={(e) => updateConfig('chatTitle', e.target.value)}
                        placeholder="Chat title"
                        className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all backdrop-blur-sm placeholder-gray-400 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={config.subtitle}
                        onChange={(e) => updateConfig('subtitle', e.target.value)}
                        placeholder="Subtitle"
                        className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all backdrop-blur-sm placeholder-gray-400 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Placeholder Text
                      </label>
                      <input
                        type="text"
                        value={config.placeholderText}
                        onChange={(e) => updateConfig('placeholderText', e.target.value)}
                        placeholder="Type your message..."
                        className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all backdrop-blur-sm placeholder-gray-400 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Welcome Message - Enhanced */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Bot className="text-emerald-400" size={20} />
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-200 to-green-200 bg-clip-text text-transparent">Welcome Message</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300">
                        Show welcome message
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="showWelcome"
                          checked={config.showWelcomeMessage}
                          onChange={(e) => updateConfig('showWelcomeMessage', e.target.checked)}
                          className="w-4 h-4 text-emerald-600 bg-gray-800 border-gray-600 rounded focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={config.welcomeMessage}
                        onChange={(e) => updateConfig('welcomeMessage', e.target.value)}
                        placeholder="Hello! How can I help you today?"
                        className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all backdrop-blur-sm placeholder-gray-400 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Popup Configuration - Enhanced */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageCircle className="text-orange-400" size={20} />
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-200 to-yellow-200 bg-clip-text text-transparent">Popup Message</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300">
                        Enable popup
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="showPopup"
                          checked={config.showPopup}
                          onChange={(e) => updateConfig('showPopup', e.target.checked)}
                          className="w-4 h-4 text-orange-600 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={config.popupMessage}
                        onChange={(e) => updateConfig('popupMessage', e.target.value)}
                        className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 transition-all backdrop-blur-sm placeholder-gray-400 font-medium"
                        placeholder="Hello! Need any help?"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-2">
                        Delay (seconds)
                      </label>
                      <input
                        type="number"
                        value={config.popupDelay}
                        onChange={(e) => updateConfig('popupDelay', parseInt(e.target.value) || 2)}
                        min="0"
                        max="30"
                        className="w-24 px-4 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 transition-all backdrop-blur-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Theme & Colors - Enhanced */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Palette className="text-pink-400" size={20} />
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-pink-200 to-purple-200 bg-clip-text text-transparent">Theme & Colors</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Theme
                      </label>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateConfig('theme', 'light')}
                          className={`flex items-center gap-2 px-4 py-3.5 rounded-xl transition-all duration-300 backdrop-blur-sm ${config.theme === 'light'
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border border-blue-500/50 shadow-lg shadow-blue-600/20'
                            : 'bg-gray-900/50 text-gray-300 hover:bg-gray-800/70 border border-gray-700/50 hover:border-gray-600/50'
                            }`}
                        >
                          <Sun className="w-4 h-4" />
                          Light
                        </button>
                        <button
                          onClick={() => updateConfig('theme', 'dark')}
                          className={`flex items-center gap-2 px-4 py-3.5 rounded-xl transition-all duration-300 backdrop-blur-sm ${config.theme === 'dark'
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border border-blue-500/50 shadow-lg shadow-blue-600/20'
                            : 'bg-gray-900/50 text-gray-300 hover:bg-gray-800/70 border border-gray-700/50 hover:border-gray-600/50'
                            }`}
                        >
                          <Moon className="w-4 h-4" />
                          Dark
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Primary Color
                      </label>
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        {colorPresets.map((color) => (
                          <button
                            key={color}
                            onClick={() => updateConfig('primaryColor', color)}
                            className={`aspect-square rounded-xl border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg relative overflow-hidden ${config.primaryColor === color
                              ? 'border-white ring-2 ring-blue-500 shadow-xl'
                              : 'border-gray-600/50 hover:border-gray-500'
                              }`}
                            style={{ backgroundColor: color }}
                          >
                            {config.primaryColor === color && (
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={config.primaryColor}
                          onChange={(e) => updateConfig('primaryColor', e.target.value)}
                          className="w-12 h-10 border border-gray-700/50 rounded-xl cursor-pointer bg-gray-900/80 backdrop-blur-sm"
                        />
                        <input
                          type="text"
                          value={config.primaryColor}
                          onChange={(e) => updateConfig('primaryColor', e.target.value)}
                          className="flex-1 px-4 py-3 text-sm bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 transition-all backdrop-blur-sm placeholder-gray-400 font-mono"
                          placeholder="#3B82F6"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Create Demo Button - Enhanced */}
                <div className="pt-4">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    disabled={!config.agentId}
                    className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transform hover:scale-105 disabled:transform-none disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <CheckCircle className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Create Demo</span>
                  </button>
                </div>

                {/* Demo Information - Enhanced */}
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Info className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">Demo Preview</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                      <div className="text-gray-400 text-xs mb-1">Agent</div>
                      <div className="text-white font-medium truncate">{selectedAgent?.name || 'None selected'}</div>
                    </div>
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                      <div className="text-gray-400 text-xs mb-1">Theme</div>
                      <div className="text-white capitalize">{config.theme}</div>
                    </div>
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                      <div className="text-gray-400 text-xs mb-1">Color</div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full border border-gray-600"
                          style={{ backgroundColor: config.primaryColor }}
                        />
                        <span className="text-white text-xs font-mono">{config.primaryColor}</span>
                      </div>
                    </div>
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                      <div className="text-gray-400 text-xs mb-1">Features</div>
                      <div className="text-white text-xs">
                        {[config.showPopup && 'Popup', config.showWelcomeMessage && 'Welcome'].filter(Boolean).join(', ') || 'Basic'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Your Demos Section - Enhanced but keeping original structure */}
              <div className="border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone className="text-emerald-400" size={18} />
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-200 to-green-200 bg-clip-text text-transparent">Your Demos</h3>
                  {userDemos.length > 0 && (
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full font-medium border border-emerald-500/30">
                      {userDemos.length}
                    </span>
                  )}
                </div>

                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                  {userDemos.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-600/50">
                        <Smartphone className="w-6 h-6 text-gray-500" />
                      </div>
                      <p className="text-sm text-gray-400 mb-2">No demos created yet</p>
                      <p className="text-xs text-gray-500">Create your first demo to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userDemos.map((demo) => (
                        <div key={demo._id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-xl p-4 hover:bg-gray-700/50 transition-all duration-300 group">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium truncate group-hover:text-blue-300 transition-colors">{demo.name}</h4>
                              <p className="text-xs text-gray-400 mt-1">Interactive demo widget</p>
                            </div>
                            
                            <DemoActions
                              demo={demo}
                              onView={() => openInfoModal(demo._id)}
                              onDelete={() => openDeleteDemoModal(demo._id, demo.name)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals - keeping all original functionality */}
        <CreateDemoModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          agentConfig={{
            name: config.name,
            agentId: config.agentId,
            theme: config.theme,
            color: config.primaryColor,
            avatarUrl: config.avatar,
            showWelcome: config.showWelcomeMessage,
            welcomeMessage: config.welcomeMessage,
            placeholderText: config.placeholderText,
            chatTitle: config.chatTitle,
            subtitle: config.subtitle,
            showPopup: config.showPopup,
            popupMessage: config.popupMessage,
            popupDelay: config.popupDelay,
          }}
          onCreateSuccess={async () => {
            const res = await fetch('/api/demo/list');
            const data = await res.json();
            setUserDemos(data.demos || []);
          }}
        />

        <InfoDemoModal
          demoId={selectedDemoId}
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
        />

        <DeleteDemoModal
          isOpen={deleteDemoModal.isOpen}
          onClose={closeDeleteDemoModal}
          onConfirm={handleDelete}
          demoName={deleteDemoModal.demoName}
          isDeleting={isDeletingDemo}
        />

        {/* Enhanced Custom Styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, rgba(59, 130, 246, 0.6), rgba(6, 182, 212, 0.6));
            border-radius: 16px;
            border: 1px solid rgba(75, 85, 99, 0.3);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, rgba(59, 130, 246, 0.8), rgba(6, 182, 212, 0.8));
          }
          
          .bg-grid {
            background-image: 
              linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
            background-size: 40px 40px;
          }
        `}</style>
      </div>
    </RequireApiKey>
  );
}