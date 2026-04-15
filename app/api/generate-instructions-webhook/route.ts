import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Agent } from "@/models/Agent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getAIClient, getUserDefaultAIClient, callAI } from "@/lib/ai-client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { webhookName, description, fields, agentId } = body;

    if (!webhookName || !description || !fields || !Array.isArray(fields)) {
      return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    }

    let client: any;
    let provider: "openai" | "anthropic";
    let model: string;

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

      const result = await getAIClient(agent);
      if (!result.client) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      client = result.client;
      provider = result.provider;
      model = agent.openaiModel || "gpt-4o";
    } else {
      const result = await getUserDefaultAIClient();
      if (!result.client) {
        return NextResponse.json({ error: result.error }, { status: result.error === "Unauthorized" ? 401 : 400 });
      }
      client = result.client;
      provider = result.provider;
      model = result.model;
    }

    const safeWebhookName = webhookName.trim();

   // 🔥 DÉTECTION DU TYPE DE WEBHOOK
    const webhookNameLower = safeWebhookName.toLowerCase();
    const isListType = webhookNameLower.includes('list') || 
                       webhookNameLower.includes('check') || 
                       webhookNameLower.includes('show') || 
                       webhookNameLower.includes('search') ||
                       webhookNameLower.includes('get');
    
    const isAddType = webhookNameLower.includes('add') || 
                      webhookNameLower.includes('create') || 
                      webhookNameLower.includes('schedule') ||
                      webhookNameLower.includes('new');
    
    const isUpdateType = webhookNameLower.includes('update') || 
                         webhookNameLower.includes('modify') || 
                         webhookNameLower.includes('edit') ||
                         webhookNameLower.includes('change');
    
    const isDeleteType = webhookNameLower.includes('delete') || 
                         webhookNameLower.includes('remove') || 
                         webhookNameLower.includes('cancel');

    // 🔥 VÉRIFIER SI LE WEBHOOK GÈRE DES DATES
    const hasDateField = fields.some(f => 
      f.key.toLowerCase().includes('date') || 
      f.key.toLowerCase().includes('day') || 
      f.key.toLowerCase().includes('time')
    );

    // 🆕 PROMPT INTELLIGENT - GÉNÈRE DES INSTRUCTIONS DE HAUTE QUALITÉ
    const prompt = `You are an expert AI prompt engineer. Generate COMPREHENSIVE integration instructions for an AI agent.

Webhook Name: ${safeWebhookName}
Description: ${description.trim()}

Parameters:
${fields.map((f) => `- ${f.key.trim()}: ${f.value.trim()}`).join('\n')}

${isListType ? `
🔥 SPECIAL INSTRUCTIONS - This is a LIST/CHECK/SEARCH webhook:

CRITICAL BEHAVIORS TO INCLUDE:

1. **AUTOMATIC DATE CALCULATION** (if date fields exist):
   - AI must calculate dates from natural language automatically
   - Include examples: today, tomorrow, yesterday, day after tomorrow, last week, next week
   - Must work for BOTH past and future dates
   - Current date context: Include "Current date is: [DATE]"
   - User timezone: Mention "User timezone: America/Montreal (EST)" or similar

2. **SMART FIELD DEFAULTS:**
   - Fields like "days", "limit", "count" should DEFAULT to 1 if not specified
   - AI should NEVER ask for these unless the query is truly ambiguous
   - Mark these fields as OPTIONAL in the instructions

3. **PAST AND FUTURE SUPPORT:**
   - Include examples for: "What did I have yesterday?" (PAST)
   - Include examples for: "What do I have tomorrow?" (FUTURE)
   - Include examples for: "Show me last week" (PAST RANGE)

4. **NATURAL RESPONSES:**
   - If events found: List them with times
   - If no events: "You have nothing scheduled" or "Your calendar was free"
   - If checking availability: "Yes, you're free" or "No, you have X scheduled"

Make the AI SMART and AUTOMATIC, not bureaucratic.
` : ''}

${isAddType ? `
🔥 SPECIAL INSTRUCTIONS - This is an ADD/CREATE/SCHEDULE webhook:

CRITICAL BEHAVIORS TO INCLUDE:

1. **ASK FOR MISSING INFO:**
   - AI should ask naturally for missing required fields
   - Don't trigger webhook until ALL required info is collected
   - Use conversational questions, not robotic forms

2. **NATURAL LANGUAGE CONVERSION:**
   - "tomorrow" → proper date format (YYYY-MM-DD)
   - "2pm" → 24-hour format (14:00)
   - "2 hours" → duration format (02:00 or 120 minutes based on field requirements)
   - "next Friday" → calculate the actual date

3. **CONFIRMATION:**
   - After success, confirm what was created with specific details
   - Use the data returned by the webhook in the confirmation
   - Be warm and helpful in the confirmation

Make the AI conversational and helpful, not a form-filling robot.
` : ''}

${isUpdateType ? `
🔥 SPECIAL INSTRUCTIONS - This is an UPDATE/MODIFY/EDIT webhook:

CRITICAL BEHAVIORS TO INCLUDE:

1. **IDENTIFY WHAT TO UPDATE:**
   - AI needs to know WHICH item to update (search query, ID, etc.)
   - AI needs to know WHAT to change (new values)
   - Ask for clarification if ambiguous

2. **PARTIAL UPDATES:**
   - Only changed fields need to be provided
   - Unchanged fields can be omitted
   - Make this clear in the instructions

