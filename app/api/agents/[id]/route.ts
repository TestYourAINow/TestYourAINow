import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Agent } from "@/models/Agent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Helper pour éviter la répétition
async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) return null;
  return session.user;
}

// GET un agent spécifique
export async function GET(req: NextRequest, context: any) {
  const params = await context.params;
  await connectToDatabase();
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agent = await Agent.findOne({ _id: params.id, userId: user.id });
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  return NextResponse.json({ name: agent.name });
}

// PUT pour update un agent
export async function PUT(req: NextRequest, context: any) {
  const params = await context.params;
  await connectToDatabase();
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    name,
    template,
    openaiModel,
    description,
    questions,
    tone,
    rules,
    companyInfo,
    language,
    industry,
    temperature,
    top_p,
    integrations,
  } = await req.json();

  const updated = await Agent.findOneAndUpdate(
    { _id: params.id, userId: user.id },
    {
      name,
      template,
      openaiModel,
      description,
      questions,
      tone,
      rules,
      companyInfo,
      language,
      industry,
      temperature,
      top_p,
      ...(integrations !== undefined && { integrations }),
    },
    { new: true }
  );

  if (!updated) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  return NextResponse.json({ message: "Agent updated", agent: updated });
}

// DELETE un agent
export async function DELETE(req: NextRequest, context: any) {
  const params = await context.params;
  await connectToDatabase();
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deleted = await Agent.findOneAndDelete({ _id: params.id, userId: user.id });
  if (!deleted) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  return NextResponse.json({ message: "Agent deleted" });
}

// POST avec action de duplication
export async function POST(req: NextRequest, context: any) {
  const params = await context.params;
  await connectToDatabase();
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "duplicate") {
    const original = await Agent.findOne({ _id: params.id, userId: user.id });
    if (!original) return NextResponse.json({ error: "Original agent not found" }, { status: 404 });

    const copy = await Agent.create({
      userId: user.id,
      name: original.name + " (Copy)",
      template: original.template,
      openaiModel: original.openaiModel,
      description: original.description,
      questions: original.questions,
      tone: original.tone,
      rules: original.rules,
      companyInfo: original.companyInfo,
      language: original.language,
      industry: original.industry,
      temperature: original.temperature,
      top_p: original.top_p,
      integrations: original.integrations ?? [],
    });

    return NextResponse.json({ message: "Agent duplicated", agentId: copy._id });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}