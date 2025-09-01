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
Transform the following company information into a friendly, well-structured FAQ written in Markdown.

- Use a casual and engaging tone, as if the brand was talking to a curious customer.
- Keep the answers concise, but informative.
- Only include relevant Q&A based on the input.
- If the input lacks enough info, just say so in a helpful sentence.
- Format each item like this:
**Q: What is [question]?**
- A: [Answer]

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