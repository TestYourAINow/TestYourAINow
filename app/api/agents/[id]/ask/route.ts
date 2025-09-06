import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Agent } from "@/models/Agent";
import { AgentKnowledge } from "@/models/AgentKnowledge";
import { Demo } from "@/models/Demo";
import { Conversation } from "@/models/Conversation"; // 🆕 AJOUT POUR WIDGET
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createAgentOpenAI, createAgentOpenAIForWebhook } from "@/lib/openai";

type IntegrationFile = { name: string; size: number; path: string; url: string };
type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

interface DemoDocument {
  _id: string;
  userId: string;
  name: string;
  agentId: string;
  demoToken: string;
  publicEnabled: boolean;
}

// LOCALIZED DATE/TIME HELPER - English version
function getLocalizedDateTime(timezone: string): string {
  const now = new Date();
  
  try {
    const localTime = now.toLocaleString('en-US', { 
      timeZone: timezone,
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const timeZoneName = Intl.DateTimeFormat('en', { timeZone: timezone, timeZoneName: 'long' })
      .formatToParts(now)
      .find(part => part.type === 'timeZoneName')?.value || timezone;
    
    return `${localTime} (${timeZoneName})`;
  } catch (error) {
    console.warn('Invalid timezone:', timezone, 'Using UTC');
    return `${now.toISOString().replace('T', ' ').replace('Z', '')} (UTC)`;
  }
}

// 🆕 NOUVELLE FONCTION POUR STOCKER LES CONVERSATIONS WIDGET
async function storeWidgetConversation(
  conversationId: string,
  connectionId: string, // = widgetId
  userId: string,        // = sessionId
  userMessage: string,
  aiResponse: string,
  agent: any
): Promise<void> {
  try {
    console.log(`💾 [WIDGET] Storing conversation: ${conversationId}`);
    
    await connectToDatabase();
    
    const now = new Date();
    const timestamp = now.getTime();
    
    // Chercher si la conversation existe déjà
    let conversation = await Conversation.findOne({
      conversationId: conversationId,
      isDeleted: false
    });
    
    if (conversation) {
      // Conversation existante - ajouter les nouveaux messages
      console.log(`📝 [WIDGET] Adding messages to existing conversation`);
      
      conversation.messages.push(
        {
          role: 'user',
          content: userMessage,
          timestamp: timestamp - 1000, // User message légèrement avant
          isFiltered: false
        },
        {
          role: 'assistant', 
          content: aiResponse,
          timestamp: timestamp,
          isFiltered: false
        }
      );
      
      // Mettre à jour les timestamps
      conversation.lastMessageAt = now;
      conversation.lastUserMessageAt = new Date(timestamp - 1000);
      conversation.lastAssistantMessageAt = now;
      
      await conversation.save();
      
    } else {
      // Nouvelle conversation
      console.log(`🆕 [WIDGET] Creating new conversation`);
      
      conversation = new Conversation({
        conversationId: conversationId,
        connectionId: connectionId,
        userId: userId,
        webhookId: connectionId, // Pour compatibilité, on utilise le même ID
        platform: 'website-widget',
        agentId: agent._id.toString(),
        agentName: agent.name,
        messages: [
          {
            role: 'user',
            content: userMessage,
            timestamp: timestamp - 1000,
            isFiltered: false
          },
          {
            role: 'assistant',
            content: aiResponse, 
            timestamp: timestamp,
            isFiltered: false
          }
        ],
        firstMessageAt: new Date(timestamp - 1000),
        lastMessageAt: now,
        lastUserMessageAt: new Date(timestamp - 1000),
        lastAssistantMessageAt: now,
        isDeleted: false
      });
      
      await conversation.save();
    }
    
    console.log(`✅ [WIDGET] Conversation stored successfully: ${conversationId}`);
    
  } catch (error) {
    console.error('❌ [WIDGET] Error storing conversation:', error);
    // Ne pas faire échouer la requête si le stockage rate
  }
}

// STRICT APPOINTMENT INTENT DETECTION
async function isAppointmentRequest(userMessage: string, openai: any, agentModel: string): Promise<boolean> {
  try {
    const intentCheck = await openai.chat.completions.create({
      model: agentModel,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: "You are an intent detector. Reply ONLY with 'true' or 'false'. Return 'true' ONLY if the user is EXPLICITLY requesting to schedule/book an appointment or meeting."
        },
        {
          role: "user", 
          content: `Message: "${userMessage}"`
        }
      ]
    });
    
    const response = intentCheck.choices[0]?.message?.content?.toLowerCase().trim();
    return response === 'true';
  } catch (error) {
    console.log('Intent detection error:', error);
    return false;
  }
}

