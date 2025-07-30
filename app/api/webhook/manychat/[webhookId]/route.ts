import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Connection } from '@/models/Connection';
import { Agent } from '@/models/Agent';
import { AgentKnowledge } from '@/models/AgentKnowledge';
import { createAgentOpenAIForWebhook } from '@/lib/openai';

// 📝 Types pour les messages OpenAI
type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

// 📝 Structure temporaire pour stocker les réponses en attente
const pendingResponses = new Map<string, string>();

// 🤖 Traiter le message avec l'IA
async function processWithAI(agent: any, userMessage: string, userId: string) {
  try {
    console.log(`🤖 Processing message for agent ${agent._id} with user ${userId}`);
    
    // 1. Créer l'instance OpenAI
    const { openai, error } = await createAgentOpenAIForWebhook(agent);
    if (!openai) {
      console.error(`❌ OpenAI setup failed: ${error}`);
      throw new Error(error || 'OpenAI setup failed');
    }

    console.log(`✅ OpenAI instance created successfully for agent ${agent._id}`);

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

    console.log(`📚 Knowledge loaded: ${knowledge.length} files, ${totalUsedChars} chars`);

    // 3. Construire les messages
    const messages: ChatMessage[] = [
      { role: 'system' as const, content: agent.finalPrompt || '' },
      { role: 'system' as const, content: `Voici ce que tu dois savoir :\n${knowledgeText}` },
      { role: 'user' as const, content: userMessage }
    ];

    console.log(`💬 Calling OpenAI with model: ${agent.openaiModel}`);

    // 4. Appel OpenAI
    const completion = await openai.chat.completions.create({
      model: agent.openaiModel,
      temperature: agent.temperature,
      top_p: agent.top_p,
      messages,
    });

    const response = completion.choices[0]?.message?.content || "Je n'ai pas pu répondre.";
    console.log(`✅ OpenAI response received: ${response.substring(0, 100)}...`);
    
    return response;
    
  } catch (error: any) {
    console.error('❌ AI processing error:', error);
    
    if (error.status === 401) {
      return "Configuration incorrecte de l'API key. Contactez l'administrateur.";
    } else if (error.status === 429) {
      return "Trop de requêtes en cours. Réessayez dans quelques instants.";
    } else if (error.status === 500) {
      return "Problème avec le service OpenAI. Réessayez plus tard.";
    }
    
    return "Désolé, je rencontre un problème technique. Réessayez dans quelques instants.";
  }
}

// 📨 POST - Gère les 2 types de requêtes selon l'URL
export async function POST(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const { webhookId } = params;
    
    // 🔍 Détecter le type de requête selon l'URL
    const url = new URL(req.url);
    const isFetchRequest = url.pathname.includes('/fetchresponse') || url.searchParams.has('fetch');
    
    console.log(`📨 Webhook ${isFetchRequest ? 'FETCH' : 'SEND'} for ID: ${webhookId}`);
    console.log(`🔗 Full URL: ${req.url}`);
    
    await connectToDatabase();

    // ==================== FETCH RESPONSE (2ème POST) ====================
    if (isFetchRequest) {
      const body = await req.text();
      const data = JSON.parse(body);
      
      // Extraire contactId du body (votre format)
      const userId = data.contactId || data.user_id || data.subscriber_id || 'anonymous';
      const conversationId = `${webhookId}_${userId}`;

      console.log(`🔍 Fetching response for ${conversationId}`);

      // Vérifier si la réponse est prête
      const aiResponse = pendingResponses.get(conversationId);
      
      if (aiResponse) {
        // Nettoyer la réponse utilisée
        pendingResponses.delete(conversationId);
        
        console.log(`✅ Response found and returned for ${conversationId}`);
        
        return NextResponse.json({
          text: aiResponse,
          success: true,
          // 🆕 Format compatible avec l'autre site
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
    }

    // ==================== SEND MESSAGE (1er POST) ====================
    
    // 1. Récupérer et parser le body
    const body = await req.text();
    const data = JSON.parse(body);

    console.log(`📄 Webhook data:`, JSON.stringify(data, null, 2));

    // 2. Trouver la connection
    const connection = await Connection.findOne({ webhookId, isActive: true });
    if (!connection) {
      console.error(`❌ Connection not found for webhookId: ${webhookId}`);
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    console.log(`✅ Connection found: ${connection.name}`);

    // 3. Récupérer l'agent
    const agent = await Agent.findById(connection.aiBuildId);
    if (!agent) {
      console.error(`❌ Agent not found for ID: ${connection.aiBuildId}`);
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    console.log(`✅ Agent found: ${agent.name}, API Key: ${agent.apiKey ? 'configured' : 'missing'}`);

    // 4. Extraire le message (votre format)
    const userMessage = data.message || data.text || '';
    const userId = data.contactId || data.user_id || data.subscriber_id || 'anonymous';
    const conversationId = `${webhookId}_${userId}`;

    console.log(`📨 Message from ${userId}: "${userMessage}"`);

    if (!userMessage) {
      console.error(`❌ No message content found in webhook data`);
      return NextResponse.json({ error: 'No message content' }, { status: 400 });
    }

    // 5. Traiter le message avec l'AI (en arrière-plan)
    processWithAI(agent, userMessage, userId)
      .then((aiResponse) => {
        // Stocker la réponse pour le fetchresponse
        pendingResponses.set(conversationId, aiResponse);
        console.log(`✅ AI response ready for ${conversationId}: "${aiResponse.substring(0, 100)}..."`);
        
        // Auto-cleanup après 5 minutes
        setTimeout(() => {
          pendingResponses.delete(conversationId);
          console.log(`🧹 Cleaned up response for ${conversationId}`);
        }, 5 * 60 * 1000);
      })
      .catch((error) => {
        console.error('❌ AI processing failed:', error);
        pendingResponses.set(conversationId, "Désolé, je rencontre un problème technique.");
      });

    // 6. Retourner immédiatement à ManyChat
    return NextResponse.json({ 
      success: true,
      message: 'Message received and processing',
      status: 'received'
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 🔄 GET - Garde la compatibilité pour l'ancien système
export async function GET(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const { webhookId } = params;
    
    // Extraire user_id depuis les query params
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id') || url.searchParams.get('subscriber_id') || 'anonymous';
    const conversationId = `${webhookId}_${userId}`;

    console.log(`🔍 GET - Fetching response for ${conversationId}`);

    // Vérifier si la réponse est prête
    const aiResponse = pendingResponses.get(conversationId);
    
    if (aiResponse) {
      // Nettoyer la réponse utilisée
      pendingResponses.delete(conversationId);
      
      console.log(`✅ GET - Response found and returned for ${conversationId}`);
      
      return NextResponse.json({
        text: aiResponse,
        success: true
      });
    } else {
      // Réponse pas encore prête
      console.log(`⏳ GET - Response not ready yet for ${conversationId}`);
      
      return NextResponse.json({
        text: "Je traite votre message, un instant s'il vous plaît...",
        success: false,
        pending: true
      });
    }

  } catch (error) {
    console.error('❌ GET response error:', error);
    return NextResponse.json({
      text: "Désolé, une erreur est survenue.",
      success: false
    });
  }
}