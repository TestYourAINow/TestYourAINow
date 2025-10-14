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
  const [messages, setMessages] = useState<Message[]>(() => {
    if (demo.showWelcome && demo.welcomeMessage) {
      return [{
        id: 'welcome',
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
    setIsOpen(!isOpen);
    setShowPopupBubble(false);
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
          // Fallback si pas d'URL
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-cyan-600/5" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

            {/* Message centré */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="text-center space-y-4 max-w-md">
                <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                  <Shield className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                </div>
                <h2 className="text-xl lg:text-3xl font-bold text-white">
                  {demo.name}
                </h2>
                <p className="text-sm lg:text-base text-gray-300">
                  Click the chat button to start your AI conversation
                </p>
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