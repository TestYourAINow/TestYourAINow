import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Agent } from "@/models/Agent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createUserOpenAI, createAgentOpenAI } from "@/lib/openai";

export async function POST(
  req: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const agent = await Agent.findOne({ _id: id, userId: session.user.id });
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const {
      openaiModel = "gpt-4o",
      temperature = 0.3,
      top_p = 1,
      name = "AI",
      description = "",
      tone = "",
      questions = "",
      rules = "",
      companyInfo = "",
      language = "English",
      template = "",
      industry = "",
      rawPrompt = "", // 🆕 NOUVEAU CHAMP AJOUTÉ
    } = agent;

    // 🆕 LOGIQUE RAW PROMPT - UTILISER TEL QUEL
    if (template === 'raw' && rawPrompt?.trim()) {
      console.log('🎯 Raw prompt mode - using as-is');
      
      agent.finalPrompt = rawPrompt.trim();
      await agent.save();
      
      return NextResponse.json({ prompt: rawPrompt.trim() });
    }

    // 🔧 CHANGEMENT PRINCIPAL - Utiliser la clé spécifique de l'agent
    const { openai, error } = await createAgentOpenAI(agent);
    
    if (!openai) {
      return NextResponse.json({ error }, { status: error === "Unauthorized" ? 401 : 400 });
    }

    const isSupport =
      template?.toLowerCase().includes("support") || description?.toLowerCase().includes("support");
    const isSales =
      template?.toLowerCase().includes("sales") || description?.toLowerCase().includes("sales");

    let adjustedCompanyInfo = companyInfo?.trim();

    if (!adjustedCompanyInfo || adjustedCompanyInfo.length < 10) {
      adjustedCompanyInfo = isSupport
        ? `
- Q: How can I contact support?
  A: You can reach us by phone or email. We're here to help you.
- Q: What are your customer service hours?
  A: Our support team is available during business hours to assist you.
- Q: Do you offer refunds or returns?
  A: Yes, we aim for customer satisfaction. Let me help you with your case.
*(Note: FAQ is generic due to lack of detailed company info.)*
        `
        : isSales
        ? `
- Q: What kind of products or services do you offer?
  A: We provide a variety of options depending on your needs.
- Q: Where are you located?
  A: We're available in multiple regions. Let me know where you're based.
- Q: How can I make a purchase?
  A: I can guide you through our process or product options.
- Q: Do you have promotions?
  A: Let me check what's currently available for you.
*(Note: This FAQ is based on general expectations due to missing company information.)*
        `
        : `
- Q: Can you tell me more about the company?
  A: I'm here to help with any questions you have about our services and support.
- Q: How can I contact customer support?
  A: You can reach us by phone or email. I'm here to assist you with anything you need.
- Q: Do you have a return policy?
  A: Yes, our goal is customer satisfaction. I can explain our return options depending on your situation.
- Q: Where are you located?
  A: We operate in multiple regions. Let me know your area so I can give you accurate info.
*(Note: Since the company information provided was limited, this FAQ is based on general support expectations.)*
        `;
    }

    const titleLine = `AI Expert in ${industry || "General"}:\n`;

    const metaPrompt = `
Generate a clean and well-structured AI prompt for an assistant named "${name}", based on the following fields.

Do not use Markdown formatting (avoid #, **, etc.). Format section titles with simple line breaks and spacing — no formatting symbols.

Use the following language as default: ${language}.

The tone should be clear, friendly, and helpful. Avoid robotic patterns. Write naturally.

IMPORTANT: Do NOT include any polite closing like "Let me know if I can help more" or "We're here if you have other questions."

Start the prompt with this title line:
${titleLine}

Then follow this structure:

1. DESCRIPTION:
- Language of prompt: ${language}
- Communication Level: ${tone || "Informal, friendly, Grade 3 complexity"}
- Core identity and personality of the AI: Supportive, friendly, empathetic
- Primary purpose and expertise: ${description}

2. AI Description:
Write a short paragraph expanding on the purpose above. Make it sound human and professional.

3. RULES AND GUIDELINES:
List clear bullet points for:
- Core behavioral principles
- Ethical boundaries and limitations
- Response style and tone

AI Rules (separate list):
1. Handle all conversations with empathy.
2. Avoid repeating questions.
3. Limit use of exclamation marks.
4. Keep answers friendly.

4. QUESTION FLOW:
Start with this question (the first from the list below).
Then continue with the rest in order.

${questions}

5. COMPANY FAQ:
Convert the company info below into a structured FAQ using Q: and A: format.
If the content is too vague, generate a general fallback instead.

${adjustedCompanyInfo}
`.trim();

    const completion = await openai.chat.completions.create({
      model: openaiModel,
      temperature,
      top_p,
      messages: [{ role: "user", content: metaPrompt }],
    });

    const output = completion.choices?.[0]?.message?.content;

    if (!output) {
      return NextResponse.json({ error: "No response from OpenAI." }, { status: 500 });
    }

    agent.finalPrompt = output;
    await agent.save();

    return NextResponse.json({ prompt: output });
  } catch (error: any) {
    console.error("Prompt generation error:", error);
    
    if (error.status === 401 || error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: "Invalid OpenAI API key. Please check your selected API key." },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: "Failed to generate prompt" }, { status: 500 });
  }
}