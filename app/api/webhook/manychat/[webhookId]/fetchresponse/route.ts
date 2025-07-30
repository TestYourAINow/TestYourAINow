import { NextRequest, NextResponse } from 'next/server';
import { getResponse, listPendingResponses } from '@/lib/responseCache'; // 🆕 Import du cache partagé

// 🔄 POST - Récupérer la réponse (2ème External Request)
export async function POST(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const { webhookId } = params;
    
    console.log(`🔍 FETCHRESPONSE POST for ID: ${webhookId}`);
    console.log(`🔗 Full URL: ${req.url}`);
    
    // 1. Récupérer et parser le body
    const body = await req.text();
    const data = JSON.parse(body);
    
    console.log(`📄 Fetchresponse data:`, JSON.stringify(data, null, 2));

    // 2. Extraire contactId du body (votre format)
    const userId = data.contactId || data.user_id || data.subscriber_id || 'anonymous';
    const conversationId = `${webhookId}_${userId}`;

    console.log(`🔍 Fetching response for ${conversationId}`);
    console.log(`📋 Available responses:`, listPendingResponses());

    // 3. 🆕 Utiliser le cache partagé
    const aiResponse = getResponse(conversationId);
    console.log(`🎯 Found response:`, aiResponse ? 'YES' : 'NO');
    
    if (aiResponse) {
      console.log(`✅ Response found and returned for ${conversationId}: "${aiResponse.substring(0, 100)}..."`);
      
      return NextResponse.json({
        text: aiResponse,
        success: true,
        response: aiResponse,
        status: "completed"
      });
    } else {
      // Réponse pas encore prête
      console.log(`⏳ Response not ready yet for ${conversationId}`);
      
      return NextResponse.json({
        text: "Je traite votre message, un instant s'il vous plaît...",
        success: false,
        pending: true,
        status: "processing"
      });
    }

  } catch (error) {
    console.error('❌ Fetchresponse error:', error);
    return NextResponse.json({
      text: "Désolé, une erreur est survenue.",
      success: false
    });
  }
}

// 🔄 GET - Compatibilité
export async function GET(req: NextRequest, context: any) {
  // Rediriger vers POST
  return POST(req, context);
}