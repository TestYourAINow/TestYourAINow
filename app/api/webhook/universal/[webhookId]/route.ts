// app/api/webhook/universal/[webhookId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Connection } from '@/models/Connection';
import { Agent } from '@/models/Agent';
import { AgentKnowledge } from '@/models/AgentKnowledge';
import { Conversation } from '@/models/Conversation';
import { createAgentOpenAIForWebhook } from '@/lib/openai';
import { storeAIResponse, storeConversationHistory, getConversationHistory } from '@/lib/redisCache';
import { handleWebhookIntegration } from '@/lib/integrations/webhookHandler';

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type UserData = {
  contactId: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  profilePic?: string;
  username?: string;
  gender?: string;
  locale?: string;
  timezone?: string;
};

// 🎯 Filtrer les messages de politesse
function isPoliteOnly(content: string): boolean {
  const politeOnlyWords = [
    'salut', 'bonjour', 'bonsoir', 'merci', 'ok', 'bye', 'au revoir', 'ciao',
    'hi', 'hello', 'hey', 'thanks', 'thank you', 'ok', 'okay', 'bye', 'goodbye',
    'hola', 'gracias', 'ok', 'adiós', 'chau',
    'hallo', 'danke', 'ok', 'tschüss'
  ];

  const cleanContent = content.toLowerCase().trim();
  return politeOnlyWords.includes(cleanContent);
}

// 🆕 Extraire données utilisateur du webhook (format flexible)
function extractUserData(data: any): UserData {
  console.log(`🔍 [USER DATA] Extracting from universal webhook:`, JSON.stringify(data, null, 2));

  // ID utilisateur (essayer plusieurs formats)
  const contactId =
    data.contactId ||
    data.contact_id ||
    data.userId ||
    data.user_id ||
    data.from ||
    data.From ||
    data.sender ||
    'anonymous';

  // Informations personnelles (flexible)
  const firstName = data.first_name || data.firstName || data.name?.split(' ')[0] || '';
  const lastName = data.last_name || data.lastName || data.name?.split(' ').slice(1).join(' ') || '';
  const profilePic = data.profile_pic || data.profilePic || data.avatar || data.picture || '';
  const username = data.username || data.user_name || '';
  const gender = data.gender || '';
  const locale = data.locale || data.language || data.lang || '';
  const timezone = data.timezone || data.tz || '';

  const fullName = `${firstName} ${lastName}`.trim() || undefined;

  const userData: UserData = {
    contactId,
    userId: contactId,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    fullName: fullName,
    profilePic: profilePic || undefined,
    username: username || undefined,
    gender: gender || undefined,
    locale: locale || undefined,
    timezone: timezone || undefined
  };

  console.log(`✅ [USER DATA] Extracted:`, {
    contactId: userData.contactId,
    name: userData.fullName || 'Anonymous',
    hasProfilePic: !!userData.profilePic,
    username: userData.username || 'N/A'
  });

  return userData;
}

