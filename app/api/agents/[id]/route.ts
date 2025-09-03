import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Agent } from "@/models/Agent";
import { AgentVersion } from "@/models/AgentVersion"; // 🆕
import { AgentKnowledge } from "@/models/AgentKnowledge"; // 🆕
import { ChatbotConfig } from "@/models/ChatbotConfig"; // 🆕
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
    apiKey, // 🆕 AJOUTÉ pour apiKey
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
      ...(apiKey !== undefined && { apiKey }), // 🆕 AJOUTÉ
      updatedAt: new Date(),
    },
    { new: true }
  );

  if (!updated) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  return NextResponse.json({ message: "Agent updated", agent: updated });
}

// 🆕 DELETE AVEC CASCADE - REMPLACE TON ANCIEN DELETE
export async function DELETE(req: NextRequest, context: any) {
  const params = await context.params;
  await connectToDatabase();
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;

  try {
    // 1️⃣ Vérifier que l'agent existe et appartient à l'utilisateur
    const agent = await Agent.findOne({ _id: id, userId: user.id });
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    console.log(`🗑️ [DELETE CASCADE] Starting deletion of agent ${id}...`);

    // 2️⃣ Supprimer TOUTES les versions de cet agent
    const deletedVersions = await AgentVersion.deleteMany({ agentId: id });
    console.log(`🗑️ [DELETE CASCADE] Deleted ${deletedVersions.deletedCount} agent versions`);

    // 3️⃣ Supprimer TOUTES les connaissances de cet agent
    const deletedKnowledge = await AgentKnowledge.deleteMany({ agentId: id });
    console.log(`🗑️ [DELETE CASCADE] Deleted ${deletedKnowledge.deletedCount} knowledge documents`);

    // 4️⃣ Supprimer TOUS les chatbot configs qui utilisent cet agent
    const deletedConfigs = await ChatbotConfig.deleteMany({ selectedAgent: id });
    console.log(`🗑️ [DELETE CASCADE] Deleted ${deletedConfigs.deletedCount} chatbot configs`);

    // 5️⃣ Finalement supprimer l'agent lui-même
    await Agent.deleteOne({ _id: id });
    console.log(`🗑️ [DELETE CASCADE] Deleted agent ${id}`);

    // 6️⃣ Résumé des suppressions
    const summary = {
      agent: 1,
      versions: deletedVersions.deletedCount,
      knowledge: deletedKnowledge.deletedCount,
      chatbotConfigs: deletedConfigs.deletedCount
    };

    console.log(`✅ [DELETE CASCADE] Complete! Summary:`, summary);

    return NextResponse.json({ 
      message: "Agent and all related data deleted successfully",
      deleted: summary
    });

  } catch (error) {
    console.error("❌ [DELETE CASCADE] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete agent and related data" }, 
      { status: 500 }
    );
  }
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
      apiKey: original.apiKey, // 🆕 AJOUTÉ
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
      updatedAt: new Date(),
    });

    return NextResponse.json({ message: "Agent duplicated", agentId: copy._id });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}