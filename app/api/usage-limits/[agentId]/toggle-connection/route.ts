// app/api/usage-limits/[agentId]/toggle-connection/route.ts
// PATCH: toggle countsTowardGlobalLimit for a connection

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { Connection } from '@/models/Connection'
import { Agent } from '@/models/Agent'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function PATCH(req: NextRequest, context: { params: Promise<{ agentId: string }> }) {
  await connectToDatabase()
  const { agentId } = await context.params

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { connectionId, countsTowardGlobalLimit } = await req.json()

  const agent = await Agent.findOne({ _id: agentId, userId: session.user.id })
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  const connection = await Connection.findOne({
    _id: connectionId,
    aiBuildId: agentId,
    userId: session.user.id,
  })
  if (!connection) {
    return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
  }

  connection.countsTowardGlobalLimit = countsTowardGlobalLimit
  await connection.save()

  return NextResponse.json({ success: true, countsTowardGlobalLimit: connection.countsTowardGlobalLimit })
}
