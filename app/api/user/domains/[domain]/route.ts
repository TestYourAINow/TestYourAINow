// app/api/user/domains/[domain]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { UserDomain } from '@/models/UserDomain';
import { Demo } from '@/models/Demo';

// DELETE - Supprimer un domaine
export async function DELETE(req: NextRequest, context: any) {
  const params = await context.params;
  const domain = decodeURIComponent(params.domain);

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();

  try {
    // Vérifier si le domaine existe
    const userDomain = await UserDomain.findOne({
      userId: session.user.id,
      domain: domain
    });

    if (!userDomain) {
      return NextResponse.json({ 
        error: 'Domain not found' 
      }, { status: 404 });
    }

    // Vérifier si le domaine est utilisé par des demos
    const demosUsingDomain = await Demo.find({
      userId: session.user.id,
      customDomain: domain
    });

    if (demosUsingDomain.length > 0) {
      return NextResponse.json({ 
        error: `Cannot delete domain. It's currently used by ${demosUsingDomain.length} demo(s)`,
        demosCount: demosUsingDomain.length
      }, { status: 409 });
    }

    // Supprimer le domaine
    await UserDomain.deleteOne({
      userId: session.user.id,
      domain: domain
    });

    return NextResponse.json({ 
      success: true,
      message: 'Domain deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting domain:', error);
    return NextResponse.json({ 
      error: 'Failed to delete domain' 
    }, { status: 500 });
  }
}

// PUT - Vérifier à nouveau un domaine
export async function PUT(req: NextRequest, context: any) {
  const params = await context.params;
  const domain = decodeURIComponent(params.domain);

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();

  try {
    const userDomain = await UserDomain.findOne({
      userId: session.user.id,
      domain: domain
    });

    if (!userDomain) {
      return NextResponse.json({ 
        error: 'Domain not found' 
      }, { status: 404 });
    }

    // Re-vérifier le DNS
    const dns = require('dns');
    const { promisify } = require('util');
    const resolveCname = promisify(dns.resolveCname);

    let status = 'pending';
    let errorMessage = null;
    
    try {
      const records = await resolveCname(domain);
      if (records.includes('proxy.testyourainow.com')) {
        status = 'verified';
        errorMessage = null;
      } else {
        status = 'failed';
        errorMessage = 'CNAME does not point to proxy.testyourainow.com';
      }
    } catch (error) {
      status = 'failed';
      errorMessage = 'CNAME record not found';
    }

    // Mettre à jour le domaine
    userDomain.status = status;
    userDomain.verifiedAt = status === 'verified' ? new Date() : null;
    userDomain.lastChecked = new Date();
    userDomain.errorMessage = errorMessage;
    await userDomain.save();

    return NextResponse.json({ 
      success: true,
      domain: userDomain
    });

  } catch (error) {
    console.error('Error verifying domain:', error);
    return NextResponse.json({ 
      error: 'Failed to verify domain' 
    }, { status: 500 });
  }
}