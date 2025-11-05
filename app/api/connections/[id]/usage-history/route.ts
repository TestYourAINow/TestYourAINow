// app/api/connections/[id]/usage-history/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { Connection } from '@/models/Connection';
import { connectToDatabase } from '@/lib/db';

// 🗑️ DELETE - Supprimer une période spécifique de l'historique
export async function DELETE(
  request: NextRequest,
  context: any
) {
  const params = await context.params;
  try {
    // 1️⃣ Vérifier la session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2️⃣ Connecter à MongoDB
    await connectToDatabase();

    // 3️⃣ Parser le body
    const body = await request.json();
    const { periodId } = body;

    if (!periodId) {
      return NextResponse.json(
        { success: false, error: 'Period ID is required' },
        { status: 400 }
      );
    }

    console.log(`🗑️ [API] Delete history period request:`, {
      connectionId: params.id,
      periodId,
      userEmail: session.user.email
    });

    // 4️⃣ Trouver la connection et vérifier ownership
    const connection = await Connection.findOne({
      _id: params.id,
      userId: session.user.email
    });

    if (!connection) {
      return NextResponse.json(
        { success: false, error: 'Connection not found or unauthorized' },
        { status: 404 }
      );
    }

    // 5️⃣ Supprimer la période de l'historique
    const initialHistoryLength = connection.usageHistory?.length || 0;
    
    connection.usageHistory = connection.usageHistory.filter(
      (period: any) => period._id.toString() !== periodId
    );

    const finalHistoryLength = connection.usageHistory?.length || 0;

    if (initialHistoryLength === finalHistoryLength) {
      return NextResponse.json(
        { success: false, error: 'History period not found' },
        { status: 404 }
      );
    }

    // 6️⃣ Sauvegarder les changements
    await connection.save();

    console.log(`✅ [API] History period deleted successfully:`, {
      connectionId: params.id,
      periodId,
      removedCount: initialHistoryLength - finalHistoryLength,
      remainingPeriods: finalHistoryLength
    });

    return NextResponse.json({
      success: true,
      message: 'History period deleted successfully',
      remainingPeriods: finalHistoryLength
    });

  } catch (error) {
    console.error('❌ [API] Error deleting history period:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}