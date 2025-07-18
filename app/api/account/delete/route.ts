import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { Agent } from "@/models/Agent"
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

    const filesToDelete: { bucket: string; path: string }[] = []

    for (const agent of agents) {
      if (Array.isArray(agent.integrations)) {
        for (const integration of agent.integrations) {
          if (Array.isArray(integration.files)) {
            for (const file of integration.files) {
              if (file.isCloud && file.path) {
                filesToDelete.push({ bucket: "your-bucket-name", path: file.path })
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

    // 🔁 Cancel Stripe subscription
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

    await Agent.deleteMany({ userId })
    await User.findByIdAndDelete(userId)

    return NextResponse.json({ message: "Account and all related data deleted successfully." })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to delete account." }, { status: 500 })
  }
}
