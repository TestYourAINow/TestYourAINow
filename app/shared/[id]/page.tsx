import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import { Demo } from '@/models/Demo';
import SharedDemoClient from '@/components/SharedDemoClient';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

// Interface pour typer le retour de Mongoose
interface DemoDocument {
  _id: string;
  userId: string;
  name: string;
  agentId: string;
  demoToken: string; // 🆕
  publicEnabled: boolean; // 🆕
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

// Fonction pour générer les métadonnées dynamiques
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  await connectToDatabase();
  const demoDoc = await Demo.findById(id).lean() as DemoDocument | null;
  
  if (!demoDoc || new Date(demoDoc.expiresAt).getTime() < Date.now() || !demoDoc.publicEnabled) {
    return {
      title: 'Demo not found - TestYourAInow',
    };
  }

  // Utiliser seulement le nom de la démo
  const demoTitle = demoDoc.name || 'AI Demo';
  
  // Créer l'URL de l'avatar via notre API
  const avatarImageUrl = demoDoc.avatarUrl && demoDoc.avatarUrl !== '/Default Avatar.png'
    ? `https://testyourainow.com/api/avatar/${id}`
    : 'https://testyourainow.com/og-image.png';

  return {
    title: demoTitle,
    description: 'Test your interactive AI demo!',
    
    openGraph: {
      title: demoTitle,
      description: 'Test your interactive AI demo!',
      url: `https://testyourainow.com/shared/${id}`,
      siteName: 'Test your interactive AI demo!',
      images: [
        {
          url: avatarImageUrl,
          width: 1200,
          height: 630,
          alt: demoTitle,
        },
      ],
      type: 'website',
    },
    
    twitter: {
      card: 'summary_large_image',
      title: demoTitle,
      description: 'Test your interactive AI demo!',
      images: [avatarImageUrl],
    },
  };
}

export default async function SharedDemoPage({ params }: Props) {
  const { id } = await params;

  await connectToDatabase();

  const demoDoc = await Demo.findById(id).lean() as DemoDocument | null;
  
  if (!demoDoc || new Date(demoDoc.expiresAt).getTime() < Date.now()) {
    return notFound();
  }

  // 🆕 Vérifier si l'accès public est activé
  if (!demoDoc.publicEnabled) {
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
    <SharedDemoClient 
      demo={demo} 
      demoId={id} 
      demoToken={demoDoc.demoToken} // 🆕 Passer le token au client
    />
  );
}