// app\api\stripe\checkout\route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-04-30.basil',
})

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const email = session.user.email;
    let user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // ➕ Crée un client Stripe s'il n'existe pas déjà
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId: user._id.toString() },
      });

      stripeCustomerId = customer.id;
      user.stripeCustomerId = stripeCustomerId;
      await user.save();
    }
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1RjllgEInlvHc9P2zN2NrK5Y",
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      billing_address_collection: 'required',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      customer: stripeCustomerId,
      customer_update: {
        address: "auto",
        shipping: "auto",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Erreur Stripe:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
