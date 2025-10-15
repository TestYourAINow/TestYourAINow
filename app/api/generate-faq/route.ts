import { NextRequest, NextResponse } from "next/server";
import { createUserOpenAI } from "@/lib/openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { content, apiKey } = await req.json();

    if (!content || content.trim().length < 10) {
      return NextResponse.json({
        faq: "⚠️ Please provide more detailed content to generate an FAQ.",
      });
    }

    let openai: OpenAI;

    // Si on reçoit un apiKey spécifique (ID d'une clé), l'utiliser
    if (apiKey && apiKey !== "user_api_key") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      await connectToDatabase();
      const user = await User.findById(session.user.id);
      
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Trouver l'API key spécifique par son ID
      const selectedApiKey = user.apiKeys?.find((key: any) => key._id.toString() === apiKey);
      
      if (!selectedApiKey) {
        return NextResponse.json({ 
          error: "Selected API key not found. Please check your API key selection." 
        }, { status: 400 });
      }

      // Créer l'instance OpenAI avec la clé spécifique
      openai = new OpenAI({
        apiKey: selectedApiKey.key,
      });
    } else {
      // Fallback sur la clé par défaut
      const { openai: defaultOpenai, error } = await createUserOpenAI();
      if (!defaultOpenai) {
        return NextResponse.json({ error }, { status: error === "Unauthorized" ? 401 : 400 });
      }
      openai = defaultOpenai;
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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: userPrompt }],
      temperature: 0.3,
    });

    const output = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ faq: output });
  } catch (error: any) {
    console.error("FAQ generation error:", error);
    
    if (error.status === 401 || error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: "Invalid OpenAI API key. Please check your selected API key." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Something went wrong while generating the FAQ." },
      { status: 500 }
    );
  }
}