import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { connectToDatabase } from "@/lib/db";
import { AgentKnowledge } from "@/models/AgentKnowledge";
import { Agent } from "@/models/Agent";
import { extractTextFromBuffer } from "@/lib/extractText";
import { AgentIntegration } from "@/types/integrations";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  req: NextRequest,
  context: any
) {
  const params = await context.params;
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agentId = params.id;
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const formName = formData.get("name")?.toString().trim() || "Documents";

  if (!file || !agentId) {
    return NextResponse.json({ error: "Missing file or agentId" }, { status: 400 });
  }

  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({
      error: "File is too large. Maximum allowed size is 50MB.",
    }, { status: 400 });
  }

  const allowedExtensions = [".txt", ".pdf", ".docx", ".md", ".html", ".json", ".csv"];
  const fileExtension = file.name.toLowerCase().split(".").pop();
  if (!fileExtension || !allowedExtensions.includes("." + fileExtension)) {
    return NextResponse.json({
      error: "Unsupported file type. Allowed: TXT, PDF, DOCX, MD, HTML, JSON, CSV.",
    }, { status: 400 });
  }

  const filePath = `${agentId}/${Date.now()}_${file.name}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from("agents")
    .upload(filePath, buffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage.from("agents").getPublicUrl(filePath);
  const publicUrl = publicUrlData.publicUrl;

  const fileMeta = {
    name: file.name,
    size: file.size,
    url: publicUrl,
    uploadedAt: new Date().toISOString(),
    path: filePath,
    isCloud: true,
  };

  let warning = null;
  let canAIRead = true;

  try {
    const extractedText = await extractTextFromBuffer(file.name, buffer);

    // Vérifier si c'est un message d'erreur/warning
    if (extractedText.startsWith("EXTRACTION_WARNING:") || 
        extractedText.startsWith("EXTRACTION_ERROR:") || 
        extractedText.startsWith("TYPE_NOT_SUPPORTED:")) {
      
      warning = extractedText.replace(/^[A-Z_]+: /, ""); // Enlever le préfixe
      canAIRead = false;
    }

    // Toujours sauvegarder dans AgentKnowledge
    await AgentKnowledge.create({
      agentId,
      fileName: file.name,
      path: filePath,
      content: extractedText,
      sourceName: formName,
    });

    const updateResult = await Agent.updateOne(
      { _id: agentId, "integrations.name": formName, "integrations.type": "files" },
      {
        $push: { "integrations.$.files": fileMeta },
      }
    );

    if (updateResult.modifiedCount === 0) {
      await Agent.updateOne(
        { _id: agentId },
        {
          $push: {
            integrations: {
              type: "files",
              name: formName,
              files: [fileMeta],
              createdAt: new Date().toISOString(),
            },
          },
        }
      );
    }

  } catch (err) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  // Réponse avec warning si nécessaire
  const response = {
    url: publicUrl,
    name: file.name,
    size: file.size,
    createdAt: new Date().toISOString(),
    path: filePath,
    success: true,
    ...(warning && { 
      warning: warning,
      canAIRead: canAIRead
    })
  };

  return NextResponse.json(response);
}

export async function DELETE(
  req: NextRequest,
  context: any
) {
  const params = await context.params;
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agentId = params.id;
  const body = await req.json();
  const singlePath = body.path;
  const multiplePaths: string[] = body.paths;
  const paths = multiplePaths || (singlePath ? [singlePath] : []);

  if (paths.length === 0) {
    return NextResponse.json({ error: "No file paths provided" }, { status: 400 });
  }

  const agent = await Agent.findById(agentId);
  if (!agent || !agent.integrations) {
    return NextResponse.json({ error: "Agent not found or has no integrations" }, { status: 404 });
  }

  let deletedKnowledgePaths: string[] = [];

  agent.integrations = agent.integrations.map((integration: AgentIntegration) => {
    if (integration.type !== "files" || !Array.isArray(integration.files)) return integration;

    const filesToDelete = integration.files.filter((f) => paths.includes(f.path));
    const remainingFiles = integration.files.filter((f) => !paths.includes(f.path));

    filesToDelete.forEach((f) => deletedKnowledgePaths.push(f.path));

    return { ...integration, files: remainingFiles };
  });

  const deleteResult = await supabase.storage.from("agents").remove(paths);
  if (deleteResult.error) {
    console.error("Supabase delete error:", deleteResult.error);
  }

  await Agent.updateOne(
    { _id: agentId },
    { $set: { integrations: agent.integrations } }
  );

  if (deletedKnowledgePaths.length > 0) {
    await AgentKnowledge.deleteMany({
      agentId,
      path: { $in: deletedKnowledgePaths },
    });
  }

  return NextResponse.json({ success: true });
}