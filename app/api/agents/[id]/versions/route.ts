import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AgentVersion } from "@/models/AgentVersion";
import { Agent } from "@/models/Agent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

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

  const versions = await AgentVersion.find({ agentId: id }).sort({ createdAt: -1 });

  return NextResponse.json({ versions });
}

export async function POST(
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

  const { prompt, openaiModel, temperature, top_p, integrations } = await req.json();

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
  }

  const version = await AgentVersion.create({
    agentId: agent._id,
    prompt,
    openaiModel,
    temperature,
    top_p,
    integrations,
  });

  return NextResponse.json({ message: "Version saved", version });
}
