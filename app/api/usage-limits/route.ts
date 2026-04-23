// app/api/usage-limits/route.ts
// GET: list all agents with their global limit status

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { Agent } from '@/models/Agent'
import { Connection } from '@/models/Connection'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function GET(req: NextRequest) {
  await connectToDatabase()

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
