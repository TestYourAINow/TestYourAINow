import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name || !description) {
      return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    }

    const safeName = name.trim();

    const prompt = `
You are an AI prompt engineer. Based on the following Calendly integration, generate ONLY the instruction block for this integration.

Respond ONLY with this markdown format:
\`\`\`markdown
### ${safeName} Integration

${description.trim()}

#### Triggering Conditions
Describe when the AI should initiate a Calendly scheduling action.

#### Information Needed
Explain what the AI needs from the user (e.g., preferred date, name, email) before triggering the link.

#### Response Handling
Explain how the AI should confirm that a Calendly link was sent or a booking was made.

#### Best Practices & Limitations
Describe how the AI should avoid redundancy, ensure user readiness, and maintain clarity.
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
  } catch (err) {
    console.error("[GENERATE_CALENDLY_INSTRUCTIONS]", err);
    return NextResponse.json(
      { error: "Failed to generate Calendly instructions" },
      { status: 500 }
    );
  }
}
