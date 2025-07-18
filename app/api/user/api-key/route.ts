import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import OpenAI from "openai";

// GET - Récupère l'API key (sans la montrer en entier)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hasApiKey = !!user.openaiApiKey;
    const maskedKey = user.openaiApiKey 
      ? `sk-...${user.openaiApiKey.slice(-4)}`
      : null;

    return NextResponse.json({ 
      hasApiKey,
      maskedKey 
    });
  } catch (error) {
    console.error("Get API key error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// POST - Sauvegarde l'API key
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { apiKey } = await req.json();

    if (!apiKey || !apiKey.startsWith('sk-')) {
      return NextResponse.json({ 
        error: "Invalid API key format" 
      }, { status: 400 });
    }

    // Test si l'API key fonctionne
    try {
      const openai = new OpenAI({ apiKey });
      await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "test" }],
        max_tokens: 5,
      });
    } catch (openaiError: any) {
      return NextResponse.json({ 
        error: "Invalid API key or insufficient permissions" 
      }, { status: 400 });
    }

    // Sauvegarde dans la DB
    await connectToDatabase();
    await User.findByIdAndUpdate(session.user.id, { 
      openaiApiKey: apiKey 
    });

    return NextResponse.json({ 
      success: true,
      message: "API key saved successfully" 
    });
  } catch (error) {
    console.error("Save API key error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}