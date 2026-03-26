import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { Agent } from '@/models/Agent';
import { Connection } from '@/models/Connection';
import { Demo } from '@/models/Demo';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDatabase();
  const user = await User.findById(session.user.id).select('onboardingComplete onboardingSteps');
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (user.onboardingComplete) {
    return NextResponse.json({ onboardingComplete: true });
  }

  const steps = user.onboardingSteps;
  const hasNoFlags = !steps?.hasCreatedAgent && !steps?.hasCreatedConnection && !steps?.hasCreatedDemo;

  // One-time migration for existing users: check real-time stats and save flags
  if (hasNoFlags) {
    const userId = session.user.id;
    const [agentCount, connectionCount, demoCount] = await Promise.all([
      Agent.countDocuments({ userId }),
      Connection.countDocuments({ userId }),
      Demo.countDocuments({ userId }),
    ]);

    const migratedSteps = {
      hasCreatedAgent:      agentCount > 0,
      hasCreatedConnection: connectionCount > 0,
      hasCreatedDemo:       demoCount > 0,
    };

    await User.findByIdAndUpdate(userId, { $set: { onboardingSteps: migratedSteps } });

    return NextResponse.json({ onboardingComplete: false, steps: migratedSteps });
  }

  return NextResponse.json({
    onboardingComplete: false,
    steps: {
      hasCreatedAgent:      steps?.hasCreatedAgent ?? false,
      hasCreatedConnection: steps?.hasCreatedConnection ?? false,
      hasCreatedDemo:       steps?.hasCreatedDemo ?? false,
    },
  });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDatabase();
  await User.findByIdAndUpdate(session.user.id, { onboardingComplete: true });

  return NextResponse.json({ success: true });
}
