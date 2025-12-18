import { NextResponse } from "next/server";
import { createAgentOpenAI } from "@/lib/openai";
import { connectToDatabase } from "@/lib/db";
import { Agent } from "@/models/Agent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { webhookName, description, fields, agentId } = body;

    if (!webhookName || !description || !fields || !Array.isArray(fields)) {
      return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    }

    // Utiliser la clé de l'agent si disponible
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
      const { createUserOpenAI } = await import("@/lib/openai");
      const result = await createUserOpenAI();
      if (!result.openai) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      openai = result.openai;
    }

    const safeWebhookName = webhookName.trim();

    // 🆕 NOUVEAU PROMPT - GÉNÈRE DES INSTRUCTIONS DE HAUTE QUALITÉ
    const prompt = `You are an expert AI prompt engineer. Generate COMPREHENSIVE integration instructions for an AI agent.

Webhook Name: ${safeWebhookName}
Description: ${description.trim()}

Parameters:
${fields.map((f) => `- ${f.key.trim()}: ${f.value.trim()}`).join('\n')}

Generate instructions in this EXACT format (use markdown):

## 📋 ${safeWebhookName.toUpperCase()} INTEGRATION

You have access to a ${safeWebhookName} webhook integration. Use it when users want to:
[List 3-5 specific use cases based on the description]

### WHEN TO TRIGGER:
Trigger this webhook when the user says things like:
[Provide 5-7 natural language examples in different languages if relevant]

### REQUIRED INFORMATION:
Before triggering the webhook, you MUST collect:

${fields.map((f, i) => `${i + 1}. **${f.key.trim()}** (${f.value.trim()})
   - Example values for this field
   - Format requirements if any
   - How to convert natural language to proper format`).join('\n\n')}

### EXTRACTION PROCESS:

**Step 1:** When user mentions this action, acknowledge warmly
**Step 2:** Extract all available information from their message
**Step 3:** If ANY required information is missing, ask for it naturally:
${fields.map((f) => `   - Missing ${f.key}: "Natural question to ask the user"`).join('\n')}

**Step 4:** Once you have ALL required info, trigger the webhook

### IMPORTANT RULES:

1. ⚠️ NEVER trigger the webhook if you're missing required fields
2. ✅ ALWAYS validate data formats before triggering
3. ✅ ALWAYS confirm with the user after successfully completing the action
4. ✅ If the webhook returns data, use it in your response

### RESPONSE AFTER SUCCESS:

When the webhook returns success, respond naturally like:
[Provide 2-3 example success responses]

### EXAMPLE CONVERSATIONS:

**Example 1: Complete information provided**
User: [Realistic user message with all info]
AI: [Triggers webhook immediately]
AI: [Success confirmation response]

**Example 2: Missing information**
User: [Realistic user message with missing info]
AI: [Asks for missing information naturally]
User: [Provides missing info]
AI: [Triggers webhook]
AI: [Success confirmation]

**Example 3: Using returned data**
User: [Request that expects data back]
AI: [Triggers webhook]
AI: [Uses returned data in response]

CRITICAL: Make the instructions conversational, specific, and actionable. Include concrete examples for EVERY scenario.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert prompt engineer specializing in AI agent integrations. Generate clear, comprehensive, and actionable instructions." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
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