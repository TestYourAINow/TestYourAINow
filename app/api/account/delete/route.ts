import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { Agent } from "@/models/Agent"
import { AgentVersion } from "@/models/AgentVersion"
import { AgentKnowledge } from "@/models/AgentKnowledge"
import { ChatbotConfig } from "@/models/ChatbotConfig"
import { Connection } from "@/models/Connection"
import { Conversation } from "@/models/Conversation"
import { Folder } from "@/models/Folder"
import { Demo } from "@/models/Demo"
import { supabase } from "@/lib/supabase"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any,
})

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectToDatabase()
    const userId = session.user.id
    const user = await User.findById(userId)
    const agents = await Agent.find({ userId })

    console.log(`🗑️ [CASCADE DELETE] Starting full account deletion for user: ${userId}`)

    // 1️⃣ Supprimer les fichiers Supabase (existant)
    const filesToDelete: { bucket: string; path: string }[] = []

    for (const agent of agents) {
      if (Array.isArray(agent.integrations)) {
        for (const integration of agent.integrations) {
          if (Array.isArray(integration.files)) {
            for (const file of integration.files) {
              if (file.isCloud && file.path) {
                filesToDelete.push({ bucket: "agents", path: file.path })
              }
            }
          }
        }
      }
    }

    for (const { bucket, path } of filesToDelete) {
      const { error } = await supabase.storage.from(bucket).remove([path])
      if (error) {
        console.warn(`❌ Failed to delete ${path} in ${bucket}:`, error.message)
      }
    }

    // 2️⃣ 🆕 NOUVEAU - Supprimer TOUTES les données liées aux agents
    const agentIds = agents.map(agent => agent._id)
    
    if (agentIds.length > 0) {
      // Supprimer les versions d'agents
      const deletedVersions = await AgentVersion.deleteMany({ agentId: { $in: agentIds } })
      console.log(`🗑️ Deleted ${deletedVersions.deletedCount} agent versions`)
      
      // Supprimer les connaissances d'agents  
      const deletedKnowledge = await AgentKnowledge.deleteMany({ agentId: { $in: agentIds } })
      console.log(`🗑️ Deleted ${deletedKnowledge.deletedCount} knowledge documents`)
      
      // Supprimer les conversations liées aux agents
      const deletedConversations = await Conversation.deleteMany({ 
        agentId: { $in: agentIds } 
      })
      console.log(`🗑️ Deleted ${deletedConversations.deletedCount} conversations`)
    }

    // 3️⃣ 🆕 NOUVEAU - Supprimer les configurations chatbot de l'utilisateur
    const deletedConfigs = await ChatbotConfig.deleteMany({ 
      $or: [
        { selectedAgent: { $in: agentIds } },
        { userId: userId }
      ]
    })
    console.log(`🗑️ Deleted ${deletedConfigs.deletedCount} chatbot configs`)
    
    // 4️⃣ 🆕 NOUVEAU - Supprimer les connexions de l'utilisateur
    const deletedConnections = await Connection.deleteMany({ userId })
    console.log(`🗑️ Deleted ${deletedConnections.deletedCount} connections`)
    
    // 5️⃣ 🆕 NOUVEAU - Supprimer les dossiers
    const deletedFolders = await Folder.deleteMany({ userId })
    console.log(`🗑️ Deleted ${deletedFolders.deletedCount} folders`)
    
    // 6️⃣ 🆕 NOUVEAU - Supprimer les démos
    const deletedDemos = await Demo.deleteMany({ userId })
    console.log(`🗑️ Deleted ${deletedDemos.deletedCount} demos`)

    // 7️⃣ Annuler l'abonnement Stripe (existant)
    if (user?.stripeCustomerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "active",
        limit: 1,
      })

      const subscription = subscriptions.data[0]
      if (subscription) {
        await (stripe.subscriptions as any).cancel(subscription.id)
        console.log(`✅ Subscription ${subscription.id} cancelled.`)
      }
    }

    // 8️⃣ Supprimer les agents et l'utilisateur (existant)
    await Agent.deleteMany({ userId })
    await User.findByIdAndDelete(userId)

    // 9️⃣ 🆕 NOUVEAU - Résumé des suppressions
    const summary = {
      user: 1,
      agents: agents.length,
      versions: agentIds.length > 0 ? await AgentVersion.countDocuments({ agentId: { $in: agentIds } }) : 0,
      knowledge: agentIds.length > 0 ? await AgentKnowledge.countDocuments({ agentId: { $in: agentIds } }) : 0,
      conversations: agentIds.length > 0 ? await Conversation.countDocuments({ agentId: { $in: agentIds } }) : 0,
      chatbotConfigs: deletedConfigs.deletedCount,
      connections: deletedConnections.deletedCount,
      folders: deletedFolders.deletedCount,
      demos: deletedDemos.deletedCount,
      supabaseFiles: filesToDelete.length
    }

    console.log(`✅ [CASCADE DELETE] Complete! Summary:`, summary)

    return NextResponse.json({ 
      message: "Account and all related data deleted successfully.",
      deleted: summary
    })
  } catch (err) {
    console.error("❌ [CASCADE DELETE] Error:", err)
    return NextResponse.json({ error: "Failed to delete account." }, { status: 500 })
  }
}