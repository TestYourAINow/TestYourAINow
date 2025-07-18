import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { Demo } from '@/models/Demo';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();

  const demos = await Demo.find({ userId: session.user.id })
    .select('_id name')
    .sort({ createdAt: -1 });

  return NextResponse.json({ demos });
}
