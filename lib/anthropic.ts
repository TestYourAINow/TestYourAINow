import Anthropic from "@anthropic-ai/sdk";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/db";

// Find the right Anthropic key for a user (default or specified)
async function findAnthropicKey(user: any, keyId?: string): Promise<string | null> {
  const keys = user.apiKeys || [];
  const anthropicKeys = keys.filter((k: any) => k.provider === 'anthropic');

  if (anthropicKeys.length === 0) return null;

  if (keyId) {
    const specific = anthropicKeys.find((k: any) => k._id.toString() === keyId);
    if (specific) return specific.key;
  }

  const defaultKey = anthropicKeys.find((k: any) => k.isDefault);
  return defaultKey?.key || anthropicKeys[0]?.key || null;
}

// With session (authenticated user)
export async function createAgentAnthropic(agent: any): Promise<{ anthropic: Anthropic | null; error: string | null }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { anthropic: null, error: "Unauthorized" };

    await connectToDatabase();
    const user = await User.findById(session.user.id);
    if (!user) return { anthropic: null, error: "User not found" };

    const apiKey = await findAnthropicKey(user, agent.apiKey);
    if (!apiKey) return { anthropic: null, error: "No Anthropic API key found. Please add an Anthropic key in your settings." };

    return { anthropic: new Anthropic({ apiKey }), error: null };
  } catch (error) {
    console.error("Error creating Anthropic instance:", error);
    return { anthropic: null, error: "Failed to initialize Anthropic" };
  }
}

// Without session (webhooks, public)
export async function createAgentAnthropicForWebhook(agent: any): Promise<{ anthropic: Anthropic | null; error: string | null }> {
  try {
    await connectToDatabase();

    const user = await User.findById(agent.userId);
    if (!user) return { anthropic: null, error: "Agent owner not found" };

    const apiKey = await findAnthropicKey(user, agent.apiKey);
    if (!apiKey) return { anthropic: null, error: "No Anthropic API key found for this agent" };

    return { anthropic: new Anthropic({ apiKey }), error: null };
  } catch (error) {
    console.error("Error creating Anthropic instance for webhook:", error);
    return { anthropic: null, error: "Failed to initialize Anthropic for webhook" };
  }
}
