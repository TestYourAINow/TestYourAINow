import { ChatbotConfig } from "@/models/ChatbotConfig";
import { connectToDatabase } from "@/lib/db";
import { ChatWidgetConfig } from "@/types/ChatWidgetConfig";
import ChatWidget from "@/components/ChatWidget";
import { notFound } from "next/navigation";

export default async function WidgetPage({ params }: { params: Promise<{ widgetId: string }> }) {
  const resolvedParams = await params;
  await connectToDatabase();
  const rawConfig = await ChatbotConfig.findById(resolvedParams.widgetId).lean<ChatWidgetConfig>();
  if (!rawConfig) return notFound();
  const config = JSON.parse(JSON.stringify(rawConfig));

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>AI Chat Widget</title>
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            html, body {
              width: 100%;
              height: 100%;
              background: transparent !important;
              overflow: hidden;
              font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            main {
              width: 100%;
              height: 100%;
              background: transparent !important;
              overflow: hidden;
            }
            
            /* Import only the chat widget styles from your global CSS */
            .chat-widget {
              position: static !important;
              bottom: auto !important;
              right: auto !important;
              z-index: auto !important;
              font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
            }
            
            .chat-window {
              position: static !important;
              bottom: auto !important;
              right: auto !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              overflow: hidden;
              transform: none !important;
              display: flex;
              flex-direction: column;
              width: 100% !important;
              height: 100% !important;
              max-width: none !important;
              border: none;
              background: rgba(17, 24, 39, 0.95);
              backdrop-filter: blur(20px);
            }
            
            .chat-window.open {
              opacity: 1 !important;
              transform: none !important;
              pointer-events: auto;
            }
            
            .chat-window.closed {
              opacity: 1 !important;
              transform: none !important;
              pointer-events: auto;
            }
            
            .chat-window.dark {
              background: rgba(17, 24, 39, 0.98);
            }
            
            /* Copy all your existing chat styles here... */
            .chat-header {
              height: 70px;
              padding: 12px 16px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              flex-shrink: 0;
              position: relative;
              background: linear-gradient(135deg, var(--primary-color, #3b82f6) 0%, color-mix(in srgb, var(--primary-color, #3b82f6) 85%, #06b6d4) 100%);
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .chat-header-content {
              display: flex;
              align-items: center;
              flex: 1;
              min-width: 0;
              gap: 12px;
            }
            
            .chat-avatar-container {
              position: relative;
              flex-shrink: 0;
            }
            
            .chat-avatar {
              width: 48px;
              height: 48px;
              border-radius: 50%;
              border: 3px solid rgba(255, 255, 255, 0.3);
              object-fit: cover;
              display: block;
              background: rgba(255, 255, 255, 0.1);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }
            
            .chat-status {
              width: 14px;
              height: 14px;
              background: #10b981;
              border-radius: 50%;
              border: 3px solid white;
              position: absolute;
              bottom: 0;
              right: 0;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }
            
            .chat-info {
              flex: 1;
              min-width: 0;
              display: flex;
              flex-direction: column;
              justify-content: center;
              overflow: visible;
              padding: 2px 0;
            }
            
            .chat-title {
              font-weight: 600;
              font-size: 16px;
              color: white;
              margin: 0;
              line-height: 1.4;
              white-space: nowrap;
              overflow: visible;
              text-overflow: ellipsis;
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            }
            
            .chat-subtitle {
              font-size: 13px;
              color: rgba(255, 255, 255, 0.85);
              margin: 2px 0 0 0;
              line-height: 1.3;
              white-space: nowrap;
              overflow: visible;
              text-overflow: ellipsis;
              font-weight: 400;
            }
            
            .chat-actions {
              display: flex;
              gap: 6px;
              flex-shrink: 0;
              align-items: center;
            }
            
            .chat-action-btn {
              width: 36px;
              height: 36px;
              border: none;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.15);
              color: rgba(255, 255, 255, 0.9);
              cursor: pointer;
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              display: flex;
              align-items: center;
              justify-content: center;
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .chat-action-btn:hover {
              background: rgba(255, 255, 255, 0.25);
              color: white;
              transform: scale(1.05);
              border-color: rgba(255, 255, 255, 0.2);
            }
            
            .chat-messages {
              flex: 1;
              overflow-y: auto;
              padding: 16px;
              background: rgba(248, 250, 252, 0.95);
              min-height: 0;
              backdrop-filter: blur(10px);
            }
            
            .chat-messages.dark {
              background: rgba(17, 24, 39, 0.95);
            }
            
            .messages-container {
              transition: opacity 0.3s ease;
            }
            
            .messages-container.show {
              opacity: 1;
            }
            
            .chat-bubble {
              padding: 12px 16px;
              border-radius: 20px;
              line-height: 1.5;
              word-break: break-word;
              margin-bottom: 2px;
              white-space: pre-line;
              display: inline-block;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              border: 1px solid rgba(0, 0, 0, 0.05);
            }
            
            .chat-bubble.bot {
              background: linear-gradient(135deg, #e5e7eb, #f3f4f6);
              color: #111827;
            }
            
            .chat-bubble.user {
              background: linear-gradient(135deg, var(--primary-color, #3b82f6), color-mix(in srgb, var(--primary-color, #3b82f6) 90%, #06b6d4));
              color: white;
              align-self: flex-end;
            }
            
            .chat-messages.dark .chat-bubble.bot {
              background: linear-gradient(135deg, #374151, #4b5563);
              color: white;
              border-color: rgba(75, 85, 99, 0.3);
            }
            
            .chat-timestamp {
              font-size: 11px;
              color: #9ca3af;
              margin-top: 2px;
              font-weight: 500;
            }
            
            .chat-timestamp.bot {
              text-align: left;
              padding-left: 4px;
            }
            
            .chat-timestamp.user {
              text-align: right;
              padding-right: 4px;
            }
            
            .chat-input-area {
              padding: 16px;
              border-top: 1px solid rgba(229, 231, 235, 0.5);
              background: rgba(255, 255, 255, 0.95);
              flex-shrink: 0;
              backdrop-filter: blur(20px);
            }
            
            .chat-input-area.dark {
              border-top-color: rgba(75, 85, 99, 0.5);
              background: rgba(17, 24, 39, 0.95);
            }
            
            .chat-input-container {
              display: flex;
              gap: 12px;
              align-items: flex-end;
            }
            
            .chat-input {
              flex: 1;
              padding: 12px 16px;
              border: 1px solid rgba(209, 213, 219, 0.8);
              border-radius: 24px;
              font-size: 14px;
              outline: none;
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              resize: none;
              max-height: 120px;
              min-height: 40px;
              background: rgba(255, 255, 255, 0.9);
              color: #111827;
              backdrop-filter: blur(10px);
            }
            
            .chat-input:focus {
              border-color: var(--primary-color, #3b82f6);
              box-shadow: 
                0 0 0 3px color-mix(in srgb, var(--primary-color, #3b82f6) 20%, transparent),
                0 4px 6px -1px rgba(0, 0, 0, 0.1);
              background: rgba(255, 255, 255, 1);
            }
            
            .chat-input.dark {
              background: rgba(55, 65, 81, 0.9);
              border-color: rgba(75, 85, 99, 0.8);
              color: white;
            }
            
            .chat-input.dark::placeholder {
              color: #9ca3af;
            }
            
            .chat-input.dark:focus {
              background: rgba(55, 65, 81, 1);
              border-color: var(--primary-color, #3b82f6);
            }
            
            .chat-send-btn {
              width: 40px;
              height: 40px;
              border: none;
              border-radius: 50%;
              cursor: pointer;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              background: linear-gradient(135deg, var(--primary-color, #3b82f6), color-mix(in srgb, var(--primary-color, #3b82f6) 85%, #06b6d4));
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .chat-send-btn:hover:not(:disabled) {
              transform: scale(1.1);
              box-shadow: 
                0 4px 12px rgba(0, 0, 0, 0.2),
                0 0 0 3px color-mix(in srgb, var(--primary-color, #3b82f6) 20%, transparent);
            }
            
            .chat-send-btn:disabled {
              opacity: 0.5;
              cursor: not-allowed;
              transform: none;
            }
            
            /* Custom scrollbar */
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(17, 24, 39, 0.3);
              border-radius: 16px;
            }
            
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: linear-gradient(to bottom, rgba(59, 130, 246, 0.6), rgba(6, 182, 212, 0.6));
              border-radius: 16px;
              border: 1px solid rgba(75, 85, 99, 0.3);
            }
            
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(to bottom, rgba(59, 130, 246, 0.8), rgba(6, 182, 212, 0.8));
            }
            
            /* Animations */
            @keyframes bounceDots {
              0%, 80%, 100% { 
                transform: translateY(0);
              } 
              40% { 
                transform: translateY(-8px);
              }
            }
            
            .animate-bounceDots {
              animation: bounceDots 1.4s infinite ease-in-out both;
            }
          `
        }} />
      </head>
      <body>
        <main>
          <ChatWidget config={config} />
        </main>
      </body>
    </html>
  );
}