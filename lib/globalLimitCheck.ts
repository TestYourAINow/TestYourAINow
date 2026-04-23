// lib/globalLimitCheck.ts
// Global usage limit check for all AI response routes

import { connectToDatabase } from '@/lib/db'
import { Agent } from '@/models/Agent'
import { Connection } from '@/models/Connection'

type LimitCheckResult =
  | { blocked: false }
  | { blocked: true; message: string | null; showMessage: boolean }

/**
 * Check whether the agent's global limit would be exceeded by this message.
 * Call this BEFORE generating the AI response.
 *
 * Returns { blocked: false } if the request should proceed.
 * Returns { blocked: true, message, showMessage } if it should be blocked.
 */
export async function checkGlobalLimit(
  agentId: string,
  connectionId: string
): Promise<LimitCheckResult> {
  try {
    await connectToDatabase()

    const agent = await Agent.findById(agentId)
    if (!agent?.globalLimitEnabled || !agent.globalMessageLimit) {
      return { blocked: false }
    }

    const connection = await Connection.findById(connectionId)
    if (!connection?.countsTowardGlobalLimit) {
      return { blocked: false }
    }

    // Handle period reset
    const now = new Date()

    if (!agent.globalPeriodStartDate) {
      // First time: initialize period
      const periodMs = (agent.globalPeriodDays ?? 30) * 24 * 60 * 60 * 1000
      agent.globalPeriodStartDate = now
      agent.globalPeriodEndDate = new Date(now.getTime() + periodMs)
      await agent.save()
    } else if (agent.globalPeriodEndDate && now >= agent.globalPeriodEndDate) {
      // Save period to history before resetting
      const histConns = await Connection.find({
        aiBuildId: agentId,
        countsTowardGlobalLimit: true,
      }).select('currentPeriodUsage')
      const periodTotal = histConns.reduce((sum, c) => sum + (c.currentPeriodUsage || 0), 0)
      if (!agent.agentUsageHistory) agent.agentUsageHistory = []
      agent.agentUsageHistory.push({
        periodStart: agent.globalPeriodStartDate!,
        periodEnd: agent.globalPeriodEndDate,
        totalMessages: periodTotal,
        periodDays: agent.globalPeriodDays ?? 30,
      })

      // Period expired: reset all counting connections and start new period
      const periodMs = (agent.globalPeriodDays ?? 30) * 24 * 60 * 60 * 1000
      await Connection.updateMany(
        { aiBuildId: agentId, countsTowardGlobalLimit: true },
        { $set: { currentPeriodUsage: 0, overageCount: 0 } }
      )
      agent.globalPeriodStartDate = now
      agent.globalPeriodEndDate = new Date(now.getTime() + periodMs)
      await agent.save()
    }

    // Sum usage across all counting connections
    const countingConnections = await Connection.find({
      aiBuildId: agentId,
      countsTowardGlobalLimit: true,
    }).select('currentPeriodUsage')

    const totalUsage = countingConnections.reduce(
      (sum, c) => sum + (c.currentPeriodUsage || 0),
      0
    )

    const wouldExceed = totalUsage + 1 > agent.globalMessageLimit

    if (wouldExceed && !agent.globalAllowOverage) {
      return {
        blocked: true,
        message: agent.globalShowLimitMessage
          ? (agent.globalLimitReachedMessage ?? null)
          : null,
        showMessage: agent.globalShowLimitMessage ?? true,
      }
    }

    return { blocked: false }
  } catch (err) {
    // On error, do not block — fail open to avoid breaking the chat
    console.error('[GLOBAL LIMIT] Check error (failing open):', err)
    return { blocked: false }
  }
}

/**
 * Increment the currentPeriodUsage on a connection after a successful AI response.
 * Only increments if the connection countsTowardGlobalLimit and agent globalLimitEnabled.
 */
export async function incrementGlobalUsage(
  agentId: string,
  connectionId: string
): Promise<void> {
  try {
    await connectToDatabase()

    const agent = await Agent.findById(agentId).select('globalLimitEnabled globalAllowOverage globalMessageLimit')
    if (!agent?.globalLimitEnabled) return

    const connection = await Connection.findById(connectionId).select('countsTowardGlobalLimit currentPeriodUsage')
    if (!connection?.countsTowardGlobalLimit) return

    await Connection.findByIdAndUpdate(connectionId, { $inc: { currentPeriodUsage: 1 } })
  } catch (err) {
    console.error('[GLOBAL LIMIT] Increment error:', err)
  }
}
