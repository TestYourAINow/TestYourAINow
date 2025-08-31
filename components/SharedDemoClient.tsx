'use client';

import { useState, useEffect } from 'react';
import { Activity, Clock, User, MessageCircle, Zap, Shield, Sparkles } from 'lucide-react';
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
  const [isProcessing, setIsProcessing] = useState(false); // 🔧 Éviter les doublons

  // ========== ÉTATS POUR L'INTERFACE ==========
  const [isOpen, setIsOpen] = useState(false);
  const [showPopupBubble, setShowPopupBubble] = useState(false);
  const [mobileView, setMobileView] = useState<'info' | 'chat'>('info');

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
  
  // 🔧 CORRIGÉ : Gestion des messages sans doublons et flash
  const handleMessagesChange = (newMessages: Message[]) => {
    // Si c'est juste un reset ou une modification, pas d'API
    if (newMessages.length <= messages.length) {
      setMessages(newMessages);
      return;
    }
    
    const lastMessage = newMessages[newMessages.length - 1];
    
    // Si c'est un nouveau message utilisateur ET qu'on n'est pas déjà en train de traiter
    if (!lastMessage.isBot && !isProcessing) {
      // Mettre à jour immédiatement SANS déclencher de re-render
      setMessages(newMessages);
      sendMessageToAPI(lastMessage.text, newMessages);
    }
  };

  // 📨 Envoi API séparé et sécurisé - SANS re-render
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

        // Arrêter typing AVANT d'ajouter le message
        setIsTyping(false);
        
        // Petit délai pour éviter le flash
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

        // Mettre à jour le compteur côté serveur
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

  // 🎭 Toggle chat (desktop)
  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowPopupBubble(false);
  };

  // 📱 Toggle mobile avec gestion des états corrects
  const toggleMobile = () => {
    if (mobileView === 'info') {
      setMobileView('chat');
      // Ne pas changer isOpen ici - le widget le gère
    } else {
      setMobileView('info');
      setIsOpen(false); // Fermer le chat quand on revient à info
    }
    setShowPopupBubble(false);
  };

  // 🔙 Retour vers info page (flèche back)
  const backToInfo = () => {
    setMobileView('info');
    setIsOpen(false);
    setShowPopupBubble(false);
  };

  // 📊 Calculs stats
  const usagePercentage = (usedCount / demo.usageLimit) * 100;
  const isLimitReached = usedCount >= demo.usageLimit;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-cyan-600/5" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-7xl mx-auto">

          {/* 📱 MOBILE/TABLET LAYOUT */}
          <div className="block lg:hidden">
            {mobileView === 'info' ? (
              /* PAGE 1 - Info Mobile */
              <div className="max-w-2xl mx-auto space-y-8 text-white min-h-screen flex flex-col justify-center py-8">
                
                {/* Hero Section */}
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 backdrop-blur-sm">
                    <Sparkles className="w-4 h-4 text-blue-400 mr-2" />
                    <span className="text-sm font-medium text-blue-300">Live AI Demo</span>
                  </div>
                  
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
                    {demo.name}
                  </h1>
                  
                  <p className="text-xl text-slate-300 leading-relaxed max-w-lg mx-auto">
                    Experience the power of AI conversation in real-time. Test our intelligent assistant with your own questions.
                  </p>
                </div>

                {/* Quick Stats - pas de features grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Usage</h3>
                        <p className="text-xs text-slate-400">Messages sent</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-2">{usedCount}</div>
                    <div className="text-sm text-slate-400">of {demo.usageLimit} available</div>
                  </div>

                  <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isLimitReached ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-green-500 to-green-600'
                      }`}>
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Status</h3>
                        <p className="text-xs text-slate-400">Current state</p>
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${isLimitReached ? 'text-red-400' : 'text-green-400'}`}>
                      {isLimitReached ? 'Limit Reached' : 'Active'}
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2 mt-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          usagePercentage >= 100 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                          usagePercentage >= 80 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                          'bg-gradient-to-r from-green-500 to-green-600'
                        }`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* CTA Section */}
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">Ready to start?</h3>
                    <p className="text-slate-400 text-sm mb-6">
                      Tap the button below to begin your AI conversation experience.
                    </p>
                  </div>
                  
                  <button
                    onClick={toggleMobile}
                    disabled={isLimitReached}
                    className={`w-full group relative overflow-hidden rounded-2xl p-6 font-medium text-lg transition-all duration-300 ${
                      isLimitReached
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {!isLimitReached && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/20 to-blue-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    )}
                    <div className="relative flex items-center justify-center gap-3">
                      <MessageCircle className="w-6 h-6" />
                      {isLimitReached ? 'Demo Limit Reached' : 'Start Conversation'}
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              /* PAGE 2 - Chat Mobile AVEC boutons de navigation */
              <div className="fixed inset-0 z-50">
                {/* Bouton retour en haut à gauche */}
                <div className="absolute top-4 left-4 z-50">
                  <button
                    onClick={backToInfo}
                    className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5"></path>
                      <path d="M12 19l-7-7 7-7"></path>
                    </svg>
                  </button>
                </div>

                <DemoAgentChatWidget
                  config={chatConfig}
                  isPreview={false}
                  isOpen={isOpen} // Contrôlé par les boutons
                  onToggle={toggleChat} // Le X ferme le chat seulement
                  messages={messages}
                  onMessagesChange={handleMessagesChange}
                  inputValue={inputValue}
                  onInputChange={setInputValue}
                  isTyping={isTyping}
                  onTypingChange={setIsTyping}
                  showPopupBubble={showPopupBubble}
                />
              </div>
            )}
          </div>

          {/* 🖥️ DESKTOP LAYOUT */}
          <div className="hidden lg:block">
            {mobileView === 'info' ? (
              /* PAGE 1 Desktop - Info + Chat Widget */
              <div className="grid grid-cols-12 gap-12 items-start min-h-[85vh]">

                {/* Left Side - Info Section (6 colonnes) */}
                <div className="col-span-6 text-white space-y-8">
                  
                  {/* Hero Section */}
                  <div className="space-y-6">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 backdrop-blur-sm">
                      <Sparkles className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-sm font-medium text-blue-300">Interactive AI Demo</span>
                    </div>
                    
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
                      {demo.name}
                    </h1>
                    
                    <p className="text-xl text-slate-300 leading-relaxed max-w-2xl">
                      Experience cutting-edge AI conversation technology. Test our intelligent assistant with real questions and see how it responds with context-aware, helpful answers.
                    </p>
                  </div>

                  {/* Stats Dashboard */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-lg">Usage Tracking</h3>
                          <p className="text-sm text-slate-400">Messages sent</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-3xl font-bold text-white">{usedCount}</span>
                          <span className="text-slate-400 text-sm">of {demo.usageLimit}</span>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              usagePercentage >= 100 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                              usagePercentage >= 80 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                              'bg-gradient-to-r from-blue-500 to-blue-600'
                            }`}
                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                          isLimitReached ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-green-500 to-green-600'
                        }`}>
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-lg">Demo Status</h3>
                          <p className="text-sm text-slate-400">Current availability</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          isLimitReached 
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                            : 'bg-green-500/20 text-green-300 border border-green-500/30'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${isLimitReached ? 'bg-red-400' : 'bg-green-400'}`} />
                          {isLimitReached ? 'Limit Reached' : 'Active & Ready'}
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          {isLimitReached ? 'Demo session completed' : `${demo.usageLimit - usedCount} messages remaining`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-8 backdrop-blur-sm">
                    <h3 className="text-2xl font-semibold text-white mb-3">
                      Ready to experience the future?
                    </h3>
                    <p className="text-slate-300 mb-6 leading-relaxed">
                      {isOpen
                        ? 'Great! The chat window is open. Start asking questions and explore what our AI can do.'
                        : 'Click the chat button on the right to begin your interactive AI conversation experience.'
                      }
                    </p>
                    {!isOpen && (
                      <button
                        onClick={toggleChat}
                        disabled={isLimitReached}
                        className={`group relative overflow-hidden rounded-xl px-8 py-4 font-medium text-lg transition-all duration-300 ${
                          isLimitReached
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-105 active:scale-95'
                        }`}
                      >
                        {!isLimitReached && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/20 to-blue-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        )}
                        <div className="relative flex items-center gap-3">
                          <MessageCircle className="w-5 h-5" />
                          {isLimitReached ? 'Demo Completed' : 'Launch Chat Experience'}
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Side - Chat Widget en bas à droite (6 colonnes) */}
                <div className="col-span-6 relative">
                  {/* Container fixe pour le chat widget */}
                  <div className="fixed bottom-6 right-6 z-40">
                    <DemoAgentChatWidget
                      config={chatConfig}
                      isPreview={true}
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
                </div>
              </div>
            ) : (
              /* PAGE 2 Desktop - Chat avec bouton retour */
              <div className="fixed inset-0 z-50">
                {/* Bouton retour en haut à gauche */}
                <div className="absolute top-6 left-6 z-50">
                  <button
                    onClick={backToInfo}
                    className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5"></path>
                      <path d="M12 19l-7-7 7-7"></path>
                    </svg>
                  </button>
                </div>

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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}