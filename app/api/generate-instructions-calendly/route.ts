import { NextResponse } from "next/server";
import { createAgentOpenAI } from "@/lib/openai";
import { connectToDatabase } from "@/lib/db";
import { Agent } from "@/models/Agent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, agentId } = body; // 🔧 AJOUT agentId

    if (!name || !description) {
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

    const safeName = name.trim();

    const prompt = `
You are a prompt engineering expert. Generate DETAILED instructions for a Calendly integration.

Integration information:
- Name: ${safeName}
- Description: ${description.trim()}

Respond ONLY with this markdown format:

\`\`\`markdown
### ${safeName} Integration

${description.trim()}

#### Automatic trigger
You must offer a Calendly meeting when the user:
- Asks for an appointment or meeting
- Wants to meet you or schedule something
- Asks for your availability or schedule
- Uses words like "book", "reserve", or "schedule"
- Asks questions about your calendar
- Expresses interest in your services and seems ready to take action

#### Standard reply
When you detect a booking request:
1. Reply warmly and personally
2. Briefly explain the booking process
3. Offer the Calendly link clearly and engagingly
4. Encourage action without being pushy
5. Make sure the link will be functional and accessible

#### Example reply
"I'd be happy to meet with you! I can help you book a time that works perfectly for you. Click the link below to see my real-time availability and choose the moment that suits you best. Booking only takes a few seconds!"

#### Important information
- The Calendly integration is active and functional
- Booking links are automatically generated via the Calendly API
- You don't need to ask for the email or name (Calendly collects this during booking)
- Be proactive: if someone seems interested in your services, spontaneously offer a meeting
- The system automatically detects booking requests and generates real Calendly links
- Each link leads directly to the user's booking calendar

#### Limitations and alternatives
- Do not propose specific dates/times (let Calendly handle available slots)
- Do not ask for contact details (Calendly collects this information)
- If the integration temporarily doesn't work, explain politely and offer an alternative contact method
- Always stay positive and solution-oriented even in case of technical issues

#### Best practices
- Use natural, engaging language
- Avoid technical jargon
- Personalize your responses based on the conversation context
- Briefly explain the benefits of scheduling a meeting when relevant
- Keep a professional yet approachable tone
\`\`\`
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert assistant in prompt engineering for Calendly integrations." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
    });

    const result = completion.choices[0].message.content;
    return NextResponse.json({ instructions: result });
  } catch (error: any) {
    console.error("[GENERATE_CALENDLY_INSTRUCTIONS]", error);
    
    if (error.status === 401 || error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: "Invalid OpenAI API key. Please check your agent's selected API key." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to generate Calendly instructions" },
      { status: 500 }
    );
  }
}