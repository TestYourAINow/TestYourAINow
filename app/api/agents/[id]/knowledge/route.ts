import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AgentKnowledge } from "@/models/AgentKnowledge";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function DELETE(req: NextRequest, context: any) {
  const params = await context.params;
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { paths } = await req.json();

  if (!paths || !Array.isArray(paths)) {
    return NextResponse.json({ error: "Invalid file paths" }, { status: 400 });
  }

  await AgentKnowledge.deleteMany({ agentId: params.id, path: { $in: paths } });

  return NextResponse.json({ success: true });
}