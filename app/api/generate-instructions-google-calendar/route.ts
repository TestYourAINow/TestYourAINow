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
Tu es un expert en prompt engineering. Génère des instructions DÉTAILLÉES pour une intégration Google Calendar.

Informations de l'intégration :
- Nom: ${safeName}
- Description: ${description.trim()}

Réponds UNIQUEMENT avec ce format markdown :

\`\`\`markdown
### ${safeName} Integration

${description.trim()}

#### Déclenchement automatique
Tu dois créer un rendez-vous Google Calendar quand l'utilisateur :
- Demande un rendez-vous avec une date/heure spécifique ("mardi à 14h", "vendredi matin", "demain 16h30")
- Utilise des expressions temporelles ("dans 3 jours", "la semaine prochaine", "cet après-midi")
- Confirme une disponibilité ("oui ça me va pour jeudi 10h")
- Exprime un besoin de planification avec détails temporels

#### Informations requises pour créer l'événement
Avant de créer l'événement, assure-toi d'avoir :
1. **Date et heure** : Précise (ex: "mardi 25 août 2025 à 14h00")
2. **Durée** : Par défaut 1 heure, ou selon le contexte
3. **Titre** : Génère un titre approprié (ex: "Rendez-vous avec [Client]")
4. **Email invité** : Si mentionné, sinon optionnel

#### Réponse après création
Quand tu crées avec succès un rendez-vous :
1. Confirme les détails (date, heure, durée)
2. Mentionne que l'invitation sera envoyée par email (si applicable)
3. Propose des alternatives si le créneau n'est pas libre
4. Donne les informations de modification/annulation

#### Exemple de réponse
"Parfait ! J'ai créé votre rendez-vous pour mardi 25 août 2025 à 14h00 (durée : 1 heure). ✅ 

📅 **Détails :**
- Date : Mardi 25 août 2025
- Heure : 14h00 - 15h00 
- Titre : Rendez-vous consultation

L'événement a été ajouté à votre Google Calendar. Si vous avez fourni un email, une invitation sera envoyée automatiquement."

#### Gestion des erreurs et cas spéciaux
- **Date ambiguë** : Demande clarification ("Quel mardi précisément ?")
- **Conflit d'horaire** : Propose alternatives proches
- **Timezone** : Utilise la timezone de l'utilisateur automatiquement
- **Erreur technique** : Explique poliment et propose de réessayer

#### Bonnes pratiques
- Confirme toujours les détails avant création
- Utilise un langage naturel et rassurant
- Sois précis sur les horaires (format 24h en interne, format naturel pour l'utilisateur)
- Propose toujours une assistance pour modifications
- Respecte la timezone de l'utilisateur

#### Limitations
- Ne peux pas voir le calendrier existant (conflits possibles)
- Les invitations dépendent des paramètres Google Calendar de l'utilisateur
- Modification des événements existants nécessite des informations spécifiques
\`\`\`
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Tu es un assistant expert en prompt engineering pour les intégrations Google Calendar." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
    });

    const result = completion.choices[0].message.content;
    return NextResponse.json({ instructions: result });
  } catch (error: any) {
    console.error("[GENERATE_GOOGLE_CALENDAR_INSTRUCTIONS]", error);
    
    if (error.status === 401) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key. Please check your API key in settings." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to generate Google Calendar instructions" },
      { status: 500 }
    );
  }
}