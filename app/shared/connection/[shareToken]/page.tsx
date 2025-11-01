// app/shared/connection/[shareToken]/page.tsx

import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import { Connection } from '@/models/Connection';
import { Agent } from '@/models/Agent';
import SharedConnectionClient from '@/components/SharedConnectionClient';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ shareToken: string }>;
}

interface AgentDocument {
  _id: string;
  name: string;
}

// Interface pour typer le retour de Mongoose
interface ConnectionDocument {
  _id: string;
  userId: string;
  name: string;
  integrationType: string;
  aiBuildId: string;
  isActive: boolean;
  settings: any;
  shareToken: string;
  shareEnabled: boolean;
  sharePermissions: 'read-only' | 'editable';
  sharePinEnabled: boolean;
  sharePinCode?: string;
  shareCreatedAt: Date;
  shareLastAccessedAt?: Date;
  createdAt: Date;
}

// Fonction pour générer les métadonnées dynamiques
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareToken } = await params;

  await connectToDatabase();
  const connectionDoc = await Connection.findOne({ shareToken }).lean() as ConnectionDocument | null;
  
  if (!connectionDoc || !connectionDoc.shareEnabled) {
    return {
      title: 'Connection not found - TestYourAInow',
    };
  }

  const connectionTitle = connectionDoc.name || 'AI Connection';
  
  return {
    title: `${connectionTitle} - Shared Access`,
    description: 'Access shared AI connection configuration',
    
    openGraph: {
      title: `${connectionTitle} - Shared Access`,
      description: 'Access shared AI connection configuration',
      url: `https://testyourainow.com/shared/connection/${shareToken}`,
      siteName: 'TestYourAInow',
      images: [
        {
          url: 'https://testyourainow.com/og-image.png',
          width: 1200,
          height: 630,
          alt: connectionTitle,
        },
      ],
      type: 'website',
    },
    
    twitter: {
      card: 'summary_large_image',
      title: `${connectionTitle} - Shared Access`,
      description: 'Access shared AI connection configuration',
      images: ['https://testyourainow.com/og-image.png'],
    },
    
    robots: {
      index: false, // Ne pas indexer les pages partagées
      follow: false,
    },
  };
}

export default async function SharedConnectionPage({ params }: Props) {
  const { shareToken } = await params;

  await connectToDatabase();

  // Récupérer la connection
  const connectionDoc = await Connection.findOne({ shareToken }).lean() as ConnectionDocument | null;
  
  if (!connectionDoc) {
    return notFound();
  }

  // Vérifier si le partage est activé
  if (!connectionDoc.shareEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Disabled</h1>
          <p className="text-gray-400">
            This shared connection is no longer available.
          </p>
        </div>
      </div>
    );
  }

  // Vérifier que c'est un website-widget
  if (connectionDoc.integrationType !== 'website-widget') {
    return notFound();
  }

// Récupérer le nom de l'agent
  let agentName: string | null = null;
  if (connectionDoc.aiBuildId) {
    try {
      const agent = await Agent.findById(connectionDoc.aiBuildId).lean() as AgentDocument | null;
      agentName = agent?.name || null;
    } catch (error) {
      console.error('Error fetching agent:', error);
    }
  }

  // Mettre à jour shareLastAccessedAt
  await Connection.findByIdAndUpdate(connectionDoc._id, {
    shareLastAccessedAt: new Date()
  });

  console.log(`🔗 [SHARE] Page loaded for token: ${shareToken}`);

  // Sérialiser proprement l'objet pour le composant client
  const connection = {
    _id: connectionDoc._id.toString(),
    name: connectionDoc.name,
    integrationType: connectionDoc.integrationType,
    aiBuildId: connectionDoc.aiBuildId,
    agentName,
    settings: connectionDoc.settings || {},
    sharePermissions: connectionDoc.sharePermissions,
    sharePinEnabled: connectionDoc.sharePinEnabled,
    shareToken: connectionDoc.shareToken,
  };

  return (
    <SharedConnectionClient 
      connection={connection}
      shareToken={shareToken}
    />
  );
}