// app\api\webhook\manychat\[webhookId]\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Connection } from '@/models/Connection';
import { Agent } from '@/models/Agent';
import { AgentKnowledge } from '@/models/AgentKnowledge';
import { Conversation } from '@/models/Conversation'; // 🆕 NOUVEAU
import { getAIClientForWebhook, callAI } from '@/lib/ai-client';
import { storeAIResponse, storeConversationHistory, getConversationHistory } from '@/lib/redisCache';
import { handleWebhookIntegration } from '@/lib/integrations/webhookHandler';


// 📝 Types pour les messages OpenAI
type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

// 🆕 Type pour les données utilisateur ManyChat - CORRIGÉ
type UserData = {
  contactId: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;        // 🔄 CHANGÉ DE userFullName vers fullName
  profilePic?: string;
  username?: string;
  gender?: string;
  locale?: string;
  timezone?: string;
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

// 🆕 FONCTION AMÉLIORÉE - Extraire données utilisateur du webhook ManyChat
function extractUserData(data: any): UserData {
  console.log(`🔍 [USER DATA] Extracting user data from webhook:`, JSON.stringify(data, null, 2));

  // ID utilisateur (priorité dans l'ordre)
  const contactId = data.contactId || data.contact_id || data.user_id || data.subscriber_id || 'anonymous';

  // Informations personnelles
  const firstName = data.first_name || data.firstName || '';
  const lastName = data.last_name || data.lastName || '';
  const profilePic = data.profile_pic || data.profilePic || data.avatar_url || '';
  const username = data.instagram_username || data.ig_username || data.username || data.user_name || ''; // 🔧 CORRIGÉ

  // Métadonnées
  const gender = data.gender || '';
  const locale = data.locale || data.language || '';
  const timezone = data.timezone || data.tz || '';

  // 🔄 Calculer le nom complet
  const fullName = `${firstName} ${lastName}`.trim() || undefined;

  const userData: UserData = {
    contactId,
    userId: contactId,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    fullName: fullName,              // 🔄 CHANGÉ
    profilePic: profilePic || undefined,
    username: username || undefined,
    gender: gender || undefined,
    locale: locale || undefined,
    timezone: timezone || undefined
  };

  console.log(`✅ [USER DATA] Extracted:`, {
    contactId: userData.contactId,
    name: userData.fullName || 'Anonymous',    // 🔄 CHANGÉ
    hasProfilePic: !!userData.profilePic,
    username: userData.username || 'N/A'
  });

  return userData;
}

// 🆕 FONCTION AMÉLIORÉE - Stocker dans MongoDB avec données utilisateur
async function storeInMongoDB(
  conversationId: string,
  connectionId: string,
  webhookId: string,
  userData: UserData, // 🆕 CHANGÉ de userId vers userData
  userMessage: string,
  aiResponse: string,
  agent: any,
  connection: any
) {
  try {
    console.log(`💾 [MONGODB] Storing conversation: ${conversationId} for user: ${userData.firstName || 'Anonymous'}`);

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

      // 🆕 METTRE À JOUR les infos utilisateur si elles ont changé/améliorées
      if (userData.firstName && userData.firstName !== conversation.userFirstName) {
        conversation.userFirstName = userData.firstName;
      }
      if (userData.lastName && userData.lastName !== conversation.userLastName) {
        conversation.userLastName = userData.lastName;
      }
      if (userData.profilePic && userData.profilePic !== conversation.userProfilePic) {
        conversation.userProfilePic = userData.profilePic;
      }
      if (userData.username && userData.username !== conversation.userUsername) {
        conversation.userUsername = userData.username;
      }
      if (userData.gender && userData.gender !== conversation.userGender) {
        conversation.userGender = userData.gender;
      }
      if (userData.locale && userData.locale !== conversation.userLocale) {
        conversation.userLocale = userData.locale;
      }
      if (userData.timezone && userData.timezone !== conversation.userTimezone) {
        conversation.userTimezone = userData.timezone;
      }

      // Mettre à jour les timestamps
      conversation.lastMessageAt = new Date(assistantMsg.timestamp);
      conversation.lastUserMessageAt = new Date(userMsg.timestamp);
      conversation.lastAssistantMessageAt = new Date(assistantMsg.timestamp);
      conversation.messageCount = conversation.messages.length;

      await conversation.save();
      console.log(`✅ [MONGODB] Updated existing conversation: ${conversationId} for ${conversation.userFullName || 'Anonymous'}`);
    } else {
      // 🆕 Créer une nouvelle conversation AVEC toutes les infos utilisateur
      conversation = await Conversation.create({
        conversationId,
        connectionId,
        userId: userData.userId,
        webhookId,
        platform: connection.integrationType,
        agentId: agent._id,
        agentName: agent.name,

        // 🆕 NOUVELLES DONNÉES UTILISATEUR
        userFirstName: userData.firstName,
        userLastName: userData.lastName,
        userProfilePic: userData.profilePic,
        userUsername: userData.username,
        userGender: userData.gender,
        userLocale: userData.locale,
        userTimezone: userData.timezone,

        messages: [userMsg, assistantMsg],
        messageCount: 2,
        firstMessageAt: new Date(userMsg.timestamp),
        lastMessageAt: new Date(assistantMsg.timestamp),
        lastUserMessageAt: new Date(userMsg.timestamp),
        lastAssistantMessageAt: new Date(assistantMsg.timestamp),
        isDeleted: false
      });
      console.log(`✅ [MONGODB] Created new conversation: ${conversationId} for ${conversation.userFullName || 'Anonymous'}`);
    }

    return conversation;
  } catch (error) {
    console.error(`❌ [MONGODB] Error storing conversation ${conversationId}:`, error);
    // Ne pas faire échouer le webhook si MongoDB fail
    return null;
  }
}

