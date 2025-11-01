// components/SharedConnectionClient.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PinAuthForm } from '@/components/PinAuthForm';
import ChatWidget from '@/components/ChatWidget';
import {
  Settings, Palette, MessageCircle, Bot, Eye, Lock, Upload, X, Sun, Moon, 
  Shield, Monitor, ChevronRight, ChevronLeft, User, RefreshCw, Trash2, ArrowLeft,
  Save, Check
} from 'lucide-react';
import { DeleteConversationModal } from '@/components/DeleteConversationModal';

interface SharedConnectionClientProps {
  connection: {
    _id: string;
    name: string;
    integrationType: string;
    aiBuildId: string;
    agentName: string | null;
    settings: any;
    sharePermissions: 'read-only' | 'editable';
    sharePinEnabled: boolean;
    shareToken: string;
  };
  shareToken: string;
}

// Types pour conversations
type ConversationSummary = {
  _id: string;
  conversationId: string;
  userId: string;
  lastMessage: string;
  lastMessageTime: number;
  messageCount: number;
  isUser: boolean;
  platform: string;
};

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isFiltered?: boolean;
};

type ConversationDetails = {
  _id: string;
  conversationId: string;
  userId: string;
  platform: string;
  agentName?: string;
  messages: ConversationMessage[];
  messageCount: number;
  totalMessages: number;
  firstMessageAt: string;
  lastMessageAt: string;
};

// CollapsibleSection Component
const CollapsibleSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }, 150);
    }
  };

  return (
    <div ref={sectionRef} className="border border-gray-700/50 rounded-xl bg-gray-800/30 backdrop-blur-sm overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full lg:px-4 lg:py-4 px-3 py-3 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
      >
        <div className="flex items-center lg:gap-3 gap-2">
          {icon}
          <span className="font-medium text-gray-200 lg:text-base text-sm">{title}</span>
        </div>
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
          <ChevronRight size={16} className="text-gray-400 lg:hidden" />
          <ChevronRight size={18} className="text-gray-400 hidden lg:block" />
        </div>
      </button>

      {isOpen && <div className="border-t border-gray-700/30" />}

      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="lg:px-4 lg:pb-4 lg:pt-4 px-3 pb-3 pt-3">
          {children}
        </div>
      </div>
    </div>
  );
};

// Fonction pour générer ID numérique
const getNumericId = (userId: string) => {
  const hash = userId.split('_').pop() || '';
  let numeric = '';
  for (let i = 0; i < Math.min(hash.length, 6); i++) {
    const char = hash[i];
    if (/[0-9]/.test(char)) {
      numeric += char;
    } else if (/[a-zA-Z]/.test(char)) {
      numeric += (char.toLowerCase().charCodeAt(0) - 96).toString().slice(-1);
    }
  }
  return numeric.substring(0, 6);
};

