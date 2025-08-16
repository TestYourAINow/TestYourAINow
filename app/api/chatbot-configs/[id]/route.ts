// app/api/chatbot-configs/[id]/route.ts - ROUTE POUR UN WIDGET SPÉCIFIQUE (ACCÈS PUBLIC)

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ChatbotConfig } from '@/models/ChatbotConfig';

export async function GET(
  req: NextRequest,
  context: any
) {
  const params = await context.params;
  const configId = params.id;

  try {
    await connectToDatabase();
    
    console.log(`📡 Loading public widget config: ${configId}`);
    
    // 🔓 ACCÈS PUBLIC pour les widgets (pas de session check)
    // 🎯 SEULEMENT les widgets ACTIFS
    const rawConfig = await ChatbotConfig.findOne({ 
      _id: configId,
      isActive: true 
    }).lean();
    
    if (!rawConfig) {
      console.error(`❌ Config not found or inactive: ${configId}`);
      return NextResponse.json({
        success: false,
        error: 'Widget not found or inactive'
      }, { status: 404 });
    }

    // 🔧 CONVERSION PROPRE POUR ÉVITER LES ERREURS TYPESCRIPT
    const config = JSON.parse(JSON.stringify(rawConfig));

    console.log(`✅ Config loaded successfully: ${config.name}`);
    
    // 📊 Mettre à jour lastActivity (optionnel)
    await ChatbotConfig.findByIdAndUpdate(configId, { 
      lastActivity: new Date() 
    });
    
    // 🎯 RETOURNER TOUS LES CHAMPS PUBLICS (PAS LES MÉTADONNÉES SENSIBLES)
    return NextResponse.json({
      success: true,
      config: {
        _id: config._id.toString(),
        name: config.name,
        avatar: config.avatar,
        welcomeMessage: config.welcomeMessage,
        placeholderText: config.placeholderText,
        typingText: config.typingText,
        theme: config.theme,
        primaryColor: config.primaryColor,
        width: config.width,
        height: config.height,
        placement: config.placement,
        popupMessage: config.popupMessage,
        popupDelay: config.popupDelay,
        showPopup: config.showPopup,
        showWelcomeMessage: config.showWelcomeMessage,
        selectedAgent: config.selectedAgent,
        chatTitle: config.chatTitle,
        subtitle: config.subtitle,
        // ❌ PAS d'infos sensibles : userId, deployedAt, lastActivity, timestamps
      }
    }, {
      headers: {
        // 🔓 Headers pour permettre l'accès public iframe
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Cache-Control": "public, max-age=300", // Cache 5 min
        "X-Frame-Options": "ALLOWALL" // 🎯 PERMET IFRAME
      }
    });

  } catch (error) {
    console.error(`❌ Error loading config ${configId}:`, error);
    
    return NextResponse.json({
      success: false,
      error: 'Server error'
    }, { status: 500 });
  }
}