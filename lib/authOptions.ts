// lib/authOptions.ts
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        await connectToDatabase();

        const user = await User.findOne({
          $or: [
            { email: credentials.identifier },
            { username: credentials.identifier },
          ],
        });

        if (!user) throw new Error("No user found");

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.username,
          isSubscribed: user.isSubscribed,
          stripeCustomerId: user.stripeCustomerId,
          profileImage: null,
        };
      },
    }),
    // 🆕 NOUVEAU PROVIDER GOOGLE
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.isSubscribed = user.isSubscribed;
        token.stripeCustomerId = user.stripeCustomerId;
        token.openaiApiKey = user.openaiApiKey;
      }
      
      // 🆕 STOCKER LES TOKENS GOOGLE
      if (account?.provider === "google") {
        token.googleAccessToken = account.access_token;
        token.googleRefreshToken = account.refresh_token;
      }
      
      return token;
    },
    async session({ session, token }) {
      await connectToDatabase();
      const dbUser = await User.findOne({ email: token.email });

      session.user = {
        id: token.id as string,
        email: token.email as string,
        name: dbUser?.username || token.name as string,
        isSubscribed: dbUser?.isSubscribed ?? false,
        stripeCustomerId: dbUser?.stripeCustomerId ?? "",
        openaiApiKey: dbUser?.openaiApiKey ?? "",
        profileImage: dbUser?.profileImage ?? null,
        // 🆕 AJOUTER LES TOKENS GOOGLE
        googleAccessToken: token.googleAccessToken as string,
        googleRefreshToken: token.googleRefreshToken as string,
      };

      return session;
    },
    // 🆕 CALLBACK SIGNIN POUR CRÉER/LIER LES COMPTES
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        await connectToDatabase();
        
        // Chercher si l'utilisateur existe déjà
        let existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          // Créer un nouvel utilisateur
          existingUser = await User.create({
            email: user.email,
            username: user.name?.replace(/\s+/g, '').toLowerCase() || 'user',
            password: await bcrypt.hash(Math.random().toString(36), 10), // Mot de passe aléatoire
            isSubscribed: false,
          });
        }
        
        user.id = existingUser._id.toString();
      }
      
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};