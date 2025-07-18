import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // ✅ Liste des pages publiques
  const publicPaths = ["/", "/login", "/signup", "/pricing", "/api"];
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  if (isPublic) {
    return NextResponse.next();
  }

  // ❌ Redirige vers login si non connecté
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 🔓 Bypass permanent pour ton compte
  const isSango = token.email === "sango_ks@hotmail.com";

  // 🔒 Redirige vers /subscribe si non abonné (sauf toi)
  if (!token.isSubscribed && !isSango && pathname !== "/subscribe") {
    return NextResponse.redirect(new URL("/subscribe", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