// SAFE CALENDLY INTEGRATION
async function handleCalendlyIntegration(
  userMessage: string, 
  integrations: any[], 
  openai: any,
  agentModel: string
): Promise<string | null> {
  const calendlyIntegrations = integrations.filter(i => i.type === "calendly" && i.enabled !== false);
  
  if (calendlyIntegrations.length === 0) return null;
  
  const isAppointment = await isAppointmentRequest(userMessage, openai, agentModel);
  if (!isAppointment) return null;
  
  console.log('Confirmed appointment request, Calendly integration...');
  
  for (const integration of calendlyIntegrations) {
    if (!integration.apiKey) {
      console.log(`No API key for ${integration.name}`);
      continue;
    }
    
    try {
      const userRes = await fetch('https://api.calendly.com/users/me', {
        headers: {
          'Authorization': `Bearer ${integration.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!userRes.ok) {
        console.log(`Calendly user API error (${userRes.status})`);
        continue;
      }
      
      const userData = await userRes.json();
      const userUri = userData.resource.uri;
      
      console.log('Calendly user retrieved:', userData.resource.name);
      
      const eventsRes = await fetch(`https://api.calendly.com/event_types?user=${userUri}&active=true&count=25`, {
        headers: {
          'Authorization': `Bearer ${integration.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!eventsRes.ok) {
        console.log(`Calendly events API error (${eventsRes.status})`);
        continue;
      }
      
      const eventsData = await eventsRes.json();
      const eventTypes = eventsData.collection || [];
      
      console.log(`${eventTypes.length} event types found`);
      
      if (eventTypes.length === 0) {
        console.log('No active event types found');
        continue;
      }
      
      const firstEvent = eventTypes[0];
      const schedulingUrl = firstEvent.scheduling_url;
      
      if (!schedulingUrl) {
        console.log('No scheduling_url found');
        continue;
      }
      
      console.log('Scheduling URL:', schedulingUrl);
      
      const aiRes = await openai.chat.completions.create({
        model: agentModel,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: `You are an assistant helping to schedule appointments. The user just requested an appointment. You have access to Calendly with this link: ${schedulingUrl}

Respond in a natural, warm, and professional way by offering this link for booking. 

Important instructions:
- Be enthusiastic but professional
- Briefly explain that the link leads to a booking calendar
- Encourage action
- Keep a personalized and human tone
- Don't mention technical Calendly details`
          },
          {
            role: 'user',
            content: userMessage
          }
        ]
      });
      
      const aiResponse = aiRes.choices[0]?.message?.content;
      
      if (!aiResponse) {
        console.log('No AI response');
        continue;
      }
      
      const finalResponse = `${aiResponse}\n\n**Book your time slot here:** ${schedulingUrl}`;
      
      console.log('Calendly response generated successfully');
      return finalResponse;
      
    } catch (error) {
      console.error('Calendly error for', integration.name, ':', error);
      continue;
    }
  }
  
  return null;
}

