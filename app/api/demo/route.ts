// app/api/demo/route.ts - VERSION CORRIGÉE
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { Demo } from '@/models/Demo';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const demoCount = await Demo.countDocuments({ userId: session.user.id });
    if (demoCount >= 15) {
      return NextResponse.json({ message: 'Demo limit reached (15 max)' }, { status: 403 });
    }

    const body = await req.json();
    console.log('🔍 Creating demo with body:', body); // DEBUG

    const {
      name,
      agentId,
      theme,
      color,
      avatarUrl,
      showWelcome,
      welcomeMessage,
      placeholderText,
      chatTitle,
      subtitle,
      showPopup,
      popupMessage,
      popupDelay,
      usageLimit,
      customDomain, // ✅ PAS DE || undefined ICI
    } = body;

    // ✅ VALIDATION ET NETTOYAGE
    const finalLimit = Math.min(Number(usageLimit || 150), 150);
    const cleanCustomDomain = customDomain && customDomain.trim() !== '' ? customDomain.trim() : null;

    console.log('🔍 Processed customDomain:', cleanCustomDomain); // DEBUG

    const demoData: any = {
      userId: session.user.id,
      name: name || 'Demo',
      agentId,
      
      // Apparence
      theme: theme || 'dark',
      color: color || '#007bff',
      avatarUrl: avatarUrl || '',
      
      // Messages
      showWelcome: showWelcome !== undefined ? showWelcome : true,
      welcomeMessage: welcomeMessage || 'Hello! How can I help you today?',
      placeholderText: placeholderText || 'Type your message...',
      
      // Chat info
      chatTitle: chatTitle || 'Assistant IA',
      subtitle: subtitle || 'En ligne',
      
      // Popup
      showPopup: showPopup !== undefined ? showPopup : true,
      popupMessage: popupMessage || 'Hello! Need any help?',
      popupDelay: popupDelay || 2,
      
      // Usage
      usageLimit: finalLimit,
      usedCount: 0,
      
      // Dates
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // expire dans 7 jours
    };

    // ✅ AJOUTER LE CUSTOM DOMAIN SEULEMENT S'IL EXISTE
    if (cleanCustomDomain) {
      demoData.customDomain = cleanCustomDomain;
      demoData.domainStatus = 'pending';
    }

    console.log('🔍 Final demo data:', demoData); // DEBUG

    const demo = await Demo.create(demoData);

    console.log('✅ Demo created successfully:', demo._id); // DEBUG

    return NextResponse.json({ id: demo._id }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Error creating demo:', error);
    
    // ✅ RETOUR D'ERREUR PLUS DÉTAILLÉ
    return NextResponse.json({ 
      message: 'Failed to create demo',
      error: error.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}