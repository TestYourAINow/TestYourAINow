'use client';

import { useState, useEffect, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { 
  Moon, Sun, Bot, User, Info, X, Upload, Send, Settings, MessageCircle, 
  RotateCcw, Globe, Smartphone, Palette, Monitor, Eye, Trash2, Sparkles, CheckCircle, ChevronRight, Plus, Minus
} from "lucide-react";
import { cn } from '@/lib/utils';
import CreateDemoModal from '@/components/CreateDemoModal';
import InfoDemoModal from '@/components/InfoDemoModal';
import { DeleteDemoModal } from '@/components/DeleteDemoModal';
import DemoAgentChatWidget from '@/components/DemoAgentChatWidget';

// Types - AJOUTÉ usageLimit
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
  usageLimit: number;
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
    avatar: '/Default Avatar.png',
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
    usageLimit: 150,
  });

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
  const [isOpen, setIsOpen] = useState(false);
  const [showPopupBubble, setShowPopupBubble] = useState(false);

  // Agents and demos states
  const [agents, setAgents] = useState<Agent[]>([]);
  const [userDemos, setUserDemos] = useState<DemoItem[]>([]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showDemosModal, setShowDemosModal] = useState(false);
  const [deleteDemoModal, setDeleteDemoModal] = useState({
    isOpen: false,
    demoId: '',
    demoName: ''
  });
  const [isDeletingDemo, setIsDeletingDemo] = useState(false);

  // Mobile responsive state
  const [mobileView, setMobileView] = useState<'preview' | 'config'>('preview');

  // Color picker state
  const [customColor, setCustomColor] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

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

  // Utility functions
  const updateConfig = (key: keyof DemoConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const adjustUsageLimit = (delta: number) => {
    setConfig(prev => ({
      ...prev,
      usageLimit: Math.min(Math.max(prev.usageLimit + delta, 1), 150)
    }));
  };

  // Toggle chat
  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowPopupBubble(false);
  };

  // Modal functions
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
      <div className="h-[calc(100vh-64px)] bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        
        {/* Mobile Navigation Tabs - Sticky et fixed height */}
        <div className="lg:hidden bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 flex sticky top-0 z-50 h-12">
          <button
            onClick={() => setMobileView('preview')}
            className={`flex-1 px-3 py-3 text-sm font-medium transition-all duration-200 ${
              mobileView === 'preview'
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
            className={`flex-1 px-3 py-3 text-sm font-medium transition-all duration-200 ${
              mobileView === 'config'
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
        
        {/* Structure principale - Responsive flex avec hauteur corrigée */}
        <div className="flex lg:h-full h-[calc(100%-48px)] lg:flex-row flex-col">
          
          {/* COLONNE GAUCHE - Preview Panel - Responsive avec hauteur fixe */}
          <div className={`flex-1 bg-gray-900/95 backdrop-blur-xl lg:border-r border-gray-700/50 relative bg-grid-pattern lg:h-full h-full ${
            mobileView === 'preview' ? 'block' : 'hidden lg:block'
          }`}>
            
            {/* Enhanced Device Frame - responsive */}
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

            {/* Enhanced Live Indicator - responsive */}
            <div className="absolute top-4 right-4 items-center gap-2 px-3 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl backdrop-blur-sm z-10 hidden lg:flex">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">Live</span>
            </div>

            {/* Your Demos Button - Responsive positioning */}
            <div className="absolute lg:top-16 lg:left-4 top-4 left-4 z-10">
              <button
                onClick={() => setShowDemosModal(true)}
                className="group flex items-center gap-3 lg:px-4 lg:py-3 px-3 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/30 hover:border-blue-400/50 rounded-xl backdrop-blur-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/20 transform hover:scale-105"
              >
                <div className="relative">
                  <Smartphone size={18} className="text-blue-300 group-hover:text-blue-200 transition-colors hidden lg:block" />
                  <Smartphone size={16} className="text-blue-300 group-hover:text-blue-200 transition-colors block lg:hidden" />
                </div>
                <div className="hidden lg:flex lg:flex-col lg:items-start">
                  <span className="text-sm font-semibold text-white group-hover:text-blue-100 transition-colors">
                    Your Demos
                  </span>
                  {userDemos.length > 0 ? (
                    <span className="text-xs text-blue-300/70 group-hover:text-blue-200/80 transition-colors">
                      {userDemos.length} {userDemos.length === 1 ? 'demo' : 'demos'} created
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                      No demos yet
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-white block lg:hidden">Demos</span>
                <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block">
                  <ChevronRight size={14} className="text-blue-300" />
                </div>
              </button>
            </div>

            {/* Preview Content */}
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

                {/* DemoAgentChatWidget */}
                <DemoAgentChatWidget
                  config={config}
                  isPreview={true}
                  isOpen={isOpen}
                  onToggle={toggleChat}
                  messages={messages}
                  onMessagesChange={setMessages}
                  inputValue={inputValue}
                  onInputChange={setInputValue}
                  isTyping={isTyping}
                  onTypingChange={setIsTyping}
                  showPopupBubble={showPopupBubble}
                />
              </>
            )}
          </div>

          {/* COLONNE DROITE - Configuration Panel - Responsive avec hauteur fixe */}
          <div className={`lg:w-96 w-full bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 text-white flex flex-col lg:h-full h-full ${
            mobileView === 'config' ? 'block' : 'hidden lg:block'
          }`}>

            {/* Header Configuration Panel - Mobile-friendly */}
            <div className="lg:p-6 p-3 border-b border-gray-700/50 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 flex-shrink-0">
              <div className="flex items-center gap-2 lg:gap-3 mb-1 lg:mb-2">
                <Settings className="text-blue-400 hidden lg:block" size={24} />
                <Settings className="text-blue-400 block lg:hidden" size={18} />
                <h2 className="lg:text-xl text-base font-bold text-white">Configuration</h2>
              </div>
              <p className="text-gray-400 lg:text-sm text-xs">Customize your demo</p>
            </div>

            {/* Configuration Sections - Mobile-optimized */}
            <div className="flex-1 overflow-y-auto lg:p-6 p-3 lg:space-y-4 space-y-3 custom-scrollbar">
              
              {/* General Configuration */}
              <CollapsibleSection
                title="General Configuration"
                icon={<Settings className="text-blue-400" size={20} />}
                defaultOpen={true}
              >
                <div className="lg:space-y-4 space-y-3">
                  <div>
                    <input
                      type="text"
                      value={config.name}
                      onChange={(e) => updateConfig('name', e.target.value)}
                      placeholder="Demo name"
                      className="w-full lg:px-4 lg:py-3.5 px-3 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm placeholder-gray-400 font-medium lg:text-base text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 lg:mb-3 mb-2">
                      Choose Agent
                    </label>
                    <select
                      value={config.agentId}
                      onChange={(e) => updateConfig('agentId', e.target.value)}
                      className="w-full lg:px-4 lg:py-3.5 px-3 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm font-medium lg:text-base text-sm"
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
              </CollapsibleSection>

              {/* Appearance Section - Mobile optimized */}
              <CollapsibleSection
                title="Appearance"
                icon={<Palette className="text-blue-400" size={20} />}
                defaultOpen={false}
              >
                <div className="lg:space-y-6 space-y-4">
                  {/* Bot Avatar - Mobile optimized */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 lg:mb-3 mb-2">
                      Bot Avatar
                    </label>
                    {config.avatar === '/Default Avatar.png' ? (
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
                            src={config.avatar}
                            alt="Avatar"
                            className="lg:w-16 lg:h-16 w-12 h-12 rounded-full object-cover border-2 border-gray-600/50"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.src = '/Default Avatar.png';
                            }}
                          />
                          <div className="flex-1">
                            <p className="lg:text-sm text-xs font-medium text-white">✅ Avatar uploaded successfully</p>
                            <p className="text-xs text-gray-400 mt-1 lg:block hidden">Ready to use in your demo</p>
                          </div>
                          <button
                            onClick={() => updateConfig('avatar', '/Default Avatar.png')}
                            className="lg:w-8 lg:h-8 w-7 h-7 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg flex items-center justify-center transition-colors"
                            title="Remove avatar"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Theme - Mobile optimized */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 lg:mb-3 mb-2">
                      Theme
                    </label>
                    <div className="flex items-center lg:space-x-3 space-x-2">
                      <button
                        onClick={() => updateConfig('theme', 'light')}
                        className={`flex items-center lg:gap-2 gap-1 lg:px-4 lg:py-3.5 px-3 py-3 rounded-xl transition-all duration-300 backdrop-blur-sm lg:text-base text-sm ${config.theme === 'light'
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border border-blue-500/50 shadow-lg shadow-blue-600/20'
                          : 'bg-gray-900/50 text-gray-300 hover:bg-gray-800/70 border border-gray-700/50 hover:border-gray-600/50'
                          }`}
                      >
                        <Sun className="lg:w-4 lg:h-4 w-3.5 h-3.5" />
                        Light
                      </button>
                      <button
                        onClick={() => updateConfig('theme', 'dark')}
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

                  {/* Primary Color - Mobile grid optimized */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 lg:mb-3 mb-2">
                      Primary Color
                    </label>
                    <div className="grid lg:grid-cols-4 grid-cols-4 lg:gap-3 gap-2 lg:mb-4 mb-3">
                      {colorPresets.map((color) => (
                        <button
                          key={color}
                          onClick={() => updateConfig('primaryColor', color)}
                          className={`w-full lg:h-12 h-10 rounded-xl border-2 transition-all hover:scale-105 relative ${config.primaryColor === color
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
                    <div className="flex items-center lg:gap-3 gap-2">
                      <input
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) => updateConfig('primaryColor', e.target.value)}
                        className="lg:w-12 lg:h-10 w-10 h-9 border border-gray-700/50 rounded-xl cursor-pointer bg-gray-900/80 backdrop-blur-sm"
                      />
                      <input
                        type="text"
                        value={config.primaryColor}
                        onChange={(e) => updateConfig('primaryColor', e.target.value)}
                        className="flex-1 lg:px-4 lg:py-3 px-3 py-2.5 lg:text-sm text-xs bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 transition-all backdrop-blur-sm placeholder-gray-400 font-mono"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Messages Section - Mobile optimized */}
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
                      value={config.chatTitle}
                      onChange={(e) => updateConfig('chatTitle', e.target.value)}
                      placeholder="Chat title"
                      className="w-full lg:px-4 lg:py-3.5 px-3 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all backdrop-blur-sm placeholder-gray-400 font-medium lg:text-base text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 lg:mb-3 mb-2">Subtitle</label>
                    <input
                      type="text"
                      value={config.subtitle}
                      onChange={(e) => updateConfig('subtitle', e.target.value)}
                      placeholder="Subtitle"
                      className="w-full lg:px-4 lg:py-3.5 px-3 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all backdrop-blur-sm placeholder-gray-400 font-medium lg:text-base text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 lg:mb-3 mb-2">Input Placeholder</label>
                    <input
                      type="text"
                      value={config.placeholderText}
                      onChange={(e) => updateConfig('placeholderText', e.target.value)}
                      placeholder="Type your message..."
                      className="w-full lg:px-4 lg:py-3.5 px-3 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all backdrop-blur-sm placeholder-gray-400 font-medium lg:text-base text-sm"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between lg:mb-3 mb-2">
                      <label className="text-sm font-medium text-gray-300">Show Welcome Message</label>
                      <input
                        type="checkbox"
                        checked={config.showWelcomeMessage}
                        onChange={(e) => updateConfig('showWelcomeMessage', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 bg-gray-800 border-gray-600 rounded focus:ring-emerald-500"
                      />
                    </div>
                    <input
                      type="text"
                      value={config.welcomeMessage}
                      onChange={(e) => updateConfig('welcomeMessage', e.target.value)}
                      placeholder="Hello! How can I help you today?"
                      className="w-full lg:px-4 lg:py-3.5 px-3 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all backdrop-blur-sm placeholder-gray-400 font-medium lg:text-base text-sm"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              {/* Client Message Section - Mobile optimized */}
              <CollapsibleSection
                title="Client Message"
                icon={<Bot className="text-blue-400" size={20} />}
                defaultOpen={false}
              >
                <div className="lg:space-y-4 space-y-3">
                  <div className="flex items-center justify-between lg:mb-3 mb-2">
                    <label className="text-sm font-medium text-gray-300">Enable Popup</label>
                    <input
                      type="checkbox"
                      checked={config.showPopup}
                      onChange={(e) => updateConfig('showPopup', e.target.checked)}
                      className="w-4 h-4 text-orange-600 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 lg:mb-3 mb-2">Popup Message</label>
                    <input
                      type="text"
                      value={config.popupMessage}
                      onChange={(e) => updateConfig('popupMessage', e.target.value)}
                      className="w-full lg:px-4 lg:py-3.5 px-3 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 transition-all backdrop-blur-sm placeholder-gray-400 font-medium lg:text-base text-sm"
                      placeholder="Hello! Need any help?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 lg:mb-3 mb-2">Delay (seconds)</label>
                    <input
                      type="number"
                      value={config.popupDelay}
                      onChange={(e) => updateConfig('popupDelay', parseInt(e.target.value) || 2)}
                      min="0"
                      max="30"
                      className="lg:w-24 w-20 lg:px-4 lg:py-3 px-3 py-2.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 transition-all backdrop-blur-sm font-medium lg:text-base text-sm"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              {/* Demo Settings Section - Mobile optimized */}
              <CollapsibleSection
                title="Demo Settings"
                icon={<Sparkles className="text-blue-400" size={20} />}
                defaultOpen={false}
              >
                <div className="lg:space-y-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 lg:mb-3 mb-2">Usage Limit</label>
                    <div className="flex items-center lg:gap-4 gap-3">
                      <div className="flex-1">
                        <div className="relative">
                          <input
                            type="number"
                            min={1}
                            max={150}
                            value={config.usageLimit}
                            onChange={(e) => updateConfig('usageLimit', parseInt(e.target.value) || 150)}
                            className="w-full lg:px-4 lg:py-3.5 px-3 py-3 bg-gray-900/80 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all font-medium backdrop-blur-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none lg:text-base text-sm pr-20"
                            placeholder="150"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 lg:text-sm text-xs font-medium">
                            max
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col lg:gap-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => adjustUsageLimit(1)}
                          className="lg:w-10 lg:h-8 w-9 h-7 bg-gray-700/60 hover:bg-gray-600/60 border border-gray-600/50 hover:border-gray-500/50 rounded-lg text-white text-sm flex items-center justify-center transition-all backdrop-blur-sm"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustUsageLimit(-1)}
                          className="lg:w-10 lg:h-8 w-9 h-7 bg-gray-700/60 hover:bg-gray-600/60 border border-gray-600/50 hover:border-gray-500/50 rounded-lg text-white text-sm flex items-center justify-center transition-all backdrop-blur-sm"
                        >
                          <Minus size={12} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="lg:text-xs text-xs text-gray-400 lg:mt-2 mt-1.5">
                      Limit the number of responses the AI can provide (maximum 150)
                    </p>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Create Demo Button - Mobile optimized */}
              <div className="border border-gray-700/50 rounded-xl bg-gray-800/30 backdrop-blur-sm overflow-hidden">
                <div className="lg:p-4 p-3">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    disabled={!config.agentId}
                    className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 text-white lg:py-4 py-3.5 lg:px-6 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transform hover:scale-105 disabled:transform-none disabled:opacity-50 flex items-center justify-center lg:gap-3 gap-2 relative overflow-hidden group lg:text-base text-sm"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <CheckCircle className="lg:w-5 lg:h-5 w-4 h-4 relative z-10" />
                    <span className="relative z-10">Create Demo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Your Demos - Mobile optimized */}
        {showDemosModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center lg:p-4 p-2 bg-black/50 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl w-full lg:max-w-2xl max-w-full lg:max-h-[80vh] max-h-[90vh] overflow-hidden">
              <div className="lg:p-6 p-4 border-b border-gray-700/50 bg-gradient-to-r from-blue-600/10 to-cyan-600/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center lg:gap-3 gap-2">
                    <Smartphone className="text-blue-400 lg:block hidden" size={24} />
                    <Smartphone className="text-blue-400 block lg:hidden" size={20} />
                    <h2 className="lg:text-xl text-lg font-bold text-white">Your Demos</h2>
                    {userDemos.length > 0 && (
                      <span className="bg-blue-500/20 text-blue-400 lg:text-sm text-xs lg:px-3 lg:py-1 px-2 py-0.5 rounded-full font-medium border border-blue-500/30">
                        {userDemos.length}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowDemosModal(false)}
                    className="lg:p-2 p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="lg:p-6 p-4 lg:max-h-96 max-h-80 overflow-y-auto custom-scrollbar">
                {userDemos.length === 0 ? (
                  <div className="text-center lg:py-12 py-8">
                    <div className="lg:w-16 lg:h-16 w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto lg:mb-4 mb-3 border border-gray-600/50">
                      <Smartphone className="lg:w-8 lg:h-8 w-6 h-6 text-gray-500" />
                    </div>
                    <h3 className="lg:text-lg text-base font-semibold text-white mb-2">No demos created yet</h3>
                    <p className="text-gray-400 lg:text-base text-sm">Create your first demo to get started</p>
                  </div>
                ) : (
                  <div className="grid lg:gap-4 gap-3">
                    {userDemos.map((demo) => (
                      <div key={demo._id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-xl lg:p-4 p-3 hover:bg-gray-700/50 transition-all duration-300 group">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium truncate group-hover:text-blue-300 transition-colors lg:text-base text-sm">{demo.name}</h4>
                            <p className="text-xs text-gray-400 mt-1">Interactive demo widget</p>
                          </div>
                          <DemoActions
                            demo={demo}
                            onView={() => {
                              setShowDemosModal(false);
                              openInfoModal(demo._id);
                            }}
                            onDelete={() => {
                              setShowDemosModal(false);
                              openDeleteDemoModal(demo._id, demo.name);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
            usageLimit: config.usageLimit,
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

        {/* Styles CSS */}
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
}