// app/api/account/update/route.ts - VERSION SÉCURISÉE
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any,
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name, email, password, currentPassword } = await req.json()

  try {
    await connectToDatabase()

    const currentUser = await User.findById(session.user.id)
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 🔐 NOUVELLE SÉCURITÉ : Vérifier mot de passe actuel si on veut changer le password
    if (password) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to change password" },
          { status: 400 }
        )
      }

      const isValidCurrentPassword = await bcrypt.compare(currentPassword, currentUser.password)
      if (!isValidCurrentPassword) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        )
      }
    }

    // Vérifie si email est déjà utilisé par un autre
    if (email && email !== currentUser.email) {
      const normalizedEmail = email.toLowerCase().trim();
      const existingEmail = await User.findOne({ email: normalizedEmail })
      if (existingEmail) {
        return NextResponse.json(
          { error: "Email is already in use", field: "email" },
          { status: 400 }
        )
      }
    }

    // Vérifie si username est déjà utilisé par un autre
    if (name && name !== currentUser.username) {
      const existingUsername = await User.findOne({ username: name })
      if (existingUsername) {
        return NextResponse.json(
          { error: "Username is already taken", field: "username" },
          { status: 400 }
        )
      }
    }

    // 🏗️ Construire l'objet de mise à jour dynamiquement
    const updateData: any = {}

    if (name) updateData.username = name
    if (email) updateData.email = email.toLowerCase().trim()
    if (password) {
      const hashed = await bcrypt.hash(password, 10)
      updateData.password = hashed
    }

    // ⚡ Mise à jour seulement si il y a des changements
    if (Object.keys(updateData).length > 0) {
      await User.findByIdAndUpdate(session.user.id, updateData)
    }

    // 🔁 Si l'utilisateur a un compte Stripe, on met à jour son email/nom aussi
    if (currentUser.stripeCustomerId && (email || name)) {
      await stripe.customers.update(currentUser.stripeCustomerId, {
        email: email ? email.toLowerCase().trim() : undefined,
        name: name || undefined,
      })
    }

    return NextResponse.json({ message: "Account updated successfully." })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}