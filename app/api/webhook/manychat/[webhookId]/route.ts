import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Connection } from '@/models/Connection';
import { Agent } from '@/models/Agent';
import { AgentKnowledge } from '@/models/AgentKnowledge';
import { Conversation } from '@/models/Conversation'; // 🆕 NOUVEAU
import { createAgentOpenAIForWebhook } from '@/lib/openai';
import { storeAIResponse, storeConversationHistory, getConversationHistory } from '@/lib/redisCache';

// 📝 Types pour les messages OpenAI
type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

// 🎯 NOUVELLE FONCTION - Filtrer les messages de politesse
function isPoliteOnly(content: string): boolean {
  const politeOnlyWords = [
    // Français
    'salut', 'bonjour', 'bonsoir', 'merci', 'ok', 'bye', 'au revoir', 'ciao',
    // Anglais
    'hi', 'hello', 'hey', 'thanks', 'thank you', 'ok', 'okay', 'bye', 'goodbye',
    // Espagnol
    'hola', 'gracias', 'ok', 'adiós', 'chau',
    // Allemand
    'hallo', 'danke', 'ok', 'tschüss'
  ];

  const cleanContent = content.toLowerCase().trim();

  // SEULEMENT si c'est EXACTEMENT un mot de politesse (pas de mots composés)
  return politeOnlyWords.includes(cleanContent);
}

// 🆕 NOUVELLE FONCTION - Stocker dans MongoDB (permanent)
async function storeInMongoDB(
  conversationId: string,
  connectionId: string,
  webhookId: string,
  userId: string,
  userMessage: string,
  aiResponse: string,
  agent: any,
  connection: any
) {
  try {
    console.log(`💾 [MONGODB] Storing conversation: ${conversationId}`);

    // Créer les messages avec filtrage intelligent
    const userMsg = {
      role: 'user' as const,
      content: userMessage,
      timestamp: Date.now(),
      isFiltered: isPoliteOnly(userMessage) // Marquer si c'est de la politesse pure
    };

    const assistantMsg = {
      role: 'assistant' as const,
      content: aiResponse,
      timestamp: Date.now(),
      isFiltered: false // Les réponses IA ne sont jamais filtrées
    };

    // Chercher si la conversation existe déjà
    let conversation = await Conversation.findOne({
      conversationId,
      isDeleted: false
    });

    if (conversation) {
      // 📝 Ajouter les nouveaux messages à la conversation existante
      conversation.messages.push(userMsg, assistantMsg);
      await conversation.save();
      console.log(`✅ [MONGODB] Updated existing conversation: ${conversationId}`);
    } else {
      // 🆕 Créer une nouvelle conversation
      conversation = await Conversation.create({
        conversationId,
        connectionId,
        userId,
        webhookId,
        platform: connection.integrationType,
        agentId: agent._id,
        agentName: agent.name,
        messages: [userMsg, assistantMsg],
        firstMessageAt: new Date(userMsg.timestamp),
        lastMessageAt: new Date(assistantMsg.timestamp),
        lastUserMessageAt: new Date(userMsg.timestamp),
        lastAssistantMessageAt: new Date(assistantMsg.timestamp),
        isDeleted: false
      });
      console.log(`✅ [MONGODB] Created new conversation: ${conversationId}`);
    }

    return conversation;
  } catch (error) {
    console.error(`❌ [MONGODB] Error storing conversation ${conversationId}:`, error);
    // Ne pas faire échouer le webhook si MongoDB fail
    return null;
  }
}

// 🤖 Traiter le message avec l'IA
async function processWithAI(agent: any, userMessage: string, userId: string, conversationId: string, connection: any) {
  try {
    console.log(`🤖 Processing message for agent ${agent._id} with user ${userId}`);

    // 1. Créer l'instance OpenAI
    const { openai, error } = await createAgentOpenAIForWebhook(agent);
    if (!openai) {
      console.error(`❌ OpenAI setup failed: ${error}`);
      const errorMessage = "Désolé, problème technique.";
      await storeAIResponse(conversationId, errorMessage);

      // 🆕 STOCKER L'ERREUR DANS MONGODB AUSSI
      await storeInMongoDB(
        conversationId,
        connection._id.toString(),
        connection.webhookId,
        userId,
        userMessage,
        errorMessage,
        agent,
        connection
      );
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

    // 3. 🧠 Charger l'historique de Redis pour OpenAI (rapide, 10 derniers messages filtrés)
    const conversationHistory = await getConversationHistory(conversationId);
    console.log(`🧠 [REDIS] Conversation history: ${conversationHistory.length} messages`);

    // 🎯 FILTRER L'HISTORIQUE POUR OPENAI (enlever politesses)
    const filteredHistory = conversationHistory
      .filter(msg => !isPoliteOnly(msg.content)) // Filtrer les politesses
      .slice(-10); // Garder seulement les 10 derniers messages utiles

    console.log(`🎯 [FILTERED] Using ${filteredHistory.length} filtered messages for OpenAI context`);

    // Convertir l'historique en format OpenAI
    const historyMessages: ChatMessage[] = filteredHistory.map(msg => ({
      role: msg.role as "user" | "assistant",
      content: msg.content
    }));

    // 4. Construire les messages avec historique filtré
    const messages: ChatMessage[] = [
      { role: 'system' as const, content: agent.finalPrompt || '' },
      { role: 'system' as const, content: `Voici ce que tu dois savoir :\n${knowledgeText}` },
      ...historyMessages, // 🧠 HISTORIQUE FILTRÉ AJOUTÉ !
      { role: 'user' as const, content: userMessage }
    ];

    console.log(`💬 Calling OpenAI with model: ${agent.openaiModel} (${messages.length} messages including ${filteredHistory.length} filtered history)`);

    // 5. Appel OpenAI
    const completion = await openai.chat.completions.create({
      model: agent.openaiModel,
      temperature: agent.temperature,
      top_p: agent.top_p,
      messages,
    });

    const response = completion.choices[0]?.message?.content || "Je n'ai pas pu répondre.";
    console.log(`✅ OpenAI response received: ${response.substring(0, 100)}...`);

    // 6. 🧠 STOCKER DANS REDIS (pour mémoire OpenAI future)
    await storeConversationHistory(conversationId, {
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    });

    // 7. 🚀 Stocker la réponse dans Redis (pour récupération ManyChat)
    await storeAIResponse(conversationId, response);

    // 8. 🧠 Stocker la réponse IA dans Redis
    await storeConversationHistory(conversationId, {
      role: 'assistant',
      content: response,
      timestamp: Date.now()
    });

    // 9. 🆕 STOCKER DANS MONGODB (permanent pour dashboard)
    await storeInMongoDB(
      conversationId,
      connection._id.toString(),
      connection.webhookId,
      userId,
      userMessage,
      response,
      agent,
      connection
    );

    console.log(`🎉 [COMPLETE] Message processed and stored in both Redis and MongoDB`);

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

    // Stocker le message d'erreur dans Redis
    await storeAIResponse(conversationId, errorMessage);

    // 🆕 STOCKER L'ERREUR DANS MONGODB AUSSI
    await storeInMongoDB(
      conversationId,
      connection._id.toString(),
      connection.webhookId,
      userId,
      userMessage,
      errorMessage,
      agent,
      connection
    );
  }
}

// 📨 POST - SEULEMENT pour recevoir les messages (1er External Request) - RIEN CHANGÉ
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
    console.log(`📊 [TEST] Headers:`, Object.fromEntries(req.headers.entries()));
    console.log(`📊 [TEST] URL:`, req.url);
    console.log(`📊 [TEST] Method:`, req.method);

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

    // 5. Traiter le message avec l'AI (en arrière-plan) - MAINTENANT AVEC DOUBLE STOCKAGE
    processWithAI(agent, userMessage, userId, conversationId, connection);

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