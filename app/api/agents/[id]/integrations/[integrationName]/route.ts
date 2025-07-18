import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Agent } from "@/models/Agent";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; integrationName: string } }
) {
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const agent = await Agent.findOne({ _id: params.id, userId: session.user.id });
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  const index = agent.integrations.findIndex(
    (i: { name: string }) => i.name === params.integrationName
  );
  if (index === -1) return NextResponse.json({ error: "Integration not found" }, { status: 404 });

  agent.integrations[index] = {
    ...agent.integrations[index],
    ...body,
    name: params.integrationName,
    createdAt: new Date(),
  };

  await agent.save();
  return NextResponse.json({ success: true, integration: agent.integrations[index] });
}
