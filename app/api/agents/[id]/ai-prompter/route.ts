import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Agent } from "@/models/Agent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createAgentOpenAI } from "@/lib/openai";
import { diffWords } from "diff";

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

function getDiffHtml(original: string, updated: string): string {
  const diff = diffWords(original, updated);
  return diff
    .map((part) => {
      if (part.added) {
        return `<span style="color:#22c55e; background-color:rgba(34,197,94,0.15); border-radius:4px; padding:1px 2px;">${part.value}</span>`;
      } else if (part.removed) {
        return `<span style="color:#ef4444; background-color:rgba(239,68,68,0.15); border-radius:4px; padding:1px 2px;">${part.value}</span>`;
      } else {
        return `<span>${part.value}</span>`;
      }
    })
    .join("");
}

export async function POST(
  req: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    const { id } = params; // agentId depuis l'URL

    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔧 CHANGEMENT PRINCIPAL - Récupérer l'agent d'abord
    const agent = await Agent.findOne({ _id: id, userId: session.user.id });
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // 🔧 CHANGEMENT PRINCIPAL - Utiliser la clé spécifique de l'agent
    const { openai, error } = await createAgentOpenAI(agent);
    
    if (!openai) {
      return NextResponse.json({ error }, { status: error === "Unauthorized" ? 401 : 400 });
    }

    const { prompt, instruction, timezone = 'UTC' } = await req.json(); // 🆕 AJOUTÉ timezone

    if (!prompt || !instruction) {
      return NextResponse.json(
        { error: "Missing prompt or instruction" },
        { status: 400 }
      );
    }

    // 🆕 OBTENIR LA DATE LOCALISÉE
    const currentDateTime = getLocalizedDateTime(timezone);

    const systemPrompt = `
You are an expert in prompt engineering and UX writing.

CURRENT DATE AND TIME: ${currentDateTime}

You will receive:
1. The current prompt (used to guide an AI agent).
2. A user instruction (requesting how to improve the prompt).

Your objective:
→ Rewrite the current prompt according to the user's request.
→ Keep the meaning clear, the structure clean, and the grammar correct.
→ ALWAYS preserve the exact format of the original prompt (HTML tags, line breaks, structure, lists, etc.).
→ If the prompt contains HTML, the updatedPrompt must also contain HTML with the same structure.
→ ALWAYS write the updatedPrompt in the same language as the original prompt.
→ ALWAYS write the summary in the same language as the user's instruction.
→ In the summary, NEVER mention that you preserved the format or structure. Only mention the actual content changes made.
→ Do NOT lose important information unless the user explicitly asked to remove it.
→ Do NOT over-correct or invent things that were not mentioned.
→ Do NOT produce a continuous block of text without structure.
→ Return your result as JSON (no markdown formatting, no \`\`\` blocks).

Expected output format:
{
  "summary": "What changes were made and why",
  "updatedPrompt": "The complete rewritten prompt"
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Current Prompt:\n${prompt}\n\nUser Instruction:\n${instruction}`,
        },
      ],
    });

    const aiReply = completion.choices[0].message.content;

    try {
      const cleanReply = aiReply?.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanReply || "{}");

      const { summary, updatedPrompt } = parsed;

      if (!summary || !updatedPrompt) {
        return NextResponse.json(
          { error: "AI response malformed", raw: aiReply },
          { status: 500 }
        );
      }

      const diffPrompt = getDiffHtml(prompt, updatedPrompt);

      return NextResponse.json({
        summary,
        rewrittenPrompt: updatedPrompt,
        diffPrompt,
      });
    } catch (parseError) {
      return NextResponse.json(
        { error: "Failed to parse AI response", raw: aiReply },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("AI prompter error:", error);
    
    if (error.status === 401 || error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: "Invalid OpenAI API key. Please check your agent's selected API key." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Something went wrong while processing your request." },
      { status: 500 }
    );
  }
}