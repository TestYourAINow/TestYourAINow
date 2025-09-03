import { connectToDatabase } from '@/lib/db'
import { Connection } from '@/models/Connection'
import { Agent } from '@/models/Agent'
import { ChatbotConfig } from '@/models/ChatbotConfig' // 🆕 AJOUTÉ
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { syncAgentDeploymentStatus, updateAgentDeploymentStatus } from '@/lib/deployment-utils' // 🆕 AJOUTÉ updateAgentDeploymentStatus

export async function GET(
  req: NextRequest,
  context: any
) {
  const params = await context.params
  await connectToDatabase()

  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const connection = await Connection.findOne({
    _id: params.id,
    userId: session.user.id,
  })

  if (!connection) {
    return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
  }

  // 🆕 AJOUTÉ - Récupérer le nom de l'agent
  let aiName = null;
  if (connection?.aiBuildId) {
    const agent = await Agent.findById(connection.aiBuildId);
    aiName = agent?.name || null;
  }

  return NextResponse.json({ 
    connection: {
      ...connection.toObject(),
      aiName
    }
  })
}

export async function PUT(req: NextRequest, context: any) {
  const params = await context.params;
  await connectToDatabase()
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, aiBuildId, settings } = body

  const connection = await Connection.findOneAndUpdate(
    {
      _id: params.id,
      userId: session.user.id,
    },
    {
      ...(name && { name }),
      ...(aiBuildId && { aiBuildId }),
      ...(settings && { settings }),
    },
    { new: true }
  )

  if (!connection) {
    return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, connection })
}

// 🆕 DELETE MODIFIÉ - Avec CASCADE DELETE
export async function DELETE(req: NextRequest, context: any) {
  const params = await context.params
  await connectToDatabase()

  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  try {
    console.log(`🗑️ [DELETE CASCADE] Starting deletion of connection ${id}...`)

    // 1️⃣ Récupérer la connection pour avoir l'agentId
    const connection = await Connection.findOne({ 
      _id: id, 
      userId: session.user.id 
    })
    
    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    const agentId = connection.aiBuildId

    // 2️⃣ Supprimer TOUS les ChatbotConfigs liés à cette connection
    const deletedConfigs = await ChatbotConfig.deleteMany({ 
      connectionId: id,
      userId: session.user.id 
    })
    console.log(`🗑️ [DELETE CASCADE] Deleted ${deletedConfigs.deletedCount} chatbot configs`)

    // 3️⃣ Vérifier si cet agent est encore utilisé ailleurs
    const otherConnections = await Connection.countDocuments({
      aiBuildId: agentId,
      userId: session.user.id,
      _id: { $ne: id } // Exclure la connection qu'on supprime
    })

    const otherConfigs = await ChatbotConfig.countDocuments({
      selectedAgent: agentId,
      userId: session.user.id,
      connectionId: { $ne: id }
    })

    // 4️⃣ Si l'agent n'est plus utilisé nulle part, le marquer comme non-déployé
    if (otherConnections === 0 && otherConfigs === 0) {
      await updateAgentDeploymentStatus(agentId, false)
      console.log(`📉 [DEPLOYMENT] Agent ${agentId} marked as NOT deployed (no more connections)`)
    } else {
      console.log(`📊 [DEPLOYMENT] Agent ${agentId} still in use (${otherConnections + otherConfigs} other uses)`)
    }

    // 5️⃣ Supprimer la connection
    await Connection.deleteOne({ _id: id })
    console.log(`🗑️ [DELETE CASCADE] Deleted connection ${id}`)

    const summary = {
      connection: 1,
      chatbotConfigs: deletedConfigs.deletedCount,
      agentStillDeployed: otherConnections > 0 || otherConfigs > 0
    }

    console.log(`✅ [DELETE CASCADE] Complete! Summary:`, summary)

    return NextResponse.json({ 
      success: true,
      message: 'Connection and related data deleted successfully',
      deleted: summary
    })

  } catch (error) {
    console.error('❌ [DELETE CASCADE] Error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete connection and related data' 
    }, { status: 500 })
  }
}