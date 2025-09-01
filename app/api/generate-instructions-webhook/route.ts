import { NextResponse } from "next/server";
import { createAgentOpenAI } from "@/lib/openai";
import { connectToDatabase } from "@/lib/db";
import { Agent } from "@/models/Agent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { webhookName, description, fields, agentId } = body; // 🔧 AJOUT agentId

    if (!webhookName || !description || !fields || !Array.isArray(fields)) {
      return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    }

    // 🔧 NOUVEAU - Si agentId fourni, utiliser sa clé spécifique
    let openai;
    if (agentId) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      await connectToDatabase();
      const agent = await Agent.findOne({ _id: agentId, userId: session.user.id });
      
      if (!agent) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
      }

      const result = await createAgentOpenAI(agent);
      if (!result.openai) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      openai = result.openai;
    } else {
      // 🔧 FALLBACK - Si pas d'agentId, utiliser clé par défaut
      const { createUserOpenAI } = await import("@/lib/openai");
      const result = await createUserOpenAI();
      if (!result.openai) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      openai = result.openai;
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
    
    if (error.status === 401 || error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: "Invalid OpenAI API key. Please check your agent's selected API key." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to generate instructions" },
      { status: 500 }
    );
  }
}