// 🤖 Traiter le message avec l'IA - SIGNATURE MODIFIÉE
async function processWithAI(agent: any, userMessage: string, userData: UserData, conversationId: string, connection: any) {
  try {
    console.log(`🤖 Processing message for agent ${agent._id} with user ${userData.fullName || userData.userId}`);

    const { client: aiClient, provider: aiProvider, error } = await getAIClientForWebhook(agent);
    if (!aiClient) {
      console.error(`❌ AI client setup failed: ${error}`);
      const errorMessage = "Sorry, technical problem.";
      await storeAIResponse(conversationId, errorMessage);
     storeInMongoDB(
        conversationId,
        connection._id.toString(),
        connection.webhookId,
        userData,
        userMessage,
        errorMessage,
        agent,
        connection
      ).catch(err => console.error('❌ [MONGODB] Storage error:', err));
      return;
    }
    const agentModel = agent.openaiModel || 'gpt-4o';
    const agentCallAI = (msgs: ChatMessage[], temperature?: number) =>
      callAI(aiClient, aiProvider, agentModel, msgs, {
        temperature: temperature !== undefined ? temperature : agent.temperature,
        top_p: agent.top_p,
      });

    console.log(`✅ AI instance created successfully for agent ${agent._id} (${aiProvider})`);

    // 🆕 AJOUTER ICI - VÉRIFIER LES WEBHOOKS PERSONNALISÉS AVANT OPENAI
const userTimezone = userData.timezone || 'America/Montreal';

await storeConversationHistory(conversationId, {
    role: 'user',
    content: userMessage,
    timestamp: Date.now()
  });

const conversationHistoryForWebhook = await getConversationHistory(conversationId);

console.log(`🔍 [WEBHOOK] Checking for webhook integrations...`);
const webhookResponse = await handleWebhookIntegration(
  userMessage,
  agent.integrations || [],
  agentCallAI,
  userTimezone,
  conversationHistoryForWebhook
);

if (webhookResponse) {
  console.log(`✅ [WEBHOOK] Webhook integration handled`);
  
  // 🔥 PRIORITÉ 1: Redis (ManyChat a besoin de ça MAINTENANT)
  await storeAIResponse(conversationId, webhookResponse);
  console.log(`✅ [REDIS] Response stored for ManyChat`);
  

  
  
  await storeConversationHistory(conversationId, {
    role: 'assistant',
    content: webhookResponse,
    timestamp: Date.now()
  });
  
  // MongoDB (archive, non-bloquant)
  storeInMongoDB(
    conversationId,
    connection._id.toString(),
    connection.webhookId,
    userData,
    userMessage,
    webhookResponse,
    agent,
    connection
  ).catch(err => console.error('❌ [MONGODB] Storage error:', err));
  // ← Sans await = s'exécute en arrière-plan
  
  console.log(`🎉 [WEBHOOK] Processing complete`);
  return;
}

// Si pas de webhook match, continuer normalement avec OpenAI
console.log(`ℹ️  [WEBHOOK] No webhook match, using standard OpenAI response`);

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

    // 4. 🆕 AJOUTER contexte utilisateur au prompt système
    let userContext = '';
    if (userData.firstName || userData.lastName) {
      const userName = userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
      userContext += `L'utilisateur s'appelle ${userName}. `;
    }
    if (userData.username) {
      userContext += `Son username est @${userData.username}. `;
    }
    if (userData.locale) {
      userContext += `Sa langue/région est ${userData.locale}. `;
    }

    // 5. Construire les messages avec historique filtré + contexte utilisateur
    const messages: ChatMessage[] = [
      { role: 'system' as const, content: agent.finalPrompt || '' },
      { role: 'system' as const, content: `Voici ce que tu dois savoir :\n${knowledgeText}` },
      // 🆕 AJOUTER contexte utilisateur si disponible
      ...(userContext ? [{ role: 'system' as const, content: `Contexte utilisateur: ${userContext}` }] : []),
      ...historyMessages, // 🧠 HISTORIQUE FILTRÉ AJOUTÉ !
      { role: 'user' as const, content: userMessage }
    ];

    console.log(`💬 Calling OpenAI with model: ${agent.openaiModel} (${messages.length} messages including ${filteredHistory.length} filtered history + user context)`);

    const response = await callAI(aiClient, aiProvider, agentModel, messages, {
      temperature: agent.temperature,
      top_p: agent.top_p,
    }) || "I couldn't respond.";
    console.log(`✅ OpenAI response received: ${response.substring(0, 100)}...`);


    // 8. 🚀 Stocker la réponse dans Redis (pour récupération ManyChat)
    await storeAIResponse(conversationId, response);

    // 9. 🧠 Stocker la réponse IA dans Redis
    await storeConversationHistory(conversationId, {
      role: 'assistant',
      content: response,
      timestamp: Date.now()
    });

    // 10. 🆕 STOCKER DANS MONGODB avec toutes les données utilisateur
   storeInMongoDB(
      conversationId,
      connection._id.toString(),
      connection.webhookId,
      userData, // 🆕 CHANGÉ 
      userMessage,
      response,
      agent,
      connection
    ).catch(err => console.error('❌ [MONGODB] Storage error:', err));

    console.log(`🎉 [COMPLETE] Message processed and stored in both Redis and MongoDB with user data`);

  } catch (error: any) {
    console.error('❌ AI processing error:', error);

    let errorMessage = "Sorry, I'm experiencing a technical issue. Please try again in a moment.";

    if (error.status === 401) {
      errorMessage = "Incorrect API key configuration. Please contact administrator.";
    } else if (error.status === 429) {
      errorMessage = "Too many requests in progress. Please try again in a moment.";
    } else if (error.status === 500) {
      errorMessage = "Issue with OpenAI service. Please try again later.";
    }

    // Stocker le message d'erreur dans Redis
    await storeAIResponse(conversationId, errorMessage);

    // 🆕 STOCKER L'ERREUR DANS MONGODB AVEC DONNÉES UTILISATEUR
     storeInMongoDB(
      conversationId,
      connection._id.toString(),
      connection.webhookId,
      userData, // 🆕 CHANGÉ
      userMessage,
      errorMessage,
      agent,
      connection
    ).catch(err => console.error('❌ [MONGODB] Storage error:', err));
  }
}

