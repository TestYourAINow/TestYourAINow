import { NextResponse } from "next/server"
import Stripe from "stripe"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any,
})

export async function POST(req: Request) {
  const { sessionId } = await req.json()

  try {
    await connectToDatabase()

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    const customerId = session.customer as string
    const customer = await stripe.customers.retrieve(customerId)

    const email = session.customer_email || (customer as Stripe.Customer).email

    if (!email) throw new Error("Email introuvable")

    await User.findOneAndUpdate(
      { email },
      { isSubscribed: true }
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Erreur de confirmation Stripe:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
