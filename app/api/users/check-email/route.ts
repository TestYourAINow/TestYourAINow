import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ available: false });
  }

  await connectToDatabase();
  const existing = await User.findOne({ email });
  return NextResponse.json({ available: !existing });
}
