import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Connection } from '@/models/Connection';
import { Agent } from '@/models/Agent';
import { AgentKnowledge } from '@/models/AgentKnowledge';
import { createAgentOpenAIForWebhook } from '@/lib/openai';
import { storeResponse } from '@/lib/responseCache'; // 🆕 Import du cache partagé

// 📝 Types pour les messages OpenAI
type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

// 🤖 Traiter le message avec l'IA
async function processWithAI(agent: any, userMessage: string, userId: string, conversationId: string) {
  try {
    console.log(`🤖 Processing message for agent ${agent._id} with user ${userId}`);
    
    // 1. Créer l'instance OpenAI
    const { openai, error } = await createAgentOpenAIForWebhook(agent);
    if (!openai) {
      console.error(`❌ OpenAI setup failed: ${error}`);
      storeResponse(conversationId, "Désolé, problème de configuration. Contactez l'administrateur.");
      return;
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
    
    // 5. 🆕 Stocker la réponse dans le cache partagé
    storeResponse(conversationId, response);
    
  } catch (error: any) {
    console.error('❌ AI processing error:', error);
    
    let errorMessage = "Désolé, je rencontre un problème technique. Réessayez dans quelques instants.";
    
    if (error.status === 401) {
      errorMessage = "Configuration incorrecte de l'API key. Contactez l'administrateur.";
    } else if (error.status === 429) {
      errorMessage = "Trop de requêtes en cours. Réessayez dans quelques instants.";
    } else if (error.status === 500) {
      errorMessage = "Problème avec le service OpenAI. Réessayez plus tard.";
    }
    
    // Stocker le message d'erreur
    storeResponse(conversationId, errorMessage);
  }
}

// 📨 POST - SEULEMENT pour recevoir les messages (1er External Request)
export async function POST(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const { webhookId } = params;
    
    console.log(`📨 Webhook SEND for ID: ${webhookId}`);
    console.log(`🔗 Full URL: ${req.url}`);
    
    await connectToDatabase();

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
    processWithAI(agent, userMessage, userId, conversationId);

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

// 🔄 GET - Pas utilisé mais on garde pour compatibilité
export async function GET() {
  return NextResponse.json({ message: 'Use POST method' }, { status: 405 });
}