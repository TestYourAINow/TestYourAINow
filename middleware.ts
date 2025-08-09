import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const KV_NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID || 'dc4e744e9b4b4164bdcff1a618c39622';

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || '';
  const { pathname } = req.nextUrl;

  console.log(`🔍 Middleware - Host: ${hostname}, Path: ${pathname}`);

  // ✅ 1. GESTION DES DOMAINES PERSONNALISÉS EN PREMIER
  if (!hostname.includes('testyourainow.com') && 
      !hostname.includes('localhost') && 
      !hostname.includes('vercel.app')) {
    
    console.log(`🌍 Custom domain detected: ${hostname}`);

    // Skip les assets et API routes pour les domaines custom
    if (pathname.startsWith('/_next') || 
        pathname.startsWith('/api') || 
        pathname.startsWith('/static') ||
        pathname.includes('.')) {
      console.log('✅ Asset/API route on custom domain, skipping');
      return NextResponse.next();
    }

    try {
      // Récupérer le mapping depuis Cloudflare KV
      const mapping = await getDomainMapping(hostname);
      
      if (!mapping) {
        console.log(`❌ No mapping found for ${hostname}`);
        return new NextResponse('Domain not configured', { status: 404 });
      }

      console.log(`✅ Found mapping for ${hostname} → Demo ID: ${mapping.demoId}`);

      // Rediriger vers la page shared
      const url = req.nextUrl.clone();
      const targetPath = `/shared/${mapping.demoId}${pathname === '/' ? '' : pathname}${url.search}`;
      
      console.log(`🔄 Rewriting ${hostname}${pathname} → ${targetPath}`);
      
      url.pathname = targetPath;
      return NextResponse.rewrite(url);

    } catch (error) {
      console.error(`❌ Middleware error for custom domain ${hostname}:`, error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  }

  // ✅ 2. LOGIQUE AUTH EXISTANTE (pour le domaine principal seulement)
  console.log(`🔒 Running auth middleware for main domain: ${hostname}`);

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // ✅ Liste des pages publiques (inclut /shared pour les démos)
  const publicPaths = ["/", "/login", "/signup", "/pricing", "/api", "/shared"];
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  if (isPublic) {
    console.log(`✅ Public path: ${pathname}`);
    return NextResponse.next();
  }

  // ❌ Redirige vers login si non connecté
  if (!token) {
    console.log(`❌ No token, redirecting to login`);
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 🔓 Bypass permanent pour ton compte
  const isSango = token.email === "sango_ks@hotmail.com";

  // 🔒 Redirige vers /subscribe si non abonné (sauf toi)
  if (!token.isSubscribed && !isSango && pathname !== "/subscribe") {
    console.log(`❌ Not subscribed, redirecting to subscribe`);
    return NextResponse.redirect(new URL("/subscribe", req.url));
  }

  console.log(`✅ Auth passed for ${token.email}`);
  return NextResponse.next();
}

// Fonction pour récupérer le mapping depuis Cloudflare KV
async function getDomainMapping(domain: string) {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    console.error('❌ Missing Cloudflare credentials in middleware');
    return null;
  }

  try {
    console.log(`📡 Fetching KV mapping for: ${domain}`);
    
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/${domain}`,
      {
        headers: {
          'Authorization': `Bearer ${CF_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      console.log(`❌ KV fetch failed for ${domain}: ${response.status}`);
      return null;
    }

    const mapping = await response.json();
    console.log(`✅ KV mapping retrieved:`, mapping);
    
    return mapping;
  } catch (error) {
    console.error('❌ Error fetching domain mapping:', error);
    return null;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};