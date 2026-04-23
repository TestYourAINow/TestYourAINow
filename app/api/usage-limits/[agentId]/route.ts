// app/api/usage-limits/[agentId]/route.ts
// GET: agent limit details + connections
// PUT: update agent global limit settings
// DELETE: remove a history entry by index

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { Agent } from '@/models/Agent'
import { Connection } from '@/models/Connection'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function GET(_req: NextRequest, context: { params: Promise<{ agentId: string }> }) {
  await connectToDatabase()
  const { agentId } = await context.params

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const agent = await Agent.findOne({ _id: agentId, userId: session.user.id })
    .select('_id name globalLimitEnabled globalMessageLimit globalPeriodDays globalPeriodStartDate globalPeriodEndDate globalAllowOverage globalLimitReachedMessage globalShowLimitMessage agentUsageHistory')
    .lean()

  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  const connections = await Connection.find({ aiBuildId: agentId, userId: session.user.id })
    .select('_id name integrationType isActive countsTowardGlobalLimit currentPeriodUsage usageHistory periodStartDate periodEndDate')
    .lean()

  const totalUsage = connections
    .filter((c) => c.countsTowardGlobalLimit)
    .reduce((sum, c) => sum + (c.currentPeriodUsage || 0), 0)

  return NextResponse.json({ agent, connections, currentGlobalUsage: totalUsage })
}

export async function PUT(req: NextRequest, context: { params: Promise<{ agentId: string }> }) {
  await connectToDatabase()
  const { agentId } = await context.params

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const {
    globalLimitEnabled,
    globalMessageLimit,
    globalPeriodDays,
    globalAllowOverage,
    globalLimitReachedMessage,
    globalShowLimitMessage,
    resetPeriod,
  } = body

  const agent = await Agent.findOne({ _id: agentId, userId: session.user.id })
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  const now = new Date()
  let periodStartDate = agent.globalPeriodStartDate
  let periodEndDate = agent.globalPeriodEndDate
  const period = globalPeriodDays ?? agent.globalPeriodDays ?? 30

  if (globalLimitEnabled && !agent.globalPeriodStartDate) {
    // First time enabling: start period now
    periodStartDate = now
    periodEndDate = new Date(now.getTime() + period * 24 * 60 * 60 * 1000)
  } else if (agent.globalPeriodStartDate && globalPeriodDays && globalPeriodDays !== agent.globalPeriodDays) {
    // Period duration changed: recalculate endDate from original startDate, keep usage intact
    periodEndDate = new Date(agent.globalPeriodStartDate.getTime() + period * 24 * 60 * 60 * 1000)
  }

  agent.globalLimitEnabled = globalLimitEnabled ?? agent.globalLimitEnabled
  agent.globalMessageLimit = globalMessageLimit ?? agent.globalMessageLimit
  agent.globalPeriodDays = period
  agent.globalPeriodStartDate = periodStartDate ?? undefined
  agent.globalPeriodEndDate = periodEndDate ?? undefined
  agent.globalAllowOverage = globalAllowOverage ?? agent.globalAllowOverage
  agent.globalLimitReachedMessage = globalLimitReachedMessage ?? agent.globalLimitReachedMessage
  agent.globalShowLimitMessage = globalShowLimitMessage ?? agent.globalShowLimitMessage

  await agent.save()

  return NextResponse.json({ success: true, agent })
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ agentId: string }> }) {
  await connectToDatabase()
  const { agentId } = await context.params

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { historyIndex } = await req.json()

  const agent = await Agent.findOne({ _id: agentId, userId: session.user.id })
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  if (!agent.agentUsageHistory || historyIndex < 0 || historyIndex >= agent.agentUsageHistory.length) {
    return NextResponse.json({ error: 'Invalid history index' }, { status: 400 })
  }

  agent.agentUsageHistory = agent.agentUsageHistory.filter((_: unknown, i: number) => i !== historyIndex) as typeof agent.agentUsageHistory
  await agent.save()

  return NextResponse.json({ success: true })
}
