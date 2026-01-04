// app/api/connections/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Connection } from '@/models/Connection';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import crypto from 'crypto';
import { updateAgentDeploymentStatus } from '@/lib/deployment-utils';

// Fonctions pour générer webhook ID et secret
function generateWebhookId(): string {
  return crypto.randomBytes(16).toString('base64url').replace(/[_-]/g, '');
}

function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Fonction pour générer le token de partage (12 bytes = 16 caractères)
function generateShareToken(): string {
  return crypto.randomBytes(12).toString('base64url');
}

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

  // 🆕 MODIFIÉ - Générer webhook pour ManyChat ET Webhook universel
  let webhookId, webhookSecret, webhookUrl;
  
  if (integrationType === 'instagram-dms' || integrationType === 'facebook-messenger') {
    // Pour ManyChat - ancien endpoint
    webhookId = generateWebhookId();
    webhookSecret = generateWebhookSecret();
    webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook/manychat/${webhookId}`;
    
    console.log(`🔗 [MANYCHAT] Generated webhook for ${integrationType}:`, webhookUrl);
  }
  
  // 🆕 NOUVEAU - Pour type "webhook" universel
  if (integrationType === 'webhook') {
    webhookId = generateWebhookId();
    webhookSecret = generateWebhookSecret();
    webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook/universal/${webhookId}`;
    
    console.log(`🔗 [UNIVERSAL] Generated webhook for universal integration:`, webhookUrl);
  }

  // Générer automatiquement shareToken pour website-widget
  let shareToken, shareCreatedAt;
  
  if (integrationType === 'website-widget') {
    shareToken = generateShareToken();
    shareCreatedAt = new Date();
    console.log(`🔗 [SHARE] Generated token for website-widget: ${shareToken}`);
  }

  const connection = await Connection.create({
    userId: session.user.id,
    name,
    integrationType,
    aiBuildId,
    isActive: true,
    
    // Ajouter les données webhook (seulement si générées)
    ...(webhookId && { webhookId }),
    ...(webhookSecret && { webhookSecret }),
    ...(webhookUrl && { webhookUrl }),
    
    // Ajouter les données de partage (seulement pour website-widget)
    ...(shareToken && { 
      shareToken,
      shareEnabled: false, // Désactivé par défaut
      sharePermissions: 'read-only',
      sharePinEnabled: false,
      shareCreatedAt
    }),
  });

  // Mettre isDeployed = true sur l'agent choisi
  if (aiBuildId) {
    await updateAgentDeploymentStatus(aiBuildId, true);
    console.log(`🎉 [DEPLOYMENT] Agent ${aiBuildId} marked as deployed!`);
  }

  console.log(`✅ [CONNECTION] Created successfully:`, {
    id: connection._id,
    name: connection.name,
    type: integrationType,
    hasWebhook: !!webhookUrl
  });

  return NextResponse.json({ 
    success: true, 
    connection: {
      ...connection.toObject(),
      // Retourner les infos webhook seulement si elles existent
      ...(webhookUrl && { webhookUrl }),
      ...(webhookSecret && { webhookSecret }),
      // Retourner le shareToken si généré
      ...(shareToken && { shareToken }),
    }
  });
}