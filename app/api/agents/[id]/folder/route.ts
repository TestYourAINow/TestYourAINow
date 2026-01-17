// app\api\agents\[id]\folder\route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Agent } from "@/models/Agent";
import { Folder } from "@/models/Folder";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";

// PUT - Move agent to folder or remove from folder
export async function PUT(
  req: NextRequest,
  context: any
) {
  const params = await context.params;
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { folderId } = await req.json();
    const agentId = params.id;

    // Validation
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return NextResponse.json({ error: "Invalid agent ID" }, { status: 400 });
    }

    if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
      return NextResponse.json({ error: "Invalid folder ID" }, { status: 400 });
    }

    // ✅ Récupérer l'agent actuel pour connaître l'ancien folderId
    const currentAgent = await Agent.findOne({
      _id: agentId,
      userId: session.user.id
    });

    if (!currentAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const oldFolderId = currentAgent.folderId;

    // ✅ Update l'agent avec le nouveau folderId
    const updatedAgent = await Agent.findOneAndUpdate(
      { 
        _id: agentId, 
        userId: session.user.id 
      },
      { 
        folderId: folderId ? folderId : null 
      },
      { 
        new: true,
        select: "_id name folderId integrations createdAt updatedAt"
      }
    );

    // ✅ UPDATE FOLDER COUNTS (comme deployment folders)
    if (oldFolderId) {
      await Folder.findByIdAndUpdate(
        oldFolderId,
        { 
          $inc: { agentCount: -1 },
          updatedAt: new Date()
        }
      );
    }

    if (folderId) {
      await Folder.findByIdAndUpdate(
        folderId,
        { 
          $inc: { agentCount: 1 },
          updatedAt: new Date()
        }
      );
    }

    return NextResponse.json({ 
      success: true, 
      agent: updatedAgent,
      message: folderId ? "Agent moved to folder" : "Agent removed from folder"
    });
    
  } catch (error) {
    console.error("❌ Error moving agent:", error);
    return NextResponse.json(
      { error: "Failed to move agent" },
      { status: 500 }
    );
  }
}