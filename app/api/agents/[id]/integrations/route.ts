// app\api\agents\[id]\integrations\route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Agent } from "@/models/Agent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Helper pour centraliser l'accès à l'user session
async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) return null;
  return session.user;
}

export async function POST(
  req: NextRequest,
  context: any
) {
  const params = await context.params;
  await connectToDatabase();
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const body = await req.json();
  const { type, name, description, url, fields, files, apiKey } = body;

  if (!type || !name || (type === "webhook" && !url)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const agent = await Agent.findOne({ _id: id, userId: user.id });
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  const newIntegration = {
    type,
    name,
    description: description || "",
    url: url || "",
    fields: fields || [],
    files: files || [],
    apiKey: apiKey || "",
    createdAt: new Date(),
  };

  const existingIndex = agent.integrations.findIndex(
    (i: { name: string }) => i.name === name
  );

  if (existingIndex !== -1) {
    agent.integrations[existingIndex] = newIntegration;
  } else {
    agent.integrations.push(newIntegration);
  }

  await agent.save();

  return NextResponse.json({ success: true, integration: newIntegration });
}

export async function GET(
  req: NextRequest,
  context: any
) {
  const params = await context.params;
  await connectToDatabase();
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const agent = await Agent.findOne({ _id: id, userId: user.id });
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  return NextResponse.json({ integrations: agent.integrations || [] });
}

export async function DELETE(
  req: NextRequest,
  context: any
) {
  const params = await context.params;
  await connectToDatabase();
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const body = await req.json();
  const { name, files } = body;

  if (!name) {
    return NextResponse.json({ error: "Missing integration name" }, { status: 400 });
  }

  const agent = await Agent.findOne({ _id: id, userId: user.id });
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  if (Array.isArray(files)) {
    for (const file of files) {
      const path = typeof file === "string" ? null : (file as any).path;
      if (path) {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/agents/${id}/upload`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paths: [path] }),
        });
      }
    }
  }

  agent.integrations = agent.integrations.filter((i: any) => i.name !== name);
  await agent.save();

  return NextResponse.json({ success: true });
}