import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createUserOpenAI } from "@/lib/openai";
import { diffWords } from "diff";

function getDiffHtml(original: string, updated: string): string {
  const diff = diffWords(original, updated);
  return diff
    .map((part) => {
      if (part.added) {
        return `<span style="color:#22c55e; background-color:rgba(34,197,94,0.15); border-radius:4px; padding:1px 2px;">${part.value}</span>`;
      } else if (part.removed) {
        return `<span style="color:#ef4444; background-color:rgba(239,68,68,0.15); border-radius:4px; padding:1px 2px;">${part.value}</span>`;
      } else {
        return `<span>${part.value}</span>`;
      }
    })
    .join("");
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { openai, error } = await createUserOpenAI();
    
    if (!openai) {
      return NextResponse.json({ error }, { status: error === "Unauthorized" ? 401 : 400 });
    }

    const { prompt, instruction } = await req.json();

    if (!prompt || !instruction) {
      return NextResponse.json(
        { error: "Missing prompt or instruction" },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are an expert in prompt engineering and UX writing.

You will receive:
1. The current prompt (used to guide an AI agent).
2. An instruction from the user (asking how to improve the prompt).

Your goal:
→ Rewrite the current prompt according to the user's request.
→ Keep the meaning clear, structure clean, and grammar correct.
→ Do NOT lose important information unless the user asked to remove it.
→ Do NOT over-correct or invent things that weren't mentioned.
→ Return your result in JSON (no markdown formatting, no \`\`\` blocks).

Expected output format:
{
  "summary": "What changes were made and why",
  "updatedPrompt": "The full rewritten prompt"
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Current Prompt:\n${prompt}\n\nUser Instruction:\n${instruction}`,
        },
      ],
    });

    const aiReply = completion.choices[0].message.content;

    try {
      const cleanReply = aiReply?.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanReply || "{}");

      const { summary, updatedPrompt } = parsed;

      if (!summary || !updatedPrompt) {
        return NextResponse.json(
          { error: "AI response malformed", raw: aiReply },
          { status: 500 }
        );
      }

      const diffPrompt = getDiffHtml(prompt, updatedPrompt);

      return NextResponse.json({
        summary,
        rewrittenPrompt: updatedPrompt,
        diffPrompt,
      });
    } catch (parseError) {
      return NextResponse.json(
        { error: "Failed to parse AI response", raw: aiReply },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("AI prompter error:", error);
    
    if (error.status === 401) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key. Please check your API key in settings." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Something went wrong while processing your request." },
      { status: 500 }
    );
  }
}