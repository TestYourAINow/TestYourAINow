import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Agent } from "@/models/Agent";
import { AgentKnowledge } from "@/models/AgentKnowledge";
import { Demo } from "@/models/Demo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createAgentOpenAI, createAgentOpenAIForWebhook } from "@/lib/openai";

type IntegrationFile = { name: string; size: number; path: string; url: string };
type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

// 🆕 Interface pour typer le Demo
interface DemoDocument {
  _id: string;
  userId: string;
  name: string;
  agentId: string;
  demoToken: string;
  publicEnabled: boolean;
  // ... autres champs si nécessaire
}

// 🆕 FONCTION HELPER POUR LA DATE LOCALISÉE
function getLocalizedDateTime(timezone: string): string {
  const now = new Date();
  
  try {
    // Essayer de formater avec la timezone de l'utilisateur
    const localTime = now.toLocaleString('fr-FR', { 
      timeZone: timezone,
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    // Obtenir le nom de la timezone en français
    const timeZoneName = Intl.DateTimeFormat('fr', { timeZone: timezone, timeZoneName: 'long' })
      .formatToParts(now)
      .find(part => part.type === 'timeZoneName')?.value || timezone;
    
    return `${localTime} (${timeZoneName})`;
  } catch (error) {
    // Si la timezone n'est pas valide, utiliser UTC
    console.warn('Timezone invalide:', timezone, 'Utilisation UTC');
    return `${now.toISOString().replace('T', ' ').replace('Z', '')} (UTC)`;
  }
}

// 🆕 NOUVELLE FONCTION : Gérer les intégrations Calendly
async function handleCalendlyIntegration(
  userMessage: string, 
  integrations: any[], 
  openai: any
): Promise<string | null> {
  const calendlyIntegrations = integrations.filter(i => i.type === "calendly");
  
  if (calendlyIntegrations.length === 0) return null;
  
  // Détecter si l'utilisateur demande un rendez-vous
  const appointmentKeywords = [
    'rendez-vous', 'rdv', 'rencontrer', 'réunion', 'meeting', 
    'planifier', 'réserver', 'disponibilité', 'horaire', 
    'calendrier', 'appointment', 'schedule', 'book', 'booking',
    'prendre rendez-vous', 'fixer un rdv', 'voir ensemble'
  ];
  
  const hasAppointmentRequest = appointmentKeywords.some(keyword => 
    userMessage.toLowerCase().includes(keyword)
  );
  
  if (!hasAppointmentRequest) return null;
  
  console.log('🗓️ Demande de rendez-vous détectée, intégration Calendly...');
  
  for (const integration of calendlyIntegrations) {
    if (!integration.apiKey) {
      console.log(`❌ Pas d'API key pour l'intégration ${integration.name}`);
      continue;
    }
    
    try {
      // 1. Récupérer les informations utilisateur Calendly
      const userRes = await fetch('https://api.calendly.com/users/me', {
        headers: {
          'Authorization': `Bearer ${integration.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!userRes.ok) {
        console.log(`❌ Erreur API Calendly user (${userRes.status}):`, await userRes.text());
        continue;
      }
      
      const userData = await userRes.json();
      const userUri = userData.resource.uri;
      
      console.log('✅ Utilisateur Calendly récupéré:', userData.resource.name);
      
      // 2. Récupérer les types d'événements
      const eventsRes = await fetch(`https://api.calendly.com/event_types?user=${userUri}&active=true`, {
        headers: {
          'Authorization': `Bearer ${integration.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!eventsRes.ok) {
        console.log(`❌ Erreur API Calendly events (${eventsRes.status}):`, await eventsRes.text());
        continue;
      }
      
      const eventsData = await eventsRes.json();
      const eventTypes = eventsData.collection || [];
      
      console.log(`📅 ${eventTypes.length} types d'événements trouvés`);
      
      if (eventTypes.length === 0) {
        return `❌ Aucun type d'événement actif trouvé sur Calendly pour ${integration.name}. Veuillez configurer vos événements sur Calendly.`;
      }
      
      // 3. Prendre le premier type d'événement disponible
      const firstEvent = eventTypes[0];
      const schedulingUrl = firstEvent.scheduling_url;
      
      console.log('🔗 URL de planification:', schedulingUrl);
      
      // 4. Utiliser l'IA pour générer une réponse personnalisée
      const aiRes = await openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant qui aide à planifier des rendez-vous. L'utilisateur vient de demander un rendez-vous. Tu as accès à Calendly avec le lien : ${schedulingUrl}

Réponds de manière naturelle, chaleureuse et professionnelle en proposant ce lien pour réserver. 

Instructions importantes :
- Sois enthousiaste mais professionnel
- Explique brièvement que le lien mène à un calendrier de réservation
- Encourage l'action
- Garde un ton personnalisé et humain
- Ne mentionne pas les détails techniques de Calendly`
          },
          {
            role: 'user',
            content: userMessage
          }
        ]
      });
      
      const aiResponse = aiRes.choices[0]?.message?.content || '';
      
      // 5. Construire la réponse finale avec le lien
      const finalResponse = `${aiResponse}\n\n🗓️ **Réservez votre créneau ici :** ${schedulingUrl}`;
      
      console.log('✅ Réponse Calendly générée avec succès');
      return finalResponse;
      
    } catch (error) {
      console.error('❌ Erreur Calendly pour', integration.name, ':', error);
      continue;
    }
  }
  
  // Si aucune intégration n'a fonctionné
  return `Je serais ravi de planifier un rendez-vous avec vous ! Malheureusement, il semble y avoir un problème temporaire avec mon système de réservation. Pouvez-vous me contacter directement pour que nous puissions organiser notre rencontre ?`;
}

// 🆕 NOUVELLE FONCTION : Gérer les intégrations Google Calendar
async function handleGoogleCalendarIntegration(
  userMessage: string,
  integrations: any[],
  openai: any,
  userTimezone: string
): Promise<string | null> {
  const googleCalendarIntegrations = integrations.filter(i => i.type === "google_calendar");
  
  if (googleCalendarIntegrations.length === 0) return null;
  
  // Détecter si l'utilisateur demande un rendez-vous avec date/heure spécifique
  const timeIndicators = [
    'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche', 'lundi',
    'demain', 'après-midi', 'matin', 'soir', 'dans', 'h', 'heure', '14h', '15h', '16h',
    'à', 'le', 'prochain', 'prochaine', 'semaine', 'aujourd\'hui', ':', 'h00', 'h30'
  ];
  
  const appointmentKeywords = [
    'rendez-vous', 'rdv', 'rencontrer', 'réunion', 'meeting', 
    'planifier', 'réserver', 'booker', 'créer', 'fixer'
  ];
  
  const hasTimeIndicator = timeIndicators.some(indicator => 
    userMessage.toLowerCase().includes(indicator)
  );
  
  const hasAppointmentKeyword = appointmentKeywords.some(keyword => 
    userMessage.toLowerCase().includes(keyword)
  );
  
  // Seulement déclencher si on a à la fois un mot-clé de RDV ET un indicateur temporel
  if (!hasTimeIndicator || !hasAppointmentKeyword) return null;
  
  console.log('🗓️ Demande de création Google Calendar détectée...');
  
  for (const integration of googleCalendarIntegrations) {
    if (!integration.accessToken) {
      console.log(`❌ Pas d'access token pour ${integration.name}`);
      continue;
    }
    
    try {
      // 1. Demander à l'IA d'extraire les informations temporelles
      const extractionRes = await openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant spécialisé dans l'extraction d'informations temporelles. 

Date et heure actuelles: ${new Date().toLocaleString('fr-FR', { 
              timeZone: userTimezone,
              year: 'numeric',
              month: 'long', 
              day: 'numeric',
              weekday: 'long',
              hour: '2-digit',
              minute: '2-digit'
            })} (${userTimezone})

À partir du message utilisateur, extrait les informations de rendez-vous et réponds UNIQUEMENT en JSON:

{
  "hasAppointment": true/false,
  "datetime": "2025-08-25T14:00:00", // Format ISO, timezone utilisateur
  "duration": 60, // en minutes
  "title": "Titre du rendez-vous",
  "email": "email@exemple.com" // si mentionné, sinon null
}

Si les informations sont incomplètes ou ambiguës, retourne "hasAppointment": false.`
          },
          {
            role: 'user',
            content: userMessage
          }
        ]
      });
      
      const extractedInfo = JSON.parse(extractionRes.choices[0]?.message?.content || '{"hasAppointment": false}');
      
      if (!extractedInfo.hasAppointment) {
        console.log('❌ Informations temporelles insuffisantes');
        continue;
      }
      
      console.log('✅ Informations extraites:', extractedInfo);
      
      // 2. Créer l'événement Google Calendar
      const startDateTime = new Date(extractedInfo.datetime);
      const endDateTime = new Date(startDateTime.getTime() + (extractedInfo.duration * 60000));
      
      const calendarEvent = {
        summary: extractedInfo.title || 'Rendez-vous',
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: userTimezone
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: userTimezone
        },
        attendees: extractedInfo.email ? [{ email: extractedInfo.email }] : undefined,
        description: `Rendez-vous créé automatiquement via l'assistant IA`
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
        console.error('❌ Erreur création Google Calendar:', errorData);
        continue;
      }
      
      const createdEvent = await createEventRes.json();
      console.log('✅ Événement créé:', createdEvent.id);
      
      // 3. Générer une réponse personnalisée
      const confirmationRes = await openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant qui confirme la création d'un rendez-vous Google Calendar.

L'événement a été créé avec succès avec ces détails :
- Titre: ${extractedInfo.title}
- Date: ${startDateTime.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              timeZone: userTimezone
            })}
- Heure: ${startDateTime.toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit',
              timeZone: userTimezone
            })} - ${endDateTime.toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit',
              timeZone: userTimezone
            })}
- Durée: ${extractedInfo.duration} minutes

Réponds de manière chaleureuse et professionnelle pour confirmer la création. Inclus les détails importants et rassure l'utilisateur.`
          },
          {
            role: 'user',
            content: userMessage
          }
        ]
      });
      
      const confirmationMessage = confirmationRes.choices[0]?.message?.content || '';
      
      const finalResponse = `${confirmationMessage}\n\n✅ **Événement créé dans Google Calendar**\n📅 Lien: ${createdEvent.htmlLink}`;
      
      console.log('✅ Réponse Google Calendar générée avec succès');
      return finalResponse;
      
    } catch (error) {
      console.error('❌ Erreur Google Calendar pour', integration.name, ':', error);
      continue;
    }
  }
  
  // Si aucune intégration n'a fonctionné
  return `Je serais ravi de créer ce rendez-vous pour vous ! Malheureusement, il semble y avoir un problème temporaire avec mon intégration Google Calendar. Pouvez-vous me redonner les détails du rendez-vous que nous pourrons organiser manuellement ?`;
}

