import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Agent } from "@/models/Agent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Helper pour échapper les caractères spéciaux dans une string pour une RegExp
function escapeRegExp(text: string) {
  return text.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
}

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = context.params;

  const agent = await Agent.findOne({ _id: id, userId: session.user.id });
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  return NextResponse.json({ prompt: agent.finalPrompt || "" });
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = context.params;
  const body = await req.json();
  const { prompt, appendInstructions, replaceInstructionsFor } = body;

  const agent = await Agent.findOne({ _id: id, userId: session.user.id });
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  // Overwrite full prompt manually
  if (prompt !== undefined) {
    agent.finalPrompt = prompt;
  }

  // S’assurer que le bloc ## Integrations Instructions est présent
  const header = "## Integrations Instructions";
  if (appendInstructions && !agent.finalPrompt?.includes(header)) {
    agent.finalPrompt = (agent.finalPrompt || "") + "\n\n" + header;
  }

  // Si on doit remplacer un bloc spécifique
  if (replaceInstructionsFor) {
    const safeName = replaceInstructionsFor.trim();
    const escapedName = escapeRegExp(safeName);
    const pattern = new RegExp(
      `###\\s*${escapedName}\\s+Integration[\\s\\S]*?(?=\\n###\\s|\\n##\\s|$)`,
      "gi"
    );
    agent.finalPrompt = agent.finalPrompt?.replace(pattern, "").trim();
  }

  // Si on doit ajouter des instructions
  if (appendInstructions) {
    console.log("📎 Appending instructions:", appendInstructions);
    agent.finalPrompt =
      (agent.finalPrompt || "") + "\n\n" + appendInstructions.trim();
  }

  await agent.save();

  return NextResponse.json({ success: true, prompt: agent.finalPrompt });
}
