// app/api/demo/[id]/domain/route.ts - CODE COMPLET CORRIGÉ
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { Demo } from '@/models/Demo';
import * as dns from 'dns';
import { promisify } from 'util';

const resolveCname = promisify(dns.resolveCname);

// ✅ VARIABLES D'ENVIRONNEMENT AVEC VALIDATION
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CF_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const KV_NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID || 'dc4e744e9b4b4164bdcff1a618c39622';

// ✅ VALIDATION DES VARIABLES D'ENVIRONNEMENT
function validateCloudflareConfig() {
  const missing = [];
  if (!CF_ACCOUNT_ID) missing.push('CLOUDFLARE_ACCOUNT_ID');
  if (!CF_API_TOKEN) missing.push('CLOUDFLARE_API_TOKEN');
  if (!CF_ZONE_ID) missing.push('CLOUDFLARE_ZONE_ID');
  
  if (missing.length > 0) {
    throw new Error(`Missing Cloudflare environment variables: ${missing.join(', ')}`);
  }
}

// PUT - Configurer un domaine personnalisé
export async function PUT(req: NextRequest, context: any) {
  const params = await context.params;
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // ✅ VALIDATION DES VARIABLES D'ENVIRONNEMENT EN PREMIER
    validateCloudflareConfig();

    const { customDomain } = await req.json();
    const demoId = params.id;

    console.log(`🔍 Processing domain request for demo ${demoId}, domain: ${customDomain}`);

    // Validation du domaine
    if (!customDomain || !isValidDomain(customDomain)) {
      console.error('❌ Invalid domain format:', customDomain);
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
    }

    // Vérifier que la demo existe
    const demo = await Demo.findOne({ 
      _id: demoId, 
      userId: session.user.id 
    });
    
    if (!demo) {
      console.error('❌ Demo not found:', demoId);
      return NextResponse.json({ error: 'Demo not found' }, { status: 404 });
    }

    // Vérifier que le domaine n'est pas déjà utilisé
    const existingDemo = await Demo.findOne({ 
      customDomain: customDomain,
      _id: { $ne: demoId }
    });
    
    if (existingDemo) {
      console.error('❌ Domain already in use:', customDomain);
      return NextResponse.json({ 
        error: 'Domain already in use by another demo' 
      }, { status: 409 });
    }

    // 1. Vérifier la configuration DNS
    console.log(`🔍 Checking DNS for ${customDomain}...`);
    let dnsValid = false;
    try {
      const records = await resolveCname(customDomain);
      dnsValid = records.includes('proxy.testyourainow.com');
      console.log(`✅ DNS check for ${customDomain}:`, records);
    } catch (error) {
      console.error(`❌ DNS resolution failed for ${customDomain}:`, error);
      return NextResponse.json({
        error: 'CNAME record not found. Please add: CNAME ' + customDomain.split('.')[0] + ' → proxy.testyourainow.com',
        dnsConfigured: false
      }, { status: 400 });
    }

    if (!dnsValid) {
      console.error('❌ CNAME does not point to proxy.testyourainow.com');
      return NextResponse.json({
        error: 'CNAME record does not point to proxy.testyourainow.com',
        dnsConfigured: false
      }, { status: 400 });
    }

    console.log(`🚀 Creating Custom Hostname for ${customDomain}`);

    // 2. Créer Custom Hostname dans Cloudflare for SaaS
    const customHostnameResponse = await createCustomHostname(customDomain);
    
    if (!customHostnameResponse.success) {
      console.error('❌ Failed to create custom hostname:', customHostnameResponse.error);
      
      // ✅ GESTION PLUS FINE DES ERREURS CLOUDFLARE
      if (customHostnameResponse.error.includes('already exists') || 
          customHostnameResponse.error.includes('Duplicate')) {
        console.log(`✅ Custom Hostname already exists for ${customDomain}, continuing...`);
      } else {
        return NextResponse.json({
          error: `Failed to configure domain in Cloudflare: ${customHostnameResponse.error}`,
          details: customHostnameResponse.details || 'Unknown error'
        }, { status: 500 });
      }
    }

    // 3. Ajouter le mapping dans KV
    console.log(`📝 Adding KV mapping for ${customDomain}...`);
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
        error: `Failed to configure domain mapping: ${kvResponse.error}`,
        details: kvResponse.details || 'Unknown error'
      }, { status: 500 });
    }

    // 4. Mettre à jour la demo dans MongoDB
    demo.customDomain = customDomain;
    demo.domainStatus = 'verified';
    demo.domainVerifiedAt = new Date();
    await demo.save();

    console.log(`✅ Domain ${customDomain} configured successfully`);

    return NextResponse.json({
      success: true,
      domain: customDomain,
      status: 'verified',
      demoUrl: `https://${customDomain}/shared/${demoId}`,
      customHostnameId: customHostnameResponse.id || 'existing'
    });

  } catch (error: any) {
    console.error('❌ Domain configuration error:', error);
    
    // ✅ RETOUR D'ERREUR PLUS DÉTAILLÉ
    return NextResponse.json({
      error: 'Failed to configure domain',
      details: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

  try {
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
      demoUrl: demo.customDomain ? `https://${demo.customDomain}/shared/${params.id}` : null
    });
  } catch (error) {
    console.error('❌ Error getting domain info:', error);
    return NextResponse.json({ error: 'Failed to get domain info' }, { status: 500 });
  }
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

    // Supprimer le Custom Hostname dans Cloudflare
    await removeCustomHostname(demo.customDomain);

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

// ✅ FONCTION AMÉLIORÉE POUR CRÉER UN CUSTOM HOSTNAME
async function createCustomHostname(hostname: string) {
  console.log(`🔧 Creating Custom Hostname: ${hostname}`);
  
  try {
    const requestBody = {
      hostname: hostname,
      ssl: {
        method: 'http',
        type: 'dv',
        settings: {
          http2: 'on',
          min_tls_version: '1.2',
          tls_1_3: 'on'
        }
      }
    };

    console.log('📤 Cloudflare API Request:', {
      url: `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/custom_hostnames`,
      body: requestBody
    });

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/custom_hostnames`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CF_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    const responseText = await response.text();
    console.log('📥 Cloudflare Raw Response:', response.status, responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse Cloudflare response:', parseError);
      return { 
        success: false, 
        error: 'Invalid response from Cloudflare API',
        details: responseText
      };
    }

    if (!response.ok) {
      console.error('❌ Cloudflare Custom Hostname error:', data);
      const errorMessage = data.errors?.[0]?.message || data.message || 'Unknown API error';
      const errorCode = data.errors?.[0]?.code || 'unknown';
      
      return { 
        success: false, 
        error: errorMessage,
        details: `Status: ${response.status}, Code: ${errorCode}`,
        fullResponse: data
      };
    }

    console.log(`✅ Custom Hostname created successfully: ${hostname} → ${data.result?.id}`);
    return { 
      success: true, 
      id: data.result?.id,
      status: data.result?.status,
      verification_errors: data.result?.verification_errors
    };

  } catch (error: any) {
    console.error('❌ Custom Hostname creation network error:', error);
    return { 
      success: false, 
      error: error?.message || 'Network error',
      details: 'Failed to connect to Cloudflare API'
    };
  }
}

// ✅ FONCTION AMÉLIORÉE POUR AJOUTER LE MAPPING KV
async function addDomainMapping(domain: string, mapping: any) {
  console.log(`📝 Adding KV mapping: ${domain}`);
  
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

    const responseText = await response.text();
    console.log('📥 KV Response:', response.status, responseText);

    if (!response.ok) {
      console.error('❌ Cloudflare KV error:', responseText);
      return { 
        success: false, 
        error: responseText,
        details: `Status: ${response.status}`
      };
    }

    console.log(`✅ Added KV mapping: ${domain} → ${mapping.demoId}`);
    return { success: true };

  } catch (error: any) {
    console.error('❌ KV API error:', error);
    return { 
      success: false, 
      error: error?.message || 'Unknown error',
      details: 'Failed to connect to Cloudflare KV API'
    };
  }
}

// Fonction pour supprimer un Custom Hostname
async function removeCustomHostname(hostname: string) {
  if (!CF_ZONE_ID || !CF_API_TOKEN) return;

  try {
    console.log(`🗑️ Removing Custom Hostname: ${hostname}`);
    
    // D'abord, chercher l'ID du Custom Hostname
    const listResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/custom_hostnames?hostname=${hostname}`,
      {
        headers: {
          'Authorization': `Bearer ${CF_API_TOKEN}`
        }
      }
    );

    if (listResponse.ok) {
      const listData = await listResponse.json();
      const customHostname = listData.result?.[0];
      
      if (customHostname) {
        // Supprimer le Custom Hostname
        const deleteResponse = await fetch(
          `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/custom_hostnames/${customHostname.id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${CF_API_TOKEN}`
            }
          }
        );
        
        if (deleteResponse.ok) {
          console.log(`✅ Removed Custom Hostname: ${hostname}`);
        } else {
          console.error(`❌ Failed to remove Custom Hostname: ${hostname}`, await deleteResponse.text());
        }
      } else {
        console.log(`ℹ️ Custom Hostname not found: ${hostname}`);
      }
    } else {
      console.error('❌ Failed to list Custom Hostnames:', await listResponse.text());
    }
  } catch (error) {
    console.error('❌ Failed to remove Custom Hostname:', error);
  }
}

// Fonction pour supprimer un mapping KV
async function removeDomainMapping(domain: string) {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) return;

  try {
    console.log(`🗑️ Removing KV mapping: ${domain}`);
    
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/${domain}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${CF_API_TOKEN}`
        }
      }
    );
    
    if (response.ok) {
      console.log(`✅ Removed KV mapping: ${domain}`);
    } else {
      console.error(`❌ Failed to remove KV mapping: ${domain}`, await response.text());
    }
  } catch (error) {
    console.error('❌ Failed to remove KV mapping:', error);
  }
}

// Helper Functions
function isValidDomain(domain: string): boolean {
  const regex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
  return regex.test(domain) && domain.length <= 253;
}