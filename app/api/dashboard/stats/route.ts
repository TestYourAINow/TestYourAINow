// app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/db";
import { Agent } from "@/models/Agent";
import { Connection } from "@/models/Connection";
import { Conversation } from "@/models/Conversation";
import { Folder } from "@/models/Folder";           // ✅ NOUVEAU
import { AgentVersion } from "@/models/AgentVersion"; // ✅ NOUVEAU
import { Demo } from "@/models/Demo";               // ✅ NOUVEAU
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    // 🔐 Vérification de la session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔗 Connexion à la base de données
    await connectToDatabase();

    // 👤 Récupération de l'utilisateur
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = session.user.id;

    // 📊 CALCUL DES MÉTRIQUES TEMPS RÉEL

    // 1. 🤖 AGENTS STATS
    const totalAgents = await Agent.countDocuments({ userId: userId });
    
    // 2. ⚡ AGENTS ACTIFS - Basé sur isDeployed
    const activeAgents = await Agent.countDocuments({ 
      userId: userId,
      isDeployed: true
    });

    // 3. 🔗 TOTAL INTÉGRATIONS
    const agentsWithIntegrations = await Agent.find({ 
      userId: userId,
      integrations: { $exists: true }
    }).select('integrations');
    
    const totalIntegrations = agentsWithIntegrations.reduce((total, agent) => {
      return total + (agent.integrations?.length || 0);
    }, 0);

    // 4. 🔑 API KEYS
    const totalApiKeys = user.apiKeys?.length || 0;

    // 5. 🚀 DÉPLOIEMENTS
    const totalDeployments = await Connection.countDocuments({ userId: userId });
    const activeDeployments = await Connection.countDocuments({ 
      userId: userId, 
      isActive: true 
    });

    // 6. 💬 CONVERSATIONS - Conversations de mes agents
    const userAgentIds = await Agent.find({ userId: userId }).select('_id');
    const agentObjectIds = userAgentIds.map(agent => agent._id);
    
    const totalConversations = agentObjectIds.length > 0 
      ? await Conversation.countDocuments({ 
          agentId: { $in: agentObjectIds },
          isDeleted: false 
        })
      : 0;

    // ✅ 7. NOUVELLES MÉTRIQUES - VRAIES DONNÉES

    // 📁 FOLDERS - Nombre de dossiers créés par l'utilisateur
    const totalFolders = await Folder.countDocuments({ userId: userId });
    
    // 🔄 VERSIONS - Nombre de versions d'agents sauvegardées
    const totalVersions = agentObjectIds.length > 0 
      ? await AgentVersion.countDocuments({ 
          agentId: { $in: agentObjectIds } 
        })
      : 0;
    
    // 🎭 DEMOS - Nombre de demos créées (max 15)
    const totalDemos = await Demo.countDocuments({ userId: userId });

    // 8. 📊 RÉPARTITION PAR STATUT
    const agentsByStatus = {
      active: activeAgents,
      inactive: totalAgents - activeAgents
    };

    // 🎯 RÉPONSE FINALE - ENHANCED avec toutes les nouvelles métriques
    const dashboardStats = {
      // ✅ Métriques principales existantes
      totalAgents,
      activeAgents,
      totalIntegrations,
      totalDeployments,
      activeDeployments,
      totalApiKeys,
      totalConversations,
      
      // ✅ NOUVELLES MÉTRIQUES AJOUTÉES
      totalFolders,        // Nombre de dossiers
      totalVersions,       // Nombre de versions d'agents
      totalDemos,          // Nombre de demos (X/15)
      
      // ✅ Données supplémentaires
      agentsByStatus,
      
      // ✅ Métadonnées
      lastUpdated: new Date().toISOString(),
      userId: userId
    };

    console.log(`📊 [DASHBOARD] Stats calculated for user ${userId}:`, {
      totalAgents,
      activeAgents,
      totalConversations,
      totalFolders,
      totalVersions,
      totalDemos: `${totalDemos}/15`,
      totalDeployments,
      activeDeployments
    });

    return NextResponse.json({
      success: true,
      stats: dashboardStats
    });

  } catch (error) {
    console.error("❌ Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}