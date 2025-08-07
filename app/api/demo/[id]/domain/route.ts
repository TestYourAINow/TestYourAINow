// app/api/demo/[id]/domain/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { Demo } from '@/models/Demo';
import * as dns from 'dns';
import { promisify } from 'util';

const resolveCname = promisify(dns.resolveCname);

// Variables Cloudflare (à ajouter dans tes variables d'environnement)
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const KV_NAMESPACE_ID = 'dc4e744e9b4b4164bdcff1a618c39622'; // Ton ID KV

// PUT - Ajouter/Mettre à jour un domaine personnalisé
export async function PUT(req: NextRequest, context: any) {
  const params = await context.params;
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { customDomain } = await req.json();
    const demoId = params.id;

    // Validation du domaine
    if (!customDomain || !isValidDomain(customDomain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
    }

    // Vérifier que la demo existe et appartient à l'utilisateur
    const demo = await Demo.findOne({ 
      _id: demoId, 
      userId: session.user.id 
    });
    
    if (!demo) {
      return NextResponse.json({ error: 'Demo not found' }, { status: 404 });
    }

    // Vérifier que le domaine n'est pas déjà utilisé
    const existingDemo = await Demo.findOne({ 
      customDomain: customDomain,
      _id: { $ne: demoId }
    });
    
    if (existingDemo) {
      return NextResponse.json({ 
        error: 'Domain already in use by another demo' 
      }, { status: 409 });
    }

    // Vérifier la configuration DNS
    let dnsValid = false;
    try {
      const records = await resolveCname(customDomain);
      dnsValid = records.includes('proxy.testyourainow.com');
      console.log(`🔍 DNS check for ${customDomain}:`, records);
    } catch (error) {
      console.log(`❌ DNS resolution failed for ${customDomain}:`, error);
      return NextResponse.json({
        error: 'CNAME record not found. Please add: CNAME ' + customDomain.split('.')[0] + ' → proxy.testyourainow.com',
        dnsConfigured: false
      }, { status: 400 });
    }

    if (!dnsValid) {
      return NextResponse.json({
        error: 'CNAME record does not point to proxy.testyourainow.com',
        dnsConfigured: false
      }, { status: 400 });
    }

    // Ajouter le mapping dans Cloudflare KV
    const mapping = {
      demoId: demoId,
      userId: session.user.id,
      demoName: demo.name,
      addedAt: new Date().toISOString()
    };

    const kvResponse = await addDomainMapping(customDomain, mapping);
    
    if (!kvResponse.success) {
      console.error('❌ Failed to add KV mapping:', kvResponse.error);
      return NextResponse.json({
        error: 'Failed to configure domain mapping'
      }, { status: 500 });
    }

    // Mettre à jour la demo dans MongoDB
    demo.customDomain = customDomain;
    demo.domainStatus = 'verified';
    demo.domainVerifiedAt = new Date();
    await demo.save();

    console.log(`✅ Domain ${customDomain} configured for demo ${demoId}`);

    return NextResponse.json({
      success: true,
      domain: customDomain,
      status: 'verified',
      demoUrl: `https://${customDomain}`
    });

  } catch (error) {
    console.error('❌ Domain configuration error:', error);
    return NextResponse.json({
      error: 'Failed to configure domain'
    }, { status: 500 });
  }
}

// GET - Récupérer les infos du domaine
export async function GET(req: NextRequest, context: any) {
  const params = await context.params;
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const demo = await Demo.findOne({ 
    _id: params.id, 
    userId: session.user.id 
  }).select('customDomain domainStatus domainVerifiedAt');

  if (!demo) {
    return NextResponse.json({ error: 'Demo not found' }, { status: 404 });
  }

  return NextResponse.json({
    customDomain: demo.customDomain,
    domainStatus: demo.domainStatus || 'pending',
    domainVerifiedAt: demo.domainVerifiedAt,
    demoUrl: demo.customDomain ? `https://${demo.customDomain}` : null
  });
}

// DELETE - Supprimer le domaine personnalisé
export async function DELETE(req: NextRequest, context: any) {
  const params = await context.params;
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const demo = await Demo.findOne({ 
      _id: params.id, 
      userId: session.user.id 
    });

    if (!demo || !demo.customDomain) {
      return NextResponse.json({ error: 'Demo or domain not found' }, { status: 404 });
    }

    // Supprimer le mapping dans Cloudflare KV
    await removeDomainMapping(demo.customDomain);

    // Nettoyer la demo
    demo.customDomain = null;
    demo.domainStatus = 'pending';
    demo.domainVerifiedAt = null;
    await demo.save();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Domain removal error:', error);
    return NextResponse.json({
      error: 'Failed to remove domain'
    }, { status: 500 });
  }
}

// Helper Functions
function isValidDomain(domain: string): boolean {
  const regex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
  return regex.test(domain) && domain.length <= 253;
}

async function addDomainMapping(domain: string, mapping: any) {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    console.error('❌ Cloudflare credentials missing');
    return { success: false, error: 'Missing Cloudflare configuration' };
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/${domain}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${CF_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mapping)
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Cloudflare KV error:', error);
      return { success: false, error };
    }

    console.log(`✅ Added KV mapping: ${domain} → ${mapping.demoId}`);
    return { success: true };

  } catch (error: any) {
    console.error('❌ KV API error:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
}

async function removeDomainMapping(domain: string) {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) return;

  try {
    await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/${domain}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${CF_API_TOKEN}`
        }
      }
    );
    
    console.log(`🗑️ Removed KV mapping: ${domain}`);
  } catch (error) {
    console.error('❌ Failed to remove KV mapping:', error);
  }
}