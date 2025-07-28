import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Connection } from '@/models/Connection';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import crypto from 'crypto';

// 🆕 Fonctions pour générer webhook ID et secret
function generateWebhookId(): string {
  return crypto.randomBytes(16).toString('base64url').replace(/[_-]/g, '');
}

function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex');
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

  // 🆕 Générer les données webhook SEULEMENT pour Facebook et Instagram
  let webhookId, webhookSecret, webhookUrl;
  
  if (integrationType === 'instagram-dms' || integrationType === 'facebook-messenger') {
    webhookId = generateWebhookId();
    webhookSecret = generateWebhookSecret();
    webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook/manychat/${webhookId}`;
  }

  const connection = await Connection.create({
    userId: session.user.id,
    name,
    integrationType,
    aiBuildId,
    isActive: true,
    
    // 🆕 Ajouter les données webhook (seulement si générées)
    ...(webhookId && { webhookId }),
    ...(webhookSecret && { webhookSecret }),
    ...(webhookUrl && { webhookUrl }),
  });

  return NextResponse.json({ 
    success: true, 
    connection: {
      ...connection.toObject(),
      // ✅ Retourner les infos webhook seulement si elles existent
      ...(webhookUrl && { webhookUrl }),
      ...(webhookSecret && { webhookSecret }),
    }
  });
}