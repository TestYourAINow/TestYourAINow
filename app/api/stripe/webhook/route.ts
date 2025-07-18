import { NextRequest } from "next/server";
import Stripe from "stripe";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const rawBody = await req.text(); // Edge-friendly pour Stripe
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig!, endpointSecret);
  } catch (err) {
    console.error("❌ Webhook signature invalid:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_email;

    try {
      await connectToDatabase();
      const user = await User.findOne({ email });

      if (user) {
        user.isSubscribed = true;
        await user.save();
        console.log(`✅ Subscription activated for ${email}`);
      } else {
        console.warn(`⚠️ No user found for email: ${email}`);
      }
    } catch (err) {
      console.error("❌ Error updating subscription:", err);
    }
  }

  return new Response("OK", { status: 200 });
}
