import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function isValidPassword(password: string) {
  return (
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password) &&
    password.length >= 8
  );
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const { email, password, username } = await req.json();

    if (!email || !password || !username) {
      return NextResponse.json(
        { field: "form", error: "Missing fields" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { field: "email", error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { field: "username", error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { field: "password", error: "Password does not meet security requirements." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { field: "email", error: "Email already registered" },
        { status: 409 }
      );
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return NextResponse.json(
        { field: "username", error: "Username already taken" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Crée l’utilisateur
    const newUser = await User.create({
      email,
      username,
      password: hashedPassword,
      isSubscribed: false,
      createdAt: new Date(),
    });

    // Crée un client Stripe
    const customer = await stripe.customers.create({
      email: newUser.email,
    });

    // Ajoute stripeCustomerId au user
    newUser.stripeCustomerId = customer.id;
    await newUser.save();

    return NextResponse.json(
      { message: "User created", userId: newUser._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { field: "server", error: "Internal server error" },
      { status: 500 }
    );
  }
}
