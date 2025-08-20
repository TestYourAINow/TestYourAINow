import { NextResponse } from "next/server";
import { createUserOpenAI } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { openai, error } = await createUserOpenAI();
    
    if (!openai) {
      return NextResponse.json({ error }, { status: error === "Unauthorized" ? 401 : 400 });
    }

    const body = await req.json();
    const { name, description } = body;

    if (!name || !description) {
      return NextResponse.json({ error: "Missing fields." }, { status: 400 });
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
    
    if (error.status === 401) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key. Please check your API key in settings." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to generate Calendly instructions" },
      { status: 500 }
    );
  }
}