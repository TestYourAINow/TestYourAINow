// app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/db";
import { Agent } from "@/models/Agent";
import { Connection } from "@/models/Connection";
import { Conversation } from "@/models/Conversation";
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
    
    // 2. ⚡ AGENTS ACTIFS - ✅ CORRIGÉ (maintenant basé sur isDeployed)
    const activeAgents = await Agent.countDocuments({ 
      userId: userId,
      isDeployed: true // ✅ NOUVELLE LOGIQUE !
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

    // 6. 💬 CONVERSATIONS - ✅ CONVERSATIONS DE MES AGENTS
    const userAgentIds = await Agent.find({ userId: userId }).select('_id');
    const agentObjectIds = userAgentIds.map(agent => agent._id);
    
    const totalConversations = agentObjectIds.length > 0 
      ? await Conversation.countDocuments({ 
          agentId: { $in: agentObjectIds },
          isDeleted: false 
        })
      : 0;

    // 7. 📊 RÉPARTITION PAR STATUT - ✅ CORRIGÉ
    const agentsByStatus = {
      active: activeAgents, // ✅ Basé sur isDeployed maintenant
      inactive: totalAgents - activeAgents
    };

    // 🎯 RÉPONSE FINALE - ✅ NETTOYÉE
    const dashboardStats = {
      // Métriques principales
      totalAgents,
      activeAgents, // ✅ Basé sur isDeployed
      totalIntegrations,
      totalDeployments,
      activeDeployments,
      totalApiKeys,
      totalConversations, // ✅ Conversations de mes agents
      
      // Données supplémentaires
      agentsByStatus, // ✅ Corrigé
      
      // Métadonnées
      lastUpdated: new Date().toISOString(),
      userId: userId
    };

    return NextResponse.json({
      success: true,
      stats: dashboardStats
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}