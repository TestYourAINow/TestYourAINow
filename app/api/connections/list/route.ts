// app/api/connections/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Connection } from '@/models/Connection';
import { Agent } from '@/models/Agent';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const connections = await Connection.find({ userId: session.user.id }).lean();
  
  // CORRECTION - Enrichir TOUTES les connexions avec le nom de l'agent
  const enrichedConnections = await Promise.all(
    connections.map(async (connection) => {
      // Pour TOUS les types de connexion qui ont un aiBuildId
      if (connection.aiBuildId) {
        try {
          const agent = await Agent.findOne({ 
            _id: connection.aiBuildId,
            userId: session.user.id
          }).lean();
          
          return {
            ...connection,
            aiName: (agent as any)?.name || null, // Pour ton frontend
            agentName: (agent as any)?.name || null // Compatibilité
          };
        } catch (error) {
          console.error('Error fetching agent name:', error);
          return {
            ...connection,
            aiName: null,
            agentName: null
          };
        }
      }
      
      return {
        ...connection,
        aiName: null,
        agentName: null
      };
    })
  );

  return NextResponse.json({ connections: enrichedConnections });
}