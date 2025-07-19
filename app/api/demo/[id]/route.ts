// api/demo/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { Demo } from '@/models/Demo';
import { Agent } from '@/models/Agent';

export async function GET(req: NextRequest, context: any) {
  const params = await context.params;
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const demo = await Demo.findOne({ _id: params.id, userId: session.user.id });
  if (!demo) return NextResponse.json({ error: 'Demo not found' }, { status: 404 });

  const agent = await Agent.findOne({ _id: demo.agentId });

  return NextResponse.json({
    // Infos de base
    id: demo._id,
    name: demo.name,
    usageLimit: demo.usageLimit,
    usedCount: demo.usedCount,
    createdAt: demo.createdAt,
    link: `${process.env.NEXT_PUBLIC_SITE_URL}/shared/${demo._id}`,
    messages: demo.messages || [],
    agentName: agent?.name || 'Agent inconnu',
    
    // Nouvelles infos de configuration pour InfoDemoModal
    theme: demo.theme,
    color: demo.color,
    avatarUrl: demo.avatarUrl,
    chatTitle: demo.chatTitle,
    subtitle: demo.subtitle,
    showWelcome: demo.showWelcome,
    welcomeMessage: demo.welcomeMessage,
    placeholderText: demo.placeholderText,
    showPopup: demo.showPopup,
    popupMessage: demo.popupMessage,
    popupDelay: demo.popupDelay,
  });
}

export async function DELETE(req: NextRequest, context: any) {
  const params = await context.params;
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const demo = await Demo.findOneAndDelete({ _id: params.id, userId: session.user.id });
  if (!demo) {
    return NextResponse.json({ error: 'Demo not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}