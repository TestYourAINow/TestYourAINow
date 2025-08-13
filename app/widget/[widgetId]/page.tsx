// app/widget/[widgetId]/page.tsx - VERSION AVEC COMMUNICATION
import { ChatbotConfig } from "@/models/ChatbotConfig";
import { connectToDatabase } from "@/lib/db";
import { ChatWidgetConfig } from "@/types/ChatWidgetConfig";
import { notFound } from "next/navigation";
import ChatWidget from "@/components/ChatWidget"; // 🆕 IMPORT MANQUANT

// 🆕 Composant client pour le widget avec communication
const WidgetWithCommunication = ({ config }: { config: ChatWidgetConfig }) => {
  return (
    <>
      {/* CSS minimal pour le widget - PAS de fond noir global */}
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background: transparent !important;
          overflow: hidden;
          font-family: Inter, system-ui, -apple-system, sans-serif;
        }
        
        /* Import des animations nécessaires */
        @keyframes bounceInSimple {
          0% { opacity: 0; transform: scale(0.8); }
          60% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes expandSimple {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slideInMessage {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes avatarPop {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes typingSlideIn {
          0% { opacity: 0; transform: translateY(10px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes bounceDots {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.7; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        
        @keyframes slideUpFade {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-bounce-in { animation: bounceInSimple 0.4s ease-out; }
        .animate-expand-from-button { animation: expandSimple 0.3s ease-out; }
        .animate-slide-in-message { animation: slideInMessage 0.2s ease-out forwards; opacity: 0; }
        .animate-avatar-pop { animation: avatarPop 0.2s ease-out forwards; opacity: 0; }
        .animate-slide-up { animation: slideUp 0.3s ease-out; animation-delay: 0.1s; animation-fill-mode: both; opacity: 0; }
        .animate-typing-bubble { animation: typingSlideIn 0.3s ease-out forwards; opacity: 0; }
        .animate-bounceDots { animation: bounceDots 1.2s infinite ease-in-out; }
        .animate-slide-up-fade { animation: slideUpFade 0.2s ease-out forwards; }
        .animate-button-hover:hover:not(:disabled) { transform: scale(1.05); }
        .animate-input-focus:focus { transform: scale(1.01); }
        
        /* Styles du chat widget */
        .chat-widget {
          position: fixed;
          bottom: 0;
          right: 0;
          z-index: 9999;
          font-family: Inter, system-ui, sans-serif;
        }
        
        .chat-button {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: linear-gradient(135deg, var(--primary-color, #3b82f6), color-mix(in srgb, var(--primary-color, #3b82f6) 80%, #06b6d4));
        }
        
        .chat-window {
          position: fixed;
          bottom: 0;
          right: 0;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: bottom right;
          display: flex;
          flex-direction: column;
          width: 380px;
          height: 600px;
          max-height: calc(100vh - 50px);
          background: rgba(17, 24, 39, 0.95);
          backdrop-filter: blur(20px);
        }
        
        /* Tous les autres styles nécessaires... */
        /* (Je les abrège pour la lisibilité, mais tu peux copier depuis ton globals.css) */
      `}</style>

      {/* Script de communication avec le parent */}
      <script dangerouslySetInnerHTML={{
        __html: `
          // 📡 Communication avec le widget-client.js
          let isWidgetOpen = false;
          
          // Signaler que le widget est prêt
          window.addEventListener('DOMContentLoaded', function() {
            parent.postMessage({
              type: 'WIDGET_READY',
              data: { width: 380, height: 600 }
            }, '*');
          });
          
          // 🆕 NOUVEAU: Détecter les changements d'état du widget
          const observer = new MutationObserver(function(mutations) {
            const chatButton = document.querySelector('.chat-button');
            const chatWindow = document.querySelector('.chat-window');
            
            // Widget ouvert = bouton absent ET fenêtre présente
            const isNowOpen = !chatButton && chatWindow;
            // Widget fermé = bouton présent ET fenêtre absente  
            const isNowClosed = chatButton && !chatWindow;
            
            if (isNowOpen && !isWidgetOpen) {
              isWidgetOpen = true;
              parent.postMessage({
                type: 'WIDGET_OPEN',
                data: { width: 380, height: 600 }
              }, '*');
            } else if (isNowClosed && isWidgetOpen) {
              isWidgetOpen = false;
              parent.postMessage({
                type: 'WIDGET_CLOSE',
                data: {}
              }, '*');
            }
          });
          
          // Observer les changements dans le DOM
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
        `
      }} />

      {/* Le widget ChatWidget normal */}
      <div style={{ background: 'transparent', height: '100vh', width: '100vw' }}>
        <ChatWidget config={config} />
      </div>
    </>
  );
};

export default async function WidgetPage({ params }: { params: Promise<{ widgetId: string }> }) {
  const resolvedParams = await params;
  await connectToDatabase();
  const rawConfig = await ChatbotConfig.findById(resolvedParams.widgetId).lean<ChatWidgetConfig>();
  if (!rawConfig) return notFound();
  const config = JSON.parse(JSON.stringify(rawConfig));

  return <WidgetWithCommunication config={config} />;
}