// SAFE GOOGLE CALENDAR INTEGRATION - Multilingual + Fixed timezone
async function handleGoogleCalendarIntegration(
  userMessage: string,
  integrations: any[],
  openai: any,
  userTimezone: string,
  agentModel: string
): Promise<string | null> {
  const googleCalendarIntegrations = integrations.filter(i => i.type === "google_calendar" && i.enabled !== false);
  
  if (googleCalendarIntegrations.length === 0) return null;
  
  console.log('Google Calendar creation request detected...');
  
  for (const integration of googleCalendarIntegrations) {
    if (!integration.accessToken) {
      console.log(`No access token for ${integration.name}`);
      continue;
    }
    
    try {
      const extractionRes = await openai.chat.completions.create({
        model: agentModel,
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: `Return ONLY valid minified JSON (no prose). If info is incomplete, set "hasAppointment": false.
MUST include both "datetime" AND "endDatetime" as RFC3339 with offset (e.g. "2025-08-25T14:00:00-04:00").

Current date and time: ${new Date().toLocaleString('en-US', { 
              timeZone: userTimezone,
              year: 'numeric',
              month: 'long', 
              day: 'numeric',
              weekday: 'long',
              hour: '2-digit',
              minute: '2-digit'
            })} (${userTimezone})

Required JSON format:
{
  "hasAppointment": true/false,
  "datetime": "2025-08-25T14:00:00-04:00",
  "endDatetime": "2025-08-25T15:00:00-04:00", 
  "duration": 60,
  "title": "Appointment title",
  "email": "email@example.com or null"
}`
          },
          {
            role: 'user',
            content: userMessage
          }
        ]
      });
      
      const extractedInfo = JSON.parse(extractionRes.choices[0]?.message?.content || '{"hasAppointment": false}');
      
      if (!extractedInfo.hasAppointment || !extractedInfo.datetime || !extractedInfo.endDatetime) {
        console.log('Missing datetime/endDatetime -> skip Google Calendar');
        continue;
      }
      
      console.log('Information extracted:', extractedInfo);
      
      const startISO = extractedInfo.datetime;
      const endISO = extractedInfo.endDatetime;
      
      const calendarEvent = {
        summary: extractedInfo.title || 'Appointment',
        start: {
          dateTime: startISO,
          timeZone: userTimezone
        },
        end: {
          dateTime: endISO,
          timeZone: userTimezone
        },
        attendees: extractedInfo.email ? [{ email: extractedInfo.email }] : undefined,
        description: `Appointment created automatically via AI assistant`
      };
      
      const createEventRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${integration.calendarId || 'primary'}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${integration.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(calendarEvent)
      });
      
      if (!createEventRes.ok) {
        const errorData = await createEventRes.text();
        console.error('Google Calendar creation error:', errorData);
        continue;
      }
      
      const createdEvent = await createEventRes.json();
      
      if (!createdEvent.htmlLink) {
        console.log('No htmlLink in created event');
        continue;
      }
      
      console.log('Event created:', createdEvent.id);
      
      const startDateTime = new Date(startISO);
      const endDateTime = new Date(endISO);
      
      const confirmationRes = await openai.chat.completions.create({
        model: agentModel,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: `You are an assistant confirming Google Calendar appointment creation.

The event was successfully created with these details:
- Title: ${extractedInfo.title}
- Date: ${startDateTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              timeZone: userTimezone
            })}
- Time: ${startDateTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              timeZone: userTimezone
            })} - ${endDateTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              timeZone: userTimezone
            })}
- Duration: ${extractedInfo.duration || 60} minutes

Respond warmly and professionally to confirm the creation. Include important details and reassure the user.`
          },
          {
            role: 'user',
            content: userMessage
          }
        ]
      });
      
      const confirmationMessage = confirmationRes.choices[0]?.message?.content;
      
      if (!confirmationMessage) {
        console.log('No confirmation message');
        continue;
      }
      
      const finalResponse = `${confirmationMessage}\n\n**Event created in Google Calendar**\nLink: ${createdEvent.htmlLink}`;
      
      console.log('Google Calendar response generated successfully');
      return finalResponse;
      
    } catch (error) {
      console.error('Google Calendar error for', integration.name, ':', error);
      continue;
    }
  }
  
  return null;
}