3. **CONFIRMATION:**
   - Confirm what was changed
   - Show old value → new value if possible
` : ''}

${isDeleteType ? `
🔥 SPECIAL INSTRUCTIONS - This is a DELETE/REMOVE/CANCEL webhook:

CRITICAL BEHAVIORS TO INCLUDE:

1. **SAFETY CONFIRMATION:**
   - AI should confirm before deleting
   - Make it clear what will be deleted
   - Allow the user to back out

2. **SUCCESS MESSAGE:**
   - Confirm what was deleted
   - Be reassuring in the response
` : ''}

${hasDateField ? `
🔥 DATE FIELD DETECTED - Include these conversion examples:

NATURAL LANGUAGE → DATE FORMAT CONVERSION:
- "today" → ${new Date().toISOString().split('T')[0]}
- "tomorrow" → [calculate tomorrow's date]
- "yesterday" → [calculate yesterday's date]
- "next Monday" → [calculate next Monday]
- "last Friday" → [calculate last Friday]
- "in 3 days" → [calculate date 3 days from now]
- "2pm" → "14:00" (if time field exists)
- "quarter to 3" → "14:45"

Include AT LEAST 5 examples of natural language date/time conversions.
` : ''}

Generate instructions in this EXACT format (plain text only, NO markdown symbols):

📋 ${safeWebhookName.toUpperCase()} INTEGRATION

You have access to a ${safeWebhookName} webhook integration. Use it when users want to:
[List 3-5 specific use cases based on the description]

WHEN TO TRIGGER:
Trigger this webhook when the user says things like:
[Provide 7+ natural language examples in multiple languages - English, French, Spanish if relevant]
${isListType ? '[Include examples for PAST dates: "What did I have yesterday?", "Show me last week"]' : ''}
${isListType ? '[Include examples for FUTURE dates: "What do I have tomorrow?", "Am I free next Monday?"]' : ''}

REQUIRED INFORMATION:
Before triggering the webhook, you MUST collect:

${fields.map((f, i) => `${i + 1}. ${f.key.trim()} (${f.value.trim()})
   - Example values: [Provide 2-3 realistic examples]
   - Format requirements: [Specify exact format like YYYY-MM-DD, HH:MM, etc.]
   - Conversion: [How to convert from natural language, e.g., "tomorrow" → "2026-01-02"]`).join('\n\n')}

EXTRACTION PROCESS:

Step 1: When user mentions this action, acknowledge warmly ${isListType ? '(or trigger immediately if you have all info)' : ''}
Step 2: Extract all available information from their message
Step 3: If ANY required information is missing, ask for it naturally:
${fields.map((f) => `   - Missing ${f.key}: [Write a natural, conversational question]`).join('\n')}
Step 4: Once you have ALL required info, trigger the webhook

IMPORTANT RULES:

1. ${isListType ? 'Trigger IMMEDIATELY when you have enough info - do not ask unnecessary questions' : 'NEVER trigger the webhook if you are missing required fields'}
2. ALWAYS validate data formats before triggering
3. ALWAYS confirm with the user after successfully completing the action
4. If the webhook returns data, use it in your response
${isListType ? '5. Default to sensible values (days=1, limit=10) - do not ask for optional fields' : ''}

CRITICAL WEBHOOK RULE:
When you have collected ALL required fields for ${safeWebhookName}, you MUST immediately call the ${safeWebhookName} webhook function with ALL collected data.
Do NOT write "[triggering webhook]" or describe the action in text.
ACTUALLY call the function. This is mandatory.

RESPONSE AFTER SUCCESS:

When the webhook returns success, respond naturally like:
[Provide 3 example success responses that use the returned data]

EXAMPLE CONVERSATIONS:

Example 1: Complete information provided
User: [Realistic user message with all required info]
AI: ${isListType ? '[Triggers webhook immediately without asking questions]' : '[Triggers webhook]'}
AI: [Success response using returned data]

Example 2: Missing information
User: [Realistic user message missing some info]
AI: [Asks for missing info conversationally]
User: [Provides the missing info]
AI: [Triggers webhook]
AI: [Success confirmation]

Example 3: Using returned data
User: [Request that expects specific data back]
AI: [Triggers webhook]
AI: [Natural response incorporating the returned data - be specific with examples]

${isListType ? `
Example 4: Past date query
User: "What did I have yesterday?" or "Qu'est-ce que j'avais hier ?"
AI: [Calculates yesterday's date automatically, triggers webhook]
AI: [Lists events from yesterday or says "You had nothing scheduled"]
` : ''}

CRITICAL: Make the instructions conversational, specific, and actionable. Include concrete examples for EVERY scenario. Use real-world phrasing, not robotic language.`;

    const systemMsg = "You are an expert prompt engineer specializing in AI agent integrations. Generate clear, comprehensive, and actionable instructions. Do NOT use Markdown formatting. Avoid #, ##, **, *, or any formatting symbols. Use plain text only with simple line breaks for structure.";
    const output = await callAI(client, provider, model, [
      { role: "system", content: systemMsg },
      { role: "user", content: prompt },
    ], { temperature: 0.7 });

    return NextResponse.json({ instructions: output });
  } catch (error: any) {
    console.error("[GENERATE_INSTRUCTIONS]", error);

    if (error.status === 401 || error.code === "invalid_api_key") {
      return NextResponse.json(
        { error: "Invalid API key. Please check your agent's selected API key." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to generate instructions" },
      { status: 500 }
    );
  }
}