// app/api/connections/shared/[shareToken]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Connection } from '@/models/Connection';
import { Agent } from '@/models/Agent';

// GET - Valider le token et retourner les infos de la connection (PUBLIC)
export async function GET(
  req: NextRequest,
  context: any
) {
  const params = await context.params;
  const { shareToken } = params;

  await connectToDatabase();

  try {
    // 1️⃣ Trouver la connection par shareToken
    const connection = await Connection.findOne({ shareToken });

    if (!connection) {
      return NextResponse.json({ 
        error: 'Invalid share token',
        code: 'TOKEN_NOT_FOUND'
      }, { status: 404 });
    }

    // 2️⃣ Vérifier que le partage est activé
    if (!connection.shareEnabled) {
      return NextResponse.json({ 
        error: 'Sharing is disabled for this connection',
        code: 'SHARING_DISABLED'
      }, { status: 403 });
    }

    // 3️⃣ Vérifier que c'est bien un website-widget
    if (connection.integrationType !== 'website-widget') {
      return NextResponse.json({ 
        error: 'This connection type does not support sharing',
        code: 'INVALID_TYPE'
      }, { status: 400 });
    }

    // 4️⃣ Récupérer le nom de l'agent
    let agentName = null;
    if (connection.aiBuildId) {
      const agent = await Agent.findById(connection.aiBuildId);
      agentName = agent?.name || null;
    }

    // 5️⃣ Mettre à jour shareLastAccessedAt
    await Connection.findByIdAndUpdate(connection._id, {
      shareLastAccessedAt: new Date()
    });

    console.log(`🔗 [SHARE] Access to shared connection: ${connection._id} (token: ${shareToken})`);

    // 6️⃣ Retourner les infos nécessaires (SANS données sensibles)
    return NextResponse.json({
      success: true,
      connection: {
        _id: connection._id.toString(),
        name: connection.name,
        integrationType: connection.integrationType,
        aiBuildId: connection.aiBuildId,
        agentName,
        settings: connection.settings,
        sharePermissions: connection.sharePermissions,
        sharePinEnabled: connection.sharePinEnabled,
        // ⚠️ NE PAS RETOURNER sharePinCode ici !
      },
      requiresPin: connection.sharePinEnabled || false,
    });

  } catch (error) {
    console.error('Error validating share token:', error);
    return NextResponse.json({ 
      error: 'Failed to validate share token',
      code: 'SERVER_ERROR'
    }, { status: 500 });
  }
}