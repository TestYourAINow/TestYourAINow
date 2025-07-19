import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { Connection } from '@/models/Connection'

// Interface pour typer la réponse de la base de données
interface ConnectionDocument {
  _id: string;
  userId: string;
  name: string;
  integrationType: string;
  aiBuildId: string;
  isActive: boolean;
  settings?: any;
  createdAt: Date;
}

export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    const params = await context.params
    await connectToDatabase()
    
    const { widgetId } = params
    
    // Recherche la connexion par son ID (qui correspond au widgetId)
    const connection = await Connection.findById(widgetId).lean() as ConnectionDocument | null
    
    if (!connection) {
      return NextResponse.json({ 
        isActive: false, 
        error: 'Connection not found' 
      }, { status: 404 })
    }

    // Retourne seulement le statut actif
    return NextResponse.json({ 
      isActive: connection.isActive,
      connectionId: connection._id
    })
    
  } catch (error) {
    console.error('Error checking connection status:', error)
    return NextResponse.json({ 
      isActive: false, 
      error: 'Server error' 
    }, { status: 500 })
  }
}