// FONCTION WEBHOOK CORRIGÉE avec gestion d'erreur JSON
async function handleWebhookIntegration(
  userMessage: string,
  integrations: any[],
  openai: any,
  agentModel: string
): Promise<string | null> {
  const webhookIntegrations = integrations.filter(i => i.type === "webhook" && i.enabled !== false);
  
  if (webhookIntegrations.length === 0) return null;

  console.log('Webhook integration detected...');

  for (const integration of webhookIntegrations) {
    if (!integration.url || !integration.fields) {
      console.log(`Webhook ${integration.name} missing URL or fields`);
      continue;
    }

    try {
      // 1. Demander à l'IA si ce webhook doit être déclenché
      const shouldTriggerRes = await openai.chat.completions.create({
        model: agentModel,
        temperature: 0,
        messages: [
          {
            role: "system",
            content: `You are analyzing if a webhook should be triggered.

Webhook: ${integration.name}
Description: ${integration.description}
Required fields: ${integration.fields.map((f: any) => `${f.key} (${f.value})`).join(', ')}

Reply ONLY with 'true' if the user message indicates this webhook should be triggered, 'false' otherwise.`
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      });

      const shouldTrigger = shouldTriggerRes.choices[0]?.message?.content?.toLowerCase().trim() === 'true';
      
      if (!shouldTrigger) {
        console.log(`Webhook ${integration.name} not triggered - no matching intent`);
        continue;
      }

      console.log(`Webhook ${integration.name} should be triggered`);

      // 2. Extraire les données nécessaires avec prompt plus strict
      const extractRes = await openai.chat.completions.create({
        model: agentModel,
        temperature: 0,
        messages: [
          {
            role: "system",
            content: `You MUST respond with ONLY valid JSON. No explanations, no markdown, no extra text.

Extract data for webhook: ${integration.name}

Required fields:
${integration.fields.map((f: any) => `- ${f.key}: ${f.value}`).join('\n')}

Response format (copy exactly):
{"hasAllData": true, "data": {"field1": "value1", "field2": "value2"}}

If missing data:
{"hasAllData": false, "missing": ["field1", "field2"]}`
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      });

      const rawResponse = extractRes.choices[0]?.message?.content?.trim() || '';
      console.log('Raw AI response:', rawResponse);

      let extractedData;
      try {
        // Nettoyer la réponse au cas où il y aurait des backticks ou autre
        const cleanResponse = rawResponse
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .replace(/^[^{]*({.*})[^}]*$/s, '$1');
        
        extractedData = JSON.parse(cleanResponse);
      } catch (parseError) {
        console.log('JSON parse failed:', parseError);
        console.log('Attempting to extract with regex...');
        
        // Fallback: essayer d'extraire le JSON avec regex
        const jsonMatch = rawResponse.match(/\{.*\}/s);
        if (jsonMatch) {
          try {
            extractedData = JSON.parse(jsonMatch[0]);
          } catch {
            extractedData = { hasAllData: false, error: 'Failed to parse response' };
          }
        } else {
          extractedData = { hasAllData: false, error: 'No JSON found in response' };
        }
      }
      
      if (!extractedData.hasAllData) {
        console.log(`Missing data for webhook ${integration.name}`, extractedData);
        
        // Demander les données manquantes
        const missingFieldsRes = await openai.chat.completions.create({
          model: agentModel,
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content: `The user wants to use the "${integration.name}" feature but some required information is missing.

Required information:
${integration.fields.map((f: any) => `- ${f.key}: ${f.value}`).join('\n')}

Ask the user politely to provide the missing information. Be specific about what you need and friendly.`
            },
            {
              role: "user",
              content: userMessage
            }
          ]
        });

        return missingFieldsRes.choices[0]?.message?.content || "I need more information to proceed with this request.";
      }

      // 3. Envoyer le webhook
      console.log(`Sending webhook to ${integration.url}`, extractedData.data);
      
      const webhookRes = await fetch(integration.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AI-Agent-Webhook/1.0'
        },
        body: JSON.stringify(extractedData.data)
      });

      const webhookSuccess = webhookRes.ok;
      let webhookResponseText = '';
      
      try {
        webhookResponseText = await webhookRes.text();
      } catch {
        webhookResponseText = 'No response body';
      }

      console.log(`Webhook response: ${webhookRes.status} - ${webhookResponseText}`);

      // 4. Générer la réponse
      const confirmationRes = await openai.chat.completions.create({
        model: agentModel,
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: `The webhook "${integration.name}" was ${webhookSuccess ? 'successfully' : 'unsuccessfully'} sent.

Status: ${webhookRes.status}
Data sent: ${JSON.stringify(extractedData.data, null, 2)}
Response: ${webhookResponseText.slice(0, 200)}

Generate a natural, friendly response to inform the user about the ${webhookSuccess ? 'successful submission' : 'issue with the submission'}. Be professional but warm.`
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      });

      const response = confirmationRes.choices[0]?.message?.content;
      
      if (response) {
        console.log(`Webhook ${integration.name} processed successfully`);
        return response;
      }

    } catch (error) {
      console.error(`Webhook error for ${integration.name}:`, error);
      
      // En cas d'erreur, retourner un message d'erreur générique
      return `I encountered an error while processing your request with ${integration.name}. Please try again or contact support if the issue persists.`;
    }
  }

  return null;
}

