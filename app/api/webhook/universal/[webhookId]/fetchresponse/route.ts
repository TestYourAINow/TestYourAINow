// app/api/webhook/universal/[webhookId]/fetchresponse/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAIResponse } from '@/lib/redisCache';

export async function POST(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const { webhookId } = params;
    
    console.log(`🔍 [UNIVERSAL] Fetchresponse for ID: ${webhookId}`);
    
    // Parser le body (JSON ou form-data)
    const contentType = req.headers.get('content-type') || '';
    let data: any;
    
    if (contentType.includes('application/json')) {
      data = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      data = Object.fromEntries(formData);
    } else {
      try {
        data = await req.json();
      } catch {
        return NextResponse.json({
          text: "Unsupported content type.",
          success: false
        }, { status: 400 });
      }
    }

    // Extraire l'ID utilisateur (essayer plusieurs formats)
    const userId = 
      data.From || 
      data.from || 
      data.contactId || 
      data.contact_id || 
      data.userId || 
      data.user_id || 
      'anonymous';
    
    const conversationId = `${webhookId}_${userId}`;

    console.log(`🔍 Fetching response for ${conversationId}`);

    const aiResponse = await getAIResponse(conversationId);
    
    if (aiResponse) {
      console.log(`✅ Response found`);
      
      return NextResponse.json({
        text: aiResponse,
        success: true,
        response: aiResponse,
        status: "completed"
      });
    } else {
      console.log(`⏳ Response not ready, retrying...`);
      
      // Attendre 3 secondes et retry
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const aiResponseRetry = await getAIResponse(conversationId);
      if (aiResponseRetry) {
        return NextResponse.json({
          text: aiResponseRetry,
          success: true,
          status: "completed"
        });
      }
      
      return NextResponse.json({
        text: "Processing your message...",
        success: false,
        pending: true,
        status: "processing"
      });
    }

  } catch (error) {
    console.error('❌ [UNIVERSAL] Fetchresponse error:', error);
    return NextResponse.json({
      text: "Sorry, an error occurred.",
      success: false
    });
  }
}

export async function GET(req: NextRequest, context: any) {
  return POST(req, context);
}