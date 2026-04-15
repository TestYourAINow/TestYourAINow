import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { getUserDefaultAIClient, callAI } from "@/lib/ai-client";

export async function POST(req: NextRequest) {
  try {
    const { content, apiKey } = await req.json();

    if (!content || content.trim().length < 10) {
      return NextResponse.json({
        faq: "⚠️ Please provide more detailed content to generate an FAQ.",
      });
    }

    let client: OpenAI | Anthropic;
    let provider: "openai" | "anthropic";
    let model: string;

    if (apiKey && apiKey !== "user_api_key") {
      // Specific key selected by ID
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      await connectToDatabase();
      const user = await User.findById(session.user.id);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const selectedKey = user.apiKeys?.find((key: any) => key._id.toString() === apiKey);
      if (!selectedKey) {
        return NextResponse.json(
          { error: "Selected API key not found. Please check your API key selection." },
          { status: 400 }
        );
      }

      provider = selectedKey.provider || "openai";
      model = provider === "anthropic" ? "claude-haiku-4-5-20251001" : "gpt-4o";
      client = provider === "anthropic"
        ? new Anthropic({ apiKey: selectedKey.key })
        : new OpenAI({ apiKey: selectedKey.key });
    } else {
      // User's default key
      const result = await getUserDefaultAIClient();
      if (!result.client) {
        return NextResponse.json({ error: result.error }, { status: result.error === "Unauthorized" ? 401 : 400 });
      }
      client = result.client;
      provider = result.provider;
      model = result.model;
    }

    const userPrompt = `
Transform the following company information into a well-structured FAQ.

CRITICAL INSTRUCTIONS:
1. Write the FAQ in the SAME LANGUAGE as the input content (French → French, English → English)
2. DO NOT include any introductory text like "Here's a friendly FAQ" or "Sure thing!"
3. DO NOT include any closing text like "Feel free to reach out" or "Need further assistance"
4. Start DIRECTLY with the first Q&A
5. End with the last Q&A - nothing after

FORMAT:
**Q: [question]?**
- A: [answer]

STYLE:
- Use a casual and engaging tone
- Keep answers concise but informative
- Only include relevant Q&A based on the input

Here is the content to use:
${content}
`;

    const output = await callAI(client, provider, model, [{ role: "user", content: userPrompt }], { temperature: 0.3 });

    return NextResponse.json({ faq: output });
  } catch (error: any) {
    console.error("FAQ generation error:", error);

    if (error.status === 401 || error.code === "invalid_api_key") {
      return NextResponse.json(
        { error: "Invalid API key. Please check your selected API key." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong while generating the FAQ." },
      { status: 500 }
    );
  }
}
