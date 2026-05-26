// app/api/usage-limits/route.ts
// GET: list all agents with their global limit status

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { Agent } from '@/models/Agent'
import { Connection } from '@/models/Connection'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { nextPeriodEnd } from '@/lib/periodUtils'

export async function GET(req: NextRequest) {
  await connectToDatabase()

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  // Auto-reset any expired periods before returning data
  const expiredAgents = await Agent.find({
    userId: session.user.id,
    globalLimitEnabled: true,
    globalPeriodEndDate: { $lt: now },
    globalPeriodStartDate: { $ne: null },
  })

  for (const agent of expiredAgents) {
    const agentId = String(agent._id)

    const countingConns = await Connection.find({
      aiBuildId: agentId,
      countsTowardGlobalLimit: true,
    }).select('currentPeriodUsage')

    const periodTotal = countingConns.reduce((sum, c) => sum + (c.currentPeriodUsage || 0), 0)

    if (!agent.agentUsageHistory) agent.agentUsageHistory = []
    agent.agentUsageHistory.push({
      periodStart: agent.globalPeriodStartDate!,
      periodEnd: agent.globalPeriodEndDate!,
      totalMessages: periodTotal,
      periodDays: agent.globalPeriodDays ?? 30,
    })

    await Connection.updateMany(
      { aiBuildId: agentId, countsTowardGlobalLimit: true },
      { $set: { currentPeriodUsage: 0, overageCount: 0 } }
    )

    // New period starts from previous end date, same day-of-month
    agent.globalPeriodStartDate = agent.globalPeriodEndDate!
    agent.globalPeriodEndDate = nextPeriodEnd(agent.globalPeriodEndDate!, agent.globalPeriodDays ?? 30)
    await agent.save()
  }

  const agents = await Agent.find({ userId: session.user.id })
    .select('_id name globalLimitEnabled globalMessageLimit globalPeriodDays globalPeriodStartDate globalPeriodEndDate globalAllowOverage globalLimitReachedMessage globalShowLimitMessage')
    .sort({ createdAt: -1 })
    .lean()

  // For each agent, count connections and sum current period usage from connections that count
  const agentsWithUsage = await Promise.all(
    agents.map(async (agent) => {
      const agentId = String((agent as any)._id)
      const connections = await Connection.find({ aiBuildId: agentId, userId: session.user.id })
        .select('_id name integrationType isActive countsTowardGlobalLimit currentPeriodUsage')
        .lean()

      const totalUsage = connections
        .filter((c) => c.countsTowardGlobalLimit)
        .reduce((sum, c) => sum + (c.currentPeriodUsage || 0), 0)

      return {
        ...agent,
        connections,
        currentGlobalUsage: totalUsage,
      }
    })
  )

  return NextResponse.json({ agents: agentsWithUsage })
}
