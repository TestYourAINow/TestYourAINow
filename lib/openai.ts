import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Fonction pour créer une instance OpenAI avec la clé de l'utilisateur
export async function createUserOpenAI(): Promise<{ openai: OpenAI | null; error: string | null }> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return { openai: null, error: "Unauthorized" };
    }

    const userApiKey = session.user.openaiApiKey;
    
    if (!userApiKey) {
      return { openai: null, error: "Please add your OpenAI API key in your dashboard settings" };
    }

    const openai = new OpenAI({
      apiKey: userApiKey,
    });

    return { openai, error: null };
  } catch (error) {
    console.error("Error creating OpenAI instance:", error);
    return { openai: null, error: "Failed to initialize OpenAI" };
  }
}

// Garde l'ancienne export pour compatibilité (optionnel)
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});