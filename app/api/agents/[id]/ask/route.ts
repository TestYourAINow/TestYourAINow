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

// 🌐 CORS Headers - NOUVEAU
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-public-kind, x-widget-id, x-widget-token, x-demo-id, x-demo-token',
  'Access-Control-Max-Age': '86400',
};

// ✅ OPTIONS handler pour preflight requests - NOUVEAU
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
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
        return NextResponse.json({ error: "Invalid demo token" }, { 
          status: 401,
          headers: corsHeaders // 🆕 CORS ajouté
        });
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
        return NextResponse.json({ error: "Unauthorized" }, { 
          status: 401,
          headers: corsHeaders // 🆕 CORS ajouté
        });
      }
    }

    const body = await req.json();
    const userMessage: string = body.message;
    const previousMessages: ChatMessage[] = body.previousMessages || [];
    const welcomeMessage: string | null = body.welcomeMessage || null;

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json({ error: "Message is required." }, { 
        status: 400,
        headers: corsHeaders // 🆕 CORS ajouté
      });
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
        return NextResponse.json({ error: "Unauthorized" }, { 
          status: 401,
          headers: corsHeaders // 🆕 CORS ajouté
        });
      }
      agent = await Agent.findOne({ _id: id, userId: session.user.id });
    }

    if (!agent) {
      return NextResponse.json({ error: "Agent not found." }, { 
        status: 404,
        headers: corsHeaders // 🆕 CORS ajouté
      });
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
          { 
            status: 400,
            headers: corsHeaders // 🆕 CORS ajouté
          }
        );
      } else {
        return NextResponse.json(
          { error: "Unauthorized" },
          { 
            status: 401,
            headers: corsHeaders // 🆕 CORS ajouté
          }
        );
      }
    }

    const openai = openaiResult.openai;
    console.log('✅ Instance OpenAI créée avec succès');

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
        } else if (i.type === "files" && Array.isArray(i.files)) {
          const fileList = (i.files as IntegrationFile[]).map((f) => `- ${f.name}`).join("\n");
          return `Files "${i.name}":\n${fileList}`;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n\n");

    // Construction du message avec mémoire
    const messages: ChatMessage[] = [
      { role: "system", content: agent.finalPrompt || "" },
      { role: "system", content: `Voici ce que tu dois savoir :\n${knowledgeText}` },
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
    
    // 🆕 CORS ajouté au success response
    return NextResponse.json({ reply }, {
      headers: corsHeaders
    });
    
  } catch (error: any) {
    console.error("Agent ask error:", error);
    
    if (error.status === 401) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key. Please check your API key in settings." },
        { 
          status: 400,
          headers: corsHeaders // 🆕 CORS ajouté
        }
      );
    }
    
    return NextResponse.json(
      { error: "Something went wrong while processing your request." },
      { 
        status: 500,
        headers: corsHeaders // 🆕 CORS ajouté
      }
    );
  }
}