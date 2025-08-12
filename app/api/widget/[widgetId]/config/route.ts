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
      }, { status: 404 });
    }

    // Vérifier si le widget est actif
    if (!config.isActive) {
      return NextResponse.json({ 
        error: 'Widget is not active' 
      }, { status: 403 });
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
    });
    
  } catch (error) {
    console.error('Error loading widget config:', error);
    return NextResponse.json({ 
      error: 'Server error' 
    }, { status: 500 });
  }
}