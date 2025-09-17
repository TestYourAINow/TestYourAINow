// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { headers } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-04-30.basil',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    console.error('❌ Signature Stripe manquante')
    return new Response('Signature manquante', { status: 400 })
  }

  let event: Stripe.Event

  try {
    // Vérification de la signature Stripe
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
  } catch (err: any) {
    console.error('❌ Erreur de signature webhook:', err.message)
    return new Response('Signature invalide', { status: 400 })
  }

  try {
    await connectToDatabase()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Récupérer l'email du client
        let email = session.customer_email

        // Si pas d'email direct, récupérer depuis le customer
        if (!email && session.customer) {
          const customer = await stripe.customers.retrieve(session.customer as string)
          email = (customer as Stripe.Customer).email
        }

        if (!email) {
          console.error('❌ Email introuvable pour la session:', session.id)
          return new Response('Email non trouvé', { status: 400 })
        }

        // Mise à jour de l'utilisateur
        const updatedUser = await User.findOneAndUpdate(
          { email },
          { 
            isSubscribed: true,
            stripeCustomerId: session.customer,
            subscriptionDate: new Date()
          },
          { new: true }
        )

        if (updatedUser) {
          console.log('✅ Utilisateur mis à jour:', email)
        } else {
          console.log('⚠️ Aucun utilisateur trouvé avec cet email:', email)
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('❌ Abonnement annulé:', subscription.id)

        // Récupérer le customer pour avoir l'email
        const customer = await stripe.customers.retrieve(subscription.customer as string)
        const email = (customer as Stripe.Customer).email

        if (email) {
          await User.findOneAndUpdate(
            { email },
            { isSubscribed: false }
          )
          console.log('✅ Abonnement désactivé pour:', email)
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('💸 Paiement échoué:', invoice.id)

        // Tu peux ajouter de la logique ici si besoin
        // Par exemple, envoyer un email de rappel

        break
      }

      default:
        console.log(`🔔 Événement non géré: ${event.type}`)
    }

    return new Response('OK', { status: 200 })
  } catch (error: any) {
    console.error('❌ Erreur webhook:', error)
    return new Response('Erreur serveur', { status: 500 })
  }
}