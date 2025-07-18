import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Agent } from "@/models/Agent";
import { AgentKnowledge } from "@/models/AgentKnowledge";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createUserOpenAI } from "@/lib/openai";

type IntegrationFile = { name: string; size: number; path: string; url: string };
type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { openai, error } = await createUserOpenAI();
    
    if (!openai) {
      return NextResponse.json({ error }, { status: error === "Unauthorized" ? 401 : 400 });
    }

    const { id } = params;
    const body = await req.json();
    const userMessage: string = body.message;
    const previousMessages: ChatMessage[] = body.previousMessages || [];
    const welcomeMessage: string | null = body.welcomeMessage || null;

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    // 1. Récupérer l'agent
    const agent = await Agent.findOne({ _id: id, userId: session.user.id });
    if (!agent) return NextResponse.json({ error: "Agent not found." }, { status: 404 });

    // 2. Connaissances internes (fichiers) - LIMITE INTELLIGENTE
    const knowledge = await AgentKnowledge.find({ agentId: id }).sort({ createdAt: -1 });
    
    const MAX_CONTENT_PER_FILE = 15000; // 15k caractères par fichier
    const MAX_TOTAL_KNOWLEDGE = 80000;  // 80k caractères total (pour éviter de dépasser les limites OpenAI)
    
    console.log(`📚 Found ${knowledge.length} knowledge entries for agent ${id}`);
    
    let totalUsedChars = 0;
    const knowledgeText = knowledge
      .map((k) => {
        // Si on a déjà atteint la limite totale, arrêter
        if (totalUsedChars >= MAX_TOTAL_KNOWLEDGE) {
          return null;
        }
        
        // Calculer combien on peut encore utiliser
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
      .filter(Boolean) // Enlever les null
      .join("\n");
    
    console.log(`📊 Knowledge summary: ${totalUsedChars} chars used, ${knowledge.length} files processed`);

    // 3. Intégrations
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

    // 4. Construction du message avec mémoire
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

    // 5. Appel OpenAI
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