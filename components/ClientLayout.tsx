'use client'

import { ReactNode, useEffect, useState } from "react";
import { Toaster } from "sonner";
import Sidebar from "@/components/Sidebar";
import { useSidebar } from "@/context/SidebarContext";
import { usePathname } from 'next/navigation';
import { Menu } from "lucide-react";
import MobileMenu from "@/components/MobileMenu";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // 🔧 AJOUT état menu

  // Scroll to top à chaque changement de page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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
    if (pathname.startsWith('/launch-agent/') && pathname.endsWith('/website-widget')) {
      return 'Widget Configuration';
    }
        if (pathname.startsWith('/launch-agent/') && pathname.endsWith('/instagram-dms')) {
      return 'Chat History';
    }
            if (pathname.startsWith('/launch-agent/') && pathname.endsWith('/facebook-messenger')) {
      return 'Chat History';
    }
    return 'Dashboard';
  };

  // Fonction pour obtenir la description
  const getPageDescription = () => {
    if (pathname === '/agents') return 'Manage your intelligent AI agents';
    if (pathname === '/agent-lab') return 'Create and improve your AI assistants';
    if (pathname === '/demo-agent') return 'Test and showcase your agents';
    if (pathname === '/launch-agent') return 'Deploy agents to production';
    if (pathname === '/api-key') return 'Manage API access keys';
    if (pathname === '/video-guides') return 'Learn with video tutorials';
    if (pathname === '/support') return 'Get help and support';
    if (pathname === '/agents/new') return 'Build and customize your AI agent';
    if (pathname === '/create-connection') return 'Connect your AI agent';
    if (pathname.startsWith('/launch-agent/') && pathname.endsWith('/website-widget')) {
      return 'Customize & Deploy your Widget';
    }
        if (pathname.startsWith('/launch-agent/') && pathname.endsWith('/instagram-dms')) {
      return 'View all conversations captured by your Instagram DMs agent';
    }
            if (pathname.startsWith('/launch-agent/') && pathname.endsWith('/facebook-messenger')) {
      return 'View all conversations captured by your Facebook DMs agent';
    }
    return 'Welcome to your AI workspace';
  };

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

        {/* Subtle Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-600/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Sidebar - SEULEMENT SUR DESKTOP */}
      <Sidebar />

      {/* 🔧 MAIN LAYOUT - CSS responsive pur (SANS JavaScript pour éviter l'hydration) */}
      <div
        className={`
          transition-all duration-300 ease-out relative z-10
          ml-0
          ${collapsed
            ? 'md:ml-16'
            : 'md:ml-72'
          }
        `}
      >
        {/* Enhanced TopBar */}
        <header className="h-16 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 flex items-center px-6 sticky top-0 z-40 shadow-lg">
          <div className="flex items-center gap-4 flex-1">
            {/* Enhanced Vertical Bar */}
            <div className="w-1 h-8 bg-gradient-to-b from-blue-400 via-cyan-400 to-blue-600 rounded-full shadow-lg shadow-blue-400/30"></div>

            {/* Enhanced Title Section */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-0.5 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                {getPageTitle()}
              </h1>
              <p className="text-sm text-gray-400 font-medium">
                {getPageDescription()}
              </p>
            </div>
          </div>

          {/* 🔧 MENU HAMBURGER - FONCTIONNEL et responsive */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMobileMenuOpen(true)} // 🔧 AJOUT fonction
              className="md:hidden w-10 h-10 flex items-center justify-center bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-xl transition-all duration-300 border border-gray-700/50 hover:border-blue-500/50 shadow-lg"
            >
              <Menu size={20} />
            </button>
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

      {/* 🔧 MOBILE MENU COMPONENT */}
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