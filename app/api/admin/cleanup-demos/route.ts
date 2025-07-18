import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Demo } from '@/models/Demo';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // TODO: ici tu pourrais restreindre à ton propre compte admin si tu veux
  // if (session.user.email !== 'ton@email.com') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  await connectToDatabase();

  const result = await Demo.deleteMany({
    expiresAt: { $lt: new Date() },
  });

  return NextResponse.json({
    message: 'Expired demos cleaned',
    deletedCount: result.deletedCount,
  });
}
