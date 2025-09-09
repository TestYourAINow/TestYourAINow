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
  
  const enrichedConnections = await Promise.all(
    connections.map(async (connection) => {
      if (connection.integrationType === 'website-widget' && connection.aiBuildId) {
        try {
          const agent = await Agent.findOne({ 
            _id: connection.aiBuildId,
            userId: session.user.id
          }).lean();
          
          return {
            ...connection,
            agentName: (agent as any)?.name || 'Unknown Agent' // 🔧 CAST EN any
          };
        } catch (error) {
          console.error('Error fetching agent name:', error);
          return {
            ...connection,
            agentName: 'Unknown Agent'
          };
        }
      }
      
      return connection;
    })
  );

  return NextResponse.json({ connections: enrichedConnections });
}