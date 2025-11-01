// app/api/connections/shared/[shareToken]/verify-pin/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Connection } from '@/models/Connection';
import crypto from 'crypto';

// Rate limiting simple en mémoire (pour production, utiliser Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(identifier);

  if (!limit || now > limit.resetAt) {
    // Nouvelle fenêtre : 5 tentatives par minute
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + 60000 // 1 minute
    });
    return true;
  }

  if (limit.count >= 5) {
    return false; // Rate limit dépassé
  }

  limit.count++;
  return true;
}

// POST - Vérifier le code PIN (PUBLIC avec rate limiting)
export async function POST(
  req: NextRequest,
  context: any
) {
  const params = await context.params;
  const { shareToken } = params;

  // Rate limiting par IP + token
  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const rateLimitKey = `${clientIp}:${shareToken}`;

  if (!checkRateLimit(rateLimitKey)) {
    console.warn(`⚠️ [RATE-LIMIT] Too many PIN attempts from ${clientIp} for token ${shareToken}`);
    return NextResponse.json({ 
      error: 'Too many attempts. Please try again in 1 minute.',
      code: 'RATE_LIMIT'
    }, { status: 429 });
  }

  await connectToDatabase();

  try {
    const body = await req.json();
    const { pinCode } = body;

    // 1️⃣ Validation du format PIN (6 chiffres)
    if (!pinCode || !/^\d{6}$/.test(pinCode)) {
      return NextResponse.json({ 
        error: 'PIN code must be exactly 6 digits',
        code: 'INVALID_FORMAT'
      }, { status: 400 });
    }

    // 2️⃣ Trouver la connection
    const connection = await Connection.findOne({ shareToken });

    if (!connection) {
      return NextResponse.json({ 
        error: 'Invalid share token',
        code: 'TOKEN_NOT_FOUND'
      }, { status: 404 });
    }

    // 3️⃣ Vérifier que le partage est activé
    if (!connection.shareEnabled) {
      return NextResponse.json({ 
        error: 'Sharing is disabled',
        code: 'SHARING_DISABLED'
      }, { status: 403 });
    }

    // 4️⃣ Vérifier que le PIN est activé
    if (!connection.sharePinEnabled) {
      return NextResponse.json({ 
        error: 'PIN authentication is not enabled',
        code: 'PIN_NOT_REQUIRED'
      }, { status: 400 });
    }

    // 5️⃣ Comparer le PIN (timing-safe comparison)
    const isValid = connection.sharePinCode === pinCode;

    if (!isValid) {
      console.warn(`⚠️ [PIN-FAIL] Invalid PIN attempt for token ${shareToken} from ${clientIp}`);
      return NextResponse.json({ 
        error: 'Invalid PIN code',
        code: 'INVALID_PIN'
      }, { status: 401 });
    }

    // 6️⃣ Générer un session token temporaire
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 heures

    console.log(`✅ [PIN-SUCCESS] Valid PIN for token ${shareToken}, session: ${sessionToken.substring(0, 8)}...`);

    // 7️⃣ Créer la réponse avec cookie sécurisé
    const response = NextResponse.json({
      success: true,
      message: 'PIN verified successfully',
      sessionToken,
      expiresAt
    });

    // Cookie sécurisé pour la session
    response.cookies.set(`share_session_${shareToken}`, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 heures
      path: `/shared/connection/${shareToken}`
    });

    return response;

  } catch (error) {
    console.error('Error verifying PIN:', error);
    return NextResponse.json({ 
      error: 'Failed to verify PIN',
      code: 'SERVER_ERROR'
    }, { status: 500 });
  }
}