export async function POST(
  req: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    const { id } = params;
    
    await connectToDatabase();

    const publicKind = req.headers.get('x-public-kind');
    const demoId = req.headers.get('x-demo-id');
    const demoToken = req.headers.get('x-demo-token');
    const widgetId = req.headers.get('x-widget-id'); // 🆕 NOUVEAU
    const widgetToken = req.headers.get('x-widget-token');
    
    let isPublicOK = false;
    let session = null;

    if (publicKind === 'demo' && demoId && demoToken) {
      console.log('Mode public DEMO détecté, validation du token...');
      
      const demo = await Demo.findById(demoId).lean() as DemoDocument | null;
      
      if (demo && demo.demoToken === demoToken && demo.publicEnabled) {
        isPublicOK = true;
        console.log('Token démo valide, accès public autorisé');
      } else {
        console.log('Token démo invalide ou démo désactivée');
        return NextResponse.json({ error: "Invalid demo token" }, { status: 401 });
      }
    } else if (publicKind === 'widget' && widgetId && widgetToken === 'public') {
      console.log('Mode public WIDGET détecté, validation...');
      isPublicOK = true;
      console.log('Widget public autorisé');
    } else {
      session = await getServerSession(authOptions);
      if (!session || !session.user?.email || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json();
    const userMessage: string = body.message;
    const previousMessages: ChatMessage[] = body.previousMessages || [];
    const welcomeMessage: string | null = body.welcomeMessage || null;
    const userTimezone: string = body.timezone || 'UTC';
    const sessionId: string = body.sessionId || null; // 🆕 NOUVEAU - sessionId du widget

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    let agent;
    
    if (isPublicOK) {
      agent = await Agent.findOne({ _id: id });
      console.log('Agent récupéré en mode public:', !!agent, `(${publicKind})`);
    } else {
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      agent = await Agent.findOne({ _id: id, userId: session.user.id });
    }

    if (!agent) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }

    let openaiResult;
    
    if (isPublicOK) {
      console.log(`Création OpenAI en mode public (${publicKind})...`);
      openaiResult = await createAgentOpenAIForWebhook(agent);
    } else {
      openaiResult = await createAgentOpenAI(agent);
    }

    if (!openaiResult.openai) {
      console.error('Erreur création OpenAI:', openaiResult.error);
      
      if (isPublicOK) {
        return NextResponse.json(
          { error: `Mode public: ${openaiResult.error}` },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    const openai = openaiResult.openai;
    console.log('Instance OpenAI créée avec succès');

    const agentModel = agent.openaiModel || 'gpt-4o';

    const googleCalendarResponse = await handleGoogleCalendarIntegration(
      userMessage, 
      agent.integrations || [], 
      openai,
      userTimezone,
      agentModel
    );

    if (googleCalendarResponse) {
      console.log('Google Calendar response generated');
      return NextResponse.json({ reply: googleCalendarResponse });
    }

    const calendlyResponse = await handleCalendlyIntegration(
      userMessage, 
      agent.integrations || [], 
      openai,
      agentModel
    );

    if (calendlyResponse) {
      console.log('Calendly response generated');
      return NextResponse.json({ reply: calendlyResponse });
    }

    // Vérifier les webhooks personnalisés
    const webhookResponse = await handleWebhookIntegration(
      userMessage, 
      agent.integrations || [], 
      openai,
      agentModel
    );

    if (webhookResponse) {
      console.log('Webhook response generated');
      return NextResponse.json({ reply: webhookResponse });
    }

    const knowledge = await AgentKnowledge.find({ agentId: id }).sort({ createdAt: -1 });
    
    const MAX_CONTENT_PER_FILE = 15000;
    const MAX_TOTAL_KNOWLEDGE = 80000;
    
    console.log(`Found ${knowledge.length} knowledge entries for agent ${id}`);
    
    let totalUsedChars = 0;
    const knowledgeText = knowledge
      .map((k) => {
        if (totalUsedChars >= MAX_TOTAL_KNOWLEDGE) {
          return null;
        }
        
        const remainingChars = MAX_TOTAL_KNOWLEDGE - totalUsedChars;
        const maxForThisFile = Math.min(MAX_CONTENT_PER_FILE, remainingChars);
        
        let content = k.content;
        let truncated = false;
        
        if (content.length > maxForThisFile) {
          content = content.slice(0, maxForThisFile);
          truncated = true;
        }
        
        totalUsedChars += content.length;
        
        const header = `— ${k.fileName} (${k.sourceName || 'Document'}) :`;
        const footer = truncated ? "\n... [document truncated to stay within limits]" : "";
        
        return `${header}\n${content}${footer}\n`;
      })
      .filter(Boolean)
      .join("\n");
    
    console.log(`Knowledge summary: ${totalUsedChars} chars used, ${knowledge.length} files processed`);

    const integrationsText = (agent.integrations || [])
      .map((i: any) => {
        if (i.type === "webhook") {
          return `Webhook "${i.name}": ${i.url}`;
        } else if (i.type === "calendly") {
          return `Calendly "${i.name}": ${i.url}`;
        } else if (i.type === "google_calendar") {
          return `Google Calendar "${i.name}": Connected calendar`;
        } else if (i.type === "files" && Array.isArray(i.files)) {
          const fileList = (i.files as IntegrationFile[]).map((f) => `- ${f.name}`).join("\n");
          return `Files "${i.name}":\n${fileList}`;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n\n");

    const currentDateTime = getLocalizedDateTime(userTimezone);

    const messages: ChatMessage[] = [
      { role: "system", content: agent.finalPrompt || "" },
      { role: "system", content: `Here's what you need to know:\n${knowledgeText}` },
      { 
        role: "system", 
        content: `CURRENT DATE AND TIME: ${currentDateTime}. Use this information for any time, date, or scheduling related questions. The user is in this timezone.` 
      },
    ];

    if (integrationsText) {
      messages.push({ role: "system", content: `Here are also the available integrations:\n${integrationsText}` });
    }

    if (typeof welcomeMessage === "string" && welcomeMessage.trim().length > 0) {
      messages.push({ role: "assistant", content: welcomeMessage.trim() });
    }

    messages.push(...previousMessages);
    messages.push({ role: "user", content: userMessage });

    const completion = await openai.chat.completions.create({
      model: agentModel,
      temperature: agent.temperature,
      top_p: agent.top_p,
      messages,
    });

    const reply = completion.choices[0]?.message?.content || "I couldn't provide a response.";

    // 🆕 STOCKAGE MONGODB POUR LES WIDGETS
    if (publicKind === 'widget' && widgetId && sessionId) {
      console.log(`💾 [WIDGET] Storing conversation for widget: ${widgetId}, session: ${sessionId}`);
      
      // Format conversationId: widgetId_sessionId
      const conversationId = `${widgetId}_${sessionId}`;
      
      // Stocker dans MongoDB (ne pas faire échouer la requête si ça rate)
      await storeWidgetConversation(
        conversationId,
        widgetId,      // connectionId = widgetId
        sessionId,     // userId = sessionId  
        userMessage,
        reply,
        agent
      );
    }

    return NextResponse.json({ reply });
    
  } catch (error: any) {
    console.error("Agent ask error:", error);
    
    if (error.status === 401) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key. Please check your API key in settings." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Something went wrong while processing your request." },
      { status: 500 }
    );
  }
}