'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { 
  Send, X, MessageCircle, Settings, Globe, Smartphone, Plus, RotateCcw, User, Bot, Info,
  Monitor, Upload, Palette, Save, ExternalLink, Code, Sparkles, Moon, Sun, ChevronRight, ChevronLeft
} from 'lucide-react';
import { DeploymentModal, DeployButton } from '@/components/DeploymentModal';
// ✅ NOUVEAU - Import du ChatWidget propre
import UnifiedChatWidget from '@/components/UnifiedChatWidget';

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

// CollapsibleSection Component - LOGIQUE IDENTIQUE
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
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-medium text-gray-200">{title}</span>
        </div>
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
          <ChevronRight size={18} className="text-gray-400" />
        </div>
      </button>
      
      {isOpen && (
        <div className="border-t border-gray-700/30" />
      )}
      
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="px-4 pb-4 pt-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// COMPOSANT PRINCIPAL AVEC SYSTÈME COLLAPSIBLE
const ChatbotBuilder: React.FC = () => {
  const { id } = useParams();
  const connectionId = id as string;

  // NOUVEAUX ÉTATS POUR LE SYSTÈME COLLAPSIBLE
  const [configPanelCollapsed, setConfigPanelCollapsed] = useState(false);

  // TOUS LES ÉTATS EXISTANTS RESTENT IDENTIQUES
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

  // ✅ CONFIGURATION POUR LE CHATWIDGET - Format compatible
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

  // ✅ CONVERSION POUR LE COMPOSANT ChatWidget (ajouter _id)
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
    <div className="h-[calc(100vh-64px)] overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 bg-grid-pattern">
      
      <div className="flex h-full">
        
        <div className="flex-1 bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 relative overflow-hidden bg-grid-pattern">
          
          <div className="absolute top-4 left-4 bg-gray-800/50 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-3 border border-gray-700/50 z-10">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <div className="w-px h-4 bg-gray-600" />
            <Monitor size={16} className="text-gray-400" />
            <span className="text-xs text-gray-400 font-medium">Live Preview</span>
          </div>

          <div className="absolute top-4 right-4 z-10">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">Connected Agent</div>
              <div className="flex items-center gap-2 justify-end">
                {selectedAgent && <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>}
                <span className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {selectedAgentName || 'No agent selected'}
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
                <span className="font-medium">Configure widget settings on the right</span>
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

              {/* ✅ NOUVEAU - Utilise le ChatWidget composant avec isPreview=true */}
              <UnifiedChatWidget config={widgetConfig} mode="dashboard" />
            </>
          )}
        </div>

        <div className={`bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 text-white flex flex-col h-full transition-all duration-300 ease-out ${
          configPanelCollapsed ? 'w-16' : 'w-96'
        }`}>

          <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 flex-shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="text-blue-400" size={24} />
              <div className={`transition-all duration-300 ease-out overflow-hidden ${
                configPanelCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
              }`}>
                <h2 className="text-xl font-bold text-white whitespace-nowrap">Configuration Panel</h2>
              </div>
            </div>
            <div className={`transition-all duration-300 ease-out overflow-hidden ${
              configPanelCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
            }`}>
              <p className="text-gray-400 text-sm whitespace-nowrap">Customize your widget experience</p>
            </div>
          </div>

          {!configPanelCollapsed && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              
              <CollapsibleSection
                title="General Configuration"
                icon={<Settings className="text-blue-400" size={20} />}
                defaultOpen={true}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Widget Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => updateName(e.target.value)}
                      placeholder="My AI Assistant"
                      className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Appearance"
                icon={<Palette className="text-blue-400" size={20} />}
                defaultOpen={false}
              >
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Bot Avatar
                    </label>
                    {!settings.avatar || settings.avatar === '/Default Avatar.png' ? (
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
                            src={settings.avatar}
                            alt="Avatar"
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-600/50"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.src = '/Default Avatar.png';
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">✅ Custom avatar uploaded</p>
                            <p className="text-xs text-gray-400 mt-1">Ready to use in your widget</p>
                          </div>
                          <button
                            onClick={() => updateSettings('avatar', '/Default Avatar.png')}
                            className="w-8 h-8 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg flex items-center justify-center transition-colors"
                            title="Remove avatar"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Interface Theme
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateSettings('theme', 'light')}
                        className={`flex items-center gap-2 px-4 py-3.5 rounded-xl transition-all duration-300 backdrop-blur-sm ${config.theme === 'light'
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border border-blue-500/50 shadow-lg shadow-blue-600/20'
                          : 'bg-gray-900/50 text-gray-300 hover:bg-gray-800/70 border border-gray-700/50 hover:border-gray-600/50'
                          }`}
                      >
                        <Sun className="w-4 h-4" />
                        Light
                      </button>
                      <button
                        onClick={() => updateSettings('theme', 'dark')}
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
                    <label className="block text-sm font-medium text-gray-300 mb-4">
                      Primary Color
                    </label>
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      {colorPresets.map((color) => (
                        <button
                          key={color}
                          onClick={() => updateSettings('primaryColor', color)}
                          className={`w-full h-12 rounded-xl border-2 transition-all hover:scale-105 relative ${(settings.primaryColor || '#3b82f6') === color
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
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.primaryColor || '#3b82f6'}
                        onChange={(e) => updateSettings('primaryColor', e.target.value)}
                        className="w-12 h-12 border border-gray-600/50 rounded-xl cursor-pointer bg-gray-800"
                      />
                      <input
                        type="text"
                        value={settings.primaryColor || '#3b82f6'}
                        onChange={(e) => updateSettings('primaryColor', e.target.value)}
                        className="flex-1 px-4 py-3.5 text-sm bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Chat Title</label>
                    <input
                      type="text"
                      value={settings.chatTitle || ''}
                      onChange={(e) => updateSettings('chatTitle', e.target.value)}
                      placeholder="AI Assistant"
                      className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Subtitle</label>
                    <input
                      type="text"
                      value={settings.subtitle || ''}
                      onChange={(e) => updateSettings('subtitle', e.target.value)}
                      placeholder="Online"
                      className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Placeholder Text</label>
                    <input
                      type="text"
                      value={settings.placeholderText || ''}
                      onChange={(e) => updateSettings('placeholderText', e.target.value)}
                      placeholder="Type your message..."
                      className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Widget Dimensions</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-2">Width (px)</label>
                        <input
                          type="number"
                          value={settings.width || 380}
                          onChange={(e) => updateSettings('width', parseInt(e.target.value) || 380)}
                          min="300"
                          max="600"
                          className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium backdrop-blur-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-2">Height (px)</label>
                        <input
                          type="number"
                          value={settings.height || 600}
                          onChange={(e) => updateSettings('height', parseInt(e.target.value) || 600)}
                          min="400"
                          max="800"
                          className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium backdrop-blur-sm"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Width: 300-600px • Height: 400-800px</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
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
                      className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Client Message"
                icon={<Bot className="text-blue-400" size={20} />}
                defaultOpen={false}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">Enable popup</label>
                    <input
                      type="checkbox"
                      checked={settings.showPopup !== undefined ? settings.showPopup : true}
                      onChange={(e) => updateSettings('showPopup', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={settings.popupMessage || ''}
                      onChange={(e) => updateSettings('popupMessage', e.target.value)}
                      placeholder="Hi! Need any help?"
                      className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Delay (seconds)</label>
                    <input
                      type="number"
                      value={settings.popupDelay || 2}
                      onChange={(e) => updateSettings('popupDelay', parseInt(e.target.value) || 2)}
                      min="0"
                      max="30"
                      className="w-32 px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium backdrop-blur-sm"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              <div className="border border-gray-700/50 rounded-xl bg-gray-800/30 backdrop-blur-sm overflow-hidden">
                <div className="p-4">
                  <button
                    onClick={saveChanges}
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-emerald-700 disabled:to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] disabled:scale-100 disabled:opacity-75 border border-emerald-500/30 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white relative z-10"></div>
                        <span className="relative z-10">Saving Configuration...</span>
                      </>
                    ) : saveSuccess ? (
                      <>
                        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center relative z-10">
                          <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="relative z-10">Configuration Saved!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">Save Configuration</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="border border-gray-700/50 rounded-xl bg-gray-800/30 backdrop-blur-sm overflow-hidden">
                <div className="p-4">
                  <button
                    onClick={() => setShowDeployModal(true)}
                    disabled={!savedWidgetId}
                    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg border relative overflow-hidden group ${
                      savedWidgetId 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white hover:shadow-blue-500/25 hover:scale-[1.02] border-blue-500/30' 
                        : 'bg-gray-700 text-gray-400 border-gray-600/50 cursor-not-allowed opacity-75'
                    }`}
                  >
                    {savedWidgetId && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    )}
                    <ExternalLink className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Deploy Widget</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="group">
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