// app/api/admin/cleanup/route.ts - CRÉER CE FICHIER

import { connectToDatabase } from '@/lib/db';
import { Agent } from '@/models/Agent';
import { AgentVersion } from '@/models/AgentVersion';
import { AgentKnowledge } from '@/models/AgentKnowledge';
import { ChatbotConfig } from '@/models/ChatbotConfig';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    console.log('🧹 [CLEANUP] Starting cleanup...');
    let totalCleaned = 0;

    // 1️⃣ Nettoyer AgentVersions orphelines
    const userAgents = await Agent.find({ userId: session.user.id }, '_id');
    const userAgentIds = userAgents.map(a => a._id.toString());
    
    const orphanedVersions = await AgentVersion.find({
      agentId: { $nin: userAgentIds }
    });
    
    if (orphanedVersions.length > 0) {
      await AgentVersion.deleteMany({ _id: { $in: orphanedVersions.map(v => v._id) } });
      totalCleaned += orphanedVersions.length;
      console.log(`🗑️ Cleaned ${orphanedVersions.length} orphaned versions`);
    }

    // 2️⃣ Nettoyer AgentKnowledge orpheline
    const orphanedKnowledge = await AgentKnowledge.find({
      agentId: { $nin: userAgentIds }
    });
    
    if (orphanedKnowledge.length > 0) {
      await AgentKnowledge.deleteMany({ _id: { $in: orphanedKnowledge.map(k => k._id) } });
      totalCleaned += orphanedKnowledge.length;
      console.log(`🗑️ Cleaned ${orphanedKnowledge.length} orphaned knowledge`);
    }

    // 3️⃣ Nettoyer ChatbotConfigs orphelins
    const orphanedConfigs = await ChatbotConfig.find({
      selectedAgent: { $nin: userAgentIds },
      userId: session.user.id
    });
    
    if (orphanedConfigs.length > 0) {
      await ChatbotConfig.deleteMany({ _id: { $in: orphanedConfigs.map(c => c._id) } });
      totalCleaned += orphanedConfigs.length;
      console.log(`🗑️ Cleaned ${orphanedConfigs.length} orphaned configs`);
    }

    // 4️⃣ Supprimer doublons ChatbotConfigs (garder le plus récent)
    const duplicateGroups = await ChatbotConfig.aggregate([
      { $match: { userId: session.user.id } },
      {
        $group: {
          _id: '$selectedAgent',
          configs: { $push: { id: '$_id', createdAt: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]);

    let duplicatesRemoved = 0;
    for (const group of duplicateGroups) {
      const sorted = group.configs.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      const toDelete = sorted.slice(1); // Garde le plus récent
      if (toDelete.length > 0) {
        await ChatbotConfig.deleteMany({ 
          _id: { $in: toDelete.map((c: any) => c.id) } 
        });
        duplicatesRemoved += toDelete.length;
      }
    }
    totalCleaned += duplicatesRemoved;
    
    console.log(`✅ [CLEANUP] Complete! Cleaned ${totalCleaned} items total`);

    return NextResponse.json({
      success: true,
      message: `Cleanup complete! Removed ${totalCleaned} orphaned/duplicate items`,
      cleaned: {
        orphanedVersions: orphanedVersions.length,
        orphanedKnowledge: orphanedKnowledge.length,
        orphanedConfigs: orphanedConfigs.length,
        duplicateConfigs: duplicatesRemoved,
        total: totalCleaned
      }
    });

  } catch (error) {
    console.error('❌ Cleanup error:', error);
    return NextResponse.json({ 
      error: 'Cleanup failed' 
    }, { status: 500 });
  }
}