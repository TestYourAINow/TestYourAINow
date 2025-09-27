// app/api/stripe/portal/route.ts
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST() { 
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectToDatabase()
  const user = await User.findOne({ email: session.user.email })

  const customers = await stripe.customers.list({ email: session.user.email })
  const customer = customers.data[0]
  if (!customer) {
    return NextResponse.json({ error: "Customer not found on Stripe" }, { status: 404 })
  }
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: `${baseUrl}/agents`,
  })

  return NextResponse.json({ url: portalSession.url })
}
