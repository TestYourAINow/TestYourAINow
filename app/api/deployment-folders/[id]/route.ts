// app\api\deployment-folders\[id]\route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { connectToDatabase } from '@/lib/db'
import { DeploymentFolder } from '@/models/DeploymentFolder'
import { Connection } from '@/models/Connection'
import { Agent } from '@/models/Agent'
import mongoose from 'mongoose'

// GET - Récupérer un deployment folder avec ses connections
export async function GET(
  request: NextRequest,
  context: any
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const folderId = params.id

    if (!mongoose.Types.ObjectId.isValid(folderId)) {
      return NextResponse.json(
        { error: 'Invalid folder ID' }, 
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Récupérer le folder
    const folder = await DeploymentFolder.findOne({
      _id: folderId,
      userId: session.user.id
    }).exec()

    if (!folder) {
      return NextResponse.json(
        { error: 'Deployment folder not found' }, 
        { status: 404 }
      )
    }

    // Récupérer les connections du folder
    const connections = await Connection.find({
      folderId: folderId,
      userId: session.user.id
    }).sort({ createdAt: -1 }).lean()

    // Enrichir les connections avec le nom de l'agent
    const enrichedConnections = await Promise.all(
      connections.map(async (connection: any) => {
        if (connection.aiBuildId) {
          try {
            const agent = await Agent.findOne({ 
              _id: connection.aiBuildId,
              userId: session.user.id
            }).exec();
            
            // 🔧 CORRECTION : Utiliser .toObject() pour éviter le conflit de types
            const agentData = agent?.toObject();
            
            return {
              ...connection,
              aiName: agentData?.name || null,
              agentName: agentData?.name || null
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

    return NextResponse.json({
      success: true,
      folder: {
        ...folder.toObject(),
        connectionCount: connections.length
      },
      connections: enrichedConnections
    })

  } catch (error) {
    console.error('Error fetching deployment folder:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deployment folder' }, 
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un deployment folder
export async function PUT(
  request: NextRequest,
  context: any
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const folderId = params.id
    const body = await request.json()
    const { name, description, color } = body

    if (!mongoose.Types.ObjectId.isValid(folderId)) {
      return NextResponse.json(
        { error: 'Invalid folder ID' }, 
        { status: 400 }
      )
    }

    // Validation
    if (name && (!name.trim() || name.length > 50)) {
      return NextResponse.json(
        { error: 'Folder name must be 1-50 characters' }, 
        { status: 400 }
      )
    }

    if (description && description.length > 200) {
      return NextResponse.json(
        { error: 'Description must be 200 characters or less' }, 
        { status: 400 }
      )
    }

    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      return NextResponse.json(
        { error: 'Valid color is required' }, 
        { status: 400 }
      )
    }

    await connectToDatabase()

    // 🔧 CORRECTION : Utiliser .exec() et .toObject() pour éviter les conflits de types
    const existingFolderDoc = await DeploymentFolder.findOne({
      _id: folderId,
      userId: session.user.id
    }).exec()

    if (!existingFolderDoc) {
      return NextResponse.json(
        { error: 'Deployment folder not found' }, 
        { status: 404 }
      )
    }

    // Convertir en objet JavaScript simple
    const existingFolder = existingFolderDoc.toObject()

    // Si le nom change, vérifier l'unicité
    if (name && name.trim() !== existingFolder.name) {
      const duplicateFolder = await DeploymentFolder.findOne({
        userId: session.user.id,
        name: name.trim(),
        _id: { $ne: folderId }
      }).exec()

      if (duplicateFolder) {
        return NextResponse.json(
          { error: 'A deployment folder with this name already exists' }, 
          { status: 409 }
        )
      }
    }

    // Mettre à jour le folder
    const updateData: any = {}
    if (name) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description.trim()
    if (color) updateData.color = color

    const updatedFolder = await DeploymentFolder.findByIdAndUpdate(
      folderId,
      updateData,
      { new: true }
    ).exec()

    // Compter les connections
    const connectionCount = await Connection.countDocuments({
      folderId: folderId,
      userId: session.user.id
    })

    return NextResponse.json({
      success: true,
      message: 'Deployment folder updated successfully',
      folder: {
        ...updatedFolder?.toObject(),
        connectionCount
      }
    })

  } catch (error) {
    console.error('Error updating deployment folder:', error)
    return NextResponse.json(
      { error: 'Failed to update deployment folder' }, 
      { status: 500 }
    )
  }
}