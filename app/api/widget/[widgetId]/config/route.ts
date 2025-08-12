// app/api/widget/[widgetId]/config/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ChatbotConfig } from "@/models/ChatbotConfig";

interface ChatbotConfigDocument {
  _id: string;
  userId: string;
  name: string;
  avatar?: string;
  welcomeMessage?: string;
  placeholderText?: string;
  typingText?: string;
  theme: 'light' | 'dark';
  primaryColor: string;
  width: number;
  height: number;
  placement: string;
  popupMessage?: string;
  popupDelay: number;
  showPopup: boolean;
  showWelcomeMessage: boolean;
  selectedAgent: string;
  chatTitle?: string;
  subtitle?: string;
  isActive: boolean;
}

// 🌐 CORS Headers - NOUVEAU
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-public-kind, x-widget-id, x-widget-token',
  'Access-Control-Max-Age': '86400',
};

// ✅ OPTIONS handler pour preflight requests - NOUVEAU
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    const { widgetId } = params;
    
    await connectToDatabase();
    
    // Récupérer la config du widget
    const config = await ChatbotConfig.findById(widgetId).lean() as ChatbotConfigDocument | null;
    
    if (!config) {
      return NextResponse.json({ 
        error: 'Widget not found' 
      }, { 
        status: 404,
        headers: corsHeaders // 🆕 CORS ajouté
      });
    }

    // Vérifier si le widget est actif
    if (!config.isActive) {
      return NextResponse.json({ 
        error: 'Widget is not active' 
      }, { 
        status: 403,
        headers: corsHeaders // 🆕 CORS ajouté
      });
    }

    // Retourner la config complète pour le widget
    const widgetConfig = {
      _id: config._id,
      name: config.name,
      avatar: config.avatar || '/Default Avatar.png',
      welcomeMessage: config.welcomeMessage || 'Hello! How can I help you today?',
      placeholderText: config.placeholderText || 'Type your message...',
      typingText: config.typingText || 'AI is typing...',
      theme: config.theme || 'light',
      primaryColor: config.primaryColor || '#3b82f6',
      width: config.width || 380,
      height: config.height || 600,
      placement: config.placement || 'bottom-right',
      popupMessage: config.popupMessage || 'Hi! Need any help?',
      popupDelay: config.popupDelay || 2,
      showPopup: config.showPopup !== undefined ? config.showPopup : true,
      showWelcomeMessage: config.showWelcomeMessage !== undefined ? config.showWelcomeMessage : true,
      selectedAgent: config.selectedAgent,
      chatTitle: config.chatTitle || 'AI Assistant',
      subtitle: config.subtitle || 'Online'
    };

    return NextResponse.json({ 
      success: true,
      config: widgetConfig 
    }, {
      headers: corsHeaders // 🆕 CORS ajouté
    });
    
  } catch (error) {
    console.error('Error loading widget config:', error);
    return NextResponse.json({ 
      error: 'Server error' 
    }, { 
      status: 500,
      headers: corsHeaders // 🆕 CORS ajouté
    });
  }
}