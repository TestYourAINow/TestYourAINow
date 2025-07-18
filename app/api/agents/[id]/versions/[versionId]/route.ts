import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AgentVersion } from "@/models/AgentVersion";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const version = await AgentVersion.findOne({
    _id: params.versionId,
    agentId: params.id,
  });

  if (!version) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  return NextResponse.json({ version });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const versions = await AgentVersion.find({ agentId: params.id }).sort({ createdAt: -1 });

  if (versions.length <= 1) {
    return NextResponse.json({
      error: "You can't delete the last remaining version.",
    }, { status: 400 });
  }

  const latestVersion = versions[0];
  if (latestVersion._id.toString() === params.versionId) {
    return NextResponse.json({
      error: "You can't delete the latest version.",
    }, { status: 400 });
  }

  await AgentVersion.deleteOne({ _id: params.versionId, agentId: params.id });

  return NextResponse.json({ message: "Version deleted." });
}
