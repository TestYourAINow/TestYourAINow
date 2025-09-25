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

export async function POST(request: Request) {
  console.log("🔍 Début checkout API");
  
  const session = await getServerSession(authOptions);
  console.log("📧 Session email:", session?.user?.email);

  if (!session || !session.user?.email) {
    console.log("❌ Pas de session ou email");
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    await connectToDatabase();

    // Récupère l'email depuis le body OU depuis la session
    const body = await request.json();
    const email = body.email || session.user.email;
    
    console.log("📧 Email utilisé:", email);

    let user = await User.findOne({ email });

    if (!user) {
      console.log("❌ Utilisateur introuvable avec email:", email);
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    console.log("✅ Utilisateur trouvé:", user._id);

    // ➕ Crée un client Stripe s'il n'existe pas déjà
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      console.log("🔄 Création d'un nouveau client Stripe");
      const customer = await stripe.customers.create({
        email,
        metadata: { userId: user._id.toString() },
      });

      stripeCustomerId = customer.id;
      user.stripeCustomerId = stripeCustomerId;
      await user.save();
      console.log("✅ Client Stripe créé:", stripeCustomerId);
    } else {
      console.log("✅ Client Stripe existant:", stripeCustomerId);
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    console.log("🔄 Création de la session checkout");
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

    console.log("✅ Session checkout créée:", checkoutSession.id);
    return NextResponse.json({ url: checkoutSession.url });
    
  } catch (error: any) {
    console.error("❌ Erreur Stripe:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}