export async function POST(req: NextRequest, context: any) {
  try {
    // Récupérer les paramètres
    const params = await context.params;
    const { id } = params;
    
    await connectToDatabase();

    // 🆕 ÉTAPE 1: Vérifier si c'est un appel public (demo ou widget)
    const publicKind = req.headers.get('x-public-kind');
    const demoId = req.headers.get('x-demo-id');
    const demoToken = req.headers.get('x-demo-token');
    const widgetId = req.headers.get('x-widget-id');
    const widgetToken = req.headers.get('x-widget-token');
    
    let isPublicOK = false;
    let session = null;

    if (publicKind === 'demo' && demoId && demoToken) {
      // Mode public DEMO : valider le token de la démo
      console.log('🔓 Mode public DEMO détecté, validation du token...');
      
      const demo = await Demo.findById(demoId).lean() as DemoDocument | null;
      
      if (demo && demo.demoToken === demoToken && demo.publicEnabled) {
        isPublicOK = true;
        console.log('✅ Token démo valide, accès public autorisé');
      } else {
        console.log('❌ Token démo invalide ou démo désactivée');
        return NextResponse.json({ error: "Invalid demo token" }, { status: 401 });
      }
    } else if (publicKind === 'widget' && widgetId && widgetToken === 'public') {
      // Mode public WIDGET : validation simplifiée
      console.log('🔓 Mode public WIDGET détecté, validation...');
      
      // Pour l'instant, on accepte tous les widgets avec token "public"
      // Plus tard, on pourra ajouter une validation plus stricte
      isPublicOK = true;
      console.log('✅ Widget public autorisé');
    } else {
      // Mode privé : vérifier la session
      session = await getServerSession(authOptions);
      if (!session || !session.user?.email || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json();
    const userMessage: string = body.message;
    const previousMessages: ChatMessage[] = body.previousMessages || [];
    const welcomeMessage: string | null = body.welcomeMessage || null;
    const userTimezone: string = body.timezone || 'UTC'; // 🆕 NOUVEAU

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    // 🆕 ÉTAPE 2: Récupérer l'agent selon le mode (public ou privé)
    let agent;
    
    if (isPublicOK) {
      // Mode public : récupérer l'agent sans vérifier le userId
      agent = await Agent.findOne({ _id: id });
      console.log('🔓 Agent récupéré en mode public:', !!agent, `(${publicKind})`);
    } else {
      // Mode privé : récupérer l'agent avec vérification du userId
      // ✅ Fix TypeScript : vérifier que session n'est pas null
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      agent = await Agent.findOne({ _id: id, userId: session.user.id });
    }

    if (!agent) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }

    // 🆕 ÉTAPE 3: Créer l'instance OpenAI selon le mode
    let openaiResult;
    
    if (isPublicOK) {
      // Mode public : utiliser la fonction webhook (sans session)
      console.log(`🔓 Création OpenAI en mode public (${publicKind})...`);
      openaiResult = await createAgentOpenAIForWebhook(agent);
    } else {
      // Mode privé : utiliser la fonction normale (avec session)
      openaiResult = await createAgentOpenAI(agent);
    }

    // Gérer les erreurs OpenAI
    if (!openaiResult.openai) {
      console.error('❌ Erreur création OpenAI:', openaiResult.error);
      
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
    console.log('✅ Instance OpenAI créée avec succès');

    // 🆕 VÉRIFIER SI C'EST UNE DEMANDE DE CRÉATION GOOGLE CALENDAR
    const googleCalendarResponse = await handleGoogleCalendarIntegration(
      userMessage, 
      agent.integrations || [], 
      openai,
      userTimezone
    );

    if (googleCalendarResponse) {
      console.log('✅ Réponse Google Calendar générée');
      return NextResponse.json({ reply: googleCalendarResponse });
    }

    // 🆕 VÉRIFIER SI C'EST UNE DEMANDE DE RENDEZ-VOUS CALENDLY
    const calendlyResponse = await handleCalendlyIntegration(
      userMessage, 
      agent.integrations || [], 
      openai
    );

    if (calendlyResponse) {
      console.log('✅ Réponse Calendly générée');
      return NextResponse.json({ reply: calendlyResponse });
    }

    // Le reste du code reste identique...
    // Connaissances internes (fichiers) - LIMITE INTELLIGENTE
    const knowledge = await AgentKnowledge.find({ agentId: id }).sort({ createdAt: -1 });
    
    const MAX_CONTENT_PER_FILE = 15000;
    const MAX_TOTAL_KNOWLEDGE = 80000;
    
    console.log(`📚 Found ${knowledge.length} knowledge entries for agent ${id}`);
    
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
        const footer = truncated ? "\n... [document tronqué pour rester dans les limites]" : "";
        
        return `${header}\n${content}${footer}\n`;
      })
      .filter(Boolean)
      .join("\n");
    
    console.log(`📊 Knowledge summary: ${totalUsedChars} chars used, ${knowledge.length} files processed`);

    // Intégrations
    const integrationsText = (agent.integrations || [])
      .map((i: any) => {
        if (i.type === "webhook") {
          return `Webhook "${i.name}": ${i.url}`;
        } else if (i.type === "calendly") {
          return `Calendly "${i.name}": ${i.url}`;
        } else if (i.type === "google_calendar") {
          return `Google Calendar "${i.name}": Calendrier connecté`;
        } else if (i.type === "files" && Array.isArray(i.files)) {
          const fileList = (i.files as IntegrationFile[]).map((f) => `- ${f.name}`).join("\n");
          return `Files "${i.name}":\n${fileList}`;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n\n");

    // 🆕 OBTENIR LA DATE LOCALISÉE
    const currentDateTime = getLocalizedDateTime(userTimezone);

    // Construction du message avec mémoire
    const messages: ChatMessage[] = [
      { role: "system", content: agent.finalPrompt || "" },
      { role: "system", content: `Voici ce que tu dois savoir :\n${knowledgeText}` },
      { 
        role: "system", 
        content: `DATE ET HEURE ACTUELLES: ${currentDateTime}. Utilise cette information pour toute question relative au temps, aux dates, ou à la planification. L'utilisateur est dans cette timezone.` 
      },
    ];

    if (integrationsText) {
      messages.push({ role: "system", content: `Voici aussi les intégrations disponibles :\n${integrationsText}` });
    }

    if (typeof welcomeMessage === "string" && welcomeMessage.trim().length > 0) {
      messages.push({ role: "assistant", content: welcomeMessage.trim() });
    }

    messages.push(...previousMessages);
    messages.push({ role: "user", content: userMessage });

    // Appel OpenAI
    const completion = await openai.chat.completions.create({
      model: agent.openaiModel,
      temperature: agent.temperature,
      top_p: agent.top_p,
      messages,
    });

    const reply = completion.choices[0]?.message?.content || "Je n'ai pas pu répondre.";
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