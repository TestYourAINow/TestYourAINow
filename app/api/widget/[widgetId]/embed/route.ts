import { NextRequest, NextResponse } from "next/server";
import { ChatbotConfig } from "@/models/ChatbotConfig";
import { connectToDatabase } from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: any
) {
  const params = await context.params;
  const widgetId = params.widgetId;

  try {
    await connectToDatabase();
    const config = await ChatbotConfig.findById(widgetId).lean();
    
    if (!config) {
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }

    // Retourner juste la config en JSON pour que JavaScript la récupère
    return NextResponse.json({ config });
    
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}