import { connectToDatabase } from '@/lib/db'
import { Connection } from '@/models/Connection'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { syncAgentDeploymentStatus } from '@/lib/deployment-utils' // 🆕 IMPORT

export async function PATCH(
  req: NextRequest,
  context: any
) {
  const params = await context.params
  await connectToDatabase()

  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Récupère la connexion actuelle
    const currentConnection = await Connection.findOne({
      _id: params.id,
      userId: session.user.id,
    })

    if (!currentConnection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    const agentId = currentConnection.aiBuildId;

    // Toggle le statut isActive
    const updatedConnection = await Connection.findOneAndUpdate(
      {
        _id: params.id,
        userId: session.user.id,
      },
      {
        isActive: !currentConnection.isActive
      },
      { new: true }
    )

    // 🆕 NOUVEAU - Synchroniser le statut de l'agent
    if (agentId) {
      await syncAgentDeploymentStatus(agentId);
      console.log(`🔄 [TOGGLE] Agent ${agentId} deployment status synchronized`);
    }

    return NextResponse.json({ 
      success: true,
      isActive: updatedConnection.isActive,
      message: updatedConnection.isActive ? 'Connection activated' : 'Connection deactivated'
    })
  } catch (error) {
    console.error('Error toggling connection:', error)
    return NextResponse.json({ 
      error: 'Failed to toggle connection status' 
    }, { status: 500 })
  }
}