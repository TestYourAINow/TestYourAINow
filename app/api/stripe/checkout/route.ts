// app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-04-30.basil',
})

export async function POST(request: Request) {
  console.log("Initializing checkout session");

  const session = await getServerSession(authOptions);
  console.log("Session email:", session?.user?.email);

  if (!session || !session.user?.email) {
    console.log("Unauthorized access - missing session or email");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();

    // Extract email from request body or session
    const body = await request.json();
    const email = body.email || session.user.email;

    console.log("Processing checkout for email:", email);

    let user = await User.findOne({ email });

    if (!user) {
      console.log("User not found for email:", email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("User found:", user._id);

    // Create Stripe customer if one doesn't exist
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      console.log("Creating new Stripe customer");
      const customer = await stripe.customers.create({
        email,
        metadata: { userId: user._id.toString() },
      });

      stripeCustomerId = customer.id;
      user.stripeCustomerId = stripeCustomerId;
      await user.save();
      console.log("Stripe customer created:", stripeCustomerId);
    } else {
      console.log("Using existing Stripe customer:", stripeCustomerId);
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    console.log("Creating checkout session");
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
      cancel_url: `${baseUrl}/subscribe`,
      customer: stripeCustomerId,
      customer_update: {
        address: "auto",
        shipping: "auto",
      },
    });

    console.log("Checkout session created:", checkoutSession.id);
    return NextResponse.json({ url: checkoutSession.url });

  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}