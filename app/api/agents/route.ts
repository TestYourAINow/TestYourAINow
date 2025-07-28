import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Agent } from "@/models/Agent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// GET all agents (including prompt and integrations)
export async function GET(req: NextRequest) {
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agents = await Agent.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .select("_id name integrations prompt openaiModel temperature top_p createdAt updatedAt");

  return NextResponse.json({ agents });
}

// POST - Create new agent
export async function POST(req: NextRequest) {
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      name = "",
      template = "",
      openaiModel = "gpt-4o",
      apiKey = "",
      description = "",
      questions = "",
      tone = "",
      rules = "",
      companyInfo = "",
      language = "",
      industry = "",
      temperature = 0.3,
      top_p = 1,
      prompt = "",
    } = await req.json();

    const newAgent = await Agent.create({
      userId: session.user.id,
      name,
      template,
      openaiModel,
      apiKey,
      description,
      questions,
      tone,
      rules,
      companyInfo,
      language,
      industry,
      temperature,
      top_p,
      prompt,
    });

    return NextResponse.json({ message: "Agent created", id: newAgent._id });
  } catch (err) {
    console.error("❌ Failed to create agent:", err);
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 });
  }
}
