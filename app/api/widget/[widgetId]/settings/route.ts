// app/api/widget/[widgetId]/settings/route.ts - Comme buildmyagent.io
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ChatbotConfig } from "@/models/ChatbotConfig";

// 🌐 CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

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
    
    const config = await ChatbotConfig.findById(widgetId).lean() as any;
    
    if (!config) {
      return NextResponse.json({ 
        error: 'Widget not found' 
      }, { 
        status: 404,
        headers: corsHeaders 
      });
    }

    if (!config.isActive) {
      return NextResponse.json({ 
        error: 'Widget is not active' 
      }, { 
        status: 403,
        headers: corsHeaders 
      });
    }

    // 🎯 FORMAT SETTINGS comme buildmyagent.io
    const settings = {
      widgetId: config._id,
      template: 'professional', // Template fixe pour l'instant
      theme: config.theme || 'light',
      primaryColor: config.primaryColor || '#3b82f6',
      width: config.width || 380,
      height: config.height || 600,
      placement: config.placement || 'bottom-right',
      
      // Settings de chat
      name: config.name,
      chatTitle: config.chatTitle || 'AI Assistant',
      subtitle: config.subtitle || 'Online',
      avatar: config.avatar || `${req.nextUrl.origin}/Default Avatar.png`,
      welcomeMessage: config.welcomeMessage || 'Hello! How can I help you today?',
      placeholderText: config.placeholderText || 'Type your message...',
      
      // Settings popup
      showPopup: config.showPopup !== undefined ? config.showPopup : true,
      popupMessage: config.popupMessage || 'Hi! Need any help?',
      popupDelay: config.popupDelay || 2,
      showWelcomeMessage: config.showWelcomeMessage !== undefined ? config.showWelcomeMessage : true,
      
      // Agent connecté
      selectedAgent: config.selectedAgent,
      
      // Métadonnées
      isActive: config.isActive,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt
    };

    return NextResponse.json({ 
      success: true,
      settings,
      config: settings // Compatibility
    }, {
      headers: corsHeaders
    });
    
  } catch (error) {
    console.error('Error loading widget settings:', error);
    return NextResponse.json({ 
      error: 'Server error' 
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}