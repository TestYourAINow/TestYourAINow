import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/db";

// Fonction pour créer une instance OpenAI avec la clé par défaut de l'utilisateur
export async function createUserOpenAI(): Promise<{ openai: OpenAI | null; error: string | null }> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return { openai: null, error: "Unauthorized" };
    }

    await connectToDatabase();
    
    // Récupérer l'utilisateur avec ses API keys
    const user = await User.findById(session.user.id);
    if (!user) {
      return { openai: null, error: "User not found" };
    }

    // Trouver l'API key par défaut (avec l'étoile)
    const defaultApiKey = user.apiKeys?.find((key: any) => key.isDefault);
    
    // Utiliser l'API key par défaut, sinon fallback sur l'ancien champ
    const userApiKey = defaultApiKey?.key || user.openaiApiKey;
    
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

// Fonction pour créer une instance OpenAI avec la clé spécifique de l'agent (avec session)
export async function createAgentOpenAI(agent: any): Promise<{ openai: OpenAI | null; error: string | null }> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return { openai: null, error: "Unauthorized" };
    }

    // Si l'agent n'a pas d'apiKey, utiliser la clé par défaut
    if (!agent.apiKey) {
      return await createUserOpenAI();
    }

    await connectToDatabase();
    
    // Récupérer l'utilisateur avec ses API keys
    const user = await User.findById(session.user.id);
    if (!user) {
      return { openai: null, error: "User not found" };
    }

    // Si c'est une vraie clé API (commence par sk-) - fallback pour anciennes données
    if (typeof agent.apiKey === 'string' && agent.apiKey.startsWith('sk-')) {
      const openai = new OpenAI({
        apiKey: agent.apiKey,
      });
      return { openai, error: null };
    }

    // Trouver l'API key spécifique dans les clés de l'utilisateur (comportement normal)
    const apiKeyData = user.apiKeys?.find((key: any) => key._id.toString() === agent.apiKey);
    
    if (!apiKeyData) {
      return { openai: null, error: "API key not found for this agent" };
    }

    const openai = new OpenAI({
      apiKey: apiKeyData.key,
    });

    return { openai, error: null };
  } catch (error) {
    console.error("Error creating agent OpenAI instance:", error);
    return { openai: null, error: "Failed to initialize OpenAI for agent" };
  }
}

// 🆕 NOUVELLE FONCTION pour les webhooks (sans session)
export async function createAgentOpenAIForWebhook(agent: any): Promise<{ openai: OpenAI | null; error: string | null }> {
  try {
    await connectToDatabase();
    
    if (!agent.apiKey) {
      return { openai: null, error: "Agent has no API key configured" };
    }

    // Si c'est une vraie clé API (commence par sk-) - fallback pour anciennes données
    if (typeof agent.apiKey === 'string' && agent.apiKey.startsWith('sk-')) {
      const openai = new OpenAI({
        apiKey: agent.apiKey,
      });
      return { openai, error: null };
    }

    // Récupérer l'utilisateur propriétaire de l'agent
    const user = await User.findById(agent.userId);
    if (!user) {
      return { openai: null, error: "Agent owner not found" };
    }

    // Trouver l'API key spécifique dans les clés de l'utilisateur
    const apiKeyData = user.apiKeys?.find((key: any) => key._id.toString() === agent.apiKey);
    
    if (!apiKeyData) {
      // Fallback: essayer l'API key par défaut
      const defaultApiKey = user.apiKeys?.find((key: any) => key.isDefault);
      if (defaultApiKey) {
        const openai = new OpenAI({
          apiKey: defaultApiKey.key,
        });
        return { openai, error: null };
      }
      
      // Dernier fallback: ancienne API key
      if (user.openaiApiKey) {
        const openai = new OpenAI({
          apiKey: user.openaiApiKey,
        });
        return { openai, error: null };
      }
      
      return { openai: null, error: "No valid API key found for this agent" };
    }

    const openai = new OpenAI({
      apiKey: apiKeyData.key,
    });

    return { openai, error: null };
  } catch (error) {
    console.error("Error creating webhook OpenAI instance:", error);
    return { openai: null, error: "Failed to initialize OpenAI for webhook" };
  }
}