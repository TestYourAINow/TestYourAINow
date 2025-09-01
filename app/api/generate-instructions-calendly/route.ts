import { NextResponse } from "next/server";
import { createAgentOpenAI } from "@/lib/openai";
import { connectToDatabase } from "@/lib/db";
import { Agent } from "@/models/Agent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, agentId } = body; // 🔧 AJOUT agentId

    if (!name || !description) {
      return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    }

    // 🔧 NOUVEAU - Si agentId fourni, utiliser sa clé spécifique
    let openai;
    if (agentId) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      await connectToDatabase();
      const agent = await Agent.findOne({ _id: agentId, userId: session.user.id });
      
      if (!agent) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
      }

      const result = await createAgentOpenAI(agent);
      if (!result.openai) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      openai = result.openai;
    } else {
      // 🔧 FALLBACK - Si pas d'agentId, utiliser clé par défaut
      const { createUserOpenAI } = await import("@/lib/openai");
      const result = await createUserOpenAI();
      if (!result.openai) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      openai = result.openai;
    }

    const safeName = name.trim();

    const prompt = `
Tu es un expert en prompt engineering. Génère des instructions DÉTAILLÉES pour une intégration Calendly.

Informations de l'intégration :
- Nom: ${safeName}
- Description: ${description.trim()}

Réponds UNIQUEMENT avec ce format markdown :

\`\`\`markdown
### ${safeName} Integration

${description.trim()}

#### Déclenchement automatique
Tu dois proposer un rendez-vous Calendly quand l'utilisateur :
- Demande un rendez-vous, RDV, meeting, réunion
- Veut te rencontrer, planifier quelque chose
- Demande tes disponibilités ou ton horaire
- Utilise des mots comme "réserver", "booker", "scheduler"
- Pose des questions sur ton calendrier
- Exprime un intérêt pour tes services et semble prêt à passer à l'action

#### Réponse type
Quand tu détectes une demande de rendez-vous :
1. Réponds de manière chaleureuse et personnalisée
2. Explique brièvement le processus de réservation
3. Propose le lien Calendly de manière claire et engageante
4. Encourage l'action sans être pressant
5. Assure-toi que le lien sera fonctionnel et accessible

#### Exemple de réponse
"Je serais ravi(e) de vous rencontrer ! 📅 Je peux vous aider à réserver un créneau qui vous convient parfaitement. Cliquez sur le lien ci-dessous pour voir mes disponibilités en temps réel et choisir le moment qui vous arrange le mieux. La réservation ne prend que quelques secondes !"

#### Informations importantes
- L'intégration Calendly est active et fonctionnelle
- Les liens de réservation sont générés automatiquement via l'API Calendly
- Tu n'as pas besoin de demander l'email ou le nom (Calendly s'en occupe lors de la réservation)
- Sois proactif : si quelqu'un semble intéressé par tes services, propose spontanément un rendez-vous
- Le système détecte automatiquement les demandes de rendez-vous et génère des vrais liens Calendly
- Chaque lien mène directement au calendrier de réservation de l'utilisateur

#### Limitations et alternatives
- Ne propose pas de dates/heures spécifiques (laisse Calendly gérer les créneaux disponibles)
- Ne demande pas les détails de contact (Calendly collecte ces informations)
- Si l'intégration ne fonctionne pas temporairement, explique poliment et propose une alternative de contact
- Reste toujours positif et solution-oriented même en cas de problème technique

#### Bonnes pratiques
- Utilise un langage naturel et engageant
- Évite le jargon technique
- Personnalise tes réponses selon le contexte de la conversation
- N'hésite pas à expliquer brièvement les avantages du rendez-vous
- Maintiens un ton professionnel mais accessible
\`\`\`
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Tu es un assistant expert en prompt engineering pour les intégrations Calendly." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
    });

    const result = completion.choices[0].message.content;
    return NextResponse.json({ instructions: result });
  } catch (error: any) {
    console.error("[GENERATE_CALENDLY_INSTRUCTIONS]", error);
    
    if (error.status === 401 || error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: "Invalid OpenAI API key. Please check your agent's selected API key." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to generate Calendly instructions" },
      { status: 500 }
    );
  }
}