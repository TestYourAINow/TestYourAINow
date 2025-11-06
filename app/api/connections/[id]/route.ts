// app\api\connections\[id]\route.ts

import { connectToDatabase } from '@/lib/db'
import { Connection } from '@/models/Connection'
import { Agent } from '@/models/Agent'
import { ChatbotConfig } from '@/models/ChatbotConfig' // 🆕 AJOUTÉ
import { Conversation } from '@/models/Conversation'
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

  console.log('📝 [API] PUT request received:', { name, aiBuildId, settings });

  // 🆕 DÉTECTER CHANGEMENT DE PÉRIODE
  const connection = await Connection.findOne({
    _id: params.id,
    userId: session.user.id,
  });

  if (!connection) {
    return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
  }

  let resetPeriod = false;
  let historyEntry = null;
  
  // Si la durée de période change ET qu'une période existe déjà
  if (settings?.periodDays && 
      connection.periodDays !== settings.periodDays && 
      connection.periodStartDate) {
    
    console.log(`🔄 [LIMIT] Period duration changed from ${connection.periodDays} to ${settings.periodDays} days`);
    
    // Sauvegarder la période actuelle dans l'historique
    historyEntry = {
      period: `${connection.periodStartDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })} to ${new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })}`,
      messagesUsed: connection.currentPeriodUsage,
      overageMessages: connection.overageCount || 0,
      startDate: connection.periodStartDate,
      endDate: new Date(),
      note: `Period changed from ${connection.periodDays} to ${settings.periodDays} days`
    };
    
    resetPeriod = true;
  }

  // 🆕 DÉTECTER CHANGEMENT DE LIMITE - RECALCULER OVERAGE
let recalculateOverage = false;

if (settings?.messageLimit && 
    connection.messageLimit !== settings.messageLimit && 
    connection.limitEnabled &&
    connection.currentPeriodUsage > 0) {
  
  console.log(`🔄 [LIMIT] Message limit changed from ${connection.messageLimit} to ${settings.messageLimit}`);
  recalculateOverage = true;
}

  // 🔧 CONSTRUIRE L'OBJET DE MISE À JOUR
  const updateData: any = {};
  
  if (name) updateData.name = name;
  if (aiBuildId) updateData.aiBuildId = aiBuildId;
  if (settings) updateData.settings = settings;
  
  // 🆕 EXTRAIRE LES CHAMPS DE LIMITE DE "SETTINGS" ET LES METTRE AU BON ENDROIT
  if (settings?.limitEnabled !== undefined) {
    updateData.limitEnabled = settings.limitEnabled;
    console.log('📊 [LIMIT] limitEnabled:', settings.limitEnabled);
  }
  if (settings?.messageLimit !== undefined) {
    updateData.messageLimit = settings.messageLimit;
    console.log('📊 [LIMIT] messageLimit:', settings.messageLimit);
  }
  if (settings?.periodDays !== undefined) {
    updateData.periodDays = settings.periodDays;
    console.log('📊 [LIMIT] periodDays:', settings.periodDays);
  }
  if (settings?.allowOverage !== undefined) {
    updateData.allowOverage = settings.allowOverage;
    console.log('📊 [LIMIT] allowOverage:', settings.allowOverage);
  }
  if (settings?.limitReachedMessage !== undefined) {
    updateData.limitReachedMessage = settings.limitReachedMessage;
    console.log('📊 [LIMIT] limitReachedMessage:', settings.limitReachedMessage);
  }
  if (settings?.showLimitMessage !== undefined) {
    updateData.showLimitMessage = settings.showLimitMessage;
    console.log('📊 [LIMIT] showLimitMessage:', settings.showLimitMessage);
  }
  
  // 🔄 RESET SI PÉRIODE CHANGÉE
  if (resetPeriod) {
    updateData.currentPeriodUsage = 0;
    updateData.overageCount = 0;
    updateData.periodStartDate = null;
    updateData.periodEndDate = null;
    
    // Ajouter à l'historique
    if (historyEntry) {
      updateData.$push = { usageHistory: historyEntry };
    }
    
    console.log('🔄 [LIMIT] Period reset applied');
  }

// 🔧 RECALCULER L'OVERAGE SI LA LIMITE A CHANGÉ
if (recalculateOverage && settings?.messageLimit) {
  const newLimit = settings.messageLimit;
  const currentUsage = connection.currentPeriodUsage;
  
  if (currentUsage > newLimit) {
    // On est ENCORE en overage avec la nouvelle limite
    const newOverage = currentUsage - newLimit;
    updateData.overageCount = newOverage;
    
    console.log(`📊 [LIMIT] Recalculated overage:`, {
      oldLimit: connection.messageLimit,
      newLimit: newLimit,
      currentUsage: currentUsage,
      newOverage: newOverage
    });
  } else {
    // On n'est PLUS en overage avec la nouvelle limite
    updateData.overageCount = 0;
    
    console.log(`✅ [LIMIT] No longer in overage:`, {
      oldLimit: connection.messageLimit,
      newLimit: newLimit,
      currentUsage: currentUsage
    });
  }
}

  console.log('📝 [API] Update data:', updateData);

  const updatedConnection = await Connection.findOneAndUpdate(
    {
      _id: params.id,
      userId: session.user.id,
    },
    updateData,
    { new: true }
  )

  if (!updatedConnection) {
    return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
  }

  console.log('✅ [API] Connection updated:', {
    limitEnabled: updatedConnection.limitEnabled,
    messageLimit: updatedConnection.messageLimit,
    periodDays: updatedConnection.periodDays
  });

  return NextResponse.json({ success: true, connection: updatedConnection })
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

    // 2.5️⃣ Supprimer TOUTES les conversations liées à cette connection
    const deletedConversations = await Conversation.deleteMany({
      connectionId: id
    })
    console.log(`🗑️ [DELETE CASCADE] Deleted ${deletedConversations.deletedCount} conversations`)

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
      conversations: deletedConversations.deletedCount,
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