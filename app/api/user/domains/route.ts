// app/api/user/domains/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { UserDomain } from '@/models/UserDomain';
import * as dns from 'dns';
import { promisify } from 'util';

const resolveCname = promisify(dns.resolveCname);

// GET - Lister tous les domaines de l'utilisateur
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();

  const domains = await UserDomain.find({ userId: session.user.id })
    .sort({ createdAt: -1 });

  return NextResponse.json({ domains });
}

// POST - Ajouter un nouveau domaine
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();

  try {
    const { domain } = await req.json();

    // Validation du domaine
    if (!domain || !isValidDomain(domain)) {
      return NextResponse.json({ 
        error: 'Invalid domain format' 
      }, { status: 400 });
    }

    // Vérifier si le domaine existe déjà pour cet utilisateur
    const existingDomain = await UserDomain.findOne({ 
      userId: session.user.id,
      domain: domain 
    });

    if (existingDomain) {
      return NextResponse.json({ 
        error: 'Domain already exists in your list' 
      }, { status: 409 });
    }

    // Vérifier la configuration DNS
    let status = 'pending';
    let errorMessage = null;
    
    try {
      const records = await resolveCname(domain);
      if (records.includes('proxy.testyourainow.com')) {
        status = 'verified';
      } else {
        status = 'failed';
        errorMessage = 'CNAME does not point to proxy.testyourainow.com';
      }
    } catch (error) {
      status = 'failed';
      errorMessage = 'CNAME record not found';
    }

    // Créer le domaine
    const newDomain = await UserDomain.create({
      userId: session.user.id,
      domain: domain,
      status: status,
      verifiedAt: status === 'verified' ? new Date() : null,
      lastChecked: new Date(),
      errorMessage: errorMessage
    });

    return NextResponse.json({ 
      success: true,
      domain: newDomain 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error adding domain:', error);
    
    // Gérer l'erreur de domaine dupliqué
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'Domain already exists' 
      }, { status: 409 });
    }

    return NextResponse.json({ 
      error: 'Failed to add domain' 
    }, { status: 500 });
  }
}

// Helper function pour valider le format du domaine
function isValidDomain(domain: string): boolean {
  const regex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
  return regex.test(domain) && domain.length <= 253;
}