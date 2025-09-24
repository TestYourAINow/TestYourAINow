// Créer le fichier : app/api/avatar/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Demo } from '@/models/Demo';

export async function GET(req: NextRequest, context: any) {
  const params = await context.params;
  const { id } = params;

  try {
    await connectToDatabase();
    
    const demo = await Demo.findById(id);
    if (!demo || !demo.avatarUrl) {
      return NextResponse.json({ error: 'Avatar not found' }, { status: 404 });
    }

    // Si c'est déjà une URL normale, rediriger
    if (demo.avatarUrl.startsWith('http')) {
      return NextResponse.redirect(demo.avatarUrl);
    }

    // Si c'est une image par défaut, servir depuis public
    if (demo.avatarUrl === '/Default Avatar.png') {
      return NextResponse.redirect(new URL('/Default Avatar.png', req.url));
    }

    // Si c'est du base64, le convertir en image
    if (demo.avatarUrl.startsWith('data:image/')) {
      const base64Data = demo.avatarUrl.split(',')[1];
      const mimeType = demo.avatarUrl.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,/)?.[1] || 'image/png';
      
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000', // Cache 1 an
        },
      });
    }

    return NextResponse.json({ error: 'Invalid avatar format' }, { status: 400 });

  } catch (error) {
    console.error('Error serving avatar:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}