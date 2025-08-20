/// <reference types="next-auth" />
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      isSubscribed: boolean;
      stripeCustomerId?: string;
      openaiApiKey: string;
      profileImage: string | null;
      // 🆕 NOUVEAUX CHAMPS GOOGLE
      googleAccessToken?: string;
      googleRefreshToken?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    isSubscribed: boolean;
    stripeCustomerId?: string;
    openaiApiKey?: string;
    profileImage: string | null;
    // 🆕 NOUVEAUX CHAMPS GOOGLE
    googleAccessToken?: string;
    googleRefreshToken?: string;
  }

  interface JWT {
    id: string;
    email: string;
    name?: string;
    isSubscribed: boolean;
    stripeCustomerId?: string;
    openaiApiKey?: string;
    profileImage: string | null;
    // 🆕 NOUVEAUX CHAMPS GOOGLE
    googleAccessToken?: string;
    googleRefreshToken?: string;
  }
}