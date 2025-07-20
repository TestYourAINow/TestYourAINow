// lib/authOptions.ts
import CredentialsProvider from "next-auth/providers/credentials";
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
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.isSubscribed = user.isSubscribed;
        token.stripeCustomerId = user.stripeCustomerId;
        token.openaiApiKey = user.openaiApiKey;
      }
      return token;
    },
    async session({ session, token }) {
      await connectToDatabase();
      const dbUser = await User.findOne({ email: token.email });

      session.user = {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        isSubscribed: dbUser?.isSubscribed ?? false,
        stripeCustomerId: dbUser?.stripeCustomerId ?? "",
        openaiApiKey: dbUser?.openaiApiKey ?? "",
        profileImage: dbUser?.profileImage ?? null,
      };

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};