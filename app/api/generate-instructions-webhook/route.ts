import { NextResponse } from "next/server";
import { createUserOpenAI } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { openai, error } = await createUserOpenAI();
    
    if (!openai) {
      return NextResponse.json({ error }, { status: error === "Unauthorized" ? 401 : 400 });
    }

    const body = await req.json();
    const { webhookName, description, fields } = body;

    if (!webhookName || !description || !fields || !Array.isArray(fields)) {
      return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    }

    const safeWebhookName = webhookName.trim();

    const prompt = `
You are an AI prompt engineer. Based on the following webhook configuration, generate ONLY the instruction block for this integration.

Respond ONLY with this markdown format:
\`\`\`markdown
### ${safeWebhookName} Integration

${description.trim()}

#### Parameters
${fields
  .map(
    (f) =>
      `- **${f.key.trim()}**: ${f.value.trim()} The AI should extract this from user input. If missing, prompt the user to provide it.`
  )
  .join("\n")}

#### Triggering Conditions
Describe when the AI should call this integration.

#### Handling Missing Information
Explain how the AI should prompt the user to provide missing data.

#### Response Handling
Describe how to confirm success or report failure.

#### Best Practices & Limitations
Add best practices for calling this webhook appropriately.
\`\`\`
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a prompt engineer assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
    });

    const result = completion.choices[0].message.content;
    return NextResponse.json({ instructions: result });
  } catch (error: any) {
    console.error("[GENERATE_INSTRUCTIONS]", error);
    
    if (error.status === 401) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key. Please check your API key in settings." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to generate instructions" },
      { status: 500 }
    );
  }
}