// 💾 Stocker dans MongoDB
async function storeInMongoDB(
  conversationId: string,
  connectionId: string,
  webhookId: string,
  userData: UserData,
  userMessage: string,
  aiResponse: string,
  agent: any,
  connection: any,
  requestData: any  // ← AJOUTE ÇA
) {
  try {
    console.log(`💾 [MONGODB] Storing conversation: ${conversationId} for user: ${userData.fullName || 'Anonymous'}`);

    const userMsg = {
      role: 'user' as const,
      content: userMessage,
      timestamp: Date.now(),
      isFiltered: isPoliteOnly(userMessage)
    };

    const assistantMsg = {
      role: 'assistant' as const,
      content: aiResponse,
      timestamp: Date.now(),
      isFiltered: false
    };

    let conversation = await Conversation.findOne({
      conversationId,
      isDeleted: false
    });

    if (conversation) {
      conversation.messages.push(userMsg, assistantMsg);

      conversation.platform = 'webhook';
  conversation.platformDetails = requestData.platform || connection.integrationType || 'unknown';

      // Mettre à jour les infos utilisateur si elles ont changé
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

      conversation.lastMessageAt = new Date(assistantMsg.timestamp);
      conversation.lastUserMessageAt = new Date(userMsg.timestamp);
      conversation.lastAssistantMessageAt = new Date(assistantMsg.timestamp);
      conversation.messageCount = conversation.messages.length;

      await conversation.save();
      console.log(`✅ [MONGODB] Updated existing conversation: ${conversationId}`);
    } else {
      conversation = await Conversation.create({
        conversationId,
        connectionId,
        userId: userData.userId,
        webhookId,
        platform: 'webhook',
        platformDetails: requestData.platform || connection.integrationType || 'unknown',
        agentId: agent._id,
        agentName: agent.name,

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
      console.log(`✅ [MONGODB] Created new conversation: ${conversationId}`);
    }

    return conversation;
  } catch (error) {
    console.error(`❌ [MONGODB] Error storing conversation ${conversationId}:`, error);
    return null;
  }
}

// 🤖 Traiter le message avec l'IA
async function processWithAI(
  agent: any,
  userMessage: string,
  userData: UserData,
  conversationId: string,
  connection: any,
  requestData: any
) {
  try {
    console.log(`🤖 Processing message for agent ${agent._id} with user ${userData.fullName || userData.userId}`);

    const { openai, error } = await createAgentOpenAIForWebhook(agent);
    if (!openai) {
      console.error(`❌ OpenAI setup failed: ${error}`);
      const errorMessage = "Sorry, technical problem.";
      await storeAIResponse(conversationId, errorMessage);
      await storeInMongoDB(
        conversationId,
        connection._id.toString(),
        connection.webhookId,
        userData,
        userMessage,
        errorMessage,
        agent,
        connection,
        requestData
      );
      return;
    }

    // 🆕 2. VÉRIFIER LES WEBHOOKS PERSONNALISÉS AVANT OPENAI
const userTimezone = requestData.timezone || userData.timezone || 'America/Montreal';

await storeConversationHistory(conversationId, {
  role: 'user',
  content: userMessage,
  timestamp: Date.now()
});

const conversationHistoryForWebhook = await getConversationHistory(conversationId);
console.log(`🆔 [CONV ID] conversationId: ${conversationId}`);

console.log(`📚 [WEBHOOK] History length: ${conversationHistoryForWebhook.length}`);
console.log(`📚 [WEBHOOK] History content:`, JSON.stringify(conversationHistoryForWebhook, null, 2));

console.log(`🔍 [WEBHOOK] Checking for webhook integrations...`);
const webhookResponse = await handleWebhookIntegration(
  userMessage,
  agent.integrations || [],
  openai,
  agent.openaiModel,
  userTimezone,
  conversationHistoryForWebhook
);

if (webhookResponse) {
  console.log(`✅ [WEBHOOK] Webhook integration handled, storing response`);
  
  // 🔥 STOCKER DANS REDIS EN PREMIER (AVANT MongoDB)
  await storeAIResponse(conversationId, webhookResponse);
  console.log(`✅ [WEBHOOK] Response stored in Redis`);
  
  // Puis stocker dans MongoDB (peut être plus lent)
  await storeInMongoDB(
    conversationId,
    connection._id.toString(),
    connection.webhookId,
    userData,
    userMessage,
    webhookResponse,
    agent,
    connection,
    requestData
  );
  
  console.log(`✅ [WEBHOOK] Response stored in MongoDB`);
  return; // ← Retourner 200 APRÈS avoir tout stocké
}

    // 3. Si pas de webhook match, continuer normalement avec OpenAI
    console.log(`ℹ️  [WEBHOOK] No webhook match, using standard OpenAI response`);

    console.log(`✅ OpenAI instance created successfully for agent ${agent._id}`);

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

    const conversationHistory = await getConversationHistory(conversationId);
    console.log(`🧠 [REDIS] Conversation history: ${conversationHistory.length} messages`);

    const filteredHistory = conversationHistory
      .filter(msg => !isPoliteOnly(msg.content))
      .slice(-10);

    console.log(`🎯 [FILTERED] Using ${filteredHistory.length} filtered messages for OpenAI context`);

    const historyMessages: ChatMessage[] = filteredHistory.map(msg => ({
      role: msg.role as "user" | "assistant",
      content: msg.content
    }));

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

    const messages: ChatMessage[] = [
      { role: 'system' as const, content: agent.finalPrompt || '' },
      { role: 'system' as const, content: `Voici ce que tu dois savoir :\n${knowledgeText}` },
      ...(userContext ? [{ role: 'system' as const, content: `Contexte utilisateur: ${userContext}` }] : []),
      ...historyMessages,
      { role: 'user' as const, content: userMessage }
    ];

    console.log(`💬 Calling OpenAI with model: ${agent.openaiModel} (${messages.length} messages)`);

    const completion = await openai.chat.completions.create({
      model: agent.openaiModel,
      temperature: agent.temperature,
      top_p: agent.top_p,
      messages,
    });

    const response = completion.choices[0]?.message?.content || "I couldn't respond.";
    console.log(`✅ OpenAI response received: ${response.substring(0, 100)}...`);

    await storeAIResponse(conversationId, response);

    await storeConversationHistory(conversationId, {
      role: 'assistant',
      content: response,
      timestamp: Date.now()
    });

    await storeInMongoDB(
      conversationId,
      connection._id.toString(),
      connection.webhookId,
      userData,
      userMessage,
      response,
      agent,
      connection,
      requestData
    );

    console.log(`🎉 [COMPLETE] Message processed and stored`);

  } catch (error: any) {
    console.error('❌ AI processing error:', error);

    let errorMessage = "Sorry, I'm experiencing a technical issue.";
    if (error.status === 401) {
      errorMessage = "Incorrect API key configuration.";
    } else if (error.status === 429) {
      errorMessage = "Too many requests.";
    } else if (error.status === 500) {
      errorMessage = "Issue with OpenAI service.";
    }

    await storeAIResponse(conversationId, errorMessage);
    await storeInMongoDB(
      conversationId,
      connection._id.toString(),
      connection.webhookId,
      userData,
      userMessage,
      errorMessage,
      agent,
      connection,
      requestData
    );
  }
}

// 📨 POST - Point d'entrée principal
export async function POST(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const { webhookId } = params;

    console.log(`📨 [UNIVERSAL] Webhook for ID: ${webhookId}`);
    console.log(`🔗 Full URL: ${req.url}`);

    await connectToDatabase();

    // Parser le body (JSON ou form-data)
    const contentType = req.headers.get('content-type') || '';
    let data: any;

    if (contentType.includes('application/json')) {
      data = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      data = Object.fromEntries(formData);
    } else {
      // Essayer JSON par défaut
      try {
        data = await req.json();
      } catch {
        const text = await req.text();
        console.error(`❌ Unknown content type: ${contentType}, body: ${text}`);
        return NextResponse.json({
          text: "Unsupported content type.",
          success: false
        }, { status: 400 });
      }
    }

    console.log(`📄 [UNIVERSAL] Data:`, JSON.stringify(data, null, 2));

    // Trouver la connection
    const connection = await Connection.findOne({ webhookId, isActive: true });
    if (!connection) {
      console.error(`❌ Connection not found for webhookId: ${webhookId}`);
      return NextResponse.json({
        text: "Configuration missing.",
        success: false
      }, { status: 404 });
    }

    console.log(`✅ Connection found: ${connection.name} (${connection.integrationType})`);

    // Trouver l'agent
    const agent = await Agent.findById(connection.aiBuildId);
    if (!agent) {
      console.error(`❌ Agent not found for ID: ${connection.aiBuildId}`);
      return NextResponse.json({
        text: "Agent not found.",
        success: false
      }, { status: 404 });
    }

    console.log(`✅ Agent found: ${agent.name}`);

    // Extraire données (format flexible)
    const userData = extractUserData(data);

    // Extraire le message (essayer plusieurs champs)
    const userMessage =
      data.message ||
      data.text ||
      data.Message ||
      data.Body ||
      data.body ||
      data.content ||
      '';

    const conversationId = `${webhookId}_${userData.userId}`;

    console.log(`📨 Message from ${userData.fullName || userData.userId}: "${userMessage}"`);

    if (!userMessage) {
      console.error(`❌ No message content found in webhook data`);
      return NextResponse.json({
        text: "Empty message received.",
        success: false
      }, { status: 400 });
    }

    // Traiter le message avec l'AI (asynchrone)
    processWithAI(agent, userMessage, userData, conversationId, connection, data);

    // Retourner immédiatement
    return NextResponse.json({
      success: true,
      message: 'Message received and processing',
      status: 'received'
    });

  } catch (error) {
    console.error('❌ [UNIVERSAL] Webhook error:', error);
    return NextResponse.json({
      text: "An error occurred.",
      success: false
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST method' }, { status: 405 });
}