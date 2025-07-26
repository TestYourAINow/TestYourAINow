import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { keyId } = await req.json();

    if (!keyId) {
      return NextResponse.json({ error: "Key ID required" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id);
    
    if (!user || !user.apiKeys) {
      return NextResponse.json({ error: "No API keys found" }, { status: 404 });
    }

    // Enlever le statut par défaut de toutes les clés
    user.apiKeys.forEach((key: any) => {
      key.isDefault = false;
    });

    // Mettre la clé sélectionnée par défaut
    const targetKey = user.apiKeys.find((key: any) => key._id.toString() === keyId);
    if (!targetKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    targetKey.isDefault = true;
    await user.save();

    return NextResponse.json({ 
      success: true,
      message: "Default API key updated successfully" 
    });
  } catch (error) {
    console.error("Set default API key error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}