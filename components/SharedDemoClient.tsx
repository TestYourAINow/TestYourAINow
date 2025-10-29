'use client';

import { useState, useEffect } from 'react';
import { Zap, ExternalLink, Shield } from 'lucide-react';
import DemoAgentChatWidget from './DemoAgentChatWidget';

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
  websiteUrl: string;
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
  demoToken: string;
}

export default function SharedDemoClient({ demo, demoId, demoToken }: Props) {
  // ========== ÉTATS POUR LE CHAT ==========
  const [messages, setMessages] = useState<Message[]>([]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [usedCount, setUsedCount] = useState(demo.usedCount || 0);
  const [isProcessing, setIsProcessing] = useState(false);

  // ========== ÉTATS POUR L'INTERFACE ==========
  const [isOpen, setIsOpen] = useState(false);
  const [showPopupBubble, setShowPopupBubble] = useState(false);

  // ========== CONFIGURATION POUR DemoAgentChatWidget ==========
  const chatConfig = {
    name: demo.name,
    agentId: demo.agentId,
    avatar: demo.avatarUrl,
    welcomeMessage: demo.welcomeMessage,
    placeholderText: demo.placeholderText,
    theme: demo.theme,
    primaryColor: demo.color,
    popupMessage: demo.popupMessage,
    popupDelay: demo.popupDelay,
    showPopup: demo.showPopup,
    showWelcomeMessage: demo.showWelcome,
    chatTitle: demo.chatTitle,
    subtitle: demo.subtitle,
  };

  // ========== LOGIQUE POPUP ==========
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

  // ========== FONCTIONS ==========

  // 🔧 Gestion des messages sans doublons
  const handleMessagesChange = (newMessages: Message[]) => {
    if (newMessages.length <= messages.length) {
      setMessages(newMessages);
      return;
    }

    const lastMessage = newMessages[newMessages.length - 1];

    if (!lastMessage.isBot && !isProcessing) {
      setMessages(newMessages);
      sendMessageToAPI(lastMessage.text, newMessages);
    }
  };

  // 📨 Envoi API
  const sendMessageToAPI = async (messageText: string, currentMessages: Message[]) => {
    if (usedCount >= demo.usageLimit || isProcessing) return;

    setIsProcessing(true);
    setIsTyping(true);

    try {
      const body: any = {
        message: messageText,
        previousMessages: currentMessages
          .filter(msg => msg.id !== 'welcome')
          .map(msg => ({
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
          'x-public-kind': 'demo',
          'x-demo-id': demoId,
          'x-demo-token': demoToken
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();

        setIsTyping(false);

        setTimeout(() => {
          const botMessage: Message = {
            id: crypto.randomUUID(),
            text: data.reply || 'Sorry, I couldn\'t process your request.',
            isBot: true,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
          setUsedCount(prev => prev + 1);
          setIsProcessing(false);
        }, 200);

        await fetch(`/api/demo/${demoId}/usage`, {
          method: 'POST'
        });
      } else {
        throw new Error('API Error');
      }
    } catch (error) {
      console.error('Error sending message:', error);

      setIsTyping(false);
      setTimeout(() => {
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          text: "Sorry, an error occurred. Please try again.",
          isBot: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsProcessing(false);
      }, 200);
    }
  };

  // 🎭 Toggle chat
const toggleChat = () => {
  const wasOpen = isOpen;
  setIsOpen(!isOpen);
  setShowPopupBubble(false);
  
  // Animation de typing au premier ouverture
  if (!wasOpen && messages.length === 0 && demo.showWelcome && demo.welcomeMessage) {
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages([{
          id: 'welcome',
          text: demo.welcomeMessage,
          isBot: true,
          timestamp: new Date()
        }]);
      }, 1500);
    }, 400);
  }
};

  // 📊 Calculs stats
  const usagePercentage = (usedCount / demo.usageLimit) * 100;
  const isLimitReached = usedCount >= demo.usageLimit;

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-950 flex flex-col">

      {/* 📊 TOP BAR - RÉORGANISÉ */}
      <div className="flex-shrink-0 h-14 lg:h-16 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 px-3 lg:px-6 flex items-center justify-between z-40">

        {/* Left - Demo Name + Status Badge (collés ensemble) */}
        <div className="flex items-center gap-2 lg:gap-3 min-w-0">
          <h1 className="text-white font-bold text-sm lg:text-base truncate">
            {demo.name}
          </h1>

          {/* Status Badge - juste après le nom */}
          <div className="flex items-center gap-1.5 bg-gray-800/50 backdrop-blur-sm px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg border border-gray-700/50 flex-shrink-0">
            <div className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${isLimitReached ? 'bg-red-400' : 'bg-green-400'}`} />
            <span className={`font-semibold text-xs lg:text-sm ${isLimitReached ? 'text-red-400' : 'text-green-400'}`}>
              {isLimitReached ? 'Full' : 'Active'}
            </span>
          </div>
        </div>

        {/* Right - Share Button */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied!');
          }}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-xs lg:text-sm group bg-gray-800/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-700/50 hover:border-gray-600/50"
        >
          <ExternalLink className="w-3 h-3 lg:w-3.5 lg:h-3.5 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* 🌐 IFRAME CONTAINER - Takes all remaining space */}
      <div className="flex-1 relative overflow-hidden">
        {demo.websiteUrl ? (
          <>
            <iframe
              src={demo.websiteUrl}
              className="absolute inset-0 w-full h-full border-0"
              style={{
                pointerEvents: 'none',
                transform: 'scale(1)',
                transformOrigin: 'top left'
              }}
              sandbox="allow-same-origin allow-scripts"
              title="Website Background"
            />
            {/* Overlay pour bloquer les interactions */}
            <div className="absolute inset-0 bg-transparent" style={{ pointerEvents: 'auto' }} />
          </>
        ) : (
          // Fallback Premium - Gradient avec avatar + nom de démo
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-cyan-600/5" />

            {/* Blobs lumineux */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

            {/* Grille subtile */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `
        linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
      `,
                backgroundSize: '50px 50px'
              }}
            />

            {/* Contenu centré */}
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="text-center space-y-6 max-w-2xl">

                {/* Avatar + Nom de la démo */}
                <div className="flex items-center justify-center gap-4 lg:gap-6">
                  <img
                    src={demo.avatarUrl || '/Default Avatar.png'}
                    alt="Bot Avatar"
                    className="w-16 h-16 lg:w-20 lg:h-20 rounded-full object-cover border-2 border-blue-400/30 shadow-xl"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = '/Default Avatar.png';
                    }}
                  />
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
                    {demo.name}
                  </h1>
                </div>

                {/* Texte descriptif */}
                <p className="text-base lg:text-lg text-gray-300 leading-relaxed max-w-xl mx-auto">
                  This is your preview demo. Experience cutting-edge AI conversation technology. Test our intelligent assistant with real questions and see how it responds with context-aware, helpful answers.
                </p>

                {/* Section "Works Everywhere" */}
                <div className="pt-4">
                  <div className="inline-flex flex-col items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                    <p className="text-sm text-gray-400">
                      Works seamlessly on
                    </p>
                    <div className="flex items-center gap-4 lg:gap-6">
                      {/* Website */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-white/10 flex items-center justify-center">
                          <svg className="w-5 h-5 lg:w-6 lg:h-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-400">Website</span>
                      </div>

                      {/* Messenger */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-white/10 flex items-center justify-center">
                          <svg className="w-5 h-5 lg:w-6 lg:h-6 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.912 1.447 5.507 3.715 7.2V22l3.442-1.889c.918.254 1.89.389 2.843.389 5.523 0 10-4.145 10-9.257C22 6.145 17.523 2 12 2zm.995 12.428l-2.552-2.72-4.98 2.72 5.477-5.812 2.616 2.72 4.917-2.72-5.478 5.812z" />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-400">Messenger</span>
                      </div>

                      {/* Instagram */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-white/10 flex items-center justify-center">
                          <svg className="w-5 h-5 lg:w-6 lg:h-6 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-400">Instagram</span>
                      </div>

                      {/* SMS */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-white/10 flex items-center justify-center">
                          <svg className="w-5 h-5 lg:w-6 lg:h-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-400">SMS</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Chat Widget (floating par-dessus) */}
        <DemoAgentChatWidget
          config={chatConfig}
          isPreview={false}
          isOpen={isOpen}
          onToggle={toggleChat}
          messages={messages}
          onMessagesChange={handleMessagesChange}
          inputValue={inputValue}
          onInputChange={setInputValue}
          isTyping={isTyping}
          onTypingChange={setIsTyping}
          showPopupBubble={showPopupBubble}
        />
      </div>

      {/* 📊 BOTTOM BAR - Progress Bar Centré */}
      <div className="flex-shrink-0 h-12 lg:h-14 bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50 px-3 lg:px-8 flex items-center justify-center z-40">

        {/* Progress Bar - TOUJOURS CENTRÉ et responsive */}
        <div className="flex items-center gap-3 lg:gap-4 w-full max-w-md lg:max-w-lg">
          <div className="flex-1 bg-gray-700/50 rounded-full h-2 lg:h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${usagePercentage >= 100 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                usagePercentage >= 80 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                  'bg-gradient-to-r from-blue-500 to-purple-600'
                }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
          <span className="text-gray-300 text-xs lg:text-sm font-medium whitespace-nowrap">
            {demo.usageLimit - usedCount} {demo.usageLimit - usedCount === 1 ? 'message' : 'messages'} left
          </span>
        </div>
      </div>
    </div>
  );
}