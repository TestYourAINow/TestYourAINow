// components/ClientLayout.tsx
'use client'

import { ReactNode, useEffect, useState } from "react";
import { Toaster } from "sonner";
import Sidebar from "@/components/Sidebar";
import { useSidebar } from "@/context/SidebarContext";
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Menu, MessageCircle, Settings, ArrowLeft, Globe, Monitor } from "lucide-react";
import Link from 'next/link';
import MobileMenu from "@/components/MobileMenu";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // ✅ État pour vérifier si le composant est monté côté client
  const [isMounted, setIsMounted] = useState(false);

  // ✅ Éviter l'hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Détecter si on est sur une page widget
  // Pages sans bulles flottantes
const isWidgetPage = pathname.includes('/website-widget');
const isDemoAgentPage = pathname === '/demo-agent';
const isAgentLabPage = pathname === '/agent-lab';
const hideOrbs = isWidgetPage || isDemoAgentPage || isAgentLabPage;
  
  // Gérer l'onglet actif pour les pages widget
  const activeTab = isMounted ? (searchParams.get('tab') || 'configuration') : 'configuration';

  // Scroll to top à chaque changement de page
  useEffect(() => {
    if (isMounted) {
      window.scrollTo(0, 0);
    }
  }, [pathname, isMounted]);

  // Fonction pour changer d'onglet sur les pages widget
  const setActiveTab = (tab: string) => {
    if (!isMounted) return;
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('tab', tab);
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  // Fonction pour obtenir le titre de la page
  const getPageTitle = () => {
    if (pathname === '/agents') return 'AI Agent Hub';
    if (pathname === '/agent-lab') return 'Agent Lab';
    if (pathname === '/demo-agent') return 'Demo Agent';
    if (pathname === '/launch-agent') return 'Launch Agent';
    if (pathname === '/api-key') return 'API Key';
    if (pathname === '/video-guides') return 'Video Guides';
    if (pathname === '/support') return 'Support';
    if (pathname === '/agents/new') return 'Create Agent';
    if (pathname === '/create-connection') return 'Create Connection';
    if (pathname === '/account-settings') return 'Account Settings';
    if (pathname.startsWith('/launch-agent/') && pathname.endsWith('/website-widget')) {
      return 'Widget Config';
    }
    if (pathname.startsWith('/launch-agent/') && pathname.endsWith('/instagram-dms')) {
      return 'Chat History';
    }
    if (pathname.startsWith('/launch-agent/') && pathname.endsWith('/facebook-messenger')) {
      return 'Chat History';
    }
    if (pathname.startsWith('/agents/') && pathname.split('/').length === 3) {
      return 'Agent Details';
    }
    return 'Dashboard';
  };

  // Fonction pour obtenir la description
  const getPageDescription = () => {
    if (pathname === '/agents') return 'Manage your intelligent AI agents';
    if (pathname === '/agent-lab') return 'Improve your AI assistants';
    if (pathname === '/demo-agent') return 'Test and showcase your agents';
    if (pathname === '/launch-agent') return 'Deploy agents to production';
    if (pathname === '/api-key') return 'Manage API access keys';
    if (pathname === '/video-guides') return 'Learn with video tutorials';
    if (pathname === '/support') return 'Get help and support';
    if (pathname === '/agents/new') return 'Build and customize your AI agent';
    if (pathname === '/create-connection') return 'Connect your AI agent';
    if (pathname === '/account-settings') return 'Manage your account and preferences';
    if (pathname.startsWith('/launch-agent/') && pathname.endsWith('/website-widget')) {
      return 'Customize your chat widget';
    }
    if (pathname.startsWith('/launch-agent/') && pathname.endsWith('/instagram-dms')) {
      return 'View all conversations captured by your Instagram DMs agent';
    }
    if (pathname.startsWith('/launch-agent/') && pathname.endsWith('/facebook-messenger')) {
      return 'View all conversations captured by your Facebook DMs agent';
    }
    if (pathname.startsWith('/agents/') && pathname.split('/').length === 3) {
      return 'View your AI agent configuration and prompt';
    }
    return 'Welcome to your AI workspace';
  };

  // ✅ Rendu conditionnel pour éviter l'hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            animation: 'gridFloat 20s ease-in-out infinite'
          }}
        />

        {/* Subtle Gradient Orbs - Masqués sur certaines pages */}
{!hideOrbs && (
  <>
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
    <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-600/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
  </>
)}
      </div>
      

      {/* Sidebar - SEULEMENT SUR DESKTOP */}
      <Sidebar />

      {/* MAIN LAYOUT - CSS responsive pur */}
      <div
        className={`
          transition-all duration-300 ease-out relative z-10
          ml-0
          ${collapsed ? 'md:ml-16' : 'md:ml-72'}
        `}
      >
        {/* Enhanced TopBar */}
        <header className="h-16 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 flex items-center px-6 sticky top-0 z-10 shadow-lg">
          <div className="flex items-center gap-4 flex-1">
            {/* Bouton Back pour page widget */}
            {isWidgetPage && (
              <Link 
                href="/launch-agent" 
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mr-2"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline text-sm">Back</span>
              </Link>
            )}

            {/* Enhanced Vertical Bar */}
            <div className="w-1 h-8 bg-gradient-to-b from-blue-400 via-cyan-400 to-blue-600 rounded-full shadow-lg shadow-blue-400/30"></div>

            {/* Enhanced Title Section */}
            <div className="flex-1">
              <h1 className="lg:text-2xl text-xl font-bold text-white mb-0.5 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                {getPageTitle()}
              </h1>
              <p className="lg:text-sm text-xs text-gray-400 font-medium">
                {getPageDescription()}
              </p>
            </div>
          </div>

          {/* Section droite - Boutons widget OU menu hamburger */}
          <div className="flex items-center gap-6">
            {isWidgetPage ? (
              // Boutons pour page widget - Desktop ET Mobile
              <div className="flex gap-2">
                {/* Bouton Preview - SEULEMENT MOBILE */}
                <button 
                  onClick={() => setActiveTab('preview')}
                  className={`lg:hidden px-3 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${
                    activeTab === 'preview' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Monitor size={16} />
                  <span className="hidden sm:inline">Preview</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('configuration')}
                  className={`px-3 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${
                    activeTab === 'configuration' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Settings size={16} />
                  <span className="hidden sm:inline">Configuration</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('conversations')}
                  className={`px-3 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${
                    activeTab === 'conversations' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <MessageCircle size={16} />
                  <span className="hidden sm:inline">Conversations</span>
                </button>
              </div>
            ) : (
              // Menu hamburger pour autres pages
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden w-10 h-10 flex items-center justify-center bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-xl transition-all duration-300 border border-gray-700/50 hover:border-blue-500/50 shadow-lg"
              >
                <Menu size={20} />
              </button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-[calc(100vh-64px)] relative">
          {/* Content Background with subtle gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/5 to-transparent pointer-events-none"></div>

          {/* Enhanced Toaster */}
          <Toaster
            position="top-center"
            richColors
            style={{ zIndex: 9999 }}
            toastOptions={{
              style: {
                background: 'rgba(17, 24, 39, 0.95)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                color: 'white',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>

      {/* MOBILE MENU COMPONENT */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes gridFloat {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(0px) translateX(-5px); }
          75% { transform: translateY(5px) translateX(0px); }
        }
      `}</style>
    </div>
  );
}