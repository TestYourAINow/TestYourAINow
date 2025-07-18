import { NextRequest, NextResponse } from "next/server";
import { createUserOpenAI } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { openai, error } = await createUserOpenAI();
    
    if (!openai) {
      return NextResponse.json({ error }, { status: error === "Unauthorized" ? 401 : 400 });
    }

    const { content } = await req.json();

    if (!content || content.trim().length < 10) {
      return NextResponse.json({
        faq: "⚠️ Please provide more detailed content to generate an FAQ.",
      });
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
    
    if (error.status === 401) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key. Please check your API key in settings." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Something went wrong while generating the FAQ." },
      { status: 500 }
    );
  }
}