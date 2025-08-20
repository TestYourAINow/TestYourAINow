import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createUserOpenAI } from "@/lib/openai";
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
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { openai, error } = await createUserOpenAI();
    
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
Vous êtes un expert en prompt engineering et en UX writing.

DATE ET HEURE ACTUELLES: ${currentDateTime}

Vous allez recevoir:
1. Le prompt actuel (utilisé pour guider un agent IA).
2. Une instruction de l'utilisateur (demandant comment améliorer le prompt).

Votre objectif:
→ Réécrire le prompt actuel selon la demande de l'utilisateur.
→ Garder le sens clair, la structure propre, et la grammaire correcte.
→ NE PAS perdre d'informations importantes sauf si l'utilisateur a demandé de les supprimer.
→ NE PAS sur-corriger ou inventer des choses qui n'ont pas été mentionnées.
→ Retourner votre résultat en JSON (pas de formatage markdown, pas de blocs \`\`\` blocks).

Format de sortie attendu:
{
  "summary": "Quels changements ont été faits et pourquoi",
  "updatedPrompt": "Le prompt complet réécrit"
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