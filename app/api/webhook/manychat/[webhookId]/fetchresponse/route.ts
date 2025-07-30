import { NextRequest, NextResponse } from 'next/server';
import { getAIResponse, listPendingAIResponses } from '@/lib/redisCache'; // 🚀 Redis Pro

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
    console.log(`📋 Available responses:`, await listPendingAIResponses());

    // 3. 🚀 Utiliser Redis Pro
    const aiResponse = await getAIResponse(conversationId);
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
      // 🚀 RETRY LOGIC avec Redis
      console.log(`⏳ Response not ready yet for ${conversationId}, checking if OpenAI is still processing...`);
      
      // Attendre 3 secondes et re-checker une fois
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const aiResponseRetry = await getAIResponse(conversationId);
      if (aiResponseRetry) {
        console.log(`✅ Response found on retry for ${conversationId}: "${aiResponseRetry.substring(0, 100)}..."`);
        
        return NextResponse.json({
          text: aiResponseRetry,
          success: true,
          response: aiResponseRetry,
          status: "completed"
        });
      }
      
      // Toujours pas prêt après retry
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