const SharedConnectionClient: React.FC<SharedConnectionClientProps> = ({
  connection,
  shareToken,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // États pour l'authentification PIN
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPinLoading, setIsPinLoading] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Onglet actif (depuis URL params)
  const activeTab = (searchParams.get('tab') as 'configuration' | 'conversations' | 'preview') || 'configuration';

  // États configuration
  const [name, setName] = useState(connection.name || '');
  const [settings, setSettings] = useState(connection.settings || {});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // États conversations
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetails | null>(null);
  const [conversationDetailsLoading, setConversationDetailsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // États responsive
  const [isMobileView, setIsMobileView] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isReadOnly = connection.sharePermissions === 'read-only';

  // Detect mobile
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

  // Vérifier session PIN
  useEffect(() => {
    const checkSession = async () => {
      if (!connection.sharePinEnabled) {
        setIsAuthenticated(true);
        setIsCheckingSession(false);
        return;
      }

      try {
        const response = await fetch(`/api/connections/shared/${shareToken}`);
        const data = await response.json();

        if (response.ok && !data.requiresPin) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [shareToken, connection.sharePinEnabled]);

  // Charger conversations quand onglet change
  useEffect(() => {
    if (activeTab === 'conversations' && isAuthenticated) {
      fetchConversations();
    }
  }, [activeTab, isAuthenticated]);

  // Vérifier PIN
  const handlePinSubmit = async (pin: string) => {
    setIsPinLoading(true);
    setPinError(null);

    try {
      const response = await fetch(`/api/connections/shared/${shareToken}/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinCode: pin }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAuthenticated(true);
      } else {
        if (data.code === 'RATE_LIMIT') {
          setPinError('Too many attempts. Please wait 1 minute and try again.');
        } else if (data.code === 'INVALID_PIN') {
          setPinError('Invalid PIN code. Please try again.');
        } else {
          setPinError(data.error || 'Authentication failed.');
        }
      }
    } catch (error) {
      setPinError('Network error. Please try again.');
    } finally {
      setIsPinLoading(false);
    }
  };

  // Changer d'onglet
  const setActiveTabFunc = (tab: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    router.push(url.pathname + url.search);
  };

  // Fetch conversations
  const fetchConversations = async () => {
    setConversationsLoading(true);
    try {
      const res = await fetch(`/api/connections/${connection._id}/conversations`);
      const data = await res.json();

      if (data.success) {
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setConversationsLoading(false);
    }
  };

  // Fetch conversation details
  const fetchConversationDetails = async (conversationId: string, loadMore = false, lastTimestamp?: number) => {
    if (!loadMore) {
      setConversationDetailsLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await fetch(`/api/connections/${connection._id}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, limit: 50, loadMore, lastTimestamp })
      });
      const data = await res.json();

      if (data.success) {
        if (loadMore && selectedConversation) {
          setSelectedConversation({
            ...selectedConversation,
            messages: [...data.conversation.messages, ...selectedConversation.messages]
          });
        } else {
          setSelectedConversation(data.conversation);
        }
        setHasMoreMessages(data.pagination.hasMore);
      }
    } catch (error) {
      console.error('Error fetching conversation details:', error);
    } finally {
      setConversationDetailsLoading(false);
      setLoadingMore(false);
    }
  };

  // Delete conversation (seulement si editable)
  const initiateDelete = (conversationId: string) => {
    if (isReadOnly) {
      alert('You do not have permission to delete conversations.');
      return;
    }
    setConversationToDelete(conversationId);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
      setConversationToDelete(null);
    }
  };

  const confirmDelete = async () => {
    if (!conversationToDelete || isReadOnly) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/connections/${connection._id}/conversations`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: conversationToDelete })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setConversations(prev => prev.filter(conv => conv.conversationId !== conversationToDelete));
        if (selectedConversation?.conversationId === conversationToDelete) {
          setSelectedConversation(null);
        }
        setShowDeleteModal(false);
        setConversationToDelete(null);
        setTimeout(() => fetchConversations(), 500);
      } else {
        alert(`Error: ${data.error || 'Unknown error'}`);
        fetchConversations();
      }
    } catch (error) {
      alert('Network error. Please try again.');
      fetchConversations();
    } finally {
      setIsDeleting(false);
    }
  };

  const loadMoreMessages = () => {
    if (selectedConversation && hasMoreMessages && !loadingMore && selectedConversation.messages.length > 0) {
      const oldestMessage = selectedConversation.messages[0];
      fetchConversationDetails(selectedConversation.conversationId, true, oldestMessage.timestamp);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'A few minutes ago';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  // Sauvegarder configuration
  const saveChanges = async () => {
    if (isReadOnly) {
      alert('You do not have permission to modify this connection.');
      return;
    }

    let validatedPopupMessage = settings.popupMessage || '';
    if (validatedPopupMessage.length > 55) {
      validatedPopupMessage = validatedPopupMessage.substring(0, 55);
      alert('⚠️ Popup message truncated to 55 characters maximum');
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/connections/${connection._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          settings: {
            ...settings,
            popupMessage: validatedPopupMessage,
            placement: 'bottom-right'
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      alert('Error saving. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = (key: string, value: any) => {
    if (isReadOnly) return;
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const colorPresets = [
    '#3b82f6', '#10b981', '#ef4444', '#f59e0b',
    '#06b6d4', '#8b5cf6', '#ec4899', '#6b7280'
  ];

  // Config pour ChatWidget
  const config = {
    _id: connection._id,
    name: name || 'AI Assistant',
    avatar: settings.avatar || '/Default Avatar.png',
    welcomeMessage: settings.welcomeMessage || 'Hello! How can I help you today?',
    placeholderText: settings.placeholderText || 'Type your message...',
    typingText: settings.typingText || 'AI is typing...',
    theme: settings.theme || 'light',
    primaryColor: settings.primaryColor || '#3b82f6',
    width: settings.width || 380,
    height: settings.height || 600,
    placement: 'bottom-right' as const,
    popupMessage: settings.popupMessage || 'Hi! Need any help?',
    popupDelay: settings.popupDelay || 2,
    showPopup: settings.showPopup !== undefined ? settings.showPopup : true,
    showWelcomeMessage: settings.showWelcomeMessage !== undefined ? settings.showWelcomeMessage : true,
    selectedAgent: connection.aiBuildId,
    chatTitle: settings.chatTitle || 'AI Assistant',
    subtitle: settings.subtitle || 'Online'
  };

  // Loading session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // PIN Form
  if (connection.sharePinEnabled && !isAuthenticated) {
    return (
      <PinAuthForm
        onSubmit={handlePinSubmit}
        isLoading={isPinLoading}
        error={pinError}
      />
    );
  }

  // MAIN INTERFACE
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 bg-grid-pattern">
      
      {/* Mobile Preview Widget */}
      {isMobileView && activeTab === 'preview' && connection.aiBuildId && (
        <ChatWidget config={config} isPreview={true} />
      )}

      {/* TOPBAR - Style ClientLayout */}
      <header className="h-16 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 flex items-center px-6 sticky top-0 z-20 shadow-lg">
        <div className="flex items-center gap-4 flex-1">
          {/* Badge Shared Access */}
          <div className="bg-cyan-500/20 border border-cyan-500/40 rounded-lg px-3 py-1.5 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Shield className="text-cyan-400" size={14} />
              <span className="text-xs font-medium text-cyan-300">
                Shared {isReadOnly && '• Read-only'}
              </span>
            </div>
          </div>

          {/* Vertical Bar */}
          <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 via-blue-400 to-cyan-600 rounded-full shadow-lg shadow-cyan-400/30"></div>

          {/* Title */}
          <div className="flex-1">
            <h1 className="lg:text-2xl text-xl font-bold text-white mb-0.5 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              {name || 'AI Assistant'}
            </h1>
            <p className="lg:text-sm text-xs text-gray-400 font-medium">
              {connection.agentName || 'No agent'} • {isReadOnly ? 'View only' : 'Full access'}
            </p>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex items-center gap-2">
          {/* Preview - Mobile only */}
          <button 
            onClick={() => setActiveTabFunc('preview')}
            className={`lg:hidden px-3 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${
              activeTab === 'preview' 
                ? 'bg-cyan-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Monitor size={16} />
            <span className="hidden sm:inline">Preview</span>
          </button>
          
          {/* Configuration */}
          <button 
            onClick={() => setActiveTabFunc('configuration')}
            className={`px-3 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${
              activeTab === 'configuration' 
                ? 'bg-cyan-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Settings size={16} />
            <span className="hidden sm:inline">Configuration</span>
          </button>
          
          {/* Conversations */}
          <button 
            onClick={() => setActiveTabFunc('conversations')}
            className={`px-3 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${
              activeTab === 'conversations' 
                ? 'bg-cyan-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <MessageCircle size={16} />
            <span className="hidden sm:inline">Conversations</span>
          </button>
        </div>
      </header>

      {/* LAYOUT PRINCIPAL */}
      <div className="flex lg:h-[calc(100vh-64px)] h-[calc(100vh-64px)] lg:flex-row flex-col">

        {/* Section Preview - Desktop always, Mobile when tab=preview */}
        <div className={`flex-1 bg-gray-900/95 backdrop-blur-xl ${activeTab === 'preview' ? 'block' : 'hidden lg:block'} relative bg-grid-pattern`}>
          
          {!connection.aiBuildId ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl flex items-center justify-center mb-8 shadow-2xl border border-gray-600/50">
                <MessageCircle className="w-16 h-16 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                Agent Required
              </h3>
              <p className="text-gray-400 max-w-md leading-relaxed">
                An AI agent must be connected to see the widget preview
              </p>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-grid opacity-5" />

              <div style={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: activeTab === 'conversations' ? 'none' : 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                color: 'rgba(255, 255, 255, 0.08)',
                fontSize: '20px',
                fontWeight: 500,
                pointerEvents: 'none',
                zIndex: 1
              }}>
                <Eye className="w-32 h-32 mb-3" />
                <span>Interactive Preview</span>
              </div>

              {(!isMobileView || activeTab !== 'preview') && (
                <div style={{ position: 'absolute', top: '0', left: 0, right: 0, bottom: 0 }}>
                  <ChatWidget config={config} isPreview={true} />
                </div>
              )}
            </>
          )}
        </div>

        {/* Section Configuration */}
        <div className={`lg:w-96 w-full ${activeTab === 'configuration' ? 'flex flex-col h-full' : 'hidden'} bg-gray-900/95 backdrop-blur-xl border-l border-gray-700/50 text-white`}>
          
          {/* Header Configuration Panel */}
          <div className="lg:p-6 p-3 border-b border-gray-700/50 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 flex-shrink-0">
            <div className="flex items-center lg:gap-3 gap-2 mb-2">
              <Settings className="text-cyan-400" size={24} />
              <div>
                <h2 className="lg:text-xl text-lg font-bold text-white">Configuration</h2>
                {isReadOnly ? (
                  <div className="flex items-center gap-1 mt-1">
                    <Lock size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-400">View only</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mt-1">
                    <Settings size={12} className="text-emerald-400" />
                    <span className="text-xs text-emerald-400">Full access</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-gray-400 lg:text-sm text-xs">
              {isReadOnly ? 'You have read-only access' : 'You have full access to modify this configuration'}
            </p>
          </div>

          {/* Configuration Sections - TOUTES LES SECTIONS */}
          <div className="flex-1 overflow-y-auto lg:p-6 p-3 lg:space-y-4 space-y-3 custom-scrollbar">

            {/* General Configuration */}
            <CollapsibleSection
              title="General Configuration"
              icon={<Settings className="text-cyan-400" size={20} />}
              defaultOpen={true}
            >
              <div className="lg:space-y-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 lg:mb-3 mb-2">Chat Title</label>
                  <input
                    type="text"
                    value={settings.chatTitle || ''}
                    onChange={(e) => updateSettings('chatTitle', e.target.value)}
                    disabled={isReadOnly}
                    placeholder="AI Assistant"
                    className="w-full lg:px-4 lg:py-3.5 px-3 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm lg:text-base text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Appearance */}
            <CollapsibleSection
              title="Appearance"
              icon={<Palette className="text-cyan-400" size={20} />}
              defaultOpen={false}
            >
              <div className="lg:space-y-6 space-y-4">
                
                {/* Primary Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 lg:mb-4 mb-3">Primary Color</label>
                  <div className="grid lg:grid-cols-4 grid-cols-4 lg:gap-3 gap-2 lg:mb-4 mb-3">
                    {colorPresets.map((color) => (
                      <button
                        key={color}
                        onClick={() => updateSettings('primaryColor', color)}
                        disabled={isReadOnly}
                        className={`w-full lg:h-12 h-10 rounded-xl border-2 transition-all hover:scale-105 relative ${
                          (settings.primaryColor || '#3b82f6') === color
                            ? 'border-white ring-2 ring-cyan-500/50 shadow-lg'
                            : 'border-gray-600/50 hover:border-gray-500/50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        style={{ backgroundColor: color }}
                      >
                        {(settings.primaryColor || '#3b82f6') === color && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-white rounded-full bg-white/20"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center lg:gap-3 gap-2">
                    <input
                      type="color"
                      value={settings.primaryColor || '#3b82f6'}
                      onChange={(e) => updateSettings('primaryColor', e.target.value)}
                      disabled={isReadOnly}
                      className="lg:w-12 lg:h-12 w-10 h-10 border border-gray-600/50 rounded-xl cursor-pointer bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <input
                      type="text"
                      value={settings.primaryColor || '#3b82f6'}
                      onChange={(e) => updateSettings('primaryColor', e.target.value)}
                      disabled={isReadOnly}
                      className="flex-1 lg:px-4 lg:py-3.5 px-3 py-3 lg:text-sm text-xs bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 lg:mb-3 mb-2">Interface Theme</label>
                  <div className="flex items-center lg:space-x-3 space-x-2">
                    <button
                      onClick={() => updateSettings('theme', 'light')}
                      disabled={isReadOnly}
                      className={`flex items-center lg:gap-2 gap-1 lg:px-4 lg:py-3.5 px-3 py-3 rounded-xl transition-all duration-300 backdrop-blur-sm lg:text-base text-sm ${
                        config.theme === 'light'
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border border-cyan-500/50 shadow-lg shadow-cyan-600/20'
                          : 'bg-gray-900/50 text-gray-300 hover:bg-gray-800/70 border border-gray-700/50 hover:border-gray-600/50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Sun className="lg:w-4 lg:h-4 w-3.5 h-3.5" />
                      Light
                    </button>
                    <button
                      onClick={() => updateSettings('theme', 'dark')}
                      disabled={isReadOnly}
                      className={`flex items-center lg:gap-2 gap-1 lg:px-4 lg:py-3.5 px-3 py-3 rounded-xl transition-all duration-300 backdrop-blur-sm lg:text-base text-sm ${
                        config.theme === 'dark'
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border border-cyan-500/50 shadow-lg shadow-cyan-600/20'
                          : 'bg-gray-900/50 text-gray-300 hover:bg-gray-800/70 border border-gray-700/50 hover:border-gray-600/50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Moon className="lg:w-4 lg:h-4 w-3.5 h-3.5" />
                      Dark
                    </button>
                  </div>
                </div>

                {/* Bot Avatar */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 lg:mb-3 mb-2">Bot Avatar</label>
                  {!settings.avatar || settings.avatar === '/Default Avatar.png' ? (
                    <div
                      className={`border-2 border-dashed border-gray-600/50 rounded-xl lg:p-8 p-6 text-center hover:border-cyan-400/50 transition-all bg-gray-900/30 backdrop-blur-sm group ${
                        isReadOnly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                      }`}
                      onDrop={(e) => {
                        if (isReadOnly) return;
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
                            alert('⚠️ Image too large (max 1MB)');
                          }
                        }
                      }}
                      onDragOver={(e) => !isReadOnly && e.preventDefault()}
                      onClick={() => {
                        if (isReadOnly) return;
                        const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
                        fileInput?.click();
                      }}
                    >
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        disabled={isReadOnly}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target?.files?.[0];
                          if (file && !isReadOnly) {
                            if (file.size <= 1024 * 1024) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                if (e.target?.result) {
                                  updateSettings('avatar', e.target.result);
                                }
                              };
                              reader.readAsDataURL(file);
                            } else {
                              alert('⚠️ Image too large (max 1MB)');
                            }
                          }
                        }}
                      />
                      <div className="text-gray-400 group-hover:text-gray-300 transition-colors">
                        <div className="mx-auto lg:w-16 lg:h-16 w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center lg:mb-4 mb-3 group-hover:bg-gray-600/50 transition-colors">
                          <Upload className="lg:w-8 lg:h-8 w-6 h-6" />
                        </div>
                        <p className="lg:text-sm text-xs font-medium">{isReadOnly ? 'Avatar Upload Disabled' : 'Upload Bot Avatar'}</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (max 1MB)</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative bg-gray-900/30 backdrop-blur-sm rounded-xl lg:p-4 p-3 border border-gray-700/30">
                      <div className="flex items-center lg:gap-4 gap-3">
                        <img
                          src={settings.avatar}
                          alt="Avatar"
                          className="lg:w-16 lg:h-16 w-12 h-12 rounded-full object-cover border-2 border-gray-600/50"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.src = '/Default Avatar.png';
                          }}
                        />
                        <div className="flex-1">
                          <p className="lg:text-sm text-xs font-medium text-white">✅ Custom avatar uploaded</p>
                          <p className="text-xs text-gray-400 mt-1">Ready to use in your widget</p>
                        </div>
                        {!isReadOnly && (
                          <button
                            onClick={() => updateSettings('avatar', '/Default Avatar.png')}
                            className="lg:w-8 lg:h-8 w-7 h-7 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg flex items-center justify-center transition-colors"
                            title="Remove avatar"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </CollapsibleSection>

            {/* Messages */}
            <CollapsibleSection
              title="Messages"
              icon={<MessageCircle className="text-cyan-400" size={20} />}
              defaultOpen={false}
            >
              <div className="lg:space-y-4 space-y-3">
                
                <div>
                  <div className="flex items-center justify-between lg:mb-3 mb-2">
                    <label className="text-sm font-medium text-gray-300">Show welcome message</label>
                    <input
                      type="checkbox"
                      checked={settings.showWelcomeMessage !== undefined ? settings.showWelcomeMessage : true}
                      onChange={(e) => updateSettings('showWelcomeMessage', e.target.checked)}
                      disabled={isReadOnly}
                      className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <input
                    type="text"
                    value={settings.welcomeMessage || ''}
                    onChange={(e) => updateSettings('welcomeMessage', e.target.value)}
                    disabled={isReadOnly}
                    placeholder="Hello! How can I help you today?"
                    className="w-full lg:px-4 lg:py-3.5 px-3 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm lg:text-base text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 lg:mb-3 mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={settings.subtitle || ''}
                    onChange={(e) => updateSettings('subtitle', e.target.value)}
                    disabled={isReadOnly}
                    placeholder="Online"
                    className="w-full lg:px-4 lg:py-3.5 px-3 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm lg:text-base text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 lg:mb-3 mb-2">Placeholder Text</label>
                  <input
                    type="text"
                    value={settings.placeholderText || ''}
                    onChange={(e) => updateSettings('placeholderText', e.target.value)}
                    disabled={isReadOnly}
                    placeholder="Type your message..."
                    className="w-full lg:px-4 lg:py-3.5 px-3 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm lg:text-base text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

              </div>
            </CollapsibleSection>

            {/* Client Message */}
            <CollapsibleSection
              title="Client Message"
              icon={<Bot className="text-cyan-400" size={20} />}
              defaultOpen={false}
            >
              <div className="lg:space-y-4 space-y-3">
                <div className="flex items-center justify-between lg:mb-3 mb-2">
                  <label className="text-sm font-medium text-gray-300">Enable popup</label>
                  <input
                    type="checkbox"
                    checked={settings.showPopup !== undefined ? settings.showPopup : true}
                    onChange={(e) => updateSettings('showPopup', e.target.checked)}
                    disabled={isReadOnly}
                    className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={settings.popupMessage || ''}
                    onChange={(e) => {
                      if (e.target.value.length <= 55) {
                        updateSettings('popupMessage', e.target.value);
                      }
                    }}
                    disabled={isReadOnly}
                    placeholder="Hi! Need help?"
                    maxLength={55}
                    className="w-full lg:px-4 lg:py-3.5 px-3 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm lg:text-base text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="absolute right-3 bottom-2 text-xs text-gray-500 pointer-events-none">
                    {(settings.popupMessage || '').length}/55
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${
                    (settings.popupMessage || '').length <= 40
                      ? 'bg-green-400'
                      : (settings.popupMessage || '').length <= 50
                        ? 'bg-yellow-400'
                        : 'bg-red-400'
                  }`} />
                  <span className="text-gray-400">
                    {(settings.popupMessage || '').length <= 40
                      ? 'Perfect length'
                      : (settings.popupMessage || '').length <= 50
                        ? 'Good length'
                        : 'Max reached'
                    }
                  </span>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-2">Delay (seconds)</label>
                  <input
                    type="number"
                    value={settings.popupDelay || 2}
                    onChange={(e) => updateSettings('popupDelay', parseInt(e.target.value) || 2)}
                    disabled={isReadOnly}
                    min="0"
                    max="30"
                    className="lg:w-32 w-24 lg:px-4 lg:py-3.5 px-3 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium backdrop-blur-sm lg:text-base text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Save Configuration Button - Seulement si editable */}
            {!isReadOnly && (
              <div className="border border-gray-700/50 rounded-xl bg-gray-800/30 backdrop-blur-sm overflow-hidden">
                <div className="lg:p-4 p-3">
                  <button
                    onClick={saveChanges}
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-emerald-700 disabled:to-emerald-600 text-white lg:py-4 py-3.5 lg:px-6 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center lg:gap-3 gap-2 shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] disabled:scale-100 disabled:opacity-75 border border-emerald-500/30 relative overflow-hidden group lg:text-base text-sm"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full lg:h-5 lg:w-5 h-4 w-4 border-b-2 border-white relative z-10"></div>
                        <span className="relative z-10">Saving...</span>
                      </>
                    ) : saveSuccess ? (
                      <>
                        <div className="lg:w-5 lg:h-5 w-4 h-4 bg-white rounded-full flex items-center justify-center relative z-10">
                          <svg className="lg:w-3 lg:h-3 w-2.5 h-2.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="relative z-10">Saved!</span>
                      </>
                    ) : (
                      <>
                        <Save className="lg:w-5 lg:h-5 w-4 h-4 relative z-10" />
                        <span className="relative z-10">Save Configuration</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Access notice */}
            {isReadOnly ? (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Lock className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
                  <div className="text-sm text-blue-200">
                    <strong className="font-semibold">Read-only Access:</strong>
                    <p className="mt-1 text-blue-300/90">
                      You can view this configuration but cannot make changes.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Settings className="text-emerald-400 flex-shrink-0 mt-0.5" size={18} />
                  <div className="text-sm text-emerald-200">
                    <strong className="font-semibold">Full Access:</strong>
                    <p className="mt-1 text-emerald-300/90">
                      You have full access to modify and save this configuration.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ONGLET CONVERSATIONS */}
        {activeTab === 'conversations' && (
          <div className="w-full">

            {/* Mobile: Navigation liste ↔ détail */}
            <div className="lg:hidden h-full">
              {selectedConversation ? (
                <div className="flex flex-col h-full">
                  <div className="p-3 border-b border-gray-800 flex items-center gap-3 bg-gray-900/30">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-sm">Customer #{getNumericId(selectedConversation.userId)}</h3>
                      <p className="text-gray-400 text-xs">{selectedConversation.totalMessages} messages • {selectedConversation.platform}</p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col overflow-hidden">
                    {hasMoreMessages && (
                      <div className="p-3 border-b border-gray-800/50">
                        <button
                          onClick={loadMoreMessages}
                          disabled={loadingMore}
                          className="w-full py-2 px-4 bg-gray-800/50 hover:bg-gray-700/50 disabled:opacity-50 rounded-lg text-gray-300 transition-all text-sm"
                        >
                          {loadingMore ? 'Loading...' : 'Load older messages'}
                        </button>
                      </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                      {conversationDetailsLoading ? (
                        <div className="text-center text-gray-400 py-8">
                          <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                          Loading messages...
                        </div>
                      ) : (
                        selectedConversation.messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                          >
                            <div className={`max-w-xs px-3 py-2 rounded-xl ${
                              message.role === 'user'
                                ? 'bg-gray-800/50 text-white'
                                : 'bg-cyan-600/20 text-cyan-200 border border-cyan-500/30'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs mt-1 opacity-70">
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full overflow-y-auto">
                  <div className="p-3 border-b border-gray-800 flex items-center justify-between bg-gray-900/30">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-cyan-600/20 border border-cyan-500/40 rounded-lg flex items-center justify-center">
                        <MessageCircle className="text-cyan-400" size={12} />
                      </div>
                      <div>
                        <h2 className="font-bold text-white text-sm">Conversations</h2>
                        <p className="text-gray-400 text-xs">{conversations.length} total</p>
                      </div>
                    </div>
                    <button
                      onClick={fetchConversations}
                      disabled={conversationsLoading}
                      className="w-6 h-6 bg-cyan-600/20 hover:bg-cyan-600/30 disabled:opacity-50 rounded-lg flex items-center justify-center text-cyan-400 transition-all"
                    >
                      <RefreshCw size={12} className={conversationsLoading ? 'animate-spin' : ''} />
                    </button>
                  </div>

                  {conversationsLoading ? (
                    <div className="p-6 text-center text-gray-400">
                      <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      Loading conversations...
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="w-12 h-12 bg-gray-800/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-6 h-6 text-gray-400" />
                      </div>
                      <h3 className="font-bold text-white mb-2 text-sm">No conversations yet</h3>
                      <p className="text-gray-400 text-xs">
                        Conversations will appear here once users start chatting with your widget.
                      </p>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <div
                        key={conv._id}
                        onClick={() => fetchConversationDetails(conv.conversationId)}
                        className="p-3 border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-700/50 rounded-full flex items-center justify-center group-hover:bg-gray-600/50 transition-all">
                            <User className="text-gray-400 group-hover:text-gray-300" size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-white text-xs truncate">
                                Customer #{getNumericId(conv.userId)}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {formatTime(conv.lastMessageTime)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs text-gray-500">{conv.messageCount} messages</span>
                            </div>
                          </div>
                          {!isReadOnly && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                initiateDelete(conv.conversationId);
                              }}
                              className="w-6 h-6 bg-red-600/20 hover:bg-red-600/30 rounded flex items-center justify-center text-red-400 transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Desktop: Layout 2 colonnes */}
            <div className="hidden lg:flex h-full">
              <>
                {/* Colonne gauche - Liste */}
                <div className="w-96 border-r border-gray-800 bg-gray-950 flex flex-col">
                  <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-cyan-600/20 border border-cyan-500/40 rounded-lg flex items-center justify-center">
                        <MessageCircle className="text-cyan-400" size={16} />
                      </div>
                      <div>
                        <h2 className="font-bold text-white">Conversations</h2>
                        <p className="text-gray-400 text-xs">{conversations.length} total</p>
                      </div>
                    </div>
                    <button
                      onClick={fetchConversations}
                      disabled={conversationsLoading}
                      className="w-8 h-8 bg-cyan-600/20 hover:bg-cyan-600/30 disabled:opacity-50 rounded-lg flex items-center justify-center text-cyan-400 transition-all"
                    >
                      <RefreshCw size={14} className={conversationsLoading ? 'animate-spin' : ''} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {conversationsLoading ? (
                      <div className="p-8 text-center text-gray-400">
                        <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        Loading conversations...
                      </div>
                    ) : conversations.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-12 h-12 bg-gray-800/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <MessageCircle className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="font-bold text-white mb-2">No conversations yet</h3>
                        <p className="text-gray-400 text-sm">
                          Conversations will appear here once users start chatting with your widget.
                        </p>
                      </div>
                    ) : (
                      conversations.map((conv) => (
                        <div
                          key={conv._id}
                          onClick={() => fetchConversationDetails(conv.conversationId)}
                          className={`p-4 border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer transition-all group ${
                            selectedConversation?.conversationId === conv.conversationId
                              ? 'bg-cyan-900/20 border-cyan-500/30'
                              : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center group-hover:bg-gray-600/50 transition-all">
                              <User className="text-gray-400 group-hover:text-gray-300" size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-white text-sm truncate">
                                  Customer #{getNumericId(conv.userId)}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  {formatTime(conv.lastMessageTime)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs text-gray-500">{conv.messageCount} messages</span>
                                <span className="text-xs text-gray-600">•</span>
                                <span className="text-xs text-gray-500">{conv.platform}</span>
                              </div>
                            </div>
                            {!isReadOnly && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  initiateDelete(conv.conversationId);
                                }}
                                className="opacity-0 group-hover:opacity-100 w-6 h-6 bg-red-600/20 hover:bg-red-600/30 rounded flex items-center justify-center text-red-400 transition-all"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Colonne droite - Détails */}
                <div className="flex-1 flex flex-col bg-gray-950">
                  {selectedConversation ? (
                    <>
                      <div className="p-4 border-b border-gray-800 bg-gray-900/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center">
                            <User className="text-gray-300" size={18} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white">Customer #{getNumericId(selectedConversation.userId)}</h3>
                            <p className="text-gray-400 text-sm">{selectedConversation.totalMessages} messages • {selectedConversation.platform}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => fetchConversationDetails(selectedConversation.conversationId)}
                            className="w-8 h-8 bg-cyan-600/20 hover:bg-cyan-600/30 rounded-lg flex items-center justify-center text-cyan-400 transition-all"
                          >
                            <RefreshCw size={14} />
                          </button>
                          {!isReadOnly && (
                            <button
                              onClick={() => initiateDelete(selectedConversation.conversationId)}
                              className="w-8 h-8 bg-red-600/20 hover:bg-red-600/30 rounded-lg flex items-center justify-center text-red-400 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col overflow-hidden">
                        {hasMoreMessages && (
                          <div className="p-3 border-b border-gray-800/50">
                            <button
                              onClick={loadMoreMessages}
                              disabled={loadingMore}
                              className="w-full py-2 px-4 bg-gray-800/50 hover:bg-gray-700/50 disabled:opacity-50 rounded-lg text-gray-300 transition-all text-sm"
                            >
                              {loadingMore ? 'Loading...' : 'Load older messages'}
                            </button>
                          </div>
                        )}

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                          {conversationDetailsLoading ? (
                            <div className="text-center text-gray-400 py-8">
                              <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                              Loading messages...
                            </div>
                          ) : (
                            selectedConversation.messages.map((message, index) => (
                              <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                              >
                                <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-xl ${
                                  message.role === 'user'
                                    ? 'bg-gray-800/50 text-white'
                                    : 'bg-cyan-600/20 text-cyan-200 border border-cyan-500/30'
                                }`}>
                                  <p className="text-sm">{message.content}</p>
                                  <p className="text-xs mt-1 opacity-70">
                                    {formatTime(message.timestamp)}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <MessageCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Select a conversation</h3>
                        <p className="text-gray-400">
                          Choose a conversation from the list to view the chat history.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteConversationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This action cannot be undone."
      />

      <style jsx>{`
        .bg-grid {
          background-image: 
            linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  );
};

export default SharedConnectionClient;