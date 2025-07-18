'use client';

import { useState, useEffect, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Moon, Sun, Bot, User, Info, X, Upload, Send, Settings, MessageCircle, RotateCcw, Globe, Smartphone } from "lucide-react";
import { cn } from '@/lib/utils';
import CreateDemoModal from '@/components/CreateDemoModal';
import InfoDemoModal from '@/components/InfoDemoModal';
import { DeleteDemoModal } from '@/components/DeleteDemoModal';
import RequireApiKey from "@/components/RequireApiKey"; // Import ajouté

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
                    src={config.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSI2IiB5PSI2IiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMCAyQzEwLjkgMiAxMS43IDIuOSAxMS43IDRDMTEuNyA1LjEgMTAuOSA2IDEwIDZDOS4xIDYgOC4zIDUuMSA4LjMgNEM4LjMgMi45IDkuMSAyIDEwIDJaTTE3LjUgN1YxOEMxNS44IDE4IDE0LjIgMTcuMyAxMy4zIDE2LjFDMTMuNCAxNi42IDEzLjMgMTYuNiAxMy4zIDE2LjdDMTMuMyAxNy41IDEyLjYgMTguMyAxMS43IDE4LjNIOC4zQzcuNSAxOC4zIDYuNyAxNy41IDYuNyAxNi43VjExLjdIOC4zVjguM0wxMCA3LjVMMTEuNyA3LjVMMTMuMyA4LjNWMTEuN0gxNVY4LjNMMTYuNyA3LjVIMTcuNSIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo='}
                    alt="Bot"
                    className="w-8 h-8 rounded-full self-start mr-2"
                    style={{ flexShrink: 0 }}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSI2IiB5PSI2IiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMCAyQzEwLjkgMiAxMS43IDIuOSAxMS43IDRDMTEuNyA1LjEgMTAuOSA2IDEwIDZDOS4xIDYgOC4zIDUuMSA4LjMgNEM4LjMgMi45IDkuMSAyIDEwIDJaTTE3LjUgN1YxOEMxNS4IDE4IDE0LjIgMTcuMyAxMy4zIDE2LjFDMTMuNCAxNi42IDEzLjMgMTYuNiAxMy4zIDE2LjdDMTMuMyAxNy41IDEyLjYgMTguMyAxMS43IDE4LjNIOC4zQzcuNSAxOC4zIDYuNyAxNy41IDYuNyAxNi43VjExLjdIOC4zVjguM0wxMCA3LjVMMTEuNyA3LjVMMTMuMyA4LjNWMTEuN0gxNVY4LjNMMTYuNyA3LjVIMTcuNSIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo=';
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
                  src={config.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSI2IiB5PSI2IiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMCAyQzEwLjkgMiAxMS43IDIuOSAxMS43IDRDMTEuNyA1LjEgMTAuOSA2IDEwIDZDOS4xIDYgOC4zIDUuMSA4LjMgNEM4LjMgMi45IDkuMSAyIDEwIDJaTTE3LjUgN1YxOEMxNS44IDE4IDE0LjIgMTcuMyAxMy4zIDE2LjFDMTMuNCAxNi42IDEzLjMgMTYuNiAxMy4zIDE2LjdDMTMuMyAxNy41IDEyLjYgMTguMyAxMS43IDE4LjNIOC4zQzcuNSAxOC4zIDYuNyAxNy41IDYuNyAxNi43VjExLjdIOC4zVjguM0wxMCA3LjVMMTEuNyA3LjVMMTMuMyA4LjNWMTEuN0gxNVY4LjNMMTYuNyA3LjVIMTcuNSIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo='}
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

export default function DemoAgentPage() {
  // Configuration states
  const [config, setConfig] = useState<DemoConfig>({
    name: 'AI Assistant Demo',
    agentId: '',
    avatar: '',
    welcomeMessage: 'Hello! How can I help you today?',
    placeholderText: 'Type your message...',
    theme: 'dark',
    primaryColor: '#007bff',
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
    '#007bff', '#28a745', '#dc3545', '#ffc107',
    '#17a2b8', '#6f42c1', '#e83e8c', '#6c757d'
  ];

  const appliedColor = customColor || config.primaryColor;
  const selectedAgent = agents.find(a => a._id === config.agentId);

  return (
    <RequireApiKey>
      <div className="min-h-screen bg-transparent">
        <div className="flex justify-center min-h-screen py-6">
          <div className="w-full max-w-7xl mx-auto px-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-white">
                {config.name}
              </h1>
              <p className="text-sm text-gray-400">
                Demo Agent Builder
              </p>
            </div>

            <div style={{ display: 'flex', height: 'calc(100vh - 180px)', gap: '24px' }}>
              {/* Preview Panel - Left */}
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
                  <span>Demo Preview</span>
                </div>

                {/* Chat Widget Preview */}
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
              </div>

              {/* Configuration Panel - Right */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl text-white overflow-hidden max-h-[90vh] overflow-y-auto" style={{ width: '400px', display: 'flex', flexDirection: 'column' }}>

                {/* Configuration Section */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                  {/* General Configuration */}
                  <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Settings className="text-blue-400" size={20} />
                      <h3 className="text-lg font-semibold text-blue-200">General Configuration</h3>
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
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Choose Build
                        </label>
                        <select
                          value={config.agentId}
                          onChange={(e) => updateConfig('agentId', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150"
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

                  {/* Bot Avatar Section */}
                  <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <User className="text-blue-400" size={20} />
                      <h3 className="text-lg font-semibold text-blue-200">Bot Avatar</h3>
                    </div>

                    {!config.avatar ? (
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
                        <div className="text-gray-400">
                          <div className="mx-auto w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V22H15L13.5 7.5C13.1 7.1 12.6 6.9 12 6.9S10.9 7.1 10.5 7.5L9 22H3V9L8 5H16L21 9Z" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-gray-300">Bot avatar</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (max 1MB)</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="p-6 border border-gray-500 rounded-lg bg-gray-600/30">
                          <div className="flex items-center justify-center">
                            <img
                              src={config.avatar}
                              alt="Avatar"
                              className="w-20 h-20 rounded-full object-cover border-2 border-gray-400"
                            />
                          </div>
                          <p className="text-xs text-gray-400 text-center mt-3">
                            ✅ Avatar uploaded successfully
                          </p>
                        </div>
                        <button
                          onClick={() => updateConfig('avatar', '')}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                          title="Remove avatar"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Chat Configuration */}
                  <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <MessageCircle className="text-blue-400" size={20} />
                      <h3 className="text-lg font-semibold text-blue-200">Chat Configuration</h3>
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
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
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
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
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
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Welcome Message */}
                  <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Bot className="text-blue-400" size={20} />
                      <h3 className="text-lg font-semibold text-blue-200">Welcome Message</h3>
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
                            className="w-4 h-4 text-orange-600 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                          />
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={config.welcomeMessage}
                          onChange={(e) => updateConfig('welcomeMessage', e.target.value)}
                          placeholder="Hello! How can I help you today?"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Popup Configuration */}
                  <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <MessageCircle className="text-blue-400" size={20} />
                      <h3 className="text-lg font-semibold text-blue-200">Popup Message</h3>
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
                            className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
                          />
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={config.popupMessage}
                          onChange={(e) => updateConfig('popupMessage', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
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
                          className="w-24 px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Theme & Colors */}
                  <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Globe className="text-blue-400" size={20} />
                      <h3 className="text-lg font-semibold text-blue-200">Theme & Colors</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Theme
                        </label>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateConfig('theme', 'light')}
                            className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${config.theme === 'light'
                              ? 'bg-indigo-600 text-white border border-indigo-400'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                              }`}
                          >
                            <Sun className="w-4 h-4" />
                            Light
                          </button>
                          <button
                            onClick={() => updateConfig('theme', 'dark')}
                            className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${config.theme === 'dark'
                              ? 'bg-indigo-600 text-white border border-indigo-400'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
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
                              className={`w-12 h-10 rounded-lg border-2 transition-transform hover:scale-105 ${config.primaryColor === color
                                ? 'border-white ring-2 ring-indigo-500'
                                : 'border-gray-500'
                                }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={config.primaryColor}
                            onChange={(e) => updateConfig('primaryColor', e.target.value)}
                            className="w-10 h-10 border border-gray-600 rounded-lg cursor-pointer bg-gray-800"
                          />
                          <input
                            type="text"
                            value={config.primaryColor}
                            onChange={(e) => updateConfig('primaryColor', e.target.value)}
                            className="flex-1 px-4 py-3 text-sm bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
                            placeholder="#007bff"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Create Demo Button */}
                  <div className="pt-4">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      disabled={!config.agentId}
                      className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-green-700 disabled:opacity-75 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                    >
                      <Settings className="w-5 h-5" />
                      Create Demo
                    </button>
                  </div>

                  {/* Demo Information */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Info className="text-blue-400" size={20} />
                      <h3 className="text-lg font-semibold text-blue-200">Demo Information</h3>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-300">
                        <span>Agent:</span>
                        <span className="text-white font-medium">{selectedAgent?.name || 'None selected'}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Theme:</span>
                        <span className="text-white capitalize">{config.theme === 'light' ? 'Light' : 'Dark'}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Primary Color:</span>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border border-gray-600"
                            style={{ backgroundColor: config.primaryColor }}
                          />
                          <span className="text-white text-xs font-mono">{config.primaryColor}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Popup message:</span>
                        <span className="text-white">{config.showPopup ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Welcome message:</span>
                        <span className="text-white">{config.showWelcomeMessage ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Your Demos Section */}
                <div className="border-t border-gray-700 bg-gray-800/50 p-4 h-48">
                  <div className="flex items-center gap-3 mb-3">
                    <Settings className="text-gray-400" size={18} />
                    <h3 className="text-sm font-semibold text-white">Your Demos</h3>
                  </div>

                  <div className="h-32 overflow-y-auto pr-1">
                    {userDemos.length === 0 ? (
                      <p className="text-xs text-gray-400 italic text-center py-4">No demos created yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {userDemos.map((demo) => (
                          <li key={demo._id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
                            <div className="flex justify-between items-center">
                              <span className="truncate text-gray-300 text-sm">{demo.name}</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openInfoModal(demo._id)}
                                  title="Info"
                                  className="hover:bg-gray-700 p-1 rounded"
                                >
                                  <Info className="w-4 h-4 text-blue-400 hover:text-blue-300" />
                                </button>
                                <button
                                  onClick={() => openDeleteDemoModal(demo._id, demo.name)}
                                  title="Delete"
                                  className="hover:bg-gray-700 p-1 rounded"
                                >
                                  <X className="w-4 h-4 text-red-500 hover:text-red-400" />
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
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

        {/* Modal de suppression de démo */}
        <DeleteDemoModal
          isOpen={deleteDemoModal.isOpen}
          onClose={closeDeleteDemoModal}
          onConfirm={handleDelete}
          demoName={deleteDemoModal.demoName}
          isDeleting={isDeletingDemo}
        />
      </div>
    </RequireApiKey>
  );
}