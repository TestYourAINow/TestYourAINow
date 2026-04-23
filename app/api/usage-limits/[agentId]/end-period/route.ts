// app/api/usage-limits/[agentId]/end-period/route.ts
// POST: end the current period early, save to history, reset counters, start new period

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { Agent } from '@/models/Agent'
import { Connection } from '@/models/Connection'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function POST(req: NextRequest, context: { params: Promise<{ agentId: string }> }) {
  await connectToDatabase()
  const { agentId } = await context.params

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const agent = await Agent.findOne({ _id: agentId, userId: session.user.id })
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  if (!agent.globalPeriodStartDate) {
    return NextResponse.json({ error: 'No active period' }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const note: string | undefined = body.note?.trim() || undefined

  const now = new Date()

  // Sum current usage across counting connections
  const countingConns = await Connection.find({
    aiBuildId: agentId,
    countsTowardGlobalLimit: true,
  }).select('currentPeriodUsage')
  const totalMessages = countingConns.reduce((sum, c) => sum + (c.currentPeriodUsage || 0), 0)

  // Save to history
  if (!agent.agentUsageHistory) agent.agentUsageHistory = []
  agent.agentUsageHistory.push({
    periodStart: agent.globalPeriodStartDate,
    periodEnd: now,
    totalMessages,
    periodDays: agent.globalPeriodDays ?? 30,
    ...(note ? { note } : {}),
  })

  // Reset all counting connections
  await Connection.updateMany(
    { aiBuildId: agentId, countsTowardGlobalLimit: true },
    { $set: { currentPeriodUsage: 0 } }
  )

  // Start new period
  const periodMs = (agent.globalPeriodDays ?? 30) * 24 * 60 * 60 * 1000
  agent.globalPeriodStartDate = now
  agent.globalPeriodEndDate = new Date(now.getTime() + periodMs)
  await agent.save()

  return NextResponse.json({ success: true })
}
