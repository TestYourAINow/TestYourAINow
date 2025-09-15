// app\api\connections\[id]\folder\route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Connection } from "@/models/Connection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";

// PUT - Move connection to deployment folder or remove from folder
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
    const connectionId = params.id;

    // Validation
    if (!mongoose.Types.ObjectId.isValid(connectionId)) {
      return NextResponse.json({ error: "Invalid connection ID" }, { status: 400 });
    }

    if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
      return NextResponse.json({ error: "Invalid folder ID" }, { status: 400 });
    }

    // Update connection
    const updatedConnection = await Connection.findOneAndUpdate(
      { 
        _id: connectionId, 
        userId: session.user.id 
      },
      { 
        folderId: folderId ? folderId : null 
      },
      { 
        new: true
      }
    );

    if (!updatedConnection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      connection: updatedConnection,
      message: folderId ? "Connection moved to folder" : "Connection removed from folder"
    });
    
  } catch (error) {
    console.error("❌ Error moving connection:", error);
    return NextResponse.json(
      { error: "Failed to move connection" },
      { status: 500 }
    );
  }
}