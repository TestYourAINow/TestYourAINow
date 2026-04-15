import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import OpenAI from "openai";

// Types
interface ApiKeyDoc {
  _id: any;
  name: string;
  key: string;
  provider?: string;
  isDefault: boolean;
  createdAt: Date;
}

// GET - Récupère toutes les API keys
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

    // Migration : si l'utilisateur a l'ancienne API key, la migrer
    if (user.openaiApiKey && (!user.apiKeys || user.apiKeys.length === 0)) {
      user.apiKeys = [{
        name: "Default Project",
        key: user.openaiApiKey,
        isDefault: true,
        createdAt: new Date()
      }];
      user.openaiApiKey = undefined;
      await user.save();
    }

const apiKeys = (user.apiKeys || []).map((apiKey: ApiKeyDoc) => {
  const provider = apiKey.provider || "openai";
  const maskedKey = provider === "anthropic"
    ? `sk-ant-...${apiKey.key.slice(-4)}`
    : `sk-...${apiKey.key.slice(-4)}`;
  return {
    id: apiKey._id?.toString() || "unknown",
    name: apiKey.name,
    maskedKey,
    provider,
    isDefault: apiKey.isDefault,
    createdAt: apiKey.createdAt,
  };
});

    return NextResponse.json({ apiKeys });
  } catch (error) {
    console.error("Get API keys error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// POST - Ajoute une nouvelle API key
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, apiKey, provider = "openai" }: { name: string; apiKey: string; provider?: string } = await req.json();

    if (!name || !apiKey || !apiKey.startsWith('sk-')) {
      return NextResponse.json({
        error: "Invalid project name or API key format"
      }, { status: 400 });
    }

    if (!["openai", "anthropic"].includes(provider)) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    // Test si l'API key fonctionne
    try {
      if (provider === "anthropic") {
        const Anthropic = (await import("@anthropic-ai/sdk")).default;
        const anthropic = new Anthropic({ apiKey });
        await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 5,
          messages: [{ role: "user", content: "test" }],
        });
      } else {
        const openai = new OpenAI({ apiKey });
        await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: "test" }],
          max_tokens: 5,
        });
      }
    } catch (keyError: any) {
      return NextResponse.json({
        error: "Invalid API key or insufficient permissions"
      }, { status: 400 });
    }

    // Ajoute dans la DB
    await connectToDatabase();
    const user = await User.findById(session.user.id);

    if (!user.apiKeys) user.apiKeys = [];

    // Si c'est la première clé, la marquer comme default
    const isFirstKey = user.apiKeys.length === 0;

    user.apiKeys.push({
      name,
      key: apiKey,
      provider,
      isDefault: isFirstKey,
      createdAt: new Date()
    });
    
    await user.save();

    return NextResponse.json({ 
      success: true,
      message: "API key added successfully" 
    });
  } catch (error) {
    console.error("Add API key error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// DELETE - Supprime une API key
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json({ error: "Key ID required" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id);
    
    if (!user || !user.apiKeys) {
      return NextResponse.json({ error: "No API keys found" }, { status: 404 });
    }

    // Ne pas supprimer s'il n'y a qu'une seule clé
    if (user.apiKeys.length === 1) {
      return NextResponse.json({ 
        error: "Cannot delete the last API key. Add another one first." 
      }, { status: 400 });
    }

    user.apiKeys = user.apiKeys.filter((key: ApiKeyDoc) => key._id.toString() !== keyId);
    
    // Si on a supprimé la clé par défaut, en choisir une nouvelle
    if (!user.apiKeys.find((key: ApiKeyDoc) => key.isDefault) && user.apiKeys.length > 0) {
      user.apiKeys[0].isDefault = true;
    }
    
    await user.save();

    return NextResponse.json({ 
      success: true,
      message: "API key deleted successfully" 
    });
  } catch (error) {
    console.error("Delete API key error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}