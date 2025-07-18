import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username || username.length < 3) {
    return NextResponse.json({ available: false });
  }

  await connectToDatabase();

  const existingUser = await User.findOne({ username });

  return NextResponse.json({ available: !existingUser });
}
