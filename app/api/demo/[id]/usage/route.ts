// api/demo/[id]/usage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Demo } from '@/models/Demo';

export async function POST(req: NextRequest, context: any) {
  const params = await context.params;
  await connectToDatabase();

  try {
    const demo = await Demo.findById(params.id);
    
    if (!demo) {
      return NextResponse.json({ error: 'Demo not found' }, { status: 404 });
    }

    // Vérifier si la limite n'est pas déjà atteinte
    if (demo.usedCount >= demo.usageLimit) {
      return NextResponse.json({ error: 'Usage limit reached' }, { status: 429 });
    }

    // Incrémenter le compteur
    demo.usedCount += 1;
    await demo.save();

    return NextResponse.json({ 
      success: true, 
      usedCount: demo.usedCount,
      usageLimit: demo.usageLimit 
    });

  } catch (error) {
    console.error('Error updating demo usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}