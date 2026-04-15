import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { createAgentOpenAI, createAgentOpenAIForWebhook } from "@/lib/openai";
import { createAgentAnthropic, createAgentAnthropicForWebhook } from "@/lib/anthropic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/db";

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export function isClaudeModel(model: string): boolean {
  return model.startsWith("claude-");
}

// Get the right AI client for an agent (authenticated route)
export async function getAIClient(agent: any): Promise<{
  client: OpenAI | Anthropic | null;
  provider: "openai" | "anthropic";
  error: string | null;
}> {
  const model = agent.openaiModel || "gpt-4o";

  if (isClaudeModel(model)) {
    const { anthropic, error } = await createAgentAnthropic(agent);
    return { client: anthropic, provider: "anthropic", error };
  } else {
    const { openai, error } = await createAgentOpenAI(agent);
    return { client: openai, provider: "openai", error };
  }
}

// Get the right AI client for an agent (webhook/public route — no session)
export async function getAIClientForWebhook(agent: any): Promise<{
  client: OpenAI | Anthropic | null;
  provider: "openai" | "anthropic";
  error: string | null;
}> {
  const model = agent.openaiModel || "gpt-4o";

  if (isClaudeModel(model)) {
    const { anthropic, error } = await createAgentAnthropicForWebhook(agent);
    return { client: anthropic, provider: "anthropic", error };
  } else {
    const { openai, error } = await createAgentOpenAIForWebhook(agent);
    return { client: openai, provider: "openai", error };
  }
}

// Get the right AI client using the user's default API key (for platform tools)
export async function getUserDefaultAIClient(): Promise<{
  client: OpenAI | Anthropic | null;
  provider: "openai" | "anthropic";
  model: string;
  error: string | null;
}> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { client: null, provider: "openai", model: "gpt-4o", error: "Unauthorized" };
  }

  await connectToDatabase();
  const user = await User.findById(session.user.id);
  if (!user) {
    return { client: null, provider: "openai", model: "gpt-4o", error: "User not found" };
  }

  // Find the default key, fall back to first key, then legacy field
  const defaultKey = user.apiKeys?.find((k: any) => k.isDefault);
  const keyData = defaultKey || user.apiKeys?.[0];
  const keyStr = keyData?.key || user.openaiApiKey;

  if (!keyStr) {
    return { client: null, provider: "openai", model: "gpt-4o", error: "No API key found. Please add one in your settings." };
  }

  const provider: "openai" | "anthropic" = keyData?.provider || "openai";

  if (provider === "anthropic") {
    return {
      client: new Anthropic({ apiKey: keyStr }),
      provider: "anthropic",
      model: "claude-haiku-4-5-20251001",
      error: null,
    };
  } else {
    return {
      client: new OpenAI({ apiKey: keyStr }),
      provider: "openai",
      model: "gpt-4o",
      error: null,
    };
  }
}

// Unified AI call — handles OpenAI and Anthropic differences internally
export async function callAI(
  client: OpenAI | Anthropic,
  provider: "openai" | "anthropic",
  model: string,
  messages: ChatMessage[],
  options: { temperature?: number; top_p?: number; max_tokens?: number } = {}
): Promise<string> {
  if (provider === "anthropic") {
    const anthropic = client as Anthropic;

    // Anthropic: system messages go in the `system` param, not in messages array
    const systemParts = messages.filter((m) => m.role === "system").map((m) => m.content);
    const conversationMessages = messages.filter((m) => m.role !== "system");

    const response = await anthropic.messages.create({
      model,
      max_tokens: options.max_tokens || 8096,
      ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
      ...(systemParts.length > 0 ? { system: systemParts.join("\n\n") } : {}),
      messages: conversationMessages as Anthropic.MessageParam[],
    });

    const block = response.content[0];
    return block.type === "text" ? block.text : "";
  } else {
    const openai = client as OpenAI;

    const completion = await openai.chat.completions.create({
      model,
      ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
      ...(options.top_p !== undefined ? { top_p: options.top_p } : {}),
      messages,
    });

    return completion.choices[0]?.message?.content || "";
  }
}
