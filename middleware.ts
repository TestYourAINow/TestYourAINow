// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Public path list
  const publicPaths = ["/", "/login", "/signup", "/pricing", "/api"];
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  if (isPublic) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Admin support route protection
  if (pathname.startsWith('/admin/support')) {
    const adminEmails = ['team@testyourainow.com', 'sango_ks@hotmail.com'];
    const userEmail = token.email;
    
    if (!userEmail || !adminEmails.includes(userEmail)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Permanent bypass for your account
  const isSango = token.email === "sango_ks@hotmail.com";

  // Redirect to /subscribe if not subscribed (except you)
  if (!token.isSubscribed && !isSango && pathname !== "/subscribe") {
    return NextResponse.redirect(new URL("/subscribe", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};