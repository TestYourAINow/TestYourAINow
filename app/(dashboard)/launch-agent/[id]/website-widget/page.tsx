'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  Send, X, MessageCircle, Settings, Globe, Smartphone, Plus, RotateCcw, User, Bot, Info,
  Monitor, Upload, Palette, Save, ExternalLink, Code, Sparkles, Moon, Sun, ChevronRight, ChevronLeft
} from 'lucide-react';
import { DeploymentModal, DeployButton } from '@/components/DeploymentModal';
import ChatWidget from '@/components/ChatWidget';

// Types - LOGIQUE IDENTIQUE
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

// CollapsibleSection Component - Mobile optimized
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

      {isOpen && (
        <div className="border-t border-gray-700/30" />
      )}

      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="lg:px-4 lg:pb-4 lg:pt-4 px-3 pb-3 pt-3">
          {children}
        </div>
      </div>
    </div>
  );
};

// COMPOSANT PRINCIPAL
const ChatbotBuilder: React.FC = () => {
  const { id } = useParams();
  const connectionId = id as string;

  // Mobile responsive state
  const [mobileView, setMobileView] = useState<'preview' | 'config'>('preview');
  const [configPanelCollapsed, setConfigPanelCollapsed] = useState(false);

  // TOUS LES ÉTATS EXISTANTS
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

  // Configuration pour le ChatWidget
  const config: ChatbotConfig = {
    name: name || 'AI Assistant',
    avatar: settings.avatar || '/Default Avatar.png',
    welcomeMessage: settings.welcomeMessage || 'Hello! How can I help you today?',
    placeholderText: settings.placeholderText || 'Type your message...',
    typingText: settings.typingText || 'AI is typing...',
    theme: settings.theme || 'light',
    primaryColor: settings.primaryColor || '#3b82f6',
    width: settings.width || 380,
    height: settings.height || 600,
    placement: 'bottom-right',
    popupMessage: settings.popupMessage || 'Hi! Need any help?',
    popupDelay: settings.popupDelay || 2,
    showPopup: settings.showPopup !== undefined ? settings.showPopup : true,
    showWelcomeMessage: settings.showWelcomeMessage !== undefined ? settings.showWelcomeMessage : true,
    selectedAgent: selectedAgent,
    chatTitle: settings.chatTitle || 'AI Assistant',
    subtitle: settings.subtitle || 'Online'
  };

  const widgetConfig = {
    ...config,
    _id: savedWidgetId || connectionId || 'preview'
  };

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
        console.error('Connection loading error:', err);
        setError('Error loading connection');
      } finally {
        setIsLoading(false);
      }
    };
    if (connectionId) fetchConnection();
  }, [connectionId]);

  useEffect(() => {
    if (connection) {
      setName(connection.name || '');
      setSelectedAgent(connection.aiBuildId || '');
      setSettings(connection.settings || {});
    }
  }, [connection]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch('/api/agents');
        const data = await res.json();
        setAgents(data.agents || []);
      } catch (error) {
        console.error('Error loading agents:', error);
        setAgents([]);
      }
    };
    fetchAgents();
  }, []);

  const colorPresets = [
    '#3b82f6', '#10b981', '#ef4444', '#f59e0b',
    '#06b6d4', '#8b5cf6', '#ec4899', '#6b7280'
  ];

  const [saveToastTimer, setSaveToastTimer] = useState<NodeJS.Timeout | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    return () => {
      if (saveToastTimer) {
        clearTimeout(saveToastTimer);
      }
    };
  }, [saveToastTimer]);

  const toggleConfigPanel = () => {
    setConfigPanelCollapsed(!configPanelCollapsed);
  };

  const saveChanges = async () => {
    if (!connectionId) return;

  // 🎯 VALIDATION POPUP MESSAGE - 55 CHARS
  let validatedPopupMessage = settings.popupMessage || '';
  if (validatedPopupMessage.length > 55) {
    validatedPopupMessage = validatedPopupMessage.substring(0, 55);
    alert('⚠️ Popup message truncated to 55 characters maximum');
  }

    if (saveToastTimer) {
      clearTimeout(saveToastTimer);
    }

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
          settings: {
            ...settings,
            popupMessage: validatedPopupMessage,
            placement: 'bottom-right'
          }
        })
      });

      if (!connectionResponse.ok) {
        const errorData = await connectionResponse.json();
        throw new Error(errorData.error || 'Error saving connection');
      }

      const chatbotConfigResponse = await fetch('/api/chatbot-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name || 'AI Assistant',
          avatar: settings.avatar || '/Default Avatar.png',
          welcomeMessage: settings.welcomeMessage || 'Hello! How can I help you today?',
          placeholderText: settings.placeholderText || 'Type your message...',
          typingText: settings.typingText || 'AI is typing...',
          theme: settings.theme || 'light',
          primaryColor: settings.primaryColor || '#3b82f6',
          width: settings.width || 380,
          height: settings.height || 600,
          placement: 'bottom-right',
          popupMessage: settings.popupMessage || 'Hi! Need any help?',
          popupDelay: settings.popupDelay || 2,
          showPopup: settings.showPopup !== undefined ? settings.showPopup : true,
          showWelcomeMessage: settings.showWelcomeMessage !== undefined ? settings.showWelcomeMessage : true,
          selectedAgent: selectedAgent,
          chatTitle: settings.chatTitle || 'AI Assistant',
          subtitle: settings.subtitle || 'Online'
        })
      });

      if (chatbotConfigResponse.ok) {
        const chatbotResult = await chatbotConfigResponse.json();
        if (chatbotResult.success && chatbotResult.widgetId) {
          setSavedWidgetId(chatbotResult.widgetId);
        }
      }

      setLastSaved(new Date());
      setSaveSuccess(true);

      const timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      setSaveToastTimer(timer);

    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const updateName = (newName: string) => {
    setName(newName);
  };

  const updateSettings = (key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-white text-lg">Loading configuration...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-red-400 text-lg">Error loading: {error}</div>
      </div>
    );
  }

  const selectedAgentName = agents.find(a => a._id === selectedAgent)?.name;

  return (
    <div className="h-[calc(100vh-64px)] bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 bg-grid-pattern">

      {/* Mobile Navigation Tabs */}
      <div className="lg:hidden bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 flex sticky top-0 z-50 h-12">
        <button
          onClick={() => setMobileView('preview')}
          className={`flex-1 px-3 py-3 text-sm font-medium transition-all duration-200 ${mobileView === 'preview'
            ? 'text-white bg-blue-600/20 border-b-2 border-blue-500'
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Monitor size={16} />
            <span>Preview</span>
          </div>
        </button>
        <button
          onClick={() => setMobileView('config')}
          className={`flex-1 px-3 py-3 text-sm font-medium transition-all duration-200 ${mobileView === 'config'
            ? 'text-white bg-blue-600/20 border-b-2 border-blue-500'
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Settings size={16} />
            <span>Settings</span>
          </div>
        </button>
      </div>

      {/* Structure principale */}
      <div className="flex lg:h-full h-[calc(100%-48px)] lg:flex-row flex-col">

        {/* COLONNE GAUCHE - Preview */}
        <div className={`flex-1 bg-gray-900/95 backdrop-blur-xl lg:border-r border-gray-700/50 relative bg-grid-pattern lg:h-full h-full ${mobileView === 'preview' ? 'block' : 'hidden lg:block'
          }`}>

          {/* Device Frame - Desktop only */}
          <div className="absolute top-4 left-4 bg-gray-800/50 backdrop-blur-sm rounded-xl px-3 py-2 items-center gap-3 border border-gray-700/50 z-10 hidden lg:flex">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <div className="w-px h-4 bg-gray-600" />
            <Monitor size={16} className="text-gray-400" />
            <span className="text-xs text-gray-400 font-medium">Live Preview</span>
          </div>

          {/* Agent Status */}
          <div className="absolute lg:top-4 lg:right-4 top-4 right-4 z-10">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1 lg:block hidden">Connected Agent</div>
              <div className="flex items-center gap-2 justify-end">
                {selectedAgent && <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>}
                <span className="lg:text-lg text-sm font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {selectedAgentName || 'No agent'}
                </span>
              </div>
            </div>
          </div>

          {!selectedAgent ? (
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
              <div className="mt-8 flex items-center gap-2 text-blue-400">
                <span className="text-2xl">👉</span>
                <span className="font-medium">Configure widget settings</span>
              </div>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-grid opacity-5" />

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

              <ChatWidget config={widgetConfig} isPreview={true} />
            </>
          )}
        </div>

        {/* COLONNE DROITE - Configuration */}
        <div className={`lg:bg-gray-900/95 lg:backdrop-blur-xl lg:border lg:border-gray-700/50 text-white lg:flex lg:flex-col lg:h-full lg:transition-all lg:duration-300 lg:ease-out ${configPanelCollapsed ? 'lg:w-16' : 'lg:w-96'
          } ${mobileView === 'config' ? 'w-full bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 flex flex-col h-full' : 'hidden lg:flex'
          }`}>

          {/* Header Configuration Panel */}
          <div className="lg:p-6 p-3 border-b border-gray-700/50 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 flex-shrink-0">
            <div className="flex items-center gap-2 lg:gap-3 mb-1 lg:mb-2">
              <Settings className="text-blue-400 hidden lg:block" size={24} />
              <Settings className="text-blue-400 block lg:hidden" size={18} />
              <div className={`transition-all duration-300 ease-out overflow-hidden ${configPanelCollapsed ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto lg:opacity-100'
                } w-auto opacity-100`}>
                <h2 className="lg:text-xl text-base font-bold text-white whitespace-nowrap">Configuration</h2>
              </div>
            </div>
            <div className={`transition-all duration-300 ease-out overflow-hidden ${configPanelCollapsed ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto lg:opacity-100'
              } w-auto opacity-100`}>
              <p className="text-gray-400 lg:text-sm text-xs whitespace-nowrap">Customize your widget</p>
            </div>
          </div>

          {/* Configuration Sections */}
          {!configPanelCollapsed && (
            <div className="flex-1 overflow-y-auto lg:p-6 p-3 lg:space-y-4 space-y-3 custom-scrollbar">

              <CollapsibleSection
                title="General Configuration"
                icon={<Settings className="text-blue-400" size={20} />}
                defaultOpen={true}
              >
                <div className="lg:space-y-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 lg:mb-3 mb-2">
                      Widget Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => updateName(e.target.value)}
                      placeholder="My AI Assistant"
                      className="w-full lg:px-4 lg:py-3.5 px-3 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm lg:text-base text-sm"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Appearance"
                icon={<Palette className="text-blue-400" size={20} />}
                defaultOpen={false}
              >
                <div className="lg:space-y-6 space-y-4">
                  {/* Bot Avatar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 lg:mb-3 mb-2">
                      Bot Avatar
                    </label>
                    {!settings.avatar || settings.avatar === '/Default Avatar.png' ? (
                      <div
                        className="border-2 border-dashed border-gray-600/50 rounded-xl lg:p-8 p-6 text-center hover:border-blue-400/50 transition-all cursor-pointer bg-gray-900/30 backdrop-blur-sm group"
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
                              alert('⚠️ Image too large (max 1MB)');
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
                          <p className="lg:text-sm text-xs font-medium">Upload Bot Avatar</p>
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
                            <p className="text-xs text-gray-400 mt-1 lg:block hidden">Ready to use in your widget</p>
                          </div>
                          <button
                            onClick={() => updateSettings('avatar', '/Default Avatar.png')}
                            className="lg:w-8 lg:h-8 w-7 h-7 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg flex items-center justify-center transition-colors"
                            title="Remove avatar"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Theme */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 lg:mb-3 mb-2">
                      Interface Theme
                    </label>
                    <div className="flex items-center lg:space-x-3 space-x-2">
                      <button
                        onClick={() => updateSettings('theme', 'light')}
                        className={`flex items-center lg:gap-2 gap-1 lg:px-4 lg:py-3.5 px-3 py-3 rounded-xl transition-all duration-300 backdrop-blur-sm lg:text-base text-sm ${config.theme === 'light'
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border border-blue-500/50 shadow-lg shadow-blue-600/20'
                          : 'bg-gray-900/50 text-gray-300 hover:bg-gray-800/70 border border-gray-700/50 hover:border-gray-600/50'
                          }`}
                      >
                        <Sun className="lg:w-4 lg:h-4 w-3.5 h-3.5" />
                        Light
                      </button>
                      <button
                        onClick={() => updateSettings('theme', 'dark')}
                        className={`flex items-center lg:gap-2 gap-1 lg:px-4 lg:py-3.5 px-3 py-3 rounded-xl transition-all duration-300 backdrop-blur-sm lg:text-base text-sm ${config.theme === 'dark'
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border border-blue-500/50 shadow-lg shadow-blue-600/20'
                          : 'bg-gray-900/50 text-gray-300 hover:bg-gray-800/70 border border-gray-700/50 hover:border-gray-600/50'
                          }`}
                      >
                        <Moon className="lg:w-4 lg:h-4 w-3.5 h-3.5" />
                        Dark
                      </button>
                    </div>
                  </div>

                  {/* Primary Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 lg:mb-4 mb-3">
                      Primary Color
                    </label>
                    <div className="grid lg:grid-cols-4 grid-cols-4 lg:gap-3 gap-2 lg:mb-4 mb-3">
                      {colorPresets.map((color) => (
                        <button
                          key={color}
                          onClick={() => updateSettings('primaryColor', color)}
                          className={`w-full lg:h-12 h-10 rounded-xl border-2 transition-all hover:scale-105 relative ${(settings.primaryColor || '#3b82f6') === color
                            ? 'border-white ring-2 ring-blue-500/50 shadow-lg'
                            : 'border-gray-600/50 hover:border-gray-500/50'
                            }`}
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
                        className="lg:w-12 lg:h-12 w-10 h-10 border border-gray-600/50 rounded-xl cursor-pointer bg-gray-800"
                      />
                      <input
                        type="text"
                        value={settings.primaryColor || '#3b82f6'}
                        onChange={(e) => updateSettings('primaryColor', e.target.value)}
                        className="flex-1 lg:px-4 lg:py-3.5 px-3 py-2.5 lg:text-sm text-xs bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Messages"
                icon={<MessageCircle className="text-blue-400" size={20} />}
                defaultOpen={false}
              >
                <div className="lg:space-y-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 lg:mb-3 mb-2">Chat Title</label>
                    <input
                      type="text"
                      value={settings.chatTitle || ''}
                      onChange={(e) => updateSettings('chatTitle', e.target.value)}
                      placeholder="AI Assistant"
                      className="w-full lg:px-4 lg:py-3.5 px-3 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm lg:text-base text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 lg:mb-3 mb-2">Subtitle</label>
                    <input
                      type="text"
                      value={settings.subtitle || ''}
                      onChange={(e) => updateSettings('subtitle', e.target.value)}
                      placeholder="Online"
                      className="w-full lg:px-4 lg:py-3.5 px-3 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm lg:text-base text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 lg:mb-3 mb-2">Placeholder Text</label>
                    <input
                      type="text"
                      value={settings.placeholderText || ''}
                      onChange={(e) => updateSettings('placeholderText', e.target.value)}
                      placeholder="Type your message..."
                      className="w-full lg:px-4 lg:py-3.5 px-3 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm lg:text-base text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 lg:mb-3 mb-2">Widget Dimensions</label>
                    <div className="grid grid-cols-2 lg:gap-4 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 lg:mb-2 mb-1.5">Width (px)</label>
                        <input
                          type="number"
                          value={settings.width || 380}
                          onChange={(e) => updateSettings('width', parseInt(e.target.value) || 380)}
                          min="300"
                          max="600"
                          className="w-full lg:px-4 lg:py-3.5 px-3 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium backdrop-blur-sm lg:text-base text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 lg:mb-2 mb-1.5">Height (px)</label>
                        <input
                          type="number"
                          value={settings.height || 600}
                          onChange={(e) => updateSettings('height', parseInt(e.target.value) || 600)}
                          min="400"
                          max="800"
                          className="w-full lg:px-4 lg:py-3.5 px-3 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium backdrop-blur-sm lg:text-base text-sm"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 lg:mt-2 mt-1.5">Width: 300-600px • Height: 400-800px</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between lg:mb-3 mb-2">
                      <label className="text-sm font-medium text-gray-300">Show welcome message</label>
                      <input
                        type="checkbox"
                        checked={settings.showWelcomeMessage !== undefined ? settings.showWelcomeMessage : true}
                        onChange={(e) => updateSettings('showWelcomeMessage', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </div>
                    <input
                      type="text"
                      value={settings.welcomeMessage || ''}
                      onChange={(e) => updateSettings('welcomeMessage', e.target.value)}
                      placeholder="Hello! How can I help you today?"
                      className="w-full lg:px-4 lg:py-3.5 px-3 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm lg:text-base text-sm"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Client Message"
                icon={<Bot className="text-blue-400" size={20} />}
                defaultOpen={false}
              >
                <div className="lg:space-y-4 space-y-3">
                  <div className="flex items-center justify-between lg:mb-3 mb-2">
                    <label className="text-sm font-medium text-gray-300">Enable popup</label>
                    <input
                      type="checkbox"
                      checked={settings.showPopup !== undefined ? settings.showPopup : true}
                      onChange={(e) => updateSettings('showPopup', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={settings.popupMessage || ''}
                      onChange={(e) => {
                        // 🎯 BLOQUER À 55 CARACTÈRES MAX
                        if (e.target.value.length <= 55) {
                          updateSettings('popupMessage', e.target.value);
                        }
                      }}
                      placeholder="Hi! Need help?"
                      maxLength={55} // HTML native
                      className="w-full lg:px-4 lg:py-3.5 px-3 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm lg:text-base text-sm"
                    />
                    {/* 🎯 COMPTEUR 55 CHARS */}
                    <div className="absolute right-3 bottom-2 text-xs text-gray-500 pointer-events-none">
                      {(settings.popupMessage || '').length}/55
                    </div>
                  </div>
                  {/* 🎯 INDICATEUR VISUEL EN ANGLAIS */}
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${(settings.popupMessage || '').length <= 40
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
                    <label className="block text-xs text-gray-400 lg:mb-2 mb-1.5">Delay (seconds)</label>
                    <input
                      type="number"
                      value={settings.popupDelay || 2}
                      onChange={(e) => updateSettings('popupDelay', parseInt(e.target.value) || 2)}
                      min="0"
                      max="30"
                      className="lg:w-32 w-24 lg:px-4 lg:py-3.5 px-3 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium backdrop-blur-sm lg:text-base text-sm"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              {/* Save Configuration Button */}
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

              {/* Deploy Widget Button */}
              <div className="border border-gray-700/50 rounded-xl bg-gray-800/30 backdrop-blur-sm overflow-hidden">
                <div className="lg:p-4 p-3">
                  <button
                    onClick={() => setShowDeployModal(true)}
                    disabled={!savedWidgetId}
                    className={`w-full lg:py-4 py-3.5 lg:px-6 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center lg:gap-3 gap-2 shadow-lg border relative overflow-hidden group lg:text-base text-sm ${savedWidgetId
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white hover:shadow-blue-500/25 hover:scale-[1.02] border-blue-500/30'
                      : 'bg-gray-700 text-gray-400 border-gray-600/50 cursor-not-allowed opacity-75'
                      }`}
                  >
                    {savedWidgetId && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    )}
                    <ExternalLink className="lg:w-5 lg:h-5 w-4 h-4 relative z-10" />
                    <span className="relative z-10">Deploy Widget</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bouton collapse - Desktop only */}
      <div className="group lg:block hidden">
        <button
          onClick={toggleConfigPanel}
          className="fixed top-1/2 -translate-y-1/2 z-[60] w-10 h-10 flex items-center justify-center bg-gray-900/95 backdrop-blur-xl hover:bg-gray-800/95 text-gray-300 hover:text-white rounded-full transition-all duration-300 border border-gray-700/50 hover:border-blue-500/50 shadow-2xl hover:shadow-blue-500/20 hover:scale-110 group touch-manipulation"
          style={{ right: configPanelCollapsed ? '56px' : '384px' }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-300 pointer-events-none"></div>
          <ChevronRight
            size={18}
            className={`transition-all duration-300 relative z-10 ${configPanelCollapsed ? 'rotate-180' : ''} group-hover:scale-110`}
          />
        </button>
      </div>

      <DeploymentModal
        isOpen={showDeployModal}
        onClose={() => setShowDeployModal(false)}
        widgetId={savedWidgetId || ''}
        widgetName={name || 'AI Assistant'}
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

export default ChatbotBuilder;