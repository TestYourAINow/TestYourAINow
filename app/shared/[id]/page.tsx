import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import { Demo } from '@/models/Demo';
import SharedDemoClient from '@/components/SharedDemoClient';

interface Props {
  params: Promise<{ id: string }>;
}

// Interface pour typer le retour de Mongoose
interface DemoDocument {
  _id: string;
  userId: string;
  name: string;
  agentId: string;
  theme: string;
  color: string;
  avatarUrl?: string;
  showWelcome: boolean;
  welcomeMessage: string;
  placeholderText?: string;
  chatTitle?: string;
  subtitle?: string;
  showPopup?: boolean;
  popupMessage?: string;
  popupDelay?: number;
  usageLimit: number;
  usedCount?: number;
  createdAt: Date;
  expiresAt: Date;
  __v: number;
}

export default async function SharedDemoPage({ params }: Props) {
  const { id } = await params;

  await connectToDatabase();

  const demoDoc = await Demo.findById(id).lean() as DemoDocument | null;
  
  if (!demoDoc || new Date(demoDoc.expiresAt).getTime() < Date.now()) {
    return notFound();
  }

  // Sérialiser proprement l'objet pour le composant client
  const demo = {
    name: demoDoc.name,
    theme: demoDoc.theme as 'light' | 'dark',
    color: demoDoc.color,
    avatarUrl: demoDoc.avatarUrl || '',
    agentId: demoDoc.agentId,
    showWelcome: demoDoc.showWelcome,
    welcomeMessage: demoDoc.welcomeMessage || '',
    placeholderText: demoDoc.placeholderText || 'Type your message...',
    chatTitle: demoDoc.chatTitle || 'Assistant IA',
    subtitle: demoDoc.subtitle || 'En ligne',
    showPopup: demoDoc.showPopup ?? true,
    popupMessage: demoDoc.popupMessage || 'Hello! Need any help?',
    popupDelay: demoDoc.popupDelay || 2,
    usageLimit: demoDoc.usageLimit,
    usedCount: demoDoc.usedCount || 0,
  };

  return (
    <SharedDemoClient demo={demo} demoId={id} />
  );
}