// 📨 POST - MODIFIÉ pour extraire données utilisateur
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
      return NextResponse.json({
        text: "Configuration missing. Please contact administrator.",
        success: false,
        response: "Configuration missing. Please contact administrator."
      }, { status: 404 });
    }

    console.log(`✅ Connection found: ${connection.name}`);

    // 3. Récupérer l'agent
    const agent = await Agent.findById(connection.aiBuildId);
    if (!agent) {
      console.error(`❌ Agent not found for ID: ${connection.aiBuildId}`);
      return NextResponse.json({
        text: "Agent not found. Please contact administrator.",
        success: false,
        response: "Agent not found. Please contact administrator."
      }, { status: 404 });
    }

    console.log(`✅ Agent found: ${agent.name}, API Key: ${agent.apiKey ? 'configured' : 'missing'}`);

    // 4. 🆕 EXTRAIRE données utilisateur + message
    const userData = extractUserData(data);
    const userMessage = data.message || data.text || '';
    const conversationId = `${webhookId}_${userData.userId}`;

    console.log(`📨 Message from ${userData.fullName || userData.userId}: "${userMessage}"`);

    if (!userMessage) {
      console.error(`❌ No message content found in webhook data`);
      return NextResponse.json({
        text: "Empty message received.",
        success: false,
        response: "Empty message received."
      }, { status: 400 });
    }

    // 5. 🆕 Traiter le message avec l'AI (avec données utilisateur)
    processWithAI(agent, userMessage, userData, conversationId, connection);

    // 6. Retourner immédiatement à ManyChat
    return NextResponse.json({
      success: true,
      message: 'Message received and processing',
      status: 'received'
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({
      text: "An error occurred. Please try again later.",
      success: false,
      response: "An error occurred. Please try again later."
    }, { status: 500 });
  }
}

// 🔄 GET - Pas utilisé mais on garde pour compatibilité
export async function GET() {
  return NextResponse.json({ message: 'Use POST method' }, { status: 405 });
}