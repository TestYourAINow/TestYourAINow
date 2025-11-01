// app/api/connections/[id]/share/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Connection } from '@/models/Connection';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// GET - Récupérer la configuration actuelle du partage
export async function GET(
  req: NextRequest,
  context: any
) {
  const params = await context.params;
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const connection = await Connection.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // Vérifier que c'est bien un website-widget
    if (connection.integrationType !== 'website-widget') {
      return NextResponse.json({ 
        error: 'Share feature is only available for website-widget connections' 
      }, { status: 400 });
    }

    // Retourner les infos de partage
    return NextResponse.json({
      success: true,
      shareConfig: {
        shareToken: connection.shareToken,
        shareEnabled: connection.shareEnabled || false,
        sharePermissions: connection.sharePermissions || 'read-only',
        sharePinEnabled: connection.sharePinEnabled || false,
        sharePinCode: connection.sharePinCode || '',
        shareCreatedAt: connection.shareCreatedAt,
        shareLastAccessedAt: connection.shareLastAccessedAt,
      }
    });

  } catch (error) {
    console.error('Error fetching share config:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch share configuration' 
    }, { status: 500 });
  }
}

// PATCH - Mettre à jour la configuration du partage
export async function PATCH(
  req: NextRequest,
  context: any
) {
  const params = await context.params;
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { shareEnabled, sharePermissions, sharePinEnabled, sharePinCode } = body;

    // Validation du PIN si activé (6 chiffres exactement)
    if (sharePinEnabled && sharePinCode) {
      if (!/^\d{6}$/.test(sharePinCode)) {
        return NextResponse.json({ 
          error: 'PIN code must be exactly 6 digits' 
        }, { status: 400 });
      }
    }

    // Validation des permissions
    if (sharePermissions && !['read-only', 'editable'].includes(sharePermissions)) {
      return NextResponse.json({ 
        error: 'Invalid share permissions. Must be "read-only" or "editable"' 
      }, { status: 400 });
    }

    const connection = await Connection.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // Vérifier que c'est bien un website-widget
    if (connection.integrationType !== 'website-widget') {
      return NextResponse.json({ 
        error: 'Share feature is only available for website-widget connections' 
      }, { status: 400 });
    }

    // Construire l'objet de mise à jour
    const updateData: any = {};

    if (shareEnabled !== undefined) {
      updateData.shareEnabled = shareEnabled;
    }

    if (sharePermissions !== undefined) {
      updateData.sharePermissions = sharePermissions;
    }

    if (sharePinEnabled !== undefined) {
      updateData.sharePinEnabled = sharePinEnabled;
    }

    // Si PIN activé, sauvegarder le code
    if (sharePinEnabled && sharePinCode) {
      updateData.sharePinCode = sharePinCode;
    }

    // Si PIN désactivé, supprimer le code
    if (sharePinEnabled === false) {
      updateData.sharePinCode = undefined;
    }

    // Mettre à jour la connection
    const updatedConnection = await Connection.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { $set: updateData },
      { new: true }
    );

    console.log(`🔗 [SHARE] Updated share config for connection ${params.id}:`, {
      shareEnabled: updatedConnection.shareEnabled,
      sharePermissions: updatedConnection.sharePermissions,
      sharePinEnabled: updatedConnection.sharePinEnabled,
      hasPinCode: !!updatedConnection.sharePinCode
    });

    return NextResponse.json({
      success: true,
      shareConfig: {
        shareToken: updatedConnection.shareToken,
        shareEnabled: updatedConnection.shareEnabled,
        sharePermissions: updatedConnection.sharePermissions,
        sharePinEnabled: updatedConnection.sharePinEnabled,
        sharePinCode: updatedConnection.sharePinCode,
        shareCreatedAt: updatedConnection.shareCreatedAt,
      }
    });

  } catch (error) {
    console.error('Error updating share config:', error);
    return NextResponse.json({ 
      error: 'Failed to update share configuration' 
    }, { status: 500 });
  }
}