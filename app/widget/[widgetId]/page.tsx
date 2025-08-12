// app/widget/[widgetId]/page.tsx - VERSION AVEC MODES
import { ChatbotConfig } from "@/models/ChatbotConfig";
import { connectToDatabase } from "@/lib/db";
import { ChatWidgetConfig } from "@/types/ChatWidgetConfig";
import { notFound } from "next/navigation";

// 🔘 COMPOSANT BOUTON
function WidgetButton({ config, onClick }: { config: ChatWidgetConfig; onClick: () => void }) {
  return (
    <div 
      style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        cursor: 'pointer',
        backgroundColor: config.primaryColor,
        borderRadius: '50%',
        color: 'white',
        fontSize: '0',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
    </div>
  );
}

// 💬 COMPOSANT CHAT COMPLET
function WidgetChat({ config }: { config: ChatWidgetConfig }) {
  return (
    <div style={{ width: '100%', height: '100%', fontFamily: 'Inter, sans-serif' }}>
      {/* Import CSS inline pour éviter les 404 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          .widget-chat {
            width: 100%;
            height: 100%;
            background: white;
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          
          .widget-chat.dark {
            background: #1f2937;
          }
          
          .chat-header {
            background: ${config.primaryColor};
            color: white;
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-height: 70px;
          }
          
          .header-content {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
          }
          
          .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.3);
            object-fit: cover;
          }
          
          .chat-info h3 {
            font-size: 16px;
            font-weight: 600;
            margin: 0;
          }
          
          .chat-info p {
            font-size: 12px;
            opacity: 0.9;
            margin: 2px 0 0 0;
          }
          
          .header-actions {
            display: flex;
            gap: 8px;
          }
          
          .action-btn {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
          }
          
          .action-btn:hover {
            background: rgba(255,255,255,0.3);
          }
          
          .messages-area {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            background: #f8f9fa;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          
          .messages-area.dark {
            background: #111827;
          }
          
          .message {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            max-width: 85%;
          }
          
          .message.user {
            align-self: flex-end;
            flex-direction: row-reverse;
          }
          
          .message-avatar {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            object-fit: cover;
            flex-shrink: 0;
          }
          
          .message-bubble {
            padding: 10px 14px;
            border-radius: 16px;
            font-size: 14px;
            line-height: 1.4;
            word-wrap: break-word;
          }
          
          .message-bubble.bot {
            background: #e5e7eb;
            color: #1f2937;
          }
          
          .message-bubble.user {
            background: ${config.primaryColor};
            color: white;
          }
          
          .messages-area.dark .message-bubble.bot {
            background: #374151;
            color: white;
          }
          
          .input-area {
            padding: 16px;
            background: white;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 8px;
            align-items: center;
          }
          
          .input-area.dark {
            background: #1f2937;
            border-color: #374151;
          }
          
          .message-input {
            flex: 1;
            padding: 10px 16px;
            border: 1px solid #d1d5db;
            border-radius: 20px;
            font-size: 14px;
            outline: none;
            font-family: inherit;
          }
          
          .message-input:focus {
            border-color: ${config.primaryColor};
          }
          
          .message-input.dark {
            background: #374151;
            border-color: #4b5563;
            color: white;
          }
          
          .send-button {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: ${config.primaryColor};
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
          }
          
          .send-button:hover {
            transform: scale(1.05);
          }
        `
      }} />
      
      <div className={`widget-chat ${config.theme === 'dark' ? 'dark' : ''}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="header-content">
            <img src={config.avatar} alt="Avatar" className="avatar" />
            <div className="chat-info">
              <h3>{config.chatTitle}</h3>
              <p>{config.subtitle}</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="action-btn" onClick={() => {
              if (window.parent) {
                window.parent.postMessage({ type: 'widget_close' }, '*');
              }
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className={`messages-area ${config.theme === 'dark' ? 'dark' : ''}`}>
          {config.showWelcomeMessage && (
            <div className="message bot">
              <img src={config.avatar} className="message-avatar" />
              <div className="message-bubble bot">
                {config.welcomeMessage}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className={`input-area ${config.theme === 'dark' ? 'dark' : ''}`}>
          <input 
            type="text" 
            className={`message-input ${config.theme === 'dark' ? 'dark' : ''}`}
            placeholder={config.placeholderText}
          />
          <button className="send-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// 🎯 COMPOSANT PRINCIPAL avec gestion des modes
function WidgetContainer({ config, mode }: { config: ChatWidgetConfig; mode: string }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{
        __html: `
          // 📡 Communication avec le parent
          if (window.parent) {
            window.parent.postMessage({ type: 'widget_loaded' }, '*');
          }

          // 🔘 BOUTON: Envoyer clic au parent
          if ('${mode}' === 'button') {
            document.addEventListener('click', function() {
              if (window.parent) {
                window.parent.postMessage({ type: 'widget_button_click' }, '*');
              }
            });
          }
        `
      }} />

      {mode === 'button' ? (
        <WidgetButton 
          config={config} 
          onClick={() => {
            if (window.parent) {
              window.parent.postMessage({ type: 'widget_button_click' }, '*');
            }
          }} 
        />
      ) : (
        <WidgetChat config={config} />
      )}
    </>
  );
}

export default async function WidgetPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ widgetId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  await connectToDatabase();
  
  const rawConfig = await ChatbotConfig.findById(resolvedParams.widgetId).lean<ChatWidgetConfig>();
  if (!rawConfig) return notFound();
  
  const config = JSON.parse(JSON.stringify(rawConfig));
  
  // 🎯 DÉTECTER LE MODE depuis les paramètres URL
  const mode = resolvedSearchParams.mode as string || 'chat';

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{config.chatTitle}</title>
      </head>
      <body style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
        <WidgetContainer config={config} mode={mode} />
      </body>
    </html>
  );
}