import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // 🎯 NOUVEAU - GESTION IFRAME POUR WIDGETS (AVANT TOUT LE RESTE)
  if (pathname.startsWith('/widget/')) {
    console.log(`🎪 Widget iframe request: ${pathname}`);
    
    const response = NextResponse.next();
    
    // Supprimer les headers restrictifs Next.js
    response.headers.delete('X-Frame-Options');
    
    // Ajouter headers permissifs pour iframe
    response.headers.set('X-Frame-Options', 'ALLOWALL');
    response.headers.set('Content-Security-Policy', 'frame-ancestors *;');
    response.headers.set('Access-Control-Allow-Origin', '*');
    
    return response;
  }

  // ✅ Liste des pages publiques (TON CODE EXISTANT)
  const publicPaths = ["/", "/login", "/signup", "/pricing", "/api"];
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  if (isPublic) {
    return NextResponse.next();
  }

  // ❌ Redirige vers login si non connecté (TON CODE EXISTANT)
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 🔓 Bypass permanent pour ton compte (TON CODE EXISTANT)
  const isSango = token.email === "sango_ks@hotmail.com";

  // 🔒 Redirige vers /subscribe si non abonné (TON CODE EXISTANT)
  if (!token.isSubscribed && !isSango && pathname !== "/subscribe") {
    return NextResponse.redirect(new URL("/subscribe", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};