import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Connection } from '@/models/Connection';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, integrationType, aiBuildId } = body;

  if (!name || !integrationType || !aiBuildId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const connection = await Connection.create({
    userId: session.user.id,
    name,
    integrationType,
    aiBuildId,
    isActive: true,
  });

  return NextResponse.json({ success: true, connection });
}
