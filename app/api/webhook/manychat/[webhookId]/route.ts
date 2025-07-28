import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Connection } from '@/models/Connection';
import { Agent } from '@/models/Agent';
import { AgentKnowledge } from '@/models/AgentKnowledge';
import { createUserOpenAI } from '@/lib/openai';
import crypto from 'crypto';

// 📝 Types pour les messages OpenAI
type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

// 📝 Structure temporaire pour stocker les réponses en attente
const pendingResponses = new Map<string, string>();

// 🔐 Vérifier la signature webhook
function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body);
  const expectedSignature = hmac.digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// 🤖 Traiter le message avec l'AI
async function processWithAI(agent: any, userMessage: string, userId: string) {
  try {
    // 1. Créer l'instance OpenAI
    const { openai, error } = await createUserOpenAI();
    if (!openai) {
      throw new Error(error || 'OpenAI setup failed');
    }

    // 2. Récupérer les connaissances de l'agent
    const knowledge = await AgentKnowledge.find({ agentId: agent._id }).sort({ createdAt: -1 });
    
    const MAX_CONTENT_PER_FILE = 15000;
    const MAX_TOTAL_KNOWLEDGE = 80000;
    
    let totalUsedChars = 0;
    const knowledgeText = knowledge
      .map((k) => {
        if (totalUsedChars >= MAX_TOTAL_KNOWLEDGE) return null;
        
        const remainingChars = MAX_TOTAL_KNOWLEDGE - totalUsedChars;
        const maxForThisFile = Math.min(MAX_CONTENT_PER_FILE, remainingChars);
        
        let content = k.content;
        if (content.length > maxForThisFile) {
          content = content.slice(0, maxForThisFile);
        }
        
        totalUsedChars += content.length;
        return `— ${k.fileName} (${k.sourceName || 'Document'}) :\n${content}\n`;
      })
      .filter(Boolean)
      .join('\n');

    // 3. Construire les messages avec types corrects
    const messages: ChatMessage[] = [
      { role: 'system' as const, content: agent.finalPrompt || '' },
      { role: 'system' as const, content: `Voici ce que tu dois savoir :\n${knowledgeText}` },
      { role: 'user' as const, content: userMessage }
    ];

    // 4. Appel OpenAI
    const completion = await openai.chat.completions.create({
      model: agent.openaiModel,
      temperature: agent.temperature,
      top_p: agent.top_p,
      messages,
    });

    return completion.choices[0]?.message?.content || "Je n'ai pas pu répondre.";
    
  } catch (error) {
    console.error('AI processing error:', error);
    return "Désolé, je rencontre un problème technique. Réessayez dans quelques instants.";
  }
}

// 📨 POST - Recevoir les messages de ManyChat
export async function POST(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const { webhookId } = params;
    
    await connectToDatabase();

    // 1. Récupérer le body
    const body = await req.text();
    const data = JSON.parse(body);

    // 2. Trouver la connection
    const connection = await Connection.findOne({ webhookId, isActive: true });
    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // 3. Vérifier la signature webhook (sécurité)
    const signature = req.headers.get('x-webhook-secret') || '';
    if (!verifyWebhookSignature(body, signature, connection.webhookSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 4. Récupérer l'agent
    const agent = await Agent.findById(connection.aiBuildId);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // 5. Extraire les données du message ManyChat
    const userMessage = data.text || data.message || '';
    const userId = data.user_id || data.subscriber_id || 'anonymous';
    const conversationId = `${webhookId}_${userId}`;

    console.log(`📨 Received message from ${userId}: ${userMessage}`);

    if (!userMessage) {
      return NextResponse.json({ error: 'No message content' }, { status: 400 });
    }

    // 6. Traiter le message avec l'AI (en arrière-plan)
    processWithAI(agent, userMessage, userId)
      .then((aiResponse) => {
        // Stocker la réponse pour le fetchresponse
        pendingResponses.set(conversationId, aiResponse);
        console.log(`✅ AI response ready for ${conversationId}`);
        
        // Auto-cleanup après 5 minutes
        setTimeout(() => {
          pendingResponses.delete(conversationId);
        }, 5 * 60 * 1000);
      })
      .catch((error) => {
        console.error('AI processing failed:', error);
        pendingResponses.set(conversationId, "Désolé, je rencontre un problème technique.");
      });

    // 7. Retourner immédiatement à ManyChat
    return NextResponse.json({ 
      success: true,
      message: 'Message received and processing'
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 🔄 GET - Récupérer la réponse (fetchresponse)
export async function GET(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const { webhookId } = params;
    
    // Extraire user_id depuis les query params
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id') || url.searchParams.get('subscriber_id') || 'anonymous';
    const conversationId = `${webhookId}_${userId}`;

    console.log(`🔍 Fetching response for ${conversationId}`);

    // Vérifier si la réponse est prête
    const aiResponse = pendingResponses.get(conversationId);
    
    if (aiResponse) {
      // Nettoyer la réponse utilisée
      pendingResponses.delete(conversationId);
      
      return NextResponse.json({
        text: aiResponse,
        success: true
      });
    } else {
      // Réponse pas encore prête
      return NextResponse.json({
        text: "Je traite votre message, un instant s'il vous plaît...",
        success: false,
        pending: true
      });
    }

  } catch (error) {
    console.error('Fetch response error:', error);
    return NextResponse.json({
      text: "Désolé, une erreur est survenue.",
      success: false
    });
  }
}