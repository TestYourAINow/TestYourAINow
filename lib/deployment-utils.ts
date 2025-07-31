// lib/deployment-utils.ts - VERSION CORRIGÉE
import { Agent } from '@/models/Agent';
import { Connection } from '@/models/Connection';
// ✅ IMPORT STATIQUE au lieu de dynamique pour éviter l'erreur webpack
import { ChatbotConfig } from '@/models/ChatbotConfig';

// ✅ FONCTION POUR METTRE À JOUR isDeployed
export async function updateAgentDeploymentStatus(agentId: string, isDeployed: boolean) {
  try {
    console.log(`🚀 [DEPLOYMENT] Updating agent ${agentId} isDeployed to: ${isDeployed}`);
    
    const updatedAgent = await Agent.findByIdAndUpdate(
      agentId,
      { 
        isDeployed: isDeployed,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (updatedAgent) {
      console.log(`✅ [DEPLOYMENT] Agent ${agentId} deployment status updated successfully`);
      return { success: true, agent: updatedAgent };
    } else {
      console.error(`❌ [DEPLOYMENT] Agent ${agentId} not found`);
      return { success: false, error: 'Agent not found' };
    }
  } catch (error: any) {
    console.error(`❌ [DEPLOYMENT] Error updating agent ${agentId}:`, error);
    return { success: false, error: error.message };
  }
}

// ✅ FONCTION POUR VÉRIFIER ET SYNCHRONISER UN AGENT - VERSION CORRIGÉE
export async function syncAgentDeploymentStatus(agentId: string) {
  try {
    console.log(`🔄 [SYNC] Checking deployment status for agent ${agentId}`);
    
    // 1. Compter les connections actives (Instagram/Facebook)
    const activeConnections = await Connection.countDocuments({
      aiBuildId: agentId,
      isActive: true
    });

    // 2. ✅ Compter les ChatbotConfig actives (Website Widgets)
    let activeChatbotConfigs = 0;
    try {
      activeChatbotConfigs = await ChatbotConfig.countDocuments({
        selectedAgent: agentId,
        isActive: true
      });
    } catch (chatbotError) {
      console.log(`⚠️ [SYNC] ChatbotConfig model not available, counting only connections`);
      // Si ChatbotConfig pas disponible, continuer avec seulement les connections
    }

    // 3. ✅ Agent déployé si AU MOINS UNE des deux conditions
    const shouldBeDeployed = activeConnections > 0 || activeChatbotConfigs > 0;
    
    // Mettre à jour le statut
    const result = await updateAgentDeploymentStatus(agentId, shouldBeDeployed);
    
    console.log(`🔄 [SYNC] Agent ${agentId}: ${activeConnections} connections + ${activeChatbotConfigs} widgets → ${shouldBeDeployed ? 'deployed' : 'not deployed'}`);
    
    return result;
  } catch (error: any) {
    console.error(`❌ [SYNC] Error syncing agent ${agentId}:`, error);
    return { success: false, error: error.message };
  }
}

// 🆕 FONCTION UTILITAIRE - Synchroniser TOUS les agents (pour corriger l'état actuel)
export async function syncAllAgentsDeploymentStatus(userId?: string) {
  try {
    console.log(`🔄 [SYNC_ALL] Starting full synchronization...`);
    
    // Récupérer tous les agents (optionnellement filtrés par utilisateur)
    const query = userId ? { userId } : {};
    const allAgents = await Agent.find(query).select('_id name isDeployed');
    
    let syncCount = 0;
    let errorCount = 0;
    
    for (const agent of allAgents) {
      try {
        await syncAgentDeploymentStatus(agent._id.toString());
        syncCount++;
      } catch (error) {
        console.error(`❌ [SYNC_ALL] Failed to sync agent ${agent._id}:`, error);
        errorCount++;
      }
    }

    console.log(`✅ [SYNC_ALL] Completed: ${syncCount} synced, ${errorCount} errors`);
    
    return { 
      success: true, 
      synced: syncCount, 
      errors: errorCount,
      message: `Synchronized ${syncCount} agents` 
    };

  } catch (error: any) {
    console.error(`❌ [SYNC_ALL] Error syncing all agents:`, error);
    return { success: false, error: error